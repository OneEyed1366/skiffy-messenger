use crate::core::storage::{create_secure_storage, SecureStorageRef, SessionStatus};
use flutter_rust_bridge::frb;
use once_cell::sync::Lazy;
use std::sync::Arc;
use tokio::sync::RwLock;

/// Global secure storage instance
static STORAGE: Lazy<Arc<RwLock<Option<SecureStorageRef>>>> =
    Lazy::new(|| Arc::new(RwLock::new(None)));

/// Session status for FFI layer
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FfiSessionStatus {
    /// Session data is securely persisted across app restarts
    Persistent,
    /// Session data is only stored in memory and will be lost on app restart
    NonPersistent,
}

impl From<SessionStatus> for FfiSessionStatus {
    fn from(status: SessionStatus) -> Self {
        match status {
            SessionStatus::Persistent => FfiSessionStatus::Persistent,
            SessionStatus::NonPersistent => FfiSessionStatus::NonPersistent,
        }
    }
}

/// Error types for secure storage operations exposed to Flutter
#[derive(Debug, Clone)]
pub struct SecureStorageApiError {
    pub message: String,
    pub error_type: String,
}

impl SecureStorageApiError {
    pub fn new(message: String, error_type: String) -> Self {
        Self {
            message,
            error_type,
        }
    }

    pub fn key_not_found(key: &str) -> Self {
        Self::new(format!("Key not found: {}", key), "KeyNotFound".to_string())
    }

    pub fn access_denied(key: &str) -> Self {
        Self::new(
            format!("Access denied for key: {}", key),
            "AccessDenied".to_string(),
        )
    }

    pub fn backend_not_available(reason: &str) -> Self {
        Self::new(
            format!("Storage backend not available: {}", reason),
            "BackendNotAvailable".to_string(),
        )
    }

    pub fn invalid_input(message: &str) -> Self {
        Self::new(
            format!("Invalid input: {}", message),
            "InvalidInput".to_string(),
        )
    }

    pub fn internal_error(message: &str) -> Self {
        Self::new(
            format!("Internal error: {}", message),
            "InternalError".to_string(),
        )
    }
}

impl From<crate::core::storage::SecureStorageError> for SecureStorageApiError {
    fn from(error: crate::core::storage::SecureStorageError) -> Self {
        match error {
            crate::core::storage::SecureStorageError::KeyNotFound { key } => {
                Self::key_not_found(&key)
            }
            crate::core::storage::SecureStorageError::AccessDenied { key } => {
                Self::access_denied(&key)
            }
            crate::core::storage::SecureStorageError::BackendNotAvailable { reason } => {
                Self::backend_not_available(&reason)
            }
            crate::core::storage::SecureStorageError::InvalidInput { message } => {
                Self::invalid_input(&message)
            }
            crate::core::storage::SecureStorageError::Internal { message } => {
                Self::internal_error(&message)
            }
        }
    }
}

/// Initialize the secure storage system
///
/// This function must be called before using any other secure storage functions.
/// It creates the appropriate storage backend for the current platform.
///
/// # Returns
///
/// Returns `Ok(())` on success, or an error message on failure.
#[frb]
pub async fn initialize_secure_storage() -> Result<(), SecureStorageApiError> {
    tracing::info!("Initializing secure storage system");

    let storage = create_secure_storage()
        .await
        .map_err(|e| SecureStorageApiError::internal_error(&e.to_string()))?;

    let mut storage_guard = STORAGE.write().await;
    *storage_guard = Some(storage);

    tracing::info!("Secure storage system initialized successfully");
    Ok(())
}

/// Store a key-value pair in secure storage
///
/// # Arguments
///
/// * `key` - The key to store the value under
/// * `value` - The secret value to store
///
/// # Returns
///
/// Returns `Ok(())` on success, or an error on failure.
#[frb]
pub async fn secure_storage_set(key: String, value: String) -> Result<(), SecureStorageApiError> {
    let storage_guard = STORAGE.read().await;
    let storage = storage_guard
        .as_ref()
        .ok_or_else(|| SecureStorageApiError::internal_error("Secure storage not initialized"))?;

    storage
        .set(&key, &value)
        .await
        .map_err(SecureStorageApiError::from)
}

/// Retrieve a value from secure storage by key
///
/// # Arguments
///
/// * `key` - The key to retrieve the value for
///
/// # Returns
///
/// Returns `Ok(String)` with the stored value on success, or an error on failure.
#[frb]
pub async fn secure_storage_get(key: String) -> Result<String, SecureStorageApiError> {
    let storage_guard = STORAGE.read().await;
    let storage = storage_guard
        .as_ref()
        .ok_or_else(|| SecureStorageApiError::internal_error("Secure storage not initialized"))?;

    storage.get(&key).await.map_err(SecureStorageApiError::from)
}

