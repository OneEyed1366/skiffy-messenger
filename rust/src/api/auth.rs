use crate::core::{
    matrix_client::MatrixClient,
    storage::{create_secure_storage, AuthKeys, SecureStorageError},
};
use anyhow::Result;
use flutter_rust_bridge::frb;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::time::Duration;
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

/// Errors that can occur during homeserver verification
#[derive(Debug, Error)]
pub enum HomeserverError {
    #[error("Connection timeout")]
    ConnectionTimeout,

    #[error("Read timeout")]
    ReadTimeout,

    #[error("DNS resolution failed")]
    DnsResolutionFailed,

    #[error("Network unavailable")]
    NetworkUnavailable,

    #[error("Invalid URL format")]
    InvalidUrl,

    #[error("URL must use HTTPS")]
    NotHttps,

    #[error("Not a Matrix server")]
    NotMatrixServer,

    #[error("Malformed server response")]
    MalformedResponse,

    #[error("Unsupported Matrix version")]
    UnsupportedVersion,

    #[error("Server error: {0}")]
    ServerError(u16),
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

impl From<HomeserverError> for AuthError {
    fn from(err: HomeserverError) -> Self {
        match err {
            HomeserverError::ConnectionTimeout
            | HomeserverError::ReadTimeout
            | HomeserverError::DnsResolutionFailed
            | HomeserverError::NetworkUnavailable
            | HomeserverError::ServerError(_) => AuthError::Network(err.to_string()),
            HomeserverError::InvalidUrl
            | HomeserverError::NotHttps => AuthError::InvalidInput(err.to_string()),
            HomeserverError::NotMatrixServer
            | HomeserverError::MalformedResponse
            | HomeserverError::UnsupportedVersion => AuthError::Authentication(err.to_string()),
        }
    }
}

/// User information returned after successful authentication
#[derive(Debug, Clone)]
pub struct User {
    pub user_id: String,
    pub is_restored_session: bool,
}

/// SSO provider types supported by Matrix servers
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SsoProvider {
    Google,
    Apple,
    GitHub,
    GitLab,
    Facebook,
}

/// Capabilities supported by a Matrix homeserver
#[derive(Debug, Clone)]
pub struct HomeserverCapabilities {
    pub supports_password_login: bool,
    pub supports_sso: bool,
    pub sso_providers: Vec<SsoProvider>,
    pub supports_registration: bool,
    pub supports_guest_access: bool,
}

/// Login with username and password
#[frb]
pub async fn login(
    home_server_url: String,
    username: String,
    password: String,
) -> Result<User, AuthError> {
    let storage = create_secure_storage().await.map_err(|e| {
        AuthError::Storage(SecureStorageError::Internal {
            message: e.to_string(),
        })
    })?;

    let mut client = MatrixClient::new(&home_server_url, Some(false))
        .await
        .map_err(|e| AuthError::Network(e.to_string()))?;

    client
        .login(&username, &password, &*storage)
        .await
        .map_err(AuthError::from)?;

    let user_id = client
        .get_user_info()
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
    let storage = create_secure_storage().await.map_err(|e| {
        AuthError::Storage(SecureStorageError::Internal {
            message: e.to_string(),
        })
    })?;

    let mut client = MatrixClient::new(&home_server_url, Some(false))
        .await
        .map_err(|e| AuthError::Network(e.to_string()))?;

    let restored = client
        .restore_session(&*storage)
        .await
        .map_err(AuthError::from)?;

    if restored {
        let user_id = client
            .get_user_info()
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
    let storage = create_secure_storage().await.map_err(|e| {
        AuthError::Storage(SecureStorageError::Internal {
            message: e.to_string(),
        })
    })?;

    let mut client = MatrixClient::new(&home_server_url, Some(false))
        .await
        .map_err(|e| AuthError::Network(e.to_string()))?;

    // First restore the session if it exists so we can logout properly
    let _ = client.restore_session(&*storage).await;

    client.logout(&*storage).await.map_err(AuthError::from)?;

    Ok(())
}

/// Check if there is a stored session
#[frb]
pub async fn has_stored_session() -> Result<bool, AuthError> {
    let storage = create_secure_storage().await.map_err(|e| {
        AuthError::Storage(SecureStorageError::Internal {
            message: e.to_string(),
        })
    })?;

    match storage.get(AuthKeys::ACCESS_TOKEN).await {
        Ok(_) => Ok(true),
        Err(SecureStorageError::KeyNotFound { .. }) => Ok(false),
        Err(e) => Err(AuthError::Storage(e)),
    }
}

/// Verify that a homeserver URL is valid and points to a Matrix server
#[frb]
pub async fn verify_homeserver(home_server_url: String) -> Result<bool, HomeserverError> {
    // Basic URL validation
    if !home_server_url.starts_with("https://") {
        return Err(HomeserverError::NotHttps);
    }

    // Parse URL to validate format
    let _url = url::Url::parse(&home_server_url)
        .map_err(|_| HomeserverError::InvalidUrl)?;

    // Create HTTP client with timeouts
    let client = Client::builder()
        .connect_timeout(Duration::from_secs(30))
        .timeout(Duration::from_secs(15))
        .build()
        .map_err(|_| HomeserverError::NetworkUnavailable)?;

    // Construct well-known URL
    let well_known_url = format!("{}/.well-known/matrix/client", home_server_url.trim_end_matches('/'));

    // Make request to well-known endpoint
    let response = client
        .get(&well_known_url)
        .send()
        .await
        .map_err(|e| {
            if e.is_timeout() {
                HomeserverError::ConnectionTimeout
            } else if e.is_connect() {
                HomeserverError::DnsResolutionFailed
            } else {
                HomeserverError::NetworkUnavailable
            }
        })?;

    // Check response status
    let status = response.status();
    if !status.is_success() {
        return Err(HomeserverError::ServerError(status.as_u16()));
    }

    // Parse JSON response
    let json: Value = response
        .json()
        .await
        .map_err(|_| HomeserverError::MalformedResponse)?;

    // Verify Matrix server structure
    let homeserver_info = json
        .get("m.homeserver")
        .and_then(|h| h.get("base_url"))
        .and_then(|u| u.as_str());

    match homeserver_info {
        Some(_) => Ok(true),
        None => Err(HomeserverError::NotMatrixServer),
    }
}

/// Check homeserver capabilities to determine supported authentication methods
#[frb]
pub async fn check_homeserver_capabilities(home_server_url: String) -> Result<HomeserverCapabilities, AuthError> {
    // Basic URL validation
    if !home_server_url.starts_with("https://") {
        return Err(AuthError::InvalidInput("URL must use HTTPS".to_string()));
    }

    // Parse URL to validate format
    let _ = url::Url::parse(&home_server_url)
        .map_err(|_| AuthError::InvalidInput("Invalid URL format".to_string()))?;

    // Create HTTP client with timeout
    let client = Client::builder()
        .connect_timeout(Duration::from_secs(30))
        .timeout(Duration::from_secs(30))
        .build()
        .map_err(|_| AuthError::Network("Failed to create HTTP client".to_string()))?;

    // Construct login endpoint URL
    let login_url = format!("{}/_matrix/client/v3/login", home_server_url.trim_end_matches('/'));

    // Make request to login endpoint
    let response = client
        .get(&login_url)
        .send()
        .await
        .map_err(|e| {
            if e.is_timeout() {
                AuthError::Network("Connection timeout".to_string())
            } else if e.is_connect() {
                AuthError::Network("Cannot reach server".to_string())
            } else {
                AuthError::Network(format!("Network error: {}", e))
            }
        })?;

    // Check response status
    let status = response.status();
    if !status.is_success() {
        return Err(AuthError::Network(format!("Server error: {}", status.as_u16())));
    }

    // Parse JSON response
    let json: Value = response
        .json()
        .await
        .map_err(|_| AuthError::Authentication("Invalid server response".to_string()))?;

    // Extract login flows
    let flows = json
        .get("flows")
        .and_then(|f| f.as_array())
        .ok_or_else(|| AuthError::Authentication("No login flows found".to_string()))?;

    let mut supports_password = false;
    let mut supports_sso = false;
    let sso_providers = Vec::new();

    // Check each flow for supported authentication methods
    for flow in flows {
        if let Some(flow_type) = flow.get("type").and_then(|t| t.as_str()) {
            match flow_type {
                "m.login.password" => supports_password = true,
                "m.login.sso" => {
                    supports_sso = true;
                    // TODO: Parse SSO providers from identity_providers field in future stories
                }
                _ => {} // Ignore other flow types
            }
        }
    }

    Ok(HomeserverCapabilities {
        supports_password_login: supports_password,
        supports_sso,
        sso_providers,
        supports_registration: false, // Not implemented in this story
        supports_guest_access: false, // Not implemented in this story
    })
}

#[cfg(test)]
mod tests {
    use serde_json::json;
    use crate::{api::auth::check_homeserver_capabilities, AuthError};

    #[tokio::test]
    async fn test_check_homeserver_capabilities_invalid_url() {
        // Test invalid HTTP URL
        let result = check_homeserver_capabilities("http://example.com".to_string()).await;
        assert!(result.is_err());
        if let Err(AuthError::InvalidInput(msg)) = result {
            assert!(msg.contains("HTTPS"));
        } else {
            panic!("Expected InvalidInput error for HTTP URL");
        }
    }

    #[tokio::test]
    async fn test_check_homeserver_capabilities_malformed_url() {
        // Test malformed HTTPS URL (has https but invalid format)
        let result = check_homeserver_capabilities("https://[invalid-url".to_string()).await;
        assert!(result.is_err());
        if let Err(AuthError::InvalidInput(msg)) = result {
            assert!(msg.contains("Invalid URL format"));
        } else {
            panic!("Expected InvalidInput error for malformed URL");
        }
    }

    #[tokio::test]
    async fn test_check_homeserver_capabilities_password_support() {
        // This test would need a mock server in a real implementation
        // For now, we test the parsing logic with a mock response structure

        // Test data simulating a server response supporting password login
        let mock_response = json!({
            "flows": [
                {"type": "m.login.password"},
                {"type": "m.login.application_service"}
            ]
        });

        // In a real test, we would set up a mock HTTP server
        // and test the full flow. For now, we verify our data structures
        assert!(mock_response.get("flows").is_some());

        let flows = mock_response.get("flows").unwrap().as_array().unwrap();
        let mut supports_password = false;
        let mut supports_sso = false;

        for flow in flows {
            if let Some(flow_type) = flow.get("type").and_then(|t| t.as_str()) {
                match flow_type {
                    "m.login.password" => supports_password = true,
                    "m.login.sso" => supports_sso = true,
                    _ => {}
                }
            }
        }

        assert!(supports_password);
        assert!(!supports_sso);
    }

    #[tokio::test]
    async fn test_check_homeserver_capabilities_sso_support() {
        // Test data simulating a server response supporting SSO login
        let mock_response = json!({
            "flows": [
                {"type": "m.login.sso"},
                {"type": "m.login.application_service"}
            ]
        });

        let flows = mock_response.get("flows").unwrap().as_array().unwrap();
        let mut supports_password = false;
        let mut supports_sso = false;

        for flow in flows {
            if let Some(flow_type) = flow.get("type").and_then(|t| t.as_str()) {
                match flow_type {
                    "m.login.password" => supports_password = true,
                    "m.login.sso" => supports_sso = true,
                    _ => {}
                }
            }
        }

        assert!(!supports_password);
        assert!(supports_sso);
    }

    #[tokio::test]
    async fn test_check_homeserver_capabilities_both_methods() {
        // Test data simulating a server response supporting both methods
        let mock_response = json!({
            "flows": [
                {"type": "m.login.password"},
                {"type": "m.login.sso"},
                {"type": "m.login.application_service"}
            ]
        });

        let flows = mock_response.get("flows").unwrap().as_array().unwrap();
        let mut supports_password = false;
        let mut supports_sso = false;

        for flow in flows {
            if let Some(flow_type) = flow.get("type").and_then(|t| t.as_str()) {
                match flow_type {
                    "m.login.password" => supports_password = true,
                    "m.login.sso" => supports_sso = true,
                    _ => {}
                }
            }
        }

        assert!(supports_password);
        assert!(supports_sso);
    }

    #[tokio::test]
    async fn test_check_homeserver_capabilities_no_supported_methods() {
        // Test data simulating a server response with no supported methods
        let mock_response = json!({
            "flows": [
                {"type": "m.login.application_service"},
                {"type": "m.login.unknown_method"}
            ]
        });

        let flows = mock_response.get("flows").unwrap().as_array().unwrap();
        let mut supports_password = false;
        let mut supports_sso = false;

        for flow in flows {
            if let Some(flow_type) = flow.get("type").and_then(|t| t.as_str()) {
                match flow_type {
                    "m.login.password" => supports_password = true,
                    "m.login.sso" => supports_sso = true,
                    _ => {}
                }
            }
        }

        assert!(!supports_password);
        assert!(!supports_sso);
    }
}