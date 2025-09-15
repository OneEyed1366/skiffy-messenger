# SkiffyMessenger Technology Stack

## Version Control

- **Date**: 2025-09-15
- **Version**: 1.0
- **Status**: Active
- **Author**: Architecture Team

## Executive Summary

SkiffyMessenger employs a dual-runtime architecture with Flutter handling the presentation layer and Rust managing all business logic, networking, and security operations. This separation ensures maximum performance, security, and maintainability across all target platforms.

## Core Architecture Pattern

### Thin Client Architecture
- **Frontend**: Flutter acts as a pure presentation layer (thin client)
- **Backend**: Rust Core (`skiffy_core`) handles all business logic
- **Bridge**: FFI (Foreign Function Interface) via `flutter_rust_bridge`
- **Pattern**: Complete separation of concerns with API facade pattern

## Frontend Stack

### Framework & Language
- **Framework**: Flutter (latest stable version)
- **Language**: Dart 3.x
- **Minimum SDK**: Flutter 3.19.0+

### State Management
- **Primary**: BLoC (`flutter_bloc` ^8.1.0)
- **Pattern**: Event-driven architecture with unidirectional data flow
- **Rationale**: Predictability, testability, and strict architectural separation

### Navigation & Routing
- **Solution**: `auto_route` ^7.8.0
- **Features**: Type-safe routing, deep linking support, route guards
- **Implementation**: Declarative routing with code generation

### UI Components & Design System

#### Core Dependencies
```yaml
dependencies:
  # State Management
  flutter_bloc: ^8.1.0
  bloc: ^8.1.0

  # Navigation
  auto_route: ^7.8.0

  # Accessibility
  dotted_border: ^2.1.0  # For FocusableBorder implementation

  # Networking & Background
  flutter_background_service: ^5.0.0
  flutter_callkit_incoming: ^2.0.0

  # Media Handling
  image_picker: ^1.0.0
  camera: ^0.10.0
  video_player: ^2.8.0
  record: ^5.0.0  # Audio recording

  # Push Notifications
  firebase_messaging: ^14.7.0
  flutter_local_notifications: ^16.3.0

  # Storage
  shared_preferences: ^2.2.0
  path_provider: ^2.1.0
```

### Development Tools
```yaml
dev_dependencies:
  flutter_test:
  flutter_driver:
  integration_test:
  golden_toolkit: ^0.15.0
  bloc_test: ^9.1.0
  build_runner: ^2.4.0
  auto_route_generator: ^7.3.0
  flutter_lints: ^3.0.0
```

## Backend Stack (Rust Core)

### Core Language & Runtime
- **Language**: Rust (latest stable)
- **Minimum Version**: 1.75.0
- **Edition**: 2021

### Primary Dependencies
```toml
[dependencies]
# Matrix Protocol
matrix-rust-sdk = { version = "0.7", features = ["e2e-encryption", "sqlite"] }

# FFI Bridge
flutter_rust_bridge = "2.0"

# Async Runtime
tokio = { version = "1.35", features = ["full"] }

# Database
sqlx = { version = "0.7", features = ["runtime-tokio-native-tls", "sqlite"] }

# Serialization
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

# Error Handling
anyhow = "1.0"
thiserror = "1.0"

# Logging
tracing = "0.1"
tracing-subscriber = "0.3"

# Cryptography (additional to Matrix SDK)
ring = "0.17"

# WebRTC for VoIP
webrtc = "0.9"
```

### Architecture Patterns
- **Pattern**: Repository Pattern with Service Layer
- **Database**: SQLite for local storage
- **Concurrency**: Tokio async runtime
- **Error Handling**: Result-based with typed errors

## FFI Bridge Configuration

### Bridge Technology
- **Tool**: `flutter_rust_bridge` v2.0
- **Code Generation**: 100% automated, no manual edits
- **Pattern**: API Facade to prevent direct SDK exposure

### Bridge Structure
```
rust/src/
├── api/
│   ├── auth.rs         # Authentication API
│   ├── messaging.rs    # Messaging API
│   ├── rooms.rs        # Room management API
│   ├── sync.rs         # Sync engine API
│   └── mod.rs          # Public API surface
├── core/
│   ├── matrix_client/  # Matrix SDK wrapper
│   ├── storage/        # Database layer
│   ├── crypto/         # E2EE operations
│   └── sync/           # Sync engine
└── frb_generated.rs    # Auto-generated FFI code
```

## Platform-Specific Integrations

### iOS
- **CallKit**: Native call UI integration
- **PushKit**: VoIP push notifications
- **Keychain**: Secure credential storage
- **Background Modes**: fetch, processing, voip, remote-notification

### Android
- **ConnectionService**: Native call UI
- **FCM**: Push notifications
- **Credential Manager**: Secure storage
- **Foreground Service**: Background sync (dataSync type)

### Desktop (macOS, Windows, Linux)
- **System Tray**: Background operation indicator
- **Native Notifications**: Platform-specific APIs
- **Secure Storage**:
  - macOS: Keychain
  - Windows: Credential Manager
  - Linux: Secret Service API

