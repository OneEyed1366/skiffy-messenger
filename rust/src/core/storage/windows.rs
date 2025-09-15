use super::{SecureStorage, SecureStorageError, SessionStatus};
use async_trait::async_trait;
use keyring::{Entry, Error as KeyringError};
use std::collections::HashSet;
use std::sync::{Arc, RwLock};

/// Windows Credential Manager-based secure storage
///
/// This implementation uses the Windows Credential Manager to securely store
/// credentials. The Credential Manager is integrated with Windows security
/// and provides encrypted storage that persists across application restarts.
///
/// # Security Features
///
/// - Data is encrypted using Windows Data Protection API (DPAPI)
/// - Access is protected by the user's Windows login credentials
/// - Data persists securely across application restarts and system reboots
/// - Integration with Windows security policies and user access control
///
/// # Implementation Notes
///
/// - Uses the `keyring` crate for cross-platform keyring access
/// - Each credential is stored as a separate entry in the Credential Manager
/// - Entries are organized under the application's service name
#[derive(Debug)]
pub struct WindowsStorage {
    service_name: String,
    // Track keys we've created to support clear operation
    keys: Arc<RwLock<HashSet<String>>>,
}

impl WindowsStorage {
    /// Creates a new Windows Credential Manager storage instance
    ///
    /// # Returns
    ///
    /// Returns `Ok(WindowsStorage)` on success, or an error if initialization fails.
    pub fn new() -> Result<Self, SecureStorageError> {
        let service_name = Self::get_service_name().map_err(|e| SecureStorageError::Internal {
            message: format!("Failed to determine service name: {}", e),
        })?;

        tracing::debug!(
            "Initializing Windows Credential Manager storage with service name: {}",
            service_name
        );

        Ok(Self {
            service_name,
            keys: Arc::new(RwLock::new(HashSet::new())),
        })
    }

    /// Creates a new Windows storage instance with a custom service name
    ///
    /// # Arguments
    ///
    /// * `service_name` - The service name to use for credential entries
    ///
    /// # Returns
    ///
    /// Returns a new `WindowsStorage` instance.
    pub fn with_service_name(service_name: String) -> Self {
        tracing::debug!(
            "Initializing Windows storage with custom service name: {}",
            service_name
        );
        Self {
            service_name,
            keys: Arc::new(RwLock::new(HashSet::new())),
        }
    }

    /// Determines the appropriate service name for credential entries
    fn get_service_name() -> Result<String, Box<dyn std::error::Error>> {
        // Use a default service name for the application
        Ok("SkiffyMessenger".to_string())
    }

    /// Creates a keyring entry for the given key
    fn create_entry(&self, key: &str) -> Entry {
        Entry::new(&self.service_name, key).expect("Failed to create keyring entry")
    }

    /// Converts keyring errors to SecureStorageError
    fn map_keyring_error(error: KeyringError, key: &str) -> SecureStorageError {
        match error {
            KeyringError::NoEntry => SecureStorageError::KeyNotFound {
                key: key.to_string(),
            },
            KeyringError::PlatformFailure(e) => {
                if e.to_string().contains("access") || e.to_string().contains("denied") {
                    SecureStorageError::AccessDenied {
                        key: key.to_string(),
                    }
                } else {
                    SecureStorageError::Internal {
                        message: format!("Platform error for key '{}': {}", key, e),
                    }
                }
            }
            KeyringError::Ambiguous(e) => SecureStorageError::Internal {
                message: format!("Ambiguous keyring error for key '{}': {}", key, e),
            },
            _ => SecureStorageError::Internal {
                message: format!("Keyring error for key '{}': {}", key, error),
            },
        }
    }

    /// Adds a key to the tracked keys set
    fn track_key(&self, key: &str) {
        if let Ok(mut keys) = self.keys.write() {
            keys.insert(key.to_string());
        }
    }

    /// Removes a key from the tracked keys set
    fn untrack_key(&self, key: &str) {
        if let Ok(mut keys) = self.keys.write() {
            keys.remove(key);
        }
    }

    /// Gets all tracked keys
    fn get_tracked_keys(&self) -> Vec<String> {
        self.keys
            .read()
            .map(|keys| keys.iter().cloned().collect())
            .unwrap_or_default()
    }
}

impl Default for WindowsStorage {
    fn default() -> Self {
        Self::new().expect("Failed to create default WindowsStorage")
    }
}

