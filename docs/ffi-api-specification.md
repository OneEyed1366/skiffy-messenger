# FFI API Specification for SkiffyMessenger

## Overview

This document defines the complete Foreign Function Interface (FFI) API surface for communication between the Flutter UI layer and the Rust core. The API is designed with the following principles:

- **Type Safety**: All data structures are properly typed across language boundaries
- **Async by Default**: All operations return Futures/Streams to prevent UI blocking
- **Error Propagation**: Consistent error handling with meaningful error types
- **Minimal Surface**: Only necessary methods exposed to Flutter
- **Stream-Based Updates**: Real-time events delivered via streams

## Core Data Types

### Authentication Types

```rust
#[frb]
pub struct Session {
    pub user_id: String,
    pub device_id: String,
    pub access_token: String,
    pub homeserver_url: String,
}

#[frb]
pub enum SsoProvider {
    Google,
    Apple,
    GitHub,
    GitLab,
    Facebook,
}

#[frb]
pub enum AuthError {
    InvalidCredentials,
    NetworkError(String),
    ServerError(String),
    SsoError(String),
    DeviceVerificationRequired,
}
```

### Room Types

```rust
#[frb]
pub struct Room {
    pub id: String,
    pub name: Option<String>,
    pub topic: Option<String>,
    pub avatar_url: Option<String>,
    pub is_direct: bool,
    pub member_count: u32,
    pub last_message: Option<Message>,
    pub unread_count: u32,
    pub is_encrypted: bool,
}

#[frb]
pub struct RoomConfig {
    pub name: Option<String>,
    pub topic: Option<String>,
    pub is_public: bool,
    pub is_encrypted: bool,
    pub invite_user_ids: Vec<String>,
}

#[frb]
pub enum RoomError {
    NotFound,
    PermissionDenied,
    NetworkError(String),
    InvalidConfig(String),
}
```

### Message Types

```rust
#[frb]
pub struct Message {
    pub id: String,
    pub sender_id: String,
    pub sender_display_name: Option<String>,
    pub content: MessageContent,
    pub timestamp: i64,
    pub edited: bool,
    pub reactions: Vec<Reaction>,
    pub reply_to: Option<String>,
}

#[frb]
pub enum MessageContent {
    Text { body: String, formatted_body: Option<String> },
    Image { url: String, filename: String, caption: Option<String> },
    Video { url: String, filename: String, caption: Option<String>, duration: Option<u32> },
    Audio { url: String, filename: String, duration: u32 },
    File { url: String, filename: String, size: u64 },
}

#[frb]
pub struct Reaction {
    pub emoji: String,
    pub count: u32,
    pub user_reacted: bool,
}

#[frb]
pub enum MessageError {
    NotFound,
    PermissionDenied,
    NetworkError(String),
    EncryptionError(String),
    InvalidContent(String),
}
```

### Event Types

```rust
#[frb]
pub enum RoomUpdate {
    NewMessage(Message),
    MessageEdited { event_id: String, new_content: MessageContent },
    MessageDeleted(String),
    ReactionAdded { event_id: String, reaction: Reaction },
    ReactionRemoved { event_id: String, emoji: String },
    UserJoined { user_id: String, display_name: Option<String> },
    UserLeft(String),
    RoomNameChanged(Option<String>),
    RoomTopicChanged(Option<String>),
    TypingUsers(Vec<String>),
}

#[frb]
pub enum MessageUpdate {
    NewMessage(Message),
    MessageEdited(Message),
    MessageDeleted(String),
    ReactionsUpdated { event_id: String, reactions: Vec<Reaction> },
}

#[frb]
pub enum CallEvent {
    IncomingCall(CallInfo),
    CallAccepted(String),
    CallRejected(String),
    CallEnded(String),
    ParticipantJoined { call_id: String, user_id: String },
    ParticipantLeft { call_id: String, user_id: String },
}

#[frb]
pub struct CallInfo {
    pub id: String,
    pub caller_id: String,
    pub caller_display_name: Option<String>,
    pub is_video: bool,
    pub participants: Vec<String>,
}
```

## API Methods

### Initialization & Lifecycle

