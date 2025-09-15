use super::{SecureStorage, SecureStorageError, SessionStatus};
use async_trait::async_trait;
use security_framework::passwords::{
    delete_generic_password, get_generic_password, set_generic_password,
};

/// Keychain-based secure storage for macOS and iOS
///
/// This implementation uses the Apple Keychain Services to securely store
/// credentials. The Keychain provides hardware-encrypted storage that persists
/// across application restarts and is protected by the user's login credentials
/// or biometric authentication.
///
/// # Security Features
///
/// - Data is encrypted using the device's hardware security module when available
/// - Access is protected by the user's login credentials or biometric authentication
/// - Data persists securely across application restarts and system reboots
/// - Integration with iOS/macOS security policies and user consent flows
///
/// # Platform Support
///
/// - **macOS**: Uses the user's default keychain
/// - **iOS**: Uses the application's keychain partition
#[derive(Debug)]
pub struct KeychainStorage {
    pub service_name: String,
}

impl KeychainStorage {
    /// Creates a new Keychain storage instance
    ///
    /// # Arguments
    ///
    /// * `service_name` - Optional service name to use for keychain entries.
    ///   If None, uses the application bundle identifier.
    ///
    /// # Returns
    ///
    /// Returns `Ok(KeychainStorage)` on success, or an error if initialization fails.
    pub fn new() -> Result<Self, SecureStorageError> {
        let service_name = Self::get_service_name().map_err(|e| SecureStorageError::Internal {
            message: format!("Failed to determine service name: {}", e),
        })?;

        tracing::debug!(
            "Initializing Keychain storage with service name: {}",
            service_name
        );

        Ok(Self { service_name })
    }

    /// Creates a new Keychain storage instance with a custom service name
    ///
    /// # Arguments
    ///
    /// * `service_name` - The service name to use for keychain entries
    ///
    /// # Returns
    ///
    /// Returns a new `KeychainStorage` instance.
    pub fn with_service_name(service_name: String) -> Self {
        tracing::debug!(
            "Initializing Keychain storage with custom service name: {}",
            service_name
        );
        Self { service_name }
    }

    /// Determines the appropriate service name for keychain entries
    fn get_service_name() -> Result<String, Box<dyn std::error::Error>> {
        // Try to get the application bundle identifier
        #[cfg(target_os = "macos")]
        {
            if let Ok(bundle_id) = std::env::var("CFBundleIdentifier") {
                return Ok(bundle_id);
            }
        }

        // Fallback to a default service name
        Ok("com.skiffy.messenger".to_string())
    }

    /// Converts Keychain errors to SecureStorageError
    fn map_keychain_error(error: security_framework::base::Error, key: &str) -> SecureStorageError {
        let error_code = error.code();
        match error_code {
            -25300 => SecureStorageError::KeyNotFound {
                // errSecItemNotFound
                key: key.to_string(),
            },
            -25293 | -128 => SecureStorageError::AccessDenied {
                // errSecAuthFailed | userCanceledErr
                key: key.to_string(),
            },
            _ => SecureStorageError::Internal {
                message: format!(
                    "Keychain error for key '{}': {} (code: {})",
                    key, error, error_code
                ),
            },
        }
    }
}

impl Default for KeychainStorage {
    fn default() -> Self {
        Self::new().expect("Failed to create default KeychainStorage")
    }
}

#[async_trait]
impl SecureStorage for KeychainStorage {
    async fn set(&self, key: &str, value: &str) -> Result<(), SecureStorageError> {
        if key.is_empty() {
            return Err(SecureStorageError::InvalidInput {
                message: "Key cannot be empty".to_string(),
            });
        }

        // Convert to blocking operation since Keychain APIs are synchronous
        let service_name = self.service_name.clone();
        let key_clone = key.to_string();
        let value = value.to_string();

        tokio::task::spawn_blocking(move || {
            set_generic_password(&service_name, &key_clone, value.as_bytes())
                .map_err(|e| Self::map_keychain_error(e, &key_clone))
        })
        .await
        .map_err(|e| SecureStorageError::Internal {
            message: format!("Task join error: {}", e),
        })??;

        tracing::debug!("Successfully stored key '{}' in Keychain", key);
        Ok(())
    }