#[async_trait]
impl SecureStorage for WindowsStorage {
    async fn set(&self, key: &str, value: &str) -> Result<(), SecureStorageError> {
        if key.is_empty() {
            return Err(SecureStorageError::InvalidInput {
                message: "Key cannot be empty".to_string(),
            });
        }

        let entry = self.create_entry(key);
        let key = key.to_string();
        let value = value.to_string();

        // Convert to blocking operation since keyring APIs are synchronous
        let result = tokio::task::spawn_blocking(move || entry.set_password(&value))
            .await
            .map_err(|e| SecureStorageError::Internal {
                message: format!("Task join error: {}", e),
            })?;

        match result {
            Ok(_) => {
                self.track_key(&key);
                tracing::debug!(
                    "Successfully stored key '{}' in Windows Credential Manager",
                    key
                );
                Ok(())
            }
            Err(e) => Err(Self::map_keyring_error(e, &key)),
        }
    }

    async fn get(&self, key: &str) -> Result<String, SecureStorageError> {
        if key.is_empty() {
            return Err(SecureStorageError::InvalidInput {
                message: "Key cannot be empty".to_string(),
            });
        }

        let entry = self.create_entry(key);
        let key = key.to_string();

        let result = tokio::task::spawn_blocking(move || entry.get_password())
            .await
            .map_err(|e| SecureStorageError::Internal {
                message: format!("Task join error: {}", e),
            })?;

        match result {
            Ok(value) => {
                tracing::debug!(
                    "Successfully retrieved key '{}' from Windows Credential Manager",
                    key
                );
                Ok(value)
            }
            Err(e) => Err(Self::map_keyring_error(e, &key)),
        }
    }

    async fn delete(&self, key: &str) -> Result<(), SecureStorageError> {
        if key.is_empty() {
            return Err(SecureStorageError::InvalidInput {
                message: "Key cannot be empty".to_string(),
            });
        }

        let entry = self.create_entry(key);
        let key = key.to_string();

        let result = tokio::task::spawn_blocking(move || entry.delete_password())
            .await
            .map_err(|e| SecureStorageError::Internal {
                message: format!("Task join error: {}", e),
            })?;

        match result {
            Ok(_) => {
                self.untrack_key(&key);
                tracing::debug!(
                    "Successfully deleted key '{}' from Windows Credential Manager",
                    key
                );
                Ok(())
            }
            Err(KeyringError::NoEntry) => {
                // Deleting a non-existent key is considered success
                self.untrack_key(&key);
                tracing::debug!(
                    "Key '{}' not found in Windows Credential Manager (already deleted)",
                    key
                );
                Ok(())
            }
            Err(e) => Err(Self::map_keyring_error(e, &key)),
        }
    }

    async fn clear(&self) -> Result<(), SecureStorageError> {
        let keys = self.get_tracked_keys();
        let mut errors = Vec::new();

        for key in keys {
            if let Err(e) = self.delete(&key).await {
                errors.push(format!("Failed to delete key '{}': {}", key, e));
            }
        }

        if errors.is_empty() {
            tracing::debug!("Successfully cleared all keys from Windows Credential Manager");
            Ok(())
        } else {
            Err(SecureStorageError::Internal {
                message: format!("Failed to clear some keys: {}", errors.join(", ")),
            })
        }
    }

    fn is_persistent(&self) -> SessionStatus {
        // Windows Credential Manager storage is always persistent
        SessionStatus::Persistent
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // Note: These tests require a Windows environment with Credential Manager access

    #[tokio::test]
    #[cfg(target_os = "windows")]
    async fn test_windows_storage_operations() {
        let storage = WindowsStorage::with_service_name("SkiffyTest".to_string());
        let test_key = "test_windows_key";
        let test_value = "test_windows_value";

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
        let storage = WindowsStorage::with_service_name("SkiffyTest".to_string());

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
        let storage = WindowsStorage::with_service_name("SkiffyTest".to_string());
        assert_eq!(storage.is_persistent(), SessionStatus::Persistent);
    }

    #[tokio::test]
    #[cfg(target_os = "windows")]
    async fn test_clear_operation() {
        let storage = WindowsStorage::with_service_name("SkiffyTest".to_string());

        // Set multiple values
        let _ = storage.set("clear_test_1", "value1").await;
        let _ = storage.set("clear_test_2", "value2").await;

        // Clear all values
        let result = storage.clear().await;
        assert!(
            result.is_ok(),
            "Failed to clear storage: {:?}",
            result.err()
        );

        // Verify values are gone
        assert!(storage.get("clear_test_1").await.is_err());
        assert!(storage.get("clear_test_2").await.is_err());
    }

    #[test]
    fn test_service_name_creation() {
        let storage = WindowsStorage::with_service_name("CustomService".to_string());
        assert_eq!(storage.service_name, "CustomService");
    }
}