## Database Architecture

### Local Storage
- **Engine**: SQLite 3.40+
- **ORM**: SQLx with compile-time checked queries
- **Schema Management**: Automated migrations

### Data Structure
```sql
-- Core tables
messages        -- Encrypted message storage
rooms           -- Room metadata and state
users           -- User profiles cache
sessions        -- Active sessions
sync_tokens     -- Sync state persistence
media_cache     -- Downloaded media files
```

## Security Infrastructure

### Encryption
- **E2EE**: Olm/Megolm via matrix-rust-sdk
- **Storage**: AES-256 for local database
- **Transport**: TLS 1.3+ enforced
- **Keys**: Platform secure storage (Keychain/Credential Manager)

### Authentication
- **Methods**: Password, SSO (OAuth2/OIDC)
- **Session**: Token-based with refresh
- **Device Verification**: Cross-signing with QR codes

## Testing Stack

### Unit Testing
- **Flutter**: Built-in test framework
- **Rust**: Built-in `#[test]` with cargo
- **Coverage Target**: >90%

### Integration Testing
```yaml
# Flutter integration tests
flutter_driver:
  sdk: flutter
integration_test:
  sdk: flutter
```

### UI Testing
- **Golden Tests**: `golden_toolkit` for visual regression
- **Widget Tests**: Component-level testing
- **BLoC Tests**: `bloc_test` for state management

### Performance Testing
- **Tool**: Flutter DevTools profiler
- **Metrics**: 60 FPS target, <16.67ms frame time
- **Automation**: Performance regression CI pipeline

## Build & Deployment

### CI/CD Pipeline
```yaml
# GitHub Actions workflow
platforms:
  - ios
  - android
  - macos
  - windows
  - linux

stages:
  - lint
  - test
  - build
  - performance-test
  - deploy
```

### Build Tools
- **Flutter**: `flutter build` commands
- **Rust**: `cargo` with cross-compilation
- **FFI Generation**: `flutter_rust_bridge_codegen`
- **Code Signing**: Fastlane for mobile platforms

## Development Environment

### Required Tools
```bash
# Core requirements
- Flutter SDK 3.19.0+
- Rust 1.75.0+
- Xcode 15+ (for iOS/macOS)
- Android Studio (for Android)
- VS Code or IntelliJ IDEA

# Additional tools
- flutter_rust_bridge_codegen
- cargo-ndk (for Android)
- cocoapods (for iOS)
```

### Environment Setup
```bash
# Install Flutter
flutter channel stable
flutter upgrade

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install FFI bridge
cargo install flutter_rust_bridge_codegen

# Platform-specific setup
rustup target add aarch64-linux-android
rustup target add aarch64-apple-ios
```

## Monitoring & Analytics

### Crash Reporting
- **Service**: Firebase Crashlytics / Sentry
- **Target**: 99.9% crash-free rate
- **Integration**: Automatic symbolication

### Performance Monitoring
- **Metrics**: Frame rate, app startup time, memory usage
- **Tools**: Firebase Performance / Custom telemetry
- **Alerting**: Automated regression detection

### Analytics
- **Privacy-First**: No user tracking
- **Metrics**: Anonymous usage statistics only
- **Opt-in**: User consent required

## Third-Party Services

### Required Services
- **Push Notifications**: FCM (Android), APNs (iOS)
- **SSO Providers**: Google, Apple, GitHub (optional)
- **Media CDN**: For attachment delivery (homeserver-provided)

### Optional Services
- **TURN/STUN**: For VoIP connectivity
- **Sentry**: Advanced error tracking
- **Analytics**: Privacy-respecting analytics (optional)

## Version Management

### Dependency Updates
- **Security**: Immediate patches for vulnerabilities
- **Minor**: Monthly review cycle
- **Major**: Quarterly evaluation

### Compatibility Matrix
| Component | Min Version | Recommended | Notes |
|-----------|------------|-------------|-------|
| Flutter | 3.19.0 | Latest Stable | |
| Rust | 1.75.0 | Latest Stable | |
| iOS | 13.0 | 16.0+ | CallKit requirement |
| Android | 24 (7.0) | 29+ (10.0) | |
| macOS | 11.0 | 13.0+ | |
| Windows | 10 1809 | 11 | |
| Linux | Ubuntu 20.04 | 22.04+ | GTK3 required |

## Risk Mitigation

### Technology Risks
1. **FFI Complexity**: Mitigated by automated code generation
2. **Platform Fragmentation**: Extensive testing matrix
3. **Dependency Updates**: Locked versions with regular audits
4. **Performance**: Continuous benchmarking and profiling

### Contingency Plans
- **FFI Issues**: Fallback to manual bindings if needed
- **Performance**: Platform-specific optimizations
- **Third-party failures**: Local fallbacks for all services

---

*This document represents the complete technology stack for SkiffyMessenger. All technology choices are driven by the requirements for security, performance, and cross-platform compatibility while maintaining a superior user experience.*