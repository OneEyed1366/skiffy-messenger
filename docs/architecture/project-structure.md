# SkiffyMessenger Project Structure

## Version Control

- **Date**: 2025-09-15
- **Version**: 1.0
- **Status**: Active
- **Author**: Architecture Team

## Overview

This document defines the complete project structure for SkiffyMessenger, including directory organization, naming conventions, and architectural boundaries. The structure enforces clean separation between the Flutter UI layer and Rust core business logic.

## Repository Root Structure

```
skiffy/
├── .github/                    # GitHub-specific configuration
│   ├── workflows/             # CI/CD pipelines
│   ├── ISSUE_TEMPLATE/        # Issue templates
│   └── PULL_REQUEST_TEMPLATE.md
├── android/                   # Android-specific code and configuration
├── ios/                       # iOS-specific code and configuration
├── linux/                     # Linux desktop configuration
├── macos/                     # macOS desktop configuration
├── windows/                   # Windows desktop configuration
├── lib/                       # Flutter/Dart application code
├── rust/                      # Rust core business logic
├── assets/                    # Application assets
├── test/                      # Flutter tests
├── integration_test/          # Integration tests
├── docs/                      # Project documentation
├── scripts/                   # Build and utility scripts
├── .vscode/                   # VS Code workspace settings
├── pubspec.yaml              # Flutter dependencies
├── flutter_rust_bridge.yaml  # FFI bridge configuration
├── analysis_options.yaml     # Dart linter configuration
├── Makefile                  # Build automation
└── README.md                 # Project overview

```

## Flutter Application Structure (`lib/`)

