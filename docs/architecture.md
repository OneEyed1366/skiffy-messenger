# SkiffyMessenger System Architecture

## Overview

SkiffyMessenger is a cross-platform messaging application built with Flutter for the UI and Rust for the core business logic, implementing the Matrix protocol for decentralized communication. The architecture follows a thin-client pattern with clear separation of concerns between UI and business logic.

## Core Principles

### 1. Thin Client Architecture

- **Flutter UI Layer**: Pure presentation layer with no business logic
- **Rust Core Layer**: Single source of truth for all business logic and Matrix protocol interactions
- **FFI Bridge**: Type-safe communication between layers using flutter_rust_bridge

### 2. Performance First

- **60 FPS Guarantee**: All operations optimized for smooth UI performance
- **Asynchronous Processing**: Heavy operations never block the UI thread
- **Efficient Data Structures**: Optimized for memory usage and rendering performance

### 3. Security by Design

- **End-to-End Encryption**: All communications protected by default
- **Secure Storage**: Native OS credential storage mechanisms
- **Zero Trust**: All data validated and sanitized

### 4. Cross-Platform Consistency

- **Unified Experience**: Identical functionality across all platforms
- **Native Performance**: Platform-specific optimizations where beneficial
- **Consistent UI**: Design system ensuring visual coherence

## Technology Stack

### Frontend (Flutter)

- **Framework**: Flutter 3.x with Dart 3.x
- **State Management**: BLoC Pattern (flutter_bloc)
- **Routing**: auto_route for type-safe navigation
- **Networking**: HTTP/2 with WebSocket for real-time updates
- **Storage**: SQLite via sqflite for local caching

### Backend (Rust Core)

- **Runtime**: Tokio async runtime
- **Matrix Protocol**: matrix-rust-sdk v0.14.0 (exclusive implementation)
- **Database**: SQLite with rusqlite for local storage
- **Cryptography**: Built-in matrix-rust-sdk encryption
- **FFI**: flutter_rust_bridge v2.11.1 for cross-language communication

### Platform Integration

- **iOS**: Keychain Services, CallKit, PushKit
- **Android**: Credential Manager, Full-screen Intent, Firebase
- **macOS**: Keychain Services, Notification Center
- **Windows**: Credential Manager, Windows Notifications
- **Linux**: Secret Service API, Desktop Notifications

## Architecture Components

### 1. FFI Bridge Layer

#### Design Principles

- **Type Safety**: All data structures properly typed across language boundaries
- **Async by Default**: All operations return Futures/Streams
- **Error Propagation**: Consistent error handling across layers
- **Minimal Surface**: Only necessary methods exposed to Flutter

#### API Structure

```rust
// Authentication Module
pub async fn login(username: String, password: String) -> Result<Session, AuthError>
pub async fn login_with_sso(provider: SsoProvider) -> Result<Session, AuthError>
pub async fn logout() -> Result<(), AuthError>

// Room Management
pub async fn get_rooms() -> Result<Vec<Room>, SyncError>
pub async fn join_room(room_id: String) -> Result<Room, JoinError>
pub async fn create_room(config: RoomConfig) -> Result<Room, CreateError>

// Messaging
pub async fn send_message(room_id: String, content: MessageContent) -> Result<EventId, SendError>
pub async fn get_messages(room_id: String, limit: u32) -> Result<Vec<Message>, DbError>
pub async fn edit_message(event_id: String, content: MessageContent) -> Result<(), EditError>

// Real-time Updates
pub fn subscribe_to_room_updates() -> Stream<RoomUpdate>
pub fn subscribe_to_message_updates() -> Stream<MessageUpdate>
pub fn subscribe_to_call_events() -> Stream<CallEvent>
```

### 2. Rust Core Architecture

#### Module Structure

```
rust/src/
├── lib.rs              # Main FFI exports and initialization
├── auth/               # Authentication and session management
│   ├── mod.rs
│   ├── session.rs      # Session state management
│   ├── sso.rs          # SSO provider integration
│   └── storage.rs      # Secure credential storage
├── rooms/              # Room discovery and management
│   ├── mod.rs
│   ├── discovery.rs    # Room discovery and joining
│   ├── management.rs   # Room settings and moderation
│   └── state.rs        # Room state synchronization
├── messages/           # Message handling and reactions
│   ├── mod.rs
│   ├── sending.rs      # Message composition and sending
│   ├── receiving.rs    # Message processing and decryption
│   ├── reactions.rs    # Emoji reactions management
│   └── search.rs       # Message search functionality
├── sync/               # Real-time synchronization
│   ├── mod.rs
│   ├── engine.rs       # Sync state machine
│   ├── queue.rs        # Offline message queue
│   └── conflict.rs     # CRDT-like conflict resolution
├── media/              # File and media handling
│   ├── mod.rs
│   ├── upload.rs       # File upload with progress
│   ├── download.rs     # File download with caching
│   ├── cache.rs        # LRU cache management
│   └── encryption.rs   # Media encryption/decryption
├── calls/              # VoIP and video calls
│   ├── mod.rs
│   ├── signaling.rs    # WebRTC signaling via Matrix
│   ├── audio.rs        # Audio call management
│   ├── video.rs        # Video call management
│   └── sfu.rs          # Selective Forwarding Unit logic
├── notifications/      # Push and in-app notifications
│   ├── mod.rs
│   ├── push.rs         # Push notification handling
│   ├── in_app.rs       # In-app notification system
│   └── settings.rs     # Notification preferences
├── storage/            # Local data persistence
│   ├── mod.rs
│   ├── database.rs     # SQLite connection and schema
│   ├── messages.rs     # Message storage and retrieval
│   ├── rooms.rs        # Room metadata storage
│   └── migration.rs    # Database schema migrations
└── types/              # Shared data structures
    ├── mod.rs
    ├── auth.rs         # Authentication types
    ├── rooms.rs        # Room-related types
    ├── messages.rs     # Message types
    └── events.rs       # Matrix event types
```

