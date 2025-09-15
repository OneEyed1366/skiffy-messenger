use super::{SecureStorage, SecureStorageError, SessionStatus};
use async_trait::async_trait;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

/// In-memory secure storage implementation
///
/// This implementation stores secrets in memory only and does not persist
/// them across application restarts. It is used as a fallback on platforms
/// where native secure storage is not available, particularly on Linux systems
/// without Secret Service API support.
///
/// # Security Notes
///
/// - Data is stored in RAM and will be lost when the application terminates
/// - No encryption is applied to in-memory data (relies on OS memory protection)
/// - Sensitive data should be cleared from memory when no longer needed
/// - This implementation always reports `SessionStatus::NonPersistent`
///
/// # Thread Safety
///
/// This implementation is thread-safe using `RwLock` for concurrent access.
#[derive(Debug)]
pub struct InMemoryStorage {
    data: Arc<RwLock<HashMap<String, String>>>,
}

impl InMemoryStorage {
    /// Creates a new in-memory storage instance
    ///
    /// # Returns
    ///
    /// Returns a new `InMemoryStorage` with an empty data store.
    pub fn new() -> Self {
        Self {
            data: Arc::new(RwLock::new(HashMap::new())),
        }
    }
}

impl Default for InMemoryStorage {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl SecureStorage for InMemoryStorage {
    async fn set(&self, key: &str, value: &str) -> Result<(), SecureStorageError> {
        if key.is_empty() {
            return Err(SecureStorageError::InvalidInput {
                message: "Key cannot be empty".to_string(),
            });
        }

        let mut data = self.data.write().await;
        data.insert(key.to_string(), value.to_string());

        tracing::debug!("Stored key '{}' in memory storage", key);
        Ok(())
    }

    async fn get(&self, key: &str) -> Result<String, SecureStorageError> {
        if key.is_empty() {
            return Err(SecureStorageError::InvalidInput {
                message: "Key cannot be empty".to_string(),
            });
        }

        let data = self.data.read().await;
        data.get(key).cloned().ok_or_else(|| {
            tracing::debug!("Key '{}' not found in memory storage", key);
            SecureStorageError::KeyNotFound {
                key: key.to_string(),
            }
        })
    }

    async fn delete(&self, key: &str) -> Result<(), SecureStorageError> {
        if key.is_empty() {
            return Err(SecureStorageError::InvalidInput {
                message: "Key cannot be empty".to_string(),
            });
        }

        let mut data = self.data.write().await;
        data.remove(key);

        tracing::debug!("Deleted key '{}' from memory storage", key);
        Ok(())
    }

    async fn clear(&self) -> Result<(), SecureStorageError> {
        let mut data = self.data.write().await;
        let count = data.len();
        data.clear();

        tracing::debug!("Cleared {} keys from memory storage", count);
        Ok(())
    }

    fn is_persistent(&self) -> SessionStatus {
        // In-memory storage is never persistent
        SessionStatus::NonPersistent
    }
}

// Implement Drop to clear sensitive data when the storage is dropped
impl Drop for InMemoryStorage {
    fn drop(&mut self) {
        // Note: We can't use async in Drop, so we can't guarantee the data is cleared
        // However, the HashMap will be dropped and its memory released
        tracing::debug!("InMemoryStorage instance dropped");
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_set_and_get() {
        let storage = InMemoryStorage::new();

        // Set a value
        let result = storage.set("test_key", "test_value").await;
        assert!(result.is_ok());

        // Get the value
        let value = storage.get("test_key").await;
        assert!(value.is_ok());
        assert_eq!(value.unwrap(), "test_value");
    }

    #[tokio::test]
    async fn test_get_nonexistent_key() {
        let storage = InMemoryStorage::new();

        let result = storage.get("nonexistent_key").await;
        assert!(result.is_err());
        match result.unwrap_err() {
            SecureStorageError::KeyNotFound { key } => {
                assert_eq!(key, "nonexistent_key");
            }
            _ => panic!("Expected KeyNotFound error"),
        }
    }

    #[tokio::test]
    async fn test_delete() {
        let storage = InMemoryStorage::new();

        // Set a value
        storage.set("test_key", "test_value").await.unwrap();

        // Delete the value
        let result = storage.delete("test_key").await;
        assert!(result.is_ok());

        // Verify it's gone
        let get_result = storage.get("test_key").await;
        assert!(get_result.is_err());
    }

    #[tokio::test]
    async fn test_delete_nonexistent_key() {
        let storage = InMemoryStorage::new();

        // Deleting a non-existent key should succeed
        let result = storage.delete("nonexistent_key").await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_clear() {
        let storage = InMemoryStorage::new();

        // Set multiple values
        storage.set("key1", "value1").await.unwrap();
        storage.set("key2", "value2").await.unwrap();
        storage.set("key3", "value3").await.unwrap();

        // Clear all values
        let result = storage.clear().await;
        assert!(result.is_ok());

        // Verify all values are gone
        assert!(storage.get("key1").await.is_err());
        assert!(storage.get("key2").await.is_err());
        assert!(storage.get("key3").await.is_err());
    }

    #[tokio::test]
    async fn test_empty_key_validation() {
        let storage = InMemoryStorage::new();

        // Test set with empty key
        let result = storage.set("", "value").await;
        assert!(result.is_err());
        match result.unwrap_err() {
            SecureStorageError::InvalidInput { message } => {
                assert!(message.contains("Key cannot be empty"));
            }
            _ => panic!("Expected InvalidInput error"),
        }

        // Test get with empty key
        let result = storage.get("").await;
        assert!(result.is_err());

        // Test delete with empty key
        let result = storage.delete("").await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_is_persistent() {
        let storage = InMemoryStorage::new();
        assert_eq!(storage.is_persistent(), SessionStatus::NonPersistent);
    }

    #[tokio::test]
    async fn test_concurrent_access() {
        let storage = Arc::new(InMemoryStorage::new());
        let storage_clone = storage.clone();

        // Spawn concurrent tasks
        let handle1 = tokio::spawn(async move {
            for i in 0..100 {
                storage_clone
                    .set(&format!("key_{}", i), &format!("value_{}", i))
                    .await
                    .unwrap();
            }
        });

        let storage_clone2 = storage.clone();
        let handle2 = tokio::spawn(async move {
            tokio::time::sleep(tokio::time::Duration::from_millis(10)).await;
            for i in 0..100 {
                let _ = storage_clone2.get(&format!("key_{}", i)).await;
            }
        });

        handle1.await.unwrap();
        handle2.await.unwrap();

        // Verify some data was stored
        let result = storage.get("key_50").await;
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "value_50");
    }
}
