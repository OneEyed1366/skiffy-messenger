# SkiffyMessenger

![coverage][coverage_badge]
[![style: very good analysis][very_good_analysis_badge]][very_good_analysis_link]
[![License: Apache 2.0][license_badge]][license_link]

**Telegram-level UX on Matrix: Fast, intuitive, and feature-rich messaging with guaranteed privacy and data sovereignty.**

*An open-source Matrix client designed to deliver Telegram-level UX while maintaining the privacy and sovereignty benefits of decentralized communication. Built with Flutter (UI) and Rust (core business logic), it provides a secure, performant, and user-friendly messaging experience across all major platforms.*

## 🌟 Vision & Mission

### Vision Statement

"Telegram-like UX on Matrix: Fast, intuitive, and feature-rich messaging with guaranteed privacy and data sovereignty."

### Mission Statement

To create the most user-friendly Matrix client that bridges the gap between centralized messaging convenience and decentralized privacy, making secure communication accessible to everyone.

## ✨ Key Features

### 🔐 Privacy & Security

- **End-to-End Encryption (E2EE)**: All communications are encrypted by default
- **Matrix Protocol**: Built on the decentralized Matrix protocol for data sovereignty
- **Secure Credential Storage**: Native OS secure storage (Keychain, Credential Manager, Secret Service)
- **Device Verification**: Cross-device verification with emoji-based key verification

### 💬 Messaging Experience

- **Telegram-Level UX**: 95% feature parity with Telegram's core messaging experience
- **Real-time Synchronization**: Instant message delivery and updates
- **Offline Support**: Local message caching and offline message queuing
- **Media Sharing**: Send images, videos, voice messages, and short video clips
- **Message Reactions**: Add emoji reactions to messages
- **Message Editing & Deletion**: Edit or delete your sent messages
- **Message Search**: Full-text search within chat history
- **Message Pinning**: Pin important messages in 1:1 and group chats

### 📞 Communication

- **Voice Calls**: 1:1 and group voice calls with E2EE
- **Video Calls**: 1:1 and group video calls with screen sharing and PiP mode
- **Push Notifications**: Intelligent push notifications with privacy controls
- **In-App Notifications**: Non-intrusive notifications for active users

### 🎨 User Experience

- **Cross-Platform**: Native experience on iOS, Android, macOS, Windows, and Linux
- **60 FPS Performance**: Smooth scrolling and interactions
- **Accessibility**: WCAG AA compliant with screen reader support
- **Themes**: Light and dark themes with system integration
- **Internationalization**: Multi-language support

## 🏗️ Architecture

### Technical Stack

- **UI Layer**: Flutter - Thin client for cross-platform UI
- **Core Layer**: Rust - Business logic, Matrix protocol, cryptography
- **Communication**: FFI (flutter_rust_bridge) - Automated bridge generation
- **Protocol**: Matrix Rust SDK - Official Matrix protocol implementation
- **Storage**: SQLite - Local message caching and user data
- **Security**: Platform-specific secure storage APIs

### Project Structure

```
skiffy/
├── lib/                    # Flutter UI layer
│   ├── app/               # App configuration and routing
│   ├── features/          # Feature modules
│   ├── widgets/           # Reusable UI components
│   └── l10n/              # Internationalization
├── rust/                  # Rust core business logic
│   ├── src/
│   └── Cargo.toml
├── docs/                  # Documentation
│   ├── prd.md            # Product Requirements Document
│   ├── architecture.md   # System Architecture
│   └── ui-specification.md # UI Design Specifications
└── test/                  # Testing
```

## 🚀 Getting Started

### Prerequisites

- Flutter SDK (^3.8.0)
- Rust toolchain
- Android Studio / Xcode (for mobile development)
- VS Code with Flutter and Rust extensions

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/OneEyed1366/skiffy-messenger.git
   cd skiffy-messenger
   ```

2. **Install Flutter dependencies**

   ```bash
   flutter pub get
   ```

3. **Build Rust core**

   ```bash
   # For Android
   flutter build apk --release

   # For iOS
   flutter build ios --release

   # For other platforms
   flutter build <platform> --release
   ```

### Running the App

This project contains 3 flavors:

- **development**
- **staging**
- **production**

To run the desired flavor:

```bash
# Development
flutter run --flavor development --target lib/flavors/main_development.dart

# Staging
flutter run --flavor staging --target lib/flavors/main_staging.dart

# Production
flutter run --flavor production --target lib/flavors/main_production.dart
```

*SkiffyMessenger works on iOS, Android, Web, macOS, Windows, and Linux.*

## 🧪 Testing

### Unit & Widget Tests

```bash
flutter test --coverage
```

### Integration Tests

```bash
flutter test integration_test/
```

### Generate Coverage Report

```bash
genhtml coverage/lcov.info -o coverage/
open coverage/index.html
```

## 🌐 Internationalization

This project uses [flutter_localizations] for internationalization.

### Adding New Strings

1. Edit `lib/l10n/arb/app_en.arb`
2. Add new key/value pairs
3. Generate localizations:

   ```bash
   flutter gen-l10n --arb-dir="lib/l10n/arb"
   ```

### Supported Locales

- English (en)
- Spanish (es)
- Russian (ru)

## 📚 Documentation

- **[Product Requirements Document](docs/prd.md)** - Complete feature specifications
- **[Architecture Documentation](docs/architecture.md)** - System design and technical decisions
- **[UI Specification](docs/ui-specification.md)** - Design system and user interface guidelines
- **[API Specification](docs/ffi-api-specification.md)** - FFI interface documentation
- **[Implementation Roadmap](docs/implementation-roadmap.md)** - Development timeline and milestones

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Style

- Follow Flutter's [effective Dart](https://dart.dev/guides/language/effective-dart) guidelines
- Use `flutter format` for code formatting
- Use `cargo fmt` for Rust code formatting
- Run `very_good test` before submitting

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Matrix Protocol](https://matrix.org/) - The decentralized communication protocol
- [Flutter](https://flutter.dev/) - UI framework
- [Rust](https://www.rust-lang.org/) - Systems programming language
- [Very Good CLI](https://github.com/VeryGoodOpenSource/very_good_cli) - Project scaffolding

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/OneEyed1366/skiffy-messenger/issues)
- **Discussions**: [GitHub Discussions](https://github.com/OneEyed1366/skiffy-messenger/discussions)
- **Matrix Room**: [#skiffy:matrix.org](https://matrix.to/#/#skiffy:matrix.org)

---

**Built with ❤️ using Flutter and Rust**

[coverage_badge]: coverage_badge.svg
[license_badge]: https://img.shields.io/badge/license-Apache%202.0-blue.svg
[license_link]: https://opensource.org/licenses/Apache-2.0
[very_good_analysis_badge]: https://img.shields.io/badge/style-very_good_analysis-B22C89.svg
[very_good_analysis_link]: https://pub.dev/packages/very_good_analysis
