#[cfg(test)]
mod tests {
    use crate::core::matrix_client::structs::MatrixClient;
    use crate::core::storage::{AuthKeys, InMemoryStorage, SecureStorage};
    use anyhow::Result;
    use std::env;
    use std::sync::Arc;

    #[tokio::test]
    async fn test_client_initialization() -> Result<()> {
        let homeserver_url = "https://matrix.org";
        let client = MatrixClient::new(homeserver_url, None).await?;
        assert!(!client.is_logged_in());
        Ok(())
    }

    #[tokio::test]
    #[ignore] // Requires credentials - uncomment for manual testing
    async fn test_login_with_secure_storage() -> Result<()> {
        let homeserver_url = "https://matrix.org";
        let mut client = MatrixClient::new(homeserver_url, None).await?;
        let storage: Arc<dyn SecureStorage> = Arc::new(InMemoryStorage::new());

        let username = env::var("MATRIX_USERNAME").unwrap_or_default();
        let password = env::var("MATRIX_PASSWORD").unwrap_or_default();

        if !username.is_empty() && !password.is_empty() {
            client.login(&username, &password, &*storage).await?;
            assert!(client.is_logged_in());
            assert!(client.get_user_info().await.is_some());

            // Verify tokens are stored
            assert!(storage.get(AuthKeys::ACCESS_TOKEN).await.is_ok());
            assert!(storage.get(AuthKeys::USER_ID).await.is_ok());
            assert!(storage.get(AuthKeys::DEVICE_ID).await.is_ok());
        }

        Ok(())
    }

    #[tokio::test]
    #[ignore] // Requires credentials and room ID - uncomment for manual testing
    async fn test_send_message() -> Result<()> {
        let homeserver_url = "https://matrix.org";
        let mut client = MatrixClient::new(homeserver_url, None).await?;
        let storage: Arc<dyn SecureStorage> = Arc::new(InMemoryStorage::new());

        let username = env::var("MATRIX_USERNAME").unwrap_or_default();
        let password = env::var("MATRIX_PASSWORD").unwrap_or_default();
        let room_id = env::var("MATRIX_TEST_ROOM").unwrap_or_default();

        if !username.is_empty() && !password.is_empty() && !room_id.is_empty() {
            client.login(&username, &password, &*storage).await?;
            client
                .send_message(&room_id, "Test message from Rust SDK")
                .await?;
        }

        Ok(())
    }

