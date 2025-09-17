use super::{SecureStorage, SecureStorageError, SessionStatus};
use async_trait::async_trait;
use keyring::{Entry, Error as KeyringError};
use std::collections::HashSet;
use std::sync::{Arc, RwLock};

/// Linux Secret Service API-based secure storage
///
/// This implementation uses the Linux Secret Service API (typically provided by
/// GNOME Keyring or KDE Wallet) to securely store credentials. The Secret Service
/// provides encrypted storage that persists across application restarts.
///
/// # Security Features
///
/// - Data is encrypted using the system's secret service daemon
/// - Access is protected by the user's login credentials or keyring password
/// - Data persists securely across application restarts and system reboots
/// - Integration with desktop environment security policies
///
/// # Fallback Behavior
///
/// If the Secret Service API is not available (e.g., no desktop environment,
/// no secret service daemon), the factory will automatically fall back to
/// in-memory storage with appropriate user notification.
///
/// # Implementation Notes
///
/// - Uses the `keyring` crate for Secret Service API access
/// - Each credential is stored as a separate secret in the service
/// - Entries are organized under the application's service name
#[derive(Debug)]
pub struct LinuxStorage {
    service_name: String,
    // Track keys we've created to support clear operation
    keys: Arc<RwLock<HashSet<String>>>,
}

impl LinuxStorage {
    /// Creates a new Linux Secret Service storage instance
    ///
    /// # Returns
    ///
    /// Returns `Ok(LinuxStorage)` on success, or an error if the Secret Service
    /// is not available or initialization fails.
    pub fn new() -> Result<Self, SecureStorageError> {
        let service_name = Self::get_service_name().map_err(|e| SecureStorageError::Internal {
            message: format!("Failed to determine service name: {}", e),
        })?;

        // Test that we can connect to the Secret Service
        let test_entry = Entry::new(&service_name, "__test_connection__").map_err(|e| {
            SecureStorageError::BackendNotAvailable {
                reason: format!("Failed to create test keyring entry: {}", e),
            }
        })?;

        // Try a simple operation to verify the Secret Service is available
        match test_entry.get_password() {
            Ok(_) => {
                // Unexpected success, clean it up
                let _ = test_entry.delete_password();
            }
            Err(KeyringError::NoEntry) => {
                // Expected - the test entry doesn't exist, which means we can connect
            }
            Err(KeyringError::PlatformFailure(e)) => {
                if e.to_string().contains("Secret Service")
                    || e.to_string().contains("dbus")
                    || e.to_string().contains("keyring")
                {
                    return Err(SecureStorageError::BackendNotAvailable {
                        reason: format!("Secret Service not available: {}", e),
                    });
                }
                // Other platform failures might be temporary, continue
            }
            Err(e) => {
                return Err(SecureStorageError::BackendNotAvailable {
                    reason: format!("Secret Service test failed: {}", e),
                });
            }
        }

        tracing::debug!(
            "Successfully initialized Linux Secret Service storage with service name: {}",
            service_name
        );

        Ok(Self {
            service_name,
            keys: Arc::new(RwLock::new(HashSet::new())),
        })
    }

    /// Creates a new Linux storage instance with a custom service name
    ///
    /// # Arguments
    ///
    /// * `service_name` - The service name to use for secret entries
    ///
    /// # Returns
    ///
    /// Returns a new `LinuxStorage` instance.
    pub fn with_service_name(service_name: String) -> Result<Self, SecureStorageError> {
        tracing::debug!(
            "Initializing Linux storage with custom service name: {}",
            service_name
        );

        // Still test the connection even with custom service name
        let test_entry = Entry::new(&service_name, "__test_connection__").map_err(|e| {
            SecureStorageError::BackendNotAvailable {
                reason: format!("Failed to create test keyring entry: {}", e),
            }
        })?;

        // Verify Secret Service availability
        match test_entry.get_password() {
            Ok(_) => {
                let _ = test_entry.delete_password();
            }
            Err(KeyringError::NoEntry) => {
                // Expected - service is available
            }
            Err(e) => {
                return Err(SecureStorageError::BackendNotAvailable {
                    reason: format!("Secret Service not available: {}", e),
                });
            }
        }

        Ok(Self {
            service_name,
            keys: Arc::new(RwLock::new(HashSet::new())),
        })
    }

    /// Determines the appropriate service name for secret entries
    fn get_service_name() -> Result<String, Box<dyn std::error::Error>> {
        // Use a default service name for the application
        Ok("com.skiffy.messenger".to_string())
    }

