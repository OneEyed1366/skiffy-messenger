use super::SecureStorageRef;
use anyhow::{Context, Result};
use std::sync::Arc;

#[cfg(any(target_os = "macos", target_os = "ios"))]
use super::keychain::KeychainStorage;

#[cfg(target_os = "windows")]
use super::windows::WindowsStorage;

#[cfg(target_os = "linux")]
use super::linux::LinuxStorage;

use super::memory::InMemoryStorage;

/// Creates the appropriate secure storage implementation for the current platform
///
/// This factory function detects the current platform and creates the most appropriate
/// secure storage backend. For Linux, it attempts to create a Secret Service-based
/// storage and falls back to in-memory storage if the service is unavailable.
///
/// # Platform Support
///
/// - **macOS/iOS**: Uses Keychain Services via the `security-framework` crate
/// - **Windows**: Uses Credential Manager via the `keyring` crate
/// - **Linux**: Uses Secret Service API via the `keyring` crate, falls back to in-memory storage
///
/// # Returns
///
/// Returns `Ok(SecureStorageRef)` with the appropriate storage backend,
/// or an error if initialization fails.
///
/// # Examples
///
/// ```rust
/// use crate::core::storage::create_secure_storage;
///
/// #[tokio::main]
/// async fn main() -> anyhow::Result<()> {
///     let storage = create_secure_storage().await?;
///
///     // Use storage...
///     storage.set("key", "value").await?;
///
///     Ok(())
/// }
/// ```
pub async fn create_secure_storage() -> Result<SecureStorageRef> {
    create_platform_storage().await
}

#[cfg(any(target_os = "macos", target_os = "ios"))]
async fn create_platform_storage() -> Result<SecureStorageRef> {
    tracing::info!("Initializing Keychain storage for macOS/iOS");

    let storage = KeychainStorage::new().context("Failed to initialize Keychain storage")?;

    Ok(Arc::new(storage))
}

#[cfg(target_os = "windows")]
async fn create_platform_storage() -> Result<SecureStorageRef> {
    tracing::info!("Initializing Windows Credential Manager storage");

    let storage =
        WindowsStorage::new().context("Failed to initialize Windows Credential Manager storage")?;

    Ok(Arc::new(storage))
}

#[cfg(target_os = "linux")]
async fn create_platform_storage() -> Result<SecureStorageRef> {
    tracing::info!("Attempting to initialize Linux Secret Service storage");

    // Try to create Linux Secret Service storage first
    match LinuxStorage::new() {
        Ok(storage) => {
            tracing::info!("Successfully initialized Linux Secret Service storage");
            Ok(Arc::new(storage))
        }
        Err(e) => {
            tracing::warn!(
                "Failed to initialize Linux Secret Service storage, falling back to in-memory: {}",
                e
            );

            // Fall back to in-memory storage
            let storage = InMemoryStorage::new();
            Ok(Arc::new(storage))
        }
    }
}

#[cfg(not(any(
    target_os = "macos",
    target_os = "ios",
    target_os = "windows",
    target_os = "linux"
)))]
async fn create_platform_storage() -> Result<SecureStorageRef> {
    tracing::warn!("Unsupported platform, using in-memory storage");
    let storage = InMemoryStorage::new();
    Ok(Arc::new(storage))
}

/// Creates an in-memory storage instance for testing purposes
///
/// This function is useful for unit tests and scenarios where you need
/// a predictable, isolated storage backend.
///
/// # Returns
///
/// Returns a new `SecureStorageRef` backed by in-memory storage.
pub fn create_memory_storage() -> SecureStorageRef {
    Arc::new(InMemoryStorage::new())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_create_secure_storage() {
        let storage = create_secure_storage().await;
        assert!(storage.is_ok());
    }

    #[tokio::test]
    async fn test_create_memory_storage() {
        let storage = create_memory_storage();

        // Test basic operations
        let result = storage.set("test_key", "test_value").await;
        assert!(result.is_ok());

        let value = storage.get("test_key").await;
        assert!(value.is_ok());
        assert_eq!(value.unwrap(), "test_value");

        let delete_result = storage.delete("test_key").await;
        assert!(delete_result.is_ok());
    }
}