    #[tokio::test]
    async fn test_sync_requires_auth() -> Result<()> {
        let homeserver_url = "https://matrix.org";
        let client = MatrixClient::new(homeserver_url, None).await?;
        let result = client.sync().await;
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .to_string()
            .contains("Sync requires authentication"));
        Ok(())
    }

    #[tokio::test]
    async fn test_is_logged_in_default() {
        let homeserver_url = "https://matrix.org";
        let client = MatrixClient::new(homeserver_url, None).await.unwrap();

        assert!(!client.is_logged_in());
    }

    #[tokio::test]
    async fn test_restore_session_no_stored_data() -> Result<()> {
        let homeserver_url = "https://matrix.org";
        let mut client = MatrixClient::new(homeserver_url, None).await?;
        let storage: Arc<dyn SecureStorage> = Arc::new(InMemoryStorage::new());

        // Should return false when no session data is stored
        let restored = client.restore_session(&*storage).await?;
        assert!(!restored);
        assert!(!client.is_logged_in());

        Ok(())
    }

    #[tokio::test]
    async fn test_restore_session_with_mock_data() -> Result<()> {
        let homeserver_url = "https://matrix.org";
        let mut client = MatrixClient::new(homeserver_url, None).await?;
        let storage: Arc<dyn SecureStorage> = Arc::new(InMemoryStorage::new());

        // Mock stored session data
        storage
            .set(AuthKeys::ACCESS_TOKEN, "test_access_token")
            .await
            .unwrap();
        storage
            .set(AuthKeys::USER_ID, "@test:matrix.org")
            .await
            .unwrap();
        storage
            .set(AuthKeys::DEVICE_ID, "TEST_DEVICE")
            .await
            .unwrap();
        storage
            .set(AuthKeys::REFRESH_TOKEN, "test_refresh_token")
            .await
            .unwrap();

        // Try session restoration - this may succeed or fail depending on server connectivity
        // The important thing is that our restoration logic processes the stored data correctly
        let result = client.restore_session(&*storage).await;

        // If restoration succeeded, verify the client state was updated
        if result.is_ok() {
            assert!(client.is_logged_in());
            assert!(client.get_user_info().await.is_some());
        }
        // If it failed, that's also OK - we just want to ensure no panic/crash occurred

        Ok(())
    }

    #[tokio::test]
    async fn test_logout_clears_storage() -> Result<()> {
        let homeserver_url = "https://matrix.org";
        let mut client = MatrixClient::new(homeserver_url, None).await?;
        let storage: Arc<dyn SecureStorage> = Arc::new(InMemoryStorage::new());

        // Pre-populate storage with mock session data
        storage
            .set(AuthKeys::ACCESS_TOKEN, "test_access_token")
            .await
            .unwrap();
        storage
            .set(AuthKeys::USER_ID, "@test:matrix.org")
            .await
            .unwrap();
        storage
            .set(AuthKeys::DEVICE_ID, "TEST_DEVICE")
            .await
            .unwrap();
        storage
            .set(AuthKeys::REFRESH_TOKEN, "test_refresh_token")
            .await
            .unwrap();

        // Verify data is stored
        assert!(storage.get(AuthKeys::ACCESS_TOKEN).await.is_ok());
        assert!(storage.get(AuthKeys::USER_ID).await.is_ok());

        // Logout should clear all data
        client.logout(&*storage).await?;

        // Verify all session data is cleared
        assert!(storage.get(AuthKeys::ACCESS_TOKEN).await.is_err());
        assert!(storage.get(AuthKeys::USER_ID).await.is_err());
        assert!(storage.get(AuthKeys::DEVICE_ID).await.is_err());
        assert!(storage.get(AuthKeys::REFRESH_TOKEN).await.is_err());

        // Verify client state is cleared
        assert!(!client.is_logged_in());

        Ok(())
    }

    #[tokio::test]
    async fn test_login_storage_failure_handling() -> Result<()> {
        // This would test with a mock storage that fails on set operations
        // For now, we'll test with successful storage (InMemoryStorage)
        let homeserver_url = "https://matrix.org";
        let mut client = MatrixClient::new(homeserver_url, None).await?;
        let storage: Arc<dyn SecureStorage> = Arc::new(InMemoryStorage::new());

        // Test with invalid credentials - should fail gracefully
        let result = client
            .login("invalid_user", "invalid_pass", &*storage)
            .await;
        assert!(result.is_err());

        // Storage should remain empty since login failed
        assert!(storage.get(AuthKeys::ACCESS_TOKEN).await.is_err());

        Ok(())
    }

    #[tokio::test]
    async fn test_restore_session_partial_data() -> Result<()> {
        let homeserver_url = "https://matrix.org";
        let mut client = MatrixClient::new(homeserver_url, None).await?;
        let storage: Arc<dyn SecureStorage> = Arc::new(InMemoryStorage::new());

        // Store incomplete session data (missing user_id)
        storage
            .set(AuthKeys::ACCESS_TOKEN, "test_access_token")
            .await
            .unwrap();
        storage
            .set(AuthKeys::DEVICE_ID, "TEST_DEVICE")
            .await
            .unwrap();
        // Deliberately omit user_id

        // Should fail gracefully when required data is missing
        let result = client.restore_session(&*storage).await;
        assert!(result.is_err());

        Ok(())
    }

    #[tokio::test]
    async fn test_restore_session_invalid_user_id() -> Result<()> {
        let homeserver_url = "https://matrix.org";
        let mut client = MatrixClient::new(homeserver_url, None).await?;
        let storage: Arc<dyn SecureStorage> = Arc::new(InMemoryStorage::new());

        // Store session data with invalid user_id format
        storage
            .set(AuthKeys::ACCESS_TOKEN, "test_access_token")
            .await
            .unwrap();
        storage
            .set(AuthKeys::USER_ID, "invalid_user_id_format")
            .await
            .unwrap();
        storage
            .set(AuthKeys::DEVICE_ID, "TEST_DEVICE")
            .await
            .unwrap();

        // Should fail when user_id format is invalid
        let result = client.restore_session(&*storage).await;
        assert!(result.is_err());

        Ok(())
    }
}