```
lib/
├── api/                      # FFI bridge definitions
│   ├── frb_generated.dart   # Auto-generated FFI code
│   ├── frb_generated.io.dart
│   ├── frb_generated.web.dart
│   ├── matrix_client/       # Matrix client API wrappers
│   │   ├── auth.dart
│   │   ├── rooms.dart
│   │   ├── messages.dart
│   │   ├── sync.dart
│   │   └── models/          # Data models
│   └── lib.dart             # Public API exports
│
├── app/                      # Application-level code
│   ├── design_system/        # Design system implementation
│   │   ├── colors.dart      # AppColors class
│   │   ├── typography.dart  # AppTextStyles class
│   │   ├── icons.dart       # AppIcons class
│   │   ├── spacing.dart     # Spacing constants
│   │   ├── shadows.dart     # Shadow definitions
│   │   └── theme.dart       # ThemeData configurations
│   │
│   ├── routes/              # Application routing
│   │   ├── app_router.dart  # Auto-route configuration
│   │   ├── app_router.gr.dart # Generated routes
│   │   └── guards/          # Route guards
│   │       └── auth_guard.dart
│   │
│   ├── config/              # App configuration
│   │   ├── constants.dart   # App-wide constants
│   │   ├── environment.dart # Environment configuration
│   │   └── feature_flags.dart
│   │
│   └── app.dart             # Root application widget
│
├── features/                 # Feature modules (by domain)
│   ├── auth/                # Authentication feature
│   │   ├── screens/
│   │   │   ├── login_screen.dart
│   │   │   ├── register_screen.dart
│   │   │   ├── sso_screen.dart
│   │   │   └── server_selection_screen.dart
│   │   ├── widgets/
│   │   │   ├── login_form.dart
│   │   │   ├── server_input.dart
│   │   │   └── sso_button.dart
│   │   ├── bloc/
│   │   │   ├── auth_bloc.dart
│   │   │   ├── auth_event.dart
│   │   │   └── auth_state.dart
│   │   └── models/
│   │       └── auth_credentials.dart
│   │
│   ├── room_list/           # Room list feature
│   │   ├── screens/
│   │   │   └── room_list_screen.dart
│   │   ├── widgets/
│   │   │   ├── room_tile.dart
│   │   │   ├── room_avatar.dart
│   │   │   └── unread_badge.dart
│   │   ├── bloc/
│   │   │   ├── room_list_bloc.dart
│   │   │   ├── room_list_event.dart
│   │   │   └── room_list_state.dart
│   │   └── models/
│   │       └── room_preview.dart
│   │
│   ├── timeline/            # Chat timeline feature
│   │   ├── screens/
│   │   │   └── timeline_screen.dart
│   │   ├── widgets/
│   │   │   ├── message_bubble.dart
│   │   │   ├── message_input.dart
│   │   │   ├── typing_indicator.dart
│   │   │   ├── date_divider.dart
│   │   │   └── pinned_messages_bar.dart
│   │   ├── bloc/
│   │   │   ├── timeline_bloc.dart
│   │   │   ├── timeline_event.dart
│   │   │   └── timeline_state.dart
│   │   └── models/
│   │       ├── message.dart
│   │       └── typing_user.dart
│   │
│   ├── notifications/       # Notifications feature
│   │   ├── screens/
│   │   │   └── notification_settings_screen.dart
│   │   ├── widgets/
│   │   │   ├── notification_banner.dart
│   │   │   └── mention_badge.dart
│   │   ├── bloc/
│   │   │   ├── notification_bloc.dart
│   │   │   ├── notification_event.dart
│   │   │   └── notification_state.dart
│   │   └── models/
│   │       └── notification_preferences.dart
│   │
│   ├── calls/              # VoIP calls feature
│   │   ├── screens/
│   │   │   ├── voice_call_screen.dart
│   │   │   ├── video_call_screen.dart
│   │   │   └── incoming_call_screen.dart
│   │   ├── widgets/
│   │   │   ├── call_controls.dart
│   │   │   ├── video_view.dart
│   │   │   └── call_timer.dart
│   │   ├── bloc/
│   │   │   ├── call_bloc.dart
│   │   │   ├── call_event.dart
│   │   │   └── call_state.dart
│   │   └── models/
│   │       └── call_session.dart
│   │
│   ├── settings/           # Settings feature
│   │   ├── screens/
│   │   │   ├── settings_screen.dart
│   │   │   ├── profile_settings_screen.dart
│   │   │   ├── privacy_settings_screen.dart
│   │   │   └── device_settings_screen.dart
│   │   ├── widgets/
│   │   │   ├── setting_tile.dart
│   │   │   └── theme_selector.dart
│   │   ├── bloc/
│   │   │   ├── settings_bloc.dart
│   │   │   ├── settings_event.dart
│   │   │   └── settings_state.dart
│   │   └── models/
│   │       └── user_preferences.dart
│   │
│   └── search/             # Search feature
│       ├── screens/
│       │   └── message_search_screen.dart
│       ├── widgets/
│       │   ├── search_bar.dart
│       │   └── search_result_tile.dart
│       ├── bloc/
│       │   ├── search_bloc.dart
│       │   ├── search_event.dart
│       │   └── search_state.dart
│       └── models/
│           └── search_result.dart
│
├── widgets/                 # Shared UI components
│   ├── app_button.dart
│   ├── app_text_field.dart
│   ├── app_card.dart
│   ├── app_avatar.dart
│   ├── app_badge.dart
│   ├── app_dialog.dart
│   ├── app_bottom_sheet.dart
│   ├── app_snackbar.dart
│   ├── app_loading_indicator.dart
│   ├── app_error_widget.dart
│   ├── app_empty_state.dart
│   ├── app_focusable_border.dart
│   ├── app_mention_input.dart
│   ├── app_voice_recorder.dart
│   ├── app_video_recorder.dart
│   └── app_notification_banner.dart
│
├── services/               # Application services
│   ├── push_notification_service.dart
│   ├── background_service.dart
│   ├── call_service.dart
│   ├── media_service.dart
│   ├── permission_service.dart
│   ├── storage_service.dart
│   └── connectivity_service.dart
│
├── utils/                  # Utility functions
│   ├── extensions/
│   │   ├── string_extensions.dart
│   │   ├── datetime_extensions.dart
│   │   └── context_extensions.dart
│   ├── helpers/
│   │   ├── date_formatter.dart
│   │   ├── message_formatter.dart
│   │   └── file_helper.dart
│   ├── validators/
│   │   ├── input_validators.dart
│   │   └── matrix_id_validator.dart
│   └── constants/
│       ├── regex_patterns.dart
│       └── error_messages.dart
│
├── l10n/                   # Localization
│   ├── app_en.arb         # English translations
│   ├── app_ru.arb         # Russian translations
│   └── l10n.dart          # Generated localization code
│
└── bootstrap.dart          # Application initialization

```

## Rust Core Structure (`rust/`)