    async fn get(&self, key: &str) -> Result<String, SecureStorageError> {
        if key.is_empty() {
            return Err(SecureStorageError::InvalidInput {
                message: "Key cannot be empty".to_string(),
            });
        }

        let service_name = self.service_name.clone();
        let key_clone = key.to_string();

        let data = tokio::task::spawn_blocking(move || {
            get_generic_password(&service_name, &key_clone)
                .map_err(|e| Self::map_keychain_error(e, &key_clone))
        })
        .await
        .map_err(|e| SecureStorageError::Internal {
            message: format!("Task join error: {}", e),
        })??;

        let value = String::from_utf8(data).map_err(|e| SecureStorageError::Internal {
            message: format!("Invalid UTF-8 in stored value for key '{}': {}", key, e),
        })?;

        tracing::debug!("Successfully retrieved key '{}' from Keychain", key);
        Ok(value)
    }

    async fn delete(&self, key: &str) -> Result<(), SecureStorageError> {
        if key.is_empty() {
            return Err(SecureStorageError::InvalidInput {
                message: "Key cannot be empty".to_string(),
            });
        }

        let service_name = self.service_name.clone();
        let key_clone = key.to_string();

        let result =
            tokio::task::spawn_blocking(move || delete_generic_password(&service_name, &key_clone))
                .await
                .map_err(|e| SecureStorageError::Internal {
                    message: format!("Task join error: {}", e),
                })?;

        match result {
            Ok(_) => {
                tracing::debug!("Successfully deleted key '{}' from Keychain", key);
                Ok(())
            }
            Err(e) => {
                match e.code() {
                    -25300 => {
                        // errSecItemNotFound
                        // Deleting a non-existent key is considered success
                        tracing::debug!("Key '{}' not found in Keychain (already deleted)", key);
                        Ok(())
                    }
                    _ => Err(Self::map_keychain_error(e, key)),
                }
            }
        }
    }

    async fn clear(&self) -> Result<(), SecureStorageError> {
        // Note: There's no efficient way to clear all items for a specific service
        // in the Keychain API, so this is a placeholder implementation.
        // In a real implementation, you might maintain an index of keys or
        // use a different approach.

        tracing::warn!("clear() operation not implemented for Keychain storage");
        Err(SecureStorageError::Internal {
            message: "Clear operation not supported by Keychain storage".to_string(),
        })
    }

    fn is_persistent(&self) -> SessionStatus {
        // Keychain storage is always persistent
        SessionStatus::Persistent
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // Note: These tests require a macOS/iOS environment with Keychain access
    // and may prompt for user authorization during testing.

    #[tokio::test]
    #[cfg(any(target_os = "macos", target_os = "ios"))]
    async fn test_keychain_storage_operations() {
        let storage = KeychainStorage::with_service_name("com.skiffy.test".to_string());
        let test_key = "test_keychain_key";
        let test_value = "test_keychain_value";

        // Clean up any existing test data
        let _ = storage.delete(test_key).await;

        // Test set
        let result = storage.set(test_key, test_value).await;
        assert!(result.is_ok(), "Failed to set value: {:?}", result.err());

        // Test get
        let result = storage.get(test_key).await;
        assert!(result.is_ok(), "Failed to get value: {:?}", result.err());
        assert_eq!(result.unwrap(), test_value);

        // Test delete
        let result = storage.delete(test_key).await;
        assert!(result.is_ok(), "Failed to delete value: {:?}", result.err());

        // Verify deletion
        let result = storage.get(test_key).await;
        assert!(result.is_err());
        match result.unwrap_err() {
            SecureStorageError::KeyNotFound { .. } => {
                // Expected
            }
            e => panic!("Expected KeyNotFound, got: {:?}", e),
        }
    }

    #[tokio::test]
    async fn test_empty_key_validation() {
        let storage = KeychainStorage::with_service_name("com.skiffy.test".to_string());

        // Test set with empty key
        let result = storage.set("", "value").await;
        assert!(result.is_err());
        match result.unwrap_err() {
            SecureStorageError::InvalidInput { message } => {
                assert!(message.contains("Key cannot be empty"));
            }
            e => panic!("Expected InvalidInput, got: {:?}", e),
        }
    }

    #[test]
    fn test_is_persistent() {
        let storage = KeychainStorage::with_service_name("com.skiffy.test".to_string());
        assert_eq!(storage.is_persistent(), SessionStatus::Persistent);
    }

    #[test]
    fn test_service_name_creation() {
        let storage = KeychainStorage::with_service_name("custom.service".to_string());
        assert_eq!(storage.service_name, "custom.service");
    }
}
