# Epic 1: Foundation & Core Infrastructure

**Цель:** Создание архитектурного фундамента проекта, настройка FFI-моста для связи Flutter и Rust и обеспечение базового подключения к Matrix. Этот эпик закладывает основу для всех последующих этапов разработки.

**Ключевые UI-задачи (согласно `UI-Spec.md`):**

- **Design System:** Создание базовой палитры `AppColors` (более 50 семантических цветов), реализация светлой и темной тем через `AppTheme`.
- **UI-Kit:** Разработка набора переиспользуемых виджетов, включая `AppButton`, `AppTextField` и `FocusableBorder` для обеспечения доступности (accessibility).
- **Экраны:**
  - Реализация экрана входа (Login Screen) с использованием созданных компонентов.
  - Проектирование и верстка основного экрана чата (Main Chat Screen), включая список сообщений, поле ввода и панель закрепленных сообщений.
- **Приватность в UI:** Интеграция визуальных индикаторов E2EE-шифрования и других элементов, ориентированных на приватность.

## Story 1.1: Project Setup and Architecture

As a developer, I want to set up the Flutter+Rust project structure, so that I can build a cross-platform messaging app with clear separation of concerns.

**Acceptance Criteria:**

1. Flutter project initialized with proper directory structure
2. Rust core crate (`skiffy-core`) created with basic API facade
3. FFI bridge configured using `flutter_rust_bridge`
4. Basic project configuration and dependencies set up
5. Automated build process established for both platforms

## Story 1.2: Matrix SDK Integration

As a developer, I want to integrate the official `matrix-rust-sdk`, so that I can establish secure Matrix protocol connectivity.

**Acceptance Criteria:**

1. `matrix-rust-sdk` added as dependency in Rust core - done
2. Basic client initialization implemented - done
3. API facade provides high-level Matrix operations - in progress
4. Error handling for connection and authentication failures
5. Unit tests for SDK integration

## Story 1.3: Secure Credential Storage Implementation

As a developer, I want to implement a cross-platform secure storage mechanism, so that sensitive user credentials (tokens, keys) are protected using native OS capabilities.

**Acceptance Criteria:**

1. A `SecureStorage` trait is defined in the Rust core, abstracting `set`, `get`, and `delete` operations.
2. A platform-specific implementation for macOS/iOS is created using the `security-framework` crate to interact with the Keychain.
3. A platform-specific implementation for Windows is created using the `keyring` crate to interact with the Credential Manager.
4. A platform-specific implementation for Linux is created using the `keyring` crate to interact with the Secret Service API.
5. A secure fallback mechanism is implemented: If the Linux implementation fails to find a secret service, it defaults to an in-memory-only storage.
6. The Rust core can detect the fallback scenario and reports a "session-not-persistent" status via the FFI layer.
7. The Flutter UI displays a non-intrusive warning to the user when the "session-not-persistent" status is active.
8. Sensitive data is never written to unencrypted files or the local SQLite database.

---

*This is a shard of the complete SkiffyMessenger PRD. For the full document, see: [../prd.md](../prd.md)*