```
rust/
├── src/
│   ├── api/               # Public API surface (FFI boundary)
│   │   ├── auth/
│   │   │   ├── mod.rs
│   │   │   ├── login.rs
│   │   │   ├── register.rs
│   │   │   └── session.rs
│   │   ├── messaging/
│   │   │   ├── mod.rs
│   │   │   ├── send.rs
│   │   │   ├── receive.rs
│   │   │   └── reactions.rs
│   │   ├── rooms/
│   │   │   ├── mod.rs
│   │   │   ├── create.rs
│   │   │   ├── join.rs
│   │   │   └── leave.rs
│   │   ├── sync/
│   │   │   ├── mod.rs
│   │   │   └── sync_engine.rs
│   │   ├── calls/
│   │   │   ├── mod.rs
│   │   │   ├── voice.rs
│   │   │   └── video.rs
│   │   ├── models/        # API data models
│   │   │   ├── mod.rs
│   │   │   ├── message.rs
│   │   │   ├── room.rs
│   │   │   └── user.rs
│   │   └── mod.rs         # API exports
│   │
│   ├── core/              # Core business logic
│   │   ├── matrix_client/
│   │   │   ├── mod.rs
│   │   │   ├── client.rs
│   │   │   ├── config.rs
│   │   │   └── wrapper.rs
│   │   ├── storage/
│   │   │   ├── mod.rs
│   │   │   ├── database.rs
│   │   │   ├── migrations/
│   │   │   ├── queries/
│   │   │   └── models/
│   │   ├── crypto/
│   │   │   ├── mod.rs
│   │   │   ├── e2ee.rs
│   │   │   └── verification.rs
│   │   ├── sync/
│   │   │   ├── mod.rs
│   │   │   ├── engine.rs
│   │   │   ├── state.rs
│   │   │   └── queue.rs
│   │   ├── media/
│   │   │   ├── mod.rs
│   │   │   ├── upload.rs
│   │   │   ├── download.rs
│   │   │   └── cache.rs
│   │   └── error/
│   │       ├── mod.rs
│   │       └── types.rs
│   │
│   ├── services/          # Service layer
│   │   ├── auth_service.rs
│   │   ├── message_service.rs
│   │   ├── room_service.rs
│   │   ├── notification_service.rs
│   │   └── mod.rs
│   │
│   ├── utils/             # Utilities
│   │   ├── logger.rs
│   │   ├── config.rs
│   │   └── mod.rs
│   │
│   ├── frb_generated.rs   # Auto-generated FFI code
│   └── lib.rs             # Library entry point
│
├── tests/                 # Rust tests
│   ├── integration/
│   └── unit/
│
├── Cargo.toml            # Rust dependencies
└── build.rs              # Build script

```

## Test Structure

```
test/                      # Flutter unit tests
├── features/
│   ├── auth/
│   │   └── bloc/
│   │       └── auth_bloc_test.dart
│   ├── timeline/
│   │   └── widgets/
│   │       └── message_bubble_test.dart
│   └── ...
├── widgets/
│   ├── app_button_test.dart
│   └── ...
├── utils/
│   └── validators_test.dart
├── test_helpers/
│   ├── mock_data.dart
│   └── test_utils.dart
└── golden/               # Golden test images
    └── widgets/

integration_test/         # Integration tests
├── auth_flow_test.dart
├── messaging_test.dart
├── offline_sync_test.dart
└── performance_test.dart

```

## Documentation Structure

```
docs/
├── architecture/         # Architecture documentation
│   ├── README.md
│   ├── tech-stack.md
│   ├── project-structure.md
│   ├── coding-standards.md
│   ├── api-design.md
│   └── diagrams/
├── api/                  # API documentation
│   ├── flutter-api.md
│   ├── rust-api.md
│   └── ffi-bridge.md
├── guides/              # Development guides
│   ├── setup.md
│   ├── contributing.md
│   ├── testing.md
│   └── deployment.md
├── epics/               # Epic documentation
│   ├── epic-1-foundation.md
│   ├── epic-2-auth.md
│   └── ...
├── stories/             # User stories
├── qa/                  # QA documentation
│   ├── test-plans/
│   └── test-cases/
├── prd.md              # Product Requirements
└── ui-specification.md  # UI Specification

```

## Assets Structure

```
assets/
├── images/              # Static images
│   ├── logo/
│   ├── icons/
│   └── illustrations/
├── fonts/              # Custom fonts
│   ├── JetBrainsMono/
│   └── Inter/
├── animations/         # Lottie/Rive animations
├── sounds/            # Sound effects
│   ├── notifications/
│   └── ui/
└── translations/      # Translation files

```

## Platform-Specific Structures

### Android (`android/`)
```
android/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── AndroidManifest.xml
│   │       ├── kotlin/
│   │       └── res/
│   └── build.gradle
├── gradle/
└── settings.gradle
```

### iOS (`ios/`)
```
ios/
├── Runner/
│   ├── AppDelegate.swift
│   ├── Info.plist
│   ├── Assets.xcassets/
│   └── Base.lproj/
├── Runner.xcodeproj/
└── Podfile
```