#### Core Traits and Patterns

```rust
// Secure Storage Abstraction
#[async_trait]
pub trait SecureStorage {
    async fn set(&self, key: &str, value: &[u8]) -> Result<(), StorageError>;
    async fn get(&self, key: &str) -> Result<Option<Vec<u8>>, StorageError>;
    async fn delete(&self, key: &str) -> Result<(), StorageError>;
}

// Platform-specific implementations
pub struct KeychainStorage;      // macOS/iOS
pub struct CredentialStorage;    // Windows
pub struct SecretServiceStorage; // Linux
pub struct InMemoryStorage;      // Fallback

// Matrix Client Facade
pub struct MatrixClient {
    inner: matrix_sdk::Client,
    storage: Box<dyn SecureStorage>,
    database: Database,
}

impl MatrixClient {
    pub async fn login(&self, credentials: Credentials) -> Result<Session, AuthError> {
        // Implementation using matrix-rust-sdk
    }

    pub async fn sync(&self) -> Result<SyncResponse, SyncError> {
        // Real-time synchronization
    }
}
```

### 3. Flutter UI Architecture

#### Feature-Based Structure

```
lib/
├── app/                    # Application-level configuration
│   ├── app.dart           # Root widget with providers
│   ├── router/            # Navigation configuration
│   └── design_system/     # Colors, typography, components
├── features/              # Feature modules
│   ├── auth/              # Authentication screens
│   │   ├── bloc/          # Authentication business logic
│   │   ├── view/          # UI screens and widgets
│   │   └── models/        # Feature-specific models
│   ├── room_list/         # Chat list management
│   ├── timeline/          # Message display and interaction
│   ├── calls/             # VoIP/video call interfaces
│   ├── settings/          # User preferences
│   └── notifications/     # Notification management
├── shared/                # Shared utilities and widgets
│   ├── widgets/           # Reusable UI components
│   ├── utils/             # Helper functions
│   └── models/            # Shared data models
└── api/                   # FFI bridge and API clients
    ├── frb_generated.dart # Auto-generated FFI bindings
    └── models/            # API data models
```

#### BLoC Pattern Implementation

```dart
// Authentication BLoC
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final RustApi _api;

  AuthBloc(this._api) : super(AuthInitial()) {
    on<LoginRequested>(_onLoginRequested);
    on<SsoLoginRequested>(_onSsoLoginRequested);
  }

  Future<void> _onLoginRequested(
    LoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final session = await _api.login(event.username, event.password);
      emit(AuthSuccess(session));
    } catch (error) {
      emit(AuthFailure(error));
    }
  }
}

// Usage in UI
class LoginScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, state) {
        if (state is AuthLoading) {
          return LoadingView();
        }
        // Handle other states...
      },
    );
  }
}
```

### 4. Data Flow Architecture

#### Real-time Synchronization

```
Matrix Server → Rust Sync Engine → FFI Streams → Flutter BLoCs → UI Updates
```

#### Message Sending Flow

```
UI Input → Flutter BLoC → FFI Call → Rust Core → Matrix SDK → Server
```

#### Offline Support

```
Offline Action → Local Queue → Sync Engine → Conflict Resolution → Server Sync
```

### 5. Performance Optimization

#### 60 FPS Achievement Strategy

1. **UI Thread Isolation**
   - All heavy computations in Rust core
   - Flutter UI thread only handles rendering
   - Async operations never block UI

2. **Efficient Rendering**
   - List virtualization for message lists
   - Optimized widget rebuilds with keys
   - Image caching and lazy loading

3. **Memory Management**
   - LRU cache for media files (max 500MB)
   - Message pagination (50 messages per page)
   - Automatic cleanup of old cached data

4. **Database Optimization**
   - Indexed queries for message search
   - Batch operations for bulk updates
   - WAL mode for concurrent read/write

#### Benchmarking Strategy