```rust
#[frb(init)]
pub fn init_app() {
    // Initialize flutter_rust_bridge and logging
    flutter_rust_bridge::setup_default_user_utils();
    // Initialize tracing/logging
    // Initialize database connection pool
}

#[frb]
pub async fn initialize_matrix_client(homeserver_url: String) -> Result<(), MatrixError>

#[frb]
pub async fn shutdown() -> Result<(), MatrixError>
```

### Authentication Module

```rust
#[frb]
pub async fn login(
    username: String,
    password: String,
    homeserver_url: Option<String>,
) -> Result<Session, AuthError>

#[frb]
pub async fn login_with_sso(provider: SsoProvider) -> Result<Session, AuthError>

#[frb]
pub async fn logout() -> Result<(), AuthError>

#[frb]
pub async fn refresh_session() -> Result<Session, AuthError>

#[frb]
pub async fn get_current_session() -> Result<Option<Session>, AuthError>

#[frb]
pub async fn check_homeserver_capabilities(homeserver_url: String) -> Result<HomeserverCapabilities, AuthError>

#[frb]
pub struct HomeserverCapabilities {
    pub supports_password_login: bool,
    pub supports_sso: bool,
    pub sso_providers: Vec<SsoProvider>,
    pub supports_registration: bool,
    pub supports_guest_access: bool,
}
```

### Room Management Module

```rust
#[frb]
pub async fn get_rooms() -> Result<Vec<Room>, RoomError>

#[frb]
pub async fn get_room(room_id: String) -> Result<Room, RoomError>

#[frb]
pub async fn join_room(room_id_or_alias: String) -> Result<Room, RoomError>

#[frb]
pub async fn create_room(config: RoomConfig) -> Result<Room, RoomError>

#[frb]
pub async fn leave_room(room_id: String) -> Result<(), RoomError>

#[frb]
pub async fn search_rooms(query: String, limit: Option<u32>) -> Result<Vec<Room>, RoomError>

#[frb]
pub async fn get_room_members(room_id: String) -> Result<Vec<RoomMember>, RoomError>

#[frb]
pub async fn invite_users(room_id: String, user_ids: Vec<String>) -> Result<(), RoomError>

#[frb]
pub async fn kick_user(room_id: String, user_id: String, reason: Option<String>) -> Result<(), RoomError>

#[frb]
pub async fn ban_user(room_id: String, user_id: String, reason: Option<String>) -> Result<(), RoomError>

#[frb]
pub async fn unban_user(room_id: String, user_id: String) -> Result<(), RoomError>

#[frb]
pub async fn update_room_name(room_id: String, name: Option<String>) -> Result<(), RoomError>

#[frb]
pub async fn update_room_topic(room_id: String, topic: Option<String>) -> Result<(), RoomError>

#[frb]
pub async fn update_room_avatar(room_id: String, avatar_url: Option<String>) -> Result<(), RoomError>

#[frb]
pub struct RoomMember {
    pub user_id: String,
    pub display_name: Option<String>,
    pub avatar_url: Option<String>,
    pub membership: Membership,
    pub power_level: i32,
}

#[frb]
pub enum Membership {
    Invite,
    Join,
    Knock,
    Leave,
    Ban,
}
```

### Messaging Module

```rust
#[frb]
pub async fn send_message(
    room_id: String,
    content: MessageContent,
    reply_to: Option<String>,
) -> Result<String, MessageError> // Returns event_id

#[frb]
pub async fn edit_message(
    room_id: String,
    event_id: String,
    new_content: MessageContent,
) -> Result<(), MessageError>

#[frb]
pub async fn delete_message(room_id: String, event_id: String) -> Result<(), MessageError>

#[frb]
pub async fn get_messages(
    room_id: String,
    limit: u32,
    before: Option<String>, // event_id to paginate from
) -> Result<Vec<Message>, MessageError>

#[frb]
pub async fn search_messages(
    room_id: String,
    query: String,
    limit: Option<u32>,
) -> Result<Vec<Message>, MessageError>

#[frb]
pub async fn add_reaction(
    room_id: String,
    event_id: String,
    emoji: String,
) -> Result<(), MessageError>

#[frb]
pub async fn remove_reaction(
    room_id: String,
    event_id: String,
    emoji: String,
) -> Result<(), MessageError>

#[frb]
pub async fn send_typing_notification(
    room_id: String,
    typing: bool,
) -> Result<(), MessageError>

#[frb]
pub async fn mark_room_as_read(room_id: String, event_id: Option<String>) -> Result<(), MessageError>

#[frb]
pub async fn pin_message(room_id: String, event_id: String) -> Result<(), MessageError>

#[frb]
pub async fn unpin_message(room_id: String, event_id: String) -> Result<(), MessageError>

#[frb]
pub async fn get_pinned_messages(room_id: String) -> Result<Vec<Message>, MessageError>
```

