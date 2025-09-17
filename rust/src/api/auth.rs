use anyhow::Result;
use flutter_rust_bridge::frb;
use crate::core::{
    matrix_client::MatrixClient,
    storage::{create_secure_storage, AuthKeys, SecureStorageError}
};
use thiserror::Error;

/// Errors that can occur during authentication operations
#[derive(Debug, Error)]
pub enum AuthError {
    #[error("Authentication failed: {0}")]
    Authentication(String),

    #[error("Storage error: {0}")]
    Storage(#[from] SecureStorageError),

    #[error("Session not found")]
    SessionNotFound,

    #[error("Network error: {0}")]
    Network(String),

    #[error("Invalid input: {0}")]
    InvalidInput(String),
}

impl From<anyhow::Error> for AuthError {
    fn from(err: anyhow::Error) -> Self {
        if let Some(storage_err) = err.downcast_ref::<SecureStorageError>() {
            AuthError::Storage(storage_err.clone())
        } else {
            AuthError::Authentication(err.to_string())
        }
    }
}

/// User information returned after successful authentication
#[derive(Debug, Clone)]
pub struct User {
    pub user_id: String,
    pub is_restored_session: bool,
}

/// Login with username and password
#[frb]
pub async fn login(home_server_url: String, username: String, password: String) -> Result<User, AuthError> {
    let storage = create_secure_storage()
        .await
        .map_err(|e| AuthError::Storage(SecureStorageError::Internal {
            message: e.to_string()
        }))?;

    let mut client = MatrixClient::new(&home_server_url, Some(false))
        .await
        .map_err(|e| AuthError::Network(e.to_string()))?;

    client.login(&username, &password, &*storage)
        .await
        .map_err(AuthError::from)?;

    let user_id = client.get_user_info()
        .await
        .ok_or(AuthError::SessionNotFound)?;

    Ok(User {
        user_id: user_id.to_string(),
        is_restored_session: false,
    })
}

/// Restore a previous session from secure storage
#[frb]
pub async fn restore_session(home_server_url: String) -> Result<Option<User>, AuthError> {
    let storage = create_secure_storage()
        .await
        .map_err(|e| AuthError::Storage(SecureStorageError::Internal {
            message: e.to_string()
        }))?;

    let mut client = MatrixClient::new(&home_server_url, Some(false))
        .await
        .map_err(|e| AuthError::Network(e.to_string()))?;

    let restored = client.restore_session(&*storage)
        .await
        .map_err(AuthError::from)?;

    if restored {
        let user_id = client.get_user_info()
            .await
            .ok_or(AuthError::SessionNotFound)?;

        Ok(Some(User {
            user_id: user_id.to_string(),
            is_restored_session: true,
        }))
    } else {
        Ok(None)
    }
}

/// Logout and clear all session data
#[frb]
pub async fn logout(home_server_url: String) -> Result<(), AuthError> {
    let storage = create_secure_storage()
        .await
        .map_err(|e| AuthError::Storage(SecureStorageError::Internal {
            message: e.to_string()
        }))?;

    let mut client = MatrixClient::new(&home_server_url, Some(false))
        .await
        .map_err(|e| AuthError::Network(e.to_string()))?;

    // First restore the session if it exists so we can logout properly
    let _ = client.restore_session(&*storage).await;

    client.logout(&*storage)
        .await
        .map_err(AuthError::from)?;

    Ok(())
}

/// Check if there is a stored session
#[frb]
pub async fn has_stored_session() -> Result<bool, AuthError> {
    let storage = create_secure_storage()
        .await
        .map_err(|e| AuthError::Storage(SecureStorageError::Internal {
            message: e.to_string()
        }))?;

    match storage.get(AuthKeys::ACCESS_TOKEN).await {
        Ok(_) => Ok(true),
        Err(SecureStorageError::KeyNotFound { .. }) => Ok(false),
        Err(e) => Err(AuthError::Storage(e)),
    }
}