```rust
// Performance benchmarks in Rust
#[cfg(test)]
mod benchmarks {
    use criterion::{black_box, criterion_group, criterion_main, Criterion};

    fn message_decryption_benchmark(c: &mut Criterion) {
        // Benchmark E2EE message decryption
    }

    fn sync_processing_benchmark(c: &mut Criterion) {
        // Benchmark sync response processing
    }

    criterion_group!(benches, message_decryption_benchmark, sync_processing_benchmark);
    criterion_main!(benches);
}
```

### 6. Security Architecture

#### End-to-End Encryption

- **Implementation**: matrix-rust-sdk handles all E2EE operations
- **Key Management**: Automatic key exchange and rotation
- **Device Verification**: Emoji-based verification for new devices
- **Forward Secrecy**: Perfect forward secrecy for all communications

#### Secure Storage Implementation

```rust
// Cross-platform secure storage
pub async fn create_secure_storage() -> Result<Box<dyn SecureStorage>, StorageError> {
    #[cfg(target_os = "macos")]
    return Ok(Box::new(KeychainStorage::new()));

    #[cfg(target_os = "ios")]
    return Ok(Box::new(KeychainStorage::new()));

    #[cfg(target_os = "windows")]
    return Ok(Box::new(CredentialStorage::new()));

    #[cfg(target_os = "linux")]
    match SecretServiceStorage::new().await {
        Ok(storage) => Ok(Box::new(storage)),
        Err(_) => Ok(Box::new(InMemoryStorage::new())), // Fallback
    }

    #[cfg(not(any(target_os = "macos", target_os = "ios", target_os = "windows", target_os = "linux")))]
    return Ok(Box::new(InMemoryStorage::new()));
}
```

#### Authentication Security

- **SSO Integration**: Secure OAuth flows with PKCE
- **Session Management**: Automatic token refresh and rotation
- **Multi-device Support**: Secure device verification and management

### 7. Testing Strategy

#### Unit Testing (Rust Core)

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_message_encryption() {
        // Test E2EE message encryption/decryption
    }

    #[tokio::test]
    async fn test_room_sync() {
        // Test room synchronization logic
    }
}
```

#### Integration Testing (Cross-boundary)

```dart
// Flutter integration test
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('login flow integration test', (tester) async {
    // Test complete login flow from UI to Rust core
  });
}
```

#### Performance Testing

- **Frame Rate Monitoring**: Automated 60 FPS verification
- **Memory Leak Detection**: Heap analysis and leak tracking
- **Network Performance**: Bandwidth and latency testing

### 8. Deployment and Distribution

#### Build Pipeline

```yaml
# CI/CD configuration
stages:
  - test
  - build
  - deploy

rust_test:
  stage: test
  script:
    - cargo test
    - cargo bench

flutter_test:
  stage: test
  script:
    - flutter test
    - flutter drive --target=test_driver/integration_test.dart

build_all:
  stage: build
  script:
    - flutter build apk --release
    - flutter build ios --release
    - flutter build macos --release
    - flutter build windows --release
    - flutter build linux --release
```

#### Platform-Specific Considerations

**iOS/macOS**:

- App Store compliance and review process
- Keychain integration and entitlements
- CallKit and PushKit integration

**Android**:

- Google Play Store requirements
- Firebase integration for notifications
- Full-screen intent permissions

**Windows/Linux**:

- Microsoft Store and Snap Store distribution
- Native notification systems integration
- Credential Manager and Secret Service setup

### 9. Monitoring and Observability

#### Crash Reporting

- **Firebase Crashlytics**: Integrated crash reporting with 99.9% target
- **Custom Metrics**: Performance and stability monitoring
- **User Feedback**: In-app feedback collection

#### Logging Strategy

```rust
// Structured logging in Rust
use tracing::{info, error, warn};

#[tracing::instrument]
pub async fn send_message(&self, room_id: String, content: String) -> Result<(), Error> {
    info!("Sending message to room {}", room_id);
    // Implementation...
}
```

#### Analytics (Privacy-First)

- **Anonymous Usage Metrics**: Opt-in analytics for feature usage
- **Performance Metrics**: Automatic performance monitoring
- **Error Tracking**: Non-identifying error reporting

## Implementation Roadmap

### Phase 1: Foundation (Epic 1)

1. Complete FFI bridge setup
2. Implement authentication module
3. Basic room discovery and listing
4. Secure storage abstraction

### Phase 2: Core Messaging (Epic 3)

1. Message sending and receiving
2. Real-time synchronization
3. Basic offline support
4. Media file handling

### Phase 3: Advanced Features (Epics 4-6)

1. Advanced message mechanics (search, pinning, reactions)
2. VoIP implementation
3. Notification system
4. Performance optimization

### Phase 4: Polish and Scale (Epic 7-10)

1. Video calls and advanced VoIP
2. Complete offline support
3. User settings and privacy controls
4. Final performance tuning and testing

This architecture provides a solid foundation for building SkiffyMessenger as a high-performance, secure, and user-friendly Matrix client that can compete with centralized messaging platforms while maintaining the benefits of decentralization.
