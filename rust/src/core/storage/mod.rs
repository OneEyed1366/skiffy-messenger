use anyhow::Result;
use async_trait::async_trait;
use std::sync::Arc;
use thiserror::Error;

// Platform-specific implementations
#[cfg(any(target_os = "macos", target_os = "ios"))]
pub mod keychain;

#[cfg(target_os = "windows")]
pub mod windows;

#[cfg(target_os = "linux")]
pub mod linux;

pub mod factory;
pub mod memory;

// Re-exports
pub use factory::{create_memory_storage, create_secure_storage};
pub use memory::InMemoryStorage;

#[cfg(any(target_os = "macos", target_os = "ios"))]
pub use keychain::KeychainStorage;

/// Errors that can occur during secure storage operations
#[derive(Error, Debug)]
pub enum SecureStorageError {
    /// The key was not found in storage
    #[error("Key not found: {key}")]
    KeyNotFound { key: String },

    /// Access was denied by the storage backend
    #[error("Access denied for key: {key}")]
    AccessDenied { key: String },

    /// The storage backend is not available
    #[error("Storage backend not available: {reason}")]
    BackendNotAvailable { reason: String },

    /// Invalid input was provided
    #[error("Invalid input: {message}")]
    InvalidInput { message: String },

    /// An internal error occurred
    #[error("Internal error: {message}")]
    Internal { message: String },
}

/// Status of the storage session persistence
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SessionStatus {
    /// Session data is securely persisted across app restarts
    Persistent,
    /// Session data is only stored in memory and will be lost on app restart
    NonPersistent,
}

/// Trait defining the secure storage interface
///
/// This trait abstracts platform-specific secure storage mechanisms
/// such as macOS Keychain, Windows Credential Manager, and Linux Secret Service API.
///
/// # Example
///
/// ```rust
/// use crate::core::storage::{SecureStorage, create_secure_storage};
///
/// #[tokio::main]
/// async fn main() -> anyhow::Result<()> {
///     let storage = create_secure_storage().await?;
///
///     // Store a credential
///     storage.set("auth_token", "secret_value").await?;
///
///     // Retrieve the credential
///     let token = storage.get("auth_token").await?;
///
///     // Delete the credential
///     storage.delete("auth_token").await?;
///
///     Ok(())
/// }
/// ```
#[async_trait]
pub trait SecureStorage: Send + Sync {
    /// Store a key-value pair in secure storage
    ///
    /// # Arguments
    ///
    /// * `key` - The key to store the value under
    /// * `value` - The secret value to store
    ///
    /// # Returns
    ///
    /// Returns `Ok(())` on success, or a `SecureStorageError` on failure.
    async fn set(&self, key: &str, value: &str) -> Result<(), SecureStorageError>;

    /// Retrieve a value from secure storage by key
    ///
    /// # Arguments
    ///
    /// * `key` - The key to retrieve the value for
    ///
    /// # Returns
    ///
    /// Returns `Ok(String)` with the stored value on success,
    /// or a `SecureStorageError` on failure (including `KeyNotFound`).
    async fn get(&self, key: &str) -> Result<String, SecureStorageError>;

    /// Delete a key-value pair from secure storage
    ///
    /// # Arguments
    ///
    /// * `key` - The key to delete
    ///
    /// # Returns
    ///
    /// Returns `Ok(())` on success, or a `SecureStorageError` on failure.
    /// Returns `Ok(())` even if the key doesn't exist.
    async fn delete(&self, key: &str) -> Result<(), SecureStorageError>;

    /// Clear all stored values
    ///
    /// # Returns
    ///
    /// Returns `Ok(())` on success, or a `SecureStorageError` on failure.
    async fn clear(&self) -> Result<(), SecureStorageError>;

    /// Check if the storage backend provides persistent storage
    ///
    /// # Returns
    ///
    /// Returns `SessionStatus::Persistent` if data survives app restarts,
    /// `SessionStatus::NonPersistent` if data is only stored in memory.
    fn is_persistent(&self) -> SessionStatus;
}

/// Type alias for a thread-safe secure storage implementation
pub type SecureStorageRef = Arc<dyn SecureStorage>;

#[cfg(test)]
mod tests;
