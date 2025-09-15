use anyhow::Result;
use matrix_sdk::{
    config::{RequestConfig, SyncSettings},
    ruma::{events::room::message::RoomMessageEventContent, OwnedRoomId, OwnedUserId},
    Client,
};
use std::str::FromStr;
use url::Url;

#[derive(Debug)]
pub struct MatrixClient {
    client: Client,
    user_id: Option<OwnedUserId>,
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
        })
    }

    pub async fn login(&mut self, username: &str, password: &str) -> Result<()> {
        let response = self
            .client
            .matrix_auth()
            .login_username(username, password)
            .send()
            .await?;
        self.user_id = Some(response.user_id);

        Ok(())
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

    pub fn is_logged_in(&self) -> bool {
        self.user_id.is_some()
    }
}