### Media Module

```rust
#[frb]
pub async fn upload_file(
    room_id: String,
    file_path: String,
    filename: String,
    content_type: String,
) -> Result<String, MediaError> // Returns mxc:// URL

#[frb]
pub async fn download_file(
    mxc_url: String,
    save_path: Option<String>,
) -> Result<String, MediaError> // Returns local file path

#[frb]
pub async fn get_file_thumbnail(
    mxc_url: String,
    width: u32,
    height: u32,
) -> Result<String, MediaError> // Returns local thumbnail path

#[frb]
pub async fn get_media_cache_info() -> Result<MediaCacheInfo, MediaError>

#[frb]
pub async fn clear_media_cache() -> Result<(), MediaError>

#[frb]
pub struct MediaCacheInfo {
    pub total_size: u64,
    pub file_count: u32,
    pub images_size: u64,
    pub videos_size: u64,
    pub audio_size: u64,
    pub files_size: u64,
}

#[frb]
pub enum MediaError {
    UploadFailed(String),
    DownloadFailed(String),
    FileNotFound,
    InvalidFormat,
    NetworkError(String),
    StorageError(String),
}
```

### Real-time Synchronization Module

```rust
#[frb]
pub fn subscribe_to_room_updates() -> Stream<RoomUpdate>

#[frb]
pub fn subscribe_to_message_updates() -> Stream<MessageUpdate>

#[frb]
pub fn subscribe_to_call_events() -> Stream<CallEvent>

#[frb]
pub fn subscribe_to_sync_state() -> Stream<SyncState>

#[frb]
pub async fn start_sync() -> Result<(), SyncError>

#[frb]
pub async fn stop_sync() -> Result<(), SyncError>

#[frb]
pub async fn force_sync() -> Result<(), SyncError>

#[frb]
pub enum SyncState {
    Idle,
    Syncing,
    Error(String),
    Offline,
}

#[frb]
pub enum SyncError {
    NetworkError(String),
    AuthenticationError,
    ServerError(String),
    RateLimited,
}
```

### VoIP Calls Module

```rust
#[frb]
pub async fn start_call(
    room_id: String,
    is_video: bool,
) -> Result<String, CallError> // Returns call_id

#[frb]
pub async fn answer_call(call_id: String) -> Result<(), CallError>

#[frb]
pub async fn reject_call(call_id: String) -> Result<(), CallError>

#[frb]
pub async fn hang_up_call(call_id: String) -> Result<(), CallError>

#[frb]
pub async fn mute_call(call_id: String, mute: bool) -> Result<(), CallError>

#[frb]
pub async fn enable_video(call_id: String, enable: bool) -> Result<(), CallError>

#[frb]
pub async fn switch_camera(call_id: String) -> Result<(), CallError>

#[frb]
pub async fn share_screen(call_id: String, enable: bool) -> Result<(), CallError>

#[frb]
pub async fn get_call_participants(call_id: String) -> Result<Vec<CallParticipant>, CallError>

#[frb]
pub async fn kick_participant(call_id: String, user_id: String) -> Result<(), CallError>

#[frb]
pub struct CallParticipant {
    pub user_id: String,
    pub display_name: Option<String>,
    pub is_muted: bool,
    pub is_video_enabled: bool,
    pub is_speaking: bool,
}

#[frb]
pub enum CallError {
    NotSupported,
    AlreadyInCall,
    NetworkError(String),
    DeviceError(String),
    PermissionDenied,
    InvalidCallId,
}
```

### Notification Module

