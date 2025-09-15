#[cfg(test)]
mod tests {
    use crate::core::matrix_client::structs::MatrixClient;
    use anyhow::Result;
    use std::env;

    #[tokio::test]
    async fn test_client_initialization() -> Result<()> {
        let homeserver_url = "https://matrix.org";
        let client = MatrixClient::new(homeserver_url, None).await?;
        assert!(!client.is_logged_in());
        Ok(())
    }

    #[tokio::test]
    #[ignore] // Requires credentials - uncomment for manual testing
    async fn test_login() -> Result<()> {
        let homeserver_url = "https://matrix.org";
        let mut client = MatrixClient::new(homeserver_url, None).await?;

        let username = env::var("MATRIX_USERNAME").unwrap_or_default();
        let password = env::var("MATRIX_PASSWORD").unwrap_or_default();

        if !username.is_empty() && !password.is_empty() {
            client.login(&username, &password).await?;
            assert!(client.is_logged_in());
            assert!(client.get_user_info().await.is_some());
        }

        Ok(())
    }

    #[tokio::test]
    #[ignore] // Requires credentials and room ID - uncomment for manual testing
    async fn test_send_message() -> Result<()> {
        let homeserver_url = "https://matrix.org";
        let mut client = MatrixClient::new(homeserver_url, None).await?;

        let username = env::var("MATRIX_USERNAME").unwrap_or_default();
        let password = env::var("MATRIX_PASSWORD").unwrap_or_default();
        let room_id = env::var("MATRIX_TEST_ROOM").unwrap_or_default();

        if !username.is_empty() && !password.is_empty() && !room_id.is_empty() {
            client.login(&username, &password).await?;
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
}