    /// Creates a keyring entry for the given key
    fn create_entry(&self, key: &str) -> Result<Entry, SecureStorageError> {
        Entry::new(&self.service_name, key).map_err(|e| SecureStorageError::BackendNotAvailable {
            reason: format!("Failed to create keyring entry: {}", e),
        })
    }

    /// Converts keyring errors to SecureStorageError
    fn map_keyring_error(error: KeyringError, key: &str) -> SecureStorageError {
        match error {
            KeyringError::NoEntry => SecureStorageError::KeyNotFound {
                key: key.to_string(),
            },
            KeyringError::PlatformFailure(e) => {
                if e.to_string().contains("access")
                    || e.to_string().contains("denied")
                    || e.to_string().contains("cancelled")
                {
                    SecureStorageError::AccessDenied {
                        key: key.to_string(),
                    }
                } else if e.to_string().contains("Secret Service") || e.to_string().contains("dbus")
                {
                    SecureStorageError::BackendNotAvailable {
                        reason: format!("Secret Service unavailable: {}", e),
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

#[async_trait]
impl SecureStorage for LinuxStorage {
    async fn set(&self, key: &str, value: &str) -> Result<(), SecureStorageError> {
        if key.is_empty() {
            return Err(SecureStorageError::InvalidInput {
                message: "Key cannot be empty".to_string(),
            });
        }

        let entry = self.create_entry(key)?;
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
                tracing::debug!("Successfully stored key '{}' in Linux Secret Service", key);
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

        let entry = self.create_entry(key)?;
        let key = key.to_string();

        let result = tokio::task::spawn_blocking(move || entry.get_password())
            .await
            .map_err(|e| SecureStorageError::Internal {
                message: format!("Task join error: {}", e),
            })?;

        match result {
            Ok(value) => {
                tracing::debug!(
                    "Successfully retrieved key '{}' from Linux Secret Service",
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

        let entry = self.create_entry(key)?;
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
                    "Successfully deleted key '{}' from Linux Secret Service",
                    key
                );
                Ok(())
            }
            Err(KeyringError::NoEntry) => {
                // Deleting a non-existent key is considered success
                self.untrack_key(&key);
                tracing::debug!(
                    "Key '{}' not found in Linux Secret Service (already deleted)",
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
            tracing::debug!("Successfully cleared all keys from Linux Secret Service");
            Ok(())
        } else {
            Err(SecureStorageError::Internal {
                message: format!("Failed to clear some keys: {}", errors.join(", ")),
            })
        }
    }

    fn is_persistent(&self) -> SessionStatus {
        // Linux Secret Service storage is always persistent
        SessionStatus::Persistent
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // Note: These tests require a Linux environment with Secret Service available

    #[tokio::test]
    #[cfg(target_os = "linux")]
    async fn test_linux_storage_operations() {
        // This test will skip if Secret Service is not available
        let storage = match LinuxStorage::with_service_name("com.skiffy.test".to_string()) {
            Ok(storage) => storage,
            Err(SecureStorageError::BackendNotAvailable { .. }) => {
                println!("Skipping test: Secret Service not available");
                return;
            }
            Err(e) => panic!("Unexpected error creating LinuxStorage: {:?}", e),
        };

        let test_key = "test_linux_key";
        let test_value = "test_linux_value";

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
        // Create with custom service name to avoid fallback issues
        let storage = match LinuxStorage::with_service_name("com.skiffy.test".to_string()) {
            Ok(storage) => storage,
            Err(SecureStorageError::BackendNotAvailable { .. }) => {
                println!("Skipping test: Secret Service not available");
                return;
            }
            Err(e) => panic!("Unexpected error: {:?}", e),
        };

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
        // This test can run even without Secret Service
        match LinuxStorage::with_service_name("com.skiffy.test".to_string()) {
            Ok(storage) => {
                assert_eq!(storage.is_persistent(), SessionStatus::Persistent);
            }
            Err(SecureStorageError::BackendNotAvailable { .. }) => {
                // Expected if Secret Service is not available
                println!("Secret Service not available, cannot test persistence");
            }
            Err(e) => panic!("Unexpected error: {:?}", e),
        }
    }

    #[test]
    fn test_service_name_creation() {
        // Test service name without actually connecting
        let service_name = LinuxStorage::get_service_name().unwrap();
        assert_eq!(service_name, "com.skiffy.messenger");
    }
}