```rust
#[frb]
pub async fn register_push_token(token: String, device_name: String) -> Result<(), NotificationError>

#[frb]
pub async fn unregister_push_token() -> Result<(), NotificationError>

#[frb]
pub async fn set_room_notifications_enabled(
    room_id: String,
    enabled: bool,
) -> Result<(), NotificationError>

#[frb]
pub async fn set_room_notification_mode(
    room_id: String,
    mode: NotificationMode,
) -> Result<(), NotificationError>

#[frb]
pub async fn get_notification_settings() -> Result<NotificationSettings, NotificationError>

#[frb]
pub async fn update_notification_settings(settings: NotificationSettings) -> Result<(), NotificationError>

#[frb]
pub enum NotificationMode {
    All,
    MentionsOnly,
    None,
}

#[frb]
pub struct NotificationSettings {
    pub push_enabled: bool,
    pub in_app_enabled: bool,
    pub sound_enabled: bool,
    pub vibration_enabled: bool,
    pub show_preview: bool,
    pub mention_mode: MentionNotificationMode,
    pub room_mode: RoomNotificationMode,
}

#[frb]
pub enum MentionNotificationMode {
    Always,
    ActiveChatsOnly,
    Never,
}

#[frb]
pub enum RoomNotificationMode {
    All,
    MentionsOnly,
    None,
}

#[frb]
pub enum NotificationError {
    RegistrationFailed(String),
    PermissionDenied,
    NetworkError(String),
    InvalidToken,
}
```

### Device Management Module

```rust
#[frb]
pub async fn get_devices() -> Result<Vec<Device>, DeviceError>

#[frb]
pub async fn get_device(device_id: String) -> Result<Device, DeviceError>

#[frb]
pub async fn update_device_name(device_id: String, name: String) -> Result<(), DeviceError>

#[frb]
pub async fn delete_device(device_id: String) -> Result<(), DeviceError>

#[frb]
pub async fn verify_device(device_id: String) -> Result<(), DeviceError>

#[frb]
pub async fn request_device_verification(device_id: String) -> Result<String, DeviceError> // Returns emoji string

#[frb]
pub async fn confirm_device_verification(
    device_id: String,
    verification_code: String,
) -> Result<(), DeviceError>

#[frb]
pub struct Device {
    pub id: String,
    pub display_name: Option<String>,
    pub last_seen_ip: Option<String>,
    pub last_seen_ts: Option<i64>,
    pub is_verified: bool,
    pub is_current_device: bool,
}

#[frb]
pub enum DeviceError {
    NotFound,
    PermissionDenied,
    NetworkError(String),
    VerificationFailed,
}
```

### Profile Management Module

```rust
#[frb]
pub async fn get_profile(user_id: Option<String>) -> Result<UserProfile, ProfileError>

#[frb]
pub async fn update_display_name(name: Option<String>) -> Result<(), ProfileError>

#[frb]
pub async fn update_avatar(avatar_data: Option<Vec<u8>>, content_type: String) -> Result<(), ProfileError>

#[frb]
pub async fn add_email(email: String) -> Result<String, ProfileError> // Returns session ID

#[frb]
pub async fn verify_email(session_id: String, code: String) -> Result<(), ProfileError>

#[frb]
pub async fn remove_email(email: String) -> Result<(), ProfileError>

#[frb]
pub async fn add_phone_number(phone: String) -> Result<String, ProfileError> // Returns session ID

#[frb]
pub async fn verify_phone_number(session_id: String, code: String) -> Result<(), ProfileError>

#[frb]
pub async fn remove_phone_number(phone: String) -> Result<(), ProfileError>

#[frb]
pub async fn change_password(new_password: String) -> Result<(), ProfileError>

#[frb]
pub async fn deactivate_account(password: String, erase_data: bool) -> Result<(), ProfileError>

#[frb]
pub struct UserProfile {
    pub user_id: String,
    pub display_name: Option<String>,
    pub avatar_url: Option<String>,
    pub emails: Vec<String>,
    pub phone_numbers: Vec<String>,
    pub is_guest: bool,
}

#[frb]
pub enum ProfileError {
    NotFound,
    PermissionDenied,
    InvalidEmail,
    InvalidPhone,
    VerificationFailed,
    NetworkError(String),
    PasswordTooWeak,
}
```