/// Delete a key-value pair from secure storage
///
/// # Arguments
///
/// * `key` - The key to delete
///
/// # Returns
///
/// Returns `Ok(())` on success, or an error on failure.
#[frb]
pub async fn secure_storage_delete(key: String) -> Result<(), SecureStorageApiError> {
    let storage_guard = STORAGE.read().await;
    let storage = storage_guard
        .as_ref()
        .ok_or_else(|| SecureStorageApiError::internal_error("Secure storage not initialized"))?;

    storage
        .delete(&key)
        .await
        .map_err(SecureStorageApiError::from)
}

/// Clear all stored values from secure storage
///
/// # Returns
///
/// Returns `Ok(())` on success, or an error on failure.
#[frb]
pub async fn secure_storage_clear() -> Result<(), SecureStorageApiError> {
    let storage_guard = STORAGE.read().await;
    let storage = storage_guard
        .as_ref()
        .ok_or_else(|| SecureStorageApiError::internal_error("Secure storage not initialized"))?;

    storage.clear().await.map_err(SecureStorageApiError::from)
}

/// Check if the current storage backend provides persistent storage
///
/// # Returns
///
/// Returns the session status indicating whether data will persist across app restarts.
#[frb]
pub async fn secure_storage_session_status() -> Result<FfiSessionStatus, SecureStorageApiError> {
    let storage_guard = STORAGE.read().await;
    let storage = storage_guard
        .as_ref()
        .ok_or_else(|| SecureStorageApiError::internal_error("Secure storage not initialized"))?;

    let status = storage.is_persistent();
    Ok(status.into())
}

/// Check if secure storage is initialized
///
/// # Returns
///
/// Returns `true` if secure storage is initialized, `false` otherwise.
#[frb]
pub async fn is_secure_storage_initialized() -> bool {
    let storage_guard = STORAGE.read().await;
    storage_guard.is_some()
}

#[cfg(test)]
mod tests {
    use crate::core::storage::create_memory_storage;
    use serial_test::serial;

    use super::*;

    async fn setup_test_storage() {
        // Force use of memory storage for predictable tests
        let storage = create_memory_storage();
        let mut storage_guard = STORAGE.write().await;
        *storage_guard = Some(storage);
    }

    #[tokio::test]
    #[serial]
    async fn test_storage_not_initialized() {
        // Clear any existing storage
        {
            let mut storage_guard = STORAGE.write().await;
            *storage_guard = None;
        }

        let result = secure_storage_set("test".to_string(), "value".to_string()).await;
        assert!(result.is_err());
        assert_eq!(result.unwrap_err().error_type, "InternalError");
    }

    #[tokio::test]
    #[serial]
    async fn test_initialization() {
        // Clean slate
        {
            let mut storage_guard = STORAGE.write().await;
            *storage_guard = None;
        }

        let result = initialize_secure_storage().await;
        assert!(result.is_ok());

        let is_initialized = is_secure_storage_initialized().await;
        assert!(is_initialized);
    }

    #[tokio::test]
    #[serial]
    async fn test_set_get_delete() {
        // Clean slate
        {
            let mut storage_guard = STORAGE.write().await;
            *storage_guard = None;
        }

        setup_test_storage().await;

        // Test set
        let result = secure_storage_set("test_key".to_string(), "test_value".to_string()).await;
        assert!(result.is_ok());

        // Test get
        let result = secure_storage_get("test_key".to_string()).await;
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "test_value");

        // Test delete
        let result = secure_storage_delete("test_key".to_string()).await;
        assert!(result.is_ok());

        // Verify deletion
        let result = secure_storage_get("test_key".to_string()).await;
        assert!(result.is_err());
        assert_eq!(result.unwrap_err().error_type, "KeyNotFound");
    }

    #[tokio::test]
    #[serial]
    async fn test_session_status() {
        // Clean slate
        {
            let mut storage_guard = STORAGE.write().await;
            *storage_guard = None;
        }

        setup_test_storage().await;

        let result = secure_storage_session_status().await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    #[serial]
    async fn test_clear() {
        // Clean slate
        {
            let mut storage_guard = STORAGE.write().await;
            *storage_guard = None;
        }

        setup_test_storage().await;

        // Set multiple values
        let _ = secure_storage_set("key1".to_string(), "value1".to_string()).await;
        let _ = secure_storage_set("key2".to_string(), "value2".to_string()).await;

        // Clear
        let result = secure_storage_clear().await;
        assert!(result.is_ok());

        // Verify cleared
        let result1 = secure_storage_get("key1".to_string()).await;
        let result2 = secure_storage_get("key2".to_string()).await;
        assert!(result1.is_err());
        assert!(result2.is_err());
    }
}
