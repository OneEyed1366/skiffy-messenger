use anyhow::{Context, Result};
use matrix_sdk::{
    config::{RequestConfig, SyncSettings},
    ruma::{events::room::message::RoomMessageEventContent, OwnedDeviceId, OwnedRoomId, OwnedUserId},
    Client, SessionMeta, SessionTokens,
    authentication::matrix::MatrixSession,
};
use std::str::FromStr;
use url::Url;
use crate::core::storage::{AuthKeys, SecureStorage};

#[derive(Debug)]
pub struct MatrixClient {
    client: Client,
    user_id: Option<OwnedUserId>,
    device_id: Option<OwnedDeviceId>,
}

impl MatrixClient {
    pub async fn new(home_server_url: &str, disable_retries: Option<bool>) -> Result<Self> {
        let url = Url::parse(home_server_url)?;
        let client = Client::builder()
            .homeserver_url(&url)
            .request_config(if disable_retries.unwrap_or(false) {
                RequestConfig::new().disable_retry()
            } else {
                RequestConfig::new()
            })
            .build()
            .await?;

        Ok(MatrixClient {
            client,
            user_id: None,
            device_id: None,
        })
    }

    pub async fn login(&mut self, username: &str, password: &str, storage: &dyn SecureStorage) -> Result<()> {
        let response = self
            .client
            .matrix_auth()
            .login_username(username, password)
            .send()
            .await
            .context("Failed to authenticate with Matrix server")?;

        self.user_id = Some(response.user_id.clone());
        self.device_id = Some(response.device_id.clone());

        // Store session data in SecureStorage with standardized keys
        storage.set(AuthKeys::ACCESS_TOKEN, &response.access_token)
            .await
            .context("Failed to store access token in secure storage")?;

        if let Some(refresh_token) = &response.refresh_token {
            storage.set(AuthKeys::REFRESH_TOKEN, refresh_token)
                .await
                .context("Failed to store refresh token in secure storage")?;
        }

        storage.set(AuthKeys::USER_ID, response.user_id.as_str())
            .await
            .context("Failed to store user ID in secure storage")?;

        storage.set(AuthKeys::DEVICE_ID, response.device_id.as_str())
            .await
            .context("Failed to store device ID in secure storage")?;

        Ok(())
    }

    pub async fn restore_session(&mut self, storage: &dyn SecureStorage) -> Result<bool> {
        // Try to load stored credentials from SecureStorage
        let access_token = match storage.get(AuthKeys::ACCESS_TOKEN).await {
            Ok(token) => token,
            Err(_) => return Ok(false), // No stored session
        };

        let user_id_str = storage.get(AuthKeys::USER_ID)
            .await
            .context("Failed to load user ID from secure storage")?;

        let device_id_str = storage.get(AuthKeys::DEVICE_ID)
            .await
            .context("Failed to load device ID from secure storage")?;

        // Parse the stored values
        let user_id = OwnedUserId::from_str(&user_id_str)
            .context("Invalid user ID format in stored session")?;

        let device_id = OwnedDeviceId::try_from(device_id_str)
            .context("Invalid device ID format in stored session")?;

        // Restore the session in the Matrix client
        // Create MatrixSession from stored credentials
        let session = MatrixSession {
            meta: SessionMeta {
                user_id: user_id.clone(),
                device_id: device_id.clone(),
            },
            tokens: SessionTokens {
                access_token,
                refresh_token: storage.get(AuthKeys::REFRESH_TOKEN).await.ok(),
            },
        };

        self.client
            .restore_session(session)
            .await
            .context("Failed to restore Matrix session")?;

        self.user_id = Some(user_id);
        self.device_id = Some(device_id);

        Ok(true)
    }

    pub async fn send_message(&self, room_id: &str, message: &str) -> Result<()> {
        let room_id = OwnedRoomId::from_str(room_id)
            .map_err(|_| anyhow::anyhow!("Invalid room ID format"))?;
        let content = RoomMessageEventContent::text_plain(message);

        if let Some(room) = self.client.get_room(&room_id) {
            room.send(content).await?;
            Ok(())
        } else {
            Err(anyhow::anyhow!("Room not found"))
        }
    }

    pub async fn get_user_info(&self) -> Option<OwnedUserId> {
        self.user_id.clone()
    }

    pub async fn sync(&self) -> Result<()> {
        if self.user_id.is_some() {
            self.client.sync_once(SyncSettings::default()).await?;
            Ok(())
        } else {
            // Return early if not logged in - sync requires authentication
            Err(anyhow::anyhow!(
                "Sync requires authentication - please login first"
            ))
        }
    }

    pub async fn logout(&mut self, storage: &dyn SecureStorage) -> Result<()> {
        // First, attempt to logout from the server if logged in
        if self.user_id.is_some() {
            if let Err(e) = self.client.matrix_auth().logout().await {
                // Log the error but continue with local cleanup
                eprintln!("Warning: Failed to logout from Matrix server: {}", e);
            }
        }

        // Clear local session state
        self.user_id = None;
        self.device_id = None;

        // Clear all session data from SecureStorage
        for key in AuthKeys::all() {
            if let Err(e) = storage.delete(key).await {
                eprintln!("Warning: Failed to delete {} from secure storage: {}", key, e);
            }
        }

        Ok(())
    }

    pub fn is_logged_in(&self) -> bool {
        self.user_id.is_some()
    }
}