### Settings & Configuration Module

```rust
#[frb]
pub async fn get_app_settings() -> Result<AppSettings, SettingsError>

#[frb]
pub async fn update_app_settings(settings: AppSettings) -> Result<(), SettingsError>

#[frb]
pub async fn reset_app_settings() -> Result<(), SettingsError>

#[frb]
pub async fn export_settings() -> Result<String, SettingsError> // Returns JSON string

#[frb]
pub async fn import_settings(json_data: String) -> Result<(), SettingsError>

#[frb]
pub async fn get_cache_info() -> Result<CacheInfo, SettingsError>

#[frb]
pub async fn clear_cache() -> Result<(), SettingsError>

#[frb]
pub async fn get_storage_info() -> Result<StorageInfo, SettingsError>

#[frb]
pub struct AppSettings {
    pub theme: Theme,
    pub language: String,
    pub message_bubble_style: MessageBubbleStyle,
    pub notification_settings: NotificationSettings,
    pub privacy_settings: PrivacySettings,
    pub media_settings: MediaSettings,
    pub call_settings: CallSettings,
}

#[frb]
pub enum Theme {
    System,
    Light,
    Dark,
}

#[frb]
pub enum MessageBubbleStyle {
    Modern,
    Classic,
    Minimal,
}

#[frb]
pub struct PrivacySettings {
    pub read_receipts_enabled: bool,
    pub typing_indicators_enabled: bool,
    pub last_seen_enabled: bool,
    pub profile_visibility: ProfileVisibility,
}

#[frb]
pub enum ProfileVisibility {
    Everyone,
    ContactsOnly,
    Nobody,
}

#[frb]
pub struct MediaSettings {
    pub auto_download_media: AutoDownloadMode,
    pub max_file_size: u64,
    pub image_quality: ImageQuality,
    pub video_quality: VideoQuality,
}

#[frb]
pub enum AutoDownloadMode {
    Always,
    WifiOnly,
    Never,
}

#[frb]
pub enum ImageQuality {
    Original,
    High,
    Medium,
    Low,
}

#[frb]
pub enum VideoQuality {
    Original,
    High,
    Medium,
    Low,
}

#[frb]
pub struct CallSettings {
    pub audio_quality: AudioQuality,
    pub video_quality: VideoQuality,
    pub enable_noise_suppression: bool,
    pub enable_echo_cancellation: bool,
}

#[frb]
pub enum AudioQuality {
    Low,
    Medium,
    High,
    Ultra,
}

#[frb]
pub struct CacheInfo {
    pub messages_size: u64,
    pub media_size: u64,
    pub total_size: u64,
    pub last_cleanup: Option<i64>,
}

#[frb]
pub struct StorageInfo {
    pub total_space: u64,
    pub available_space: u64,
    pub app_usage: u64,
}

#[frb]
pub enum SettingsError {
    InvalidSetting(String),
    PermissionDenied,
    StorageError(String),
    NetworkError(String),
}
```

## Error Types

```rust
#[frb]
pub enum MatrixError {
    Network(String),
    Authentication(String),
    Authorization(String),
    NotFound(String),
    Conflict(String),
    RateLimited { retry_after: Option<u32> },
    ServerError(String),
    ClientError(String),
    Unknown(String),
}
```

## Implementation Notes

### Async Patterns

- All methods that perform I/O operations are async
- Methods that return streams use `Stream<T>` for real-time updates
- Blocking operations are avoided to prevent UI freezing

### Error Handling

- All errors implement proper error types with meaningful messages
- Errors are propagated across FFI boundary with context preservation
- Network errors include retry information where applicable

### Memory Management

- Large data structures are streamed rather than loaded entirely into memory
- File operations use streaming APIs to handle large files efficiently
- Automatic cleanup of temporary resources

### Type Safety

- All data structures are explicitly typed
- Enums are used for constrained values
- Optional fields use `Option<T>` to represent nullable values

### Performance Considerations

- Pagination is enforced for large result sets
- Caching is implemented at the Rust layer
- Database queries are optimized with proper indexing

This FFI API specification provides a complete, type-safe interface for building the SkiffyMessenger application with clear separation of concerns between the UI and business logic layers.