## Build & Scripts Structure

```
scripts/
├── build/
│   ├── build_android.sh
│   ├── build_ios.sh
│   ├── build_desktop.sh
│   └── generate_ffi.sh
├── setup/
│   ├── setup_dev_env.sh
│   └── install_dependencies.sh
├── test/
│   ├── run_tests.sh
│   └── run_integration_tests.sh
└── release/
    ├── prepare_release.sh
    └── upload_artifacts.sh

```

## Configuration Files

### Root Level
```
.
├── .gitignore
├── .gitattributes
├── pubspec.yaml            # Flutter dependencies
├── pubspec.lock
├── flutter_rust_bridge.yaml # FFI configuration
├── analysis_options.yaml   # Dart linter rules
├── .editorconfig          # Editor configuration
├── .prettierrc            # Code formatting
├── Makefile               # Build automation
├── LICENSE
└── README.md
```

### CI/CD Configuration
```
.github/
├── workflows/
│   ├── ci.yml            # Continuous Integration
│   ├── cd.yml            # Continuous Deployment
│   ├── release.yml       # Release automation
│   └── performance.yml   # Performance testing
├── dependabot.yml        # Dependency updates
└── CODEOWNERS           # Code ownership

```

## Naming Conventions

### Dart/Flutter Files
- **Files**: `snake_case.dart`
- **Classes**: `PascalCase`
- **Variables/Functions**: `camelCase`
- **Constants**: `camelCase` or `SCREAMING_SNAKE_CASE`
- **Private members**: `_leadingUnderscore`

### Rust Files
- **Files**: `snake_case.rs`
- **Modules**: `snake_case`
- **Structs/Enums**: `PascalCase`
- **Functions/Variables**: `snake_case`
- **Constants**: `SCREAMING_SNAKE_CASE`

### Directory Names
- **All directories**: `snake_case`
- **Feature modules**: Singular noun (e.g., `auth`, not `authentication`)

## Module Boundaries

### Clean Architecture Layers
1. **Presentation Layer** (Flutter `lib/`)
   - UI components and screens
   - BLoC state management
   - No direct business logic

2. **API Layer** (FFI Bridge)
   - Data transfer objects
   - API contracts
   - No implementation details

3. **Domain Layer** (Rust `core/`)
   - Business logic
   - Domain models
   - Use cases

4. **Data Layer** (Rust `storage/`)
   - Database operations
   - External API calls
   - Caching

### Dependency Rules
- Dependencies flow inward (UI → API → Core → Data)
- No circular dependencies
- Core business logic has no UI dependencies
- UI has no direct database access

## File Organization Best Practices

### Feature Module Structure
Each feature should be self-contained:
```
feature_name/
├── screens/      # Feature screens
├── widgets/      # Feature-specific widgets
├── bloc/         # State management
└── models/       # Feature data models
```

### Widget Organization
- Shared widgets in `lib/widgets/`
- Feature-specific widgets in `features/*/widgets/`
- One widget per file
- Complex widgets can have sub-widgets in same file

### Test Organization
- Mirror source structure in tests
- Group related tests
- Use descriptive test names
- Separate test utilities

## Import Organization

### Dart Import Order
```dart
// 1. Dart SDK imports
import 'dart:async';
import 'dart:io';

// 2. Flutter imports
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

// 3. Package imports (alphabetical)
import 'package:auto_route/auto_route.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

// 4. Project imports (absolute paths)
import 'package:skiffy/api/matrix_client/auth.dart';
import 'package:skiffy/features/auth/bloc/auth_bloc.dart';

// 5. Part files
part 'auth_event.dart';
part 'auth_state.dart';
```

### Rust Import Organization
```rust
// 1. Standard library
use std::collections::HashMap;
use std::sync::Arc;

// 2. External crates (alphabetical)
use anyhow::Result;
use tokio::sync::RwLock;

// 3. Internal crates
use crate::core::matrix_client;
use crate::api::models;

// 4. Module declarations
mod auth;
mod messaging;
```

## Version Control Guidelines

### Branch Structure
```
main                    # Production-ready code
├── develop            # Integration branch
├── feature/*          # Feature branches
├── bugfix/*          # Bug fixes
├── hotfix/*          # Production hotfixes
└── release/*         # Release preparation
```

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: feat, fix, docs, style, refactor, test, chore

---

*This project structure ensures clean separation of concerns, maintainability, and scalability across all platforms while enforcing architectural boundaries between the Flutter UI and Rust core.*