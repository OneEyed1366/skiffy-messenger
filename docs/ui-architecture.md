# SkiffyMessenger Frontend Architecture Document

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-15 | 1.0 | Initial frontend architecture document | Winston (Architect Agent) |

## Template and Framework Selection

SkiffyMessenger is built on Flutter 3.8.0+ with a thin-client architecture pattern. The project uses an established Flutter codebase with Rust core business logic, communicating via FFI (Foreign Function Interface).

**Framework Decision**: Flutter was chosen for cross-platform consistency while maintaining native performance. The project avoids Material You dynamic theming in favor of a custom design system to ensure consistent branding across all platforms.

**Existing Dependencies Analysis**:

- Flutter 3.8.0+ with Dart 3.x established
- BLoC pattern for state management already implemented
- auto_route for type-safe navigation configured
- Custom design system with Inter and SourceCodePro fonts
- flutter_rust_bridge 2.11.1 for FFI communication
- Internationalization support for en/es/ru languages

## Frontend Tech Stack

### Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|-----------|---------|---------|-----------|
| Framework | Flutter | 3.8.0+ | Cross-platform UI framework | Enables single codebase for all platforms while maintaining native performance |
| Language | Dart | 3.x | Application programming language | Required for Flutter, provides null safety and strong typing |
| State Management | BLoC/Cubit | 9.0.0+ | Reactive state management | Provides predictable state management with clear separation of business logic |
| Routing | auto_route | 10.1.2+ | Type-safe navigation | Generates type-safe routes, reducing runtime errors and improving developer experience |
| UI Components | Custom Design System | - | Consistent UI components | Custom implementation avoiding Material You, following project UI specifications |
| Internationalization | flutter_localizations | Built-in | Multi-language support | Native Flutter i18n with custom arb files (en/es/ru) |
| Font System | Inter + SourceCodePro | Custom | Typography system | Inter for UI text, SourceCodePro for monospace content |
| Icon System | Custom SVG Icons | - | Scalable vector icons | SVG-based icons for crisp rendering at all scales |
| FFI Bridge | flutter_rust_bridge | 2.11.1 | Flutter-Rust communication | Type-safe bridge between Flutter UI and Rust business logic |
| Build System | Standard Flutter | Built-in | Application compilation | Flutter's build system with platform-specific configurations |
| Development Tools | very_good_analysis | 9.0.0+ | Code quality and linting | Enforces consistent code style and catches potential issues |

### Technology Decisions Rationale

**Custom Design System over Material/Cupertino**: Ensures consistent branding across platforms and avoids Material You dynamic theming as specified in project requirements.

**BLoC over Riverpod/Provider**: Established pattern in the project with clear event-driven architecture that maps well to Matrix protocol events from the Rust core.

**auto_route over GoRouter**: Already integrated and provides excellent code generation for type safety, reducing runtime navigation errors.

**Custom fonts**: Professional appearance with Inter for readability and SourceCodePro for technical content like user IDs and room addresses.

## Project Structure

```
lib/
├── app/
│   ├── design_system/
│   │   ├── design_system.dart          # Main export file
│   │   ├── theme.dart                  # Flutter ThemeData configuration
│   │   ├── typography.dart             # Text styles and font definitions
│   │   ├── icons.dart                  # SVG icon definitions and helpers
│   │   └── gen/                        # Generated assets (flutter_gen)
│   │       ├── assets.gen.dart         # Generated asset definitions
│   │       ├── fonts.gen.dart          # Generated font definitions
│   │       └── gen.dart                # Barrel export for generated code
│   ├── view/
│   │   └── app.dart                    # Main App widget
│   └── router/
│       ├── app_router.dart             # auto_route configuration
│       └── app_router.gr.dart          # Generated routes (auto_route)
├── features/
│   ├── secure_storage/
│   │   ├── secure_storage.dart         # Feature implementation
│   │   ├── cubit/                      # State management
│   │   └── view/                       # UI components
│   ├── counter/                        # Example feature
│   │   ├── cubit/
│   │   └── view/
│   └── [future features like authentication, chat, etc.]
├── rust/
│   ├── api/                           # FFI API definitions
│   └── core/
│       ├── matrix_client/             # Matrix client integration
│       └── storage/                   # Storage layer
├── services/
│   ├── secure_storage_service.dart    # Credential storage service
│   └── [other services]
├── widgets/
│   ├── app_button.dart                # Custom button component
│   ├── app_text_field.dart            # Custom text input
│   ├── app_card.dart                  # Custom card component
│   ├── app_focusable_border.dart      # Focus management widget
│   └── widgets.dart                   # Widgets barrel export
├── l10n/
│   ├── arb/
│   │   ├── app_en.arb                 # English translations
│   │   ├── app_es.arb                 # Spanish translations
│   │   └── app_ru.arb                 # Russian translations
│   └── gen/                           # Generated localizations
│       ├── app_localizations.dart     # Main localization class
│       ├── app_localizations_en.dart  # English localizations
│       ├── app_localizations_es.dart  # Spanish localizations
│       └── app_localizations_ru.dart  # Russian localizations
└── main.dart                          # Application entry point

assets/
├── fonts/
│   ├── Inter-Regular.ttf
│   ├── Inter-Medium.ttf
│   ├── Inter-SemiBold.ttf
│   ├── Inter-Bold.ttf
│   ├── SourceCodePro-Regular.ttf
│   └── SourceCodePro-Medium.ttf
└── images/
    └── icons/                          # SVG icons directory

test/
├── app/
│   ├── design_system/
│   └── router/
├── features/
│   ├── authentication/
│   ├── chat/
│   └── profile/
├── widgets/
│   ├── app_button_test.dart
│   ├── app_text_field_test.dart
│   └── app_card_test.dart
├── services/
└── helpers/
    ├── test_helpers.dart               # Common test utilities
    └── mock_rust_bridge.dart           # FFI mocking utilities
```

### Key Organizational Principles

- **Feature-first structure**: Each major feature (auth, chat, profile) is self-contained with its own BLoCs and views
- **Separation of concerns**: Services handle external communication (FFI, storage), widgets are pure UI components
- **Generated code isolation**: All generated files (routes, assets, l10n) are clearly separated within their respective domains
- **Test mirroring**: Test structure mirrors the lib structure for easy navigation

### Directory Purposes

- `app/`: Application-level configuration (theme, routing, localization)
- `features/`: Domain-specific functionality with BLoC pattern implementation
- `services/`: Cross-cutting concerns and external system integration
- `widgets/`: Reusable UI components following design system
- `l10n/`: Internationalization assets and generated code
- `rust/`: FFI-related code organization for Flutter-Rust communication

## Component Standards

### Component Template

Based on the existing `AppButton` implementation, here's the established Flutter component template:

```dart
import 'package:flutter/material.dart';
import 'package:skiffy/app/design_system/design_system.dart';
import 'package:skiffy/widgets/app_focusable_border.dart';

/// [ComponentName] component for SkiffyMessenger
///
/// Brief description of the component's purpose and features.
/// Include key functionality and accessibility compliance notes.
///
/// Features:
/// - Feature 1 (e.g., Multiple variants)
/// - Feature 2 (e.g., Loading states)
/// - Feature 3 (e.g., Accessibility compliance)
/// - Feature 4 (e.g., Responsive sizing)
class AppComponentName extends StatelessWidget {
  const AppComponentName({
    super.key,
    // Required parameters first
    required this.requiredParam,
    // Optional parameters with defaults
    this.optionalParam = DefaultValue.defaultOption,
    this.isLoading = false,
    this.onAction,
    this.semanticLabel,
    this.focusNode,
    this.margin,
  });

  /// Named constructor for primary variant
  const AppComponentName.primary({
    required this.requiredParam,
    super.key,
    this.optionalParam = DefaultValue.primary,
    this.isLoading = false,
    this.onAction,
    this.semanticLabel,
    this.focusNode,
    this.margin,
  });

  /// Named constructor for secondary variant
  const AppComponentName.secondary({
    required this.requiredParam,
    super.key,
    this.optionalParam = DefaultValue.secondary,
    this.isLoading = false,
    this.onAction,
    this.semanticLabel,
    this.focusNode,
    this.margin,
  });

  /// Required parameter documentation
  final String requiredParam;

  /// Optional parameter documentation
  final DefaultValue optionalParam;

  /// Whether to show loading state
  final bool isLoading;

  /// Action callback
  final VoidCallback? onAction;

  /// Custom semantic label for accessibility
  final String? semanticLabel;

  /// Custom focus node for focus management
  final FocusNode? focusNode;

  /// Additional margin around component
  final EdgeInsets? margin;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    // Component implementation follows existing patterns

    var child = _buildContent(context);

    // Apply focus wrapper for accessibility (following AppButton pattern)
    child = AppFocusableBorderFactory.forComponent(
      child: child,
      onPressed: onAction,
      semanticLabel: semanticLabel,
      focusNode: focusNode,
    );

    // Apply margin if provided
    if (margin != null) {
      child = Padding(
        padding: margin!,
        child: child,
      );
    }

    return child;
  }

  /// Private helper methods for internal component logic
  Widget _buildContent(BuildContext context) {
    // Implementation details
  }
}

/// Enum for component variants
enum DefaultValue {
  primary,
  secondary,
  // Add other variants as needed
}
```

### Naming Conventions

**Components & Widgets:**

- **Format**: `App{ComponentName}` (e.g., `AppButton`, `AppTextField`, `AppCard`)
- **File naming**: `app_{component_name}.dart` (e.g., `app_button.dart`)
- **Constructors**: Named constructors for variants (`.primary()`, `.secondary()`, `.icon()`)

**Enums & Types:**

- **Variants**: `App{Component}{Property}` (e.g., `AppButtonVariant`, `AppButtonSize`)
- **Values**: camelCase (e.g., `primary`, `secondary`, `tertiary`)

**Methods & Properties:**

- **Public properties**: camelCase (e.g., `isLoading`, `onPressed`, `semanticLabel`)
- **Private methods**: prefixed with underscore (e.g., `_buildButtonContent`, `_getButtonColors`)
- **Factory methods**: `AppFocusableBorderFactory.forButton`

**Files & Directories:**

- **Widgets**: `lib/widgets/app_{name}.dart`
- **Features**: `lib/features/{feature_name}/`
- **Design System**: `lib/app/design_system/{component}.dart`
- **Barrel exports**: `{directory_name}.dart` (e.g., `widgets.dart`, `design_system.dart`)

**Constants & Configuration:**

- **Design tokens**: `AppTextStyles.{usage}` (e.g., `buttonMedium`, `headline1`)
- **Colors**: Exported from design_system (e.g., `colorScheme.primary`)
- **Internal classes**: Prefixed with underscore (e.g., `_ButtonColors`, `_ButtonSizes`)

### Component Architecture Patterns

- All components wrapped with `AppFocusableBorder` for accessibility
- Consistent error handling with assertions in constructors
- Design system integration via `Theme.of(context)`
- Support for semantic labels and custom focus nodes
- Loading states and proper disabled state handling
- Comprehensive documentation with feature lists
- Multiple named constructors for common use cases
- Internal helper classes for configuration (prefixed with underscore)

## State Management

SkiffyMessenger uses the BLoC (Business Logic Component) pattern with Cubit implementations for state management, providing clear separation between UI and business logic while maintaining reactive data flow from the Rust core.

### Store Structure

State management follows a feature-based organization with Cubits handling specific domain logic:

```
lib/features/{feature_name}/
├── cubit/
│   ├── {feature_name}_cubit.dart      # Main Cubit implementation
│   ├── {feature_name}_state.dart      # State definitions
│   └── {feature_name}_event.dart      # Events (if using BLoC instead of Cubit)
├── view/
│   └── {feature_name}_page.dart       # UI that consumes the state
└── {feature_name}.dart                # Feature barrel export
```

**Examples from current codebase:**

- `lib/features/secure_storage/cubit/secure_storage_cubit.dart`
- `lib/features/counter/cubit/counter_cubit.dart`

### State Management Template

Based on the existing `SecureStorageCubit`, here's the established pattern for state management:

```dart
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:skiffy/services/{related_service}.dart';

part '{feature_name}_state.dart';

/// Cubit for managing {feature_name} state
///
/// This cubit handles {brief description of responsibilities}
/// and manages {specific state aspects}.
class FeatureNameCubit extends Cubit<FeatureNameState> {
  FeatureNameCubit({
    RelatedService? relatedService,
  }) : _relatedService = relatedService ?? RelatedService.instance,
       super(const FeatureNameInitial());

  final RelatedService _relatedService;

  /// Initialize the feature and set initial state
  Future<void> initialize() async {
    emit(const FeatureNameLoading());

    try {
      final result = await _relatedService.initialize();
      if (!result) {
        emit(const FeatureNameError('Initialization failed'));
        return;
      }

      // Additional initialization logic
      await _loadInitialData();
    } catch (e) {
      emit(FeatureNameError('Initialization error: $e'));
    }
  }

  /// Private method for loading initial data
  Future<void> _loadInitialData() async {
    try {
      final data = await _relatedService.getData();
      emit(FeatureNameLoaded(data: data));
    } catch (e) {
      emit(FeatureNameError('Failed to load data: $e'));
    }
  }

  /// Public method for feature-specific actions
  Future<void> performAction(String parameter) async {
    try {
      await _relatedService.performAction(parameter);
      // Emit appropriate state changes
    } catch (e) {
      emit(FeatureNameError('Action failed: $e'));
    }
  }
}

/// State definitions using Equatable for efficient comparisons
abstract class FeatureNameState extends Equatable {
  const FeatureNameState();

  @override
  List<Object?> get props => [];
}

class FeatureNameInitial extends FeatureNameState {
  const FeatureNameInitial();
}

class FeatureNameLoading extends FeatureNameState {
  const FeatureNameLoading();
}

class FeatureNameLoaded extends FeatureNameState {
  const FeatureNameLoaded({required this.data});

  final DataModel data;

  @override
  List<Object?> get props => [data];
}

class FeatureNameError extends FeatureNameState {
  const FeatureNameError(this.message);

  final String message;

  @override
  List<Object?> get props => [message];
}
```

### State Management Patterns

**Cubit vs BLoC Decision:**

- **Simple features**: Use Cubit for straightforward state management (like `CounterCubit`)
- **Complex features**: Use BLoC with events for complex business logic that requires event tracking

**Key Patterns Established:**

1. **Service Injection**: All Cubits accept optional service dependencies for testability
2. **Error Handling**: Consistent error state emission with descriptive messages
3. **Async Operations**: All external operations are async and wrapped in try-catch
4. **State Immutability**: States extend Equatable and use copyWith for updates
5. **Service Communication**: Cubits communicate with services, not directly with FFI
6. **Loading States**: Explicit loading states for async operations

**FFI Integration Pattern:**

```dart
// Service layer handles FFI communication
class MatrixService {
  Future<RoomList> getRooms() async {
    try {
      // FFI call to Rust core
      final rustRooms = await RustBridge.instance.getRooms();
      return RoomList.fromRust(rustRooms);
    } catch (e) {
      throw MatrixServiceException('Failed to get rooms: $e');
    }
  }
}

// Cubit uses service, not FFI directly
class ChatCubit extends Cubit<ChatState> {
  ChatCubit({MatrixService? matrixService})
      : _matrixService = matrixService ?? MatrixService.instance,
        super(const ChatInitial());

  Future<void> loadRooms() async {
    emit(const ChatLoading());
    try {
      final rooms = await _matrixService.getRooms();
      emit(ChatLoaded(rooms: rooms));
    } catch (e) {
      emit(ChatError('Failed to load rooms: $e'));
    }
  }
}
```

**State Updates from Rust Core:**
For real-time updates from the Rust core, use StreamSubscriptions in Cubits:

```dart
class ChatCubit extends Cubit<ChatState> {
  StreamSubscription<RoomUpdate>? _roomUpdateSubscription;

  @override
  Future<void> close() {
    _roomUpdateSubscription?.cancel();
    return super.close();
  }

  void _subscribeToRoomUpdates() {
    _roomUpdateSubscription = _matrixService
        .roomUpdateStream
        .listen((update) {
      // Handle real-time updates from Rust core
      _handleRoomUpdate(update);
    });
  }
}

## API Integration

SkiffyMessenger uses a service layer pattern to integrate with the Rust core via FFI (Foreign Function Interface), providing clean separation between Flutter UI and backend business logic while maintaining type safety and error handling.

### Service Template

Based on the existing `SecureStorageService`, here's the established pattern for API service integration:

```dart
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:skiffy/rust/api/{feature_name}.dart';

/// Service for {feature_name} operations
///
/// This service wraps the Rust FFI {feature_name} API and provides
/// a convenient Dart interface for {feature description}.
class FeatureNameService {
  FeatureNameService._();
  static FeatureNameService? _instance;
  static FeatureNameService get instance =>
      _instance ??= FeatureNameService._();

  bool _initialized = false;
  StreamController<FeatureUpdate>? _updateStreamController;

  /// Reset the service state (for testing only)
  @visibleForTesting
  void resetForTesting() {
    _initialized = false;
    _updateStreamController?.close();
    _updateStreamController = null;
  }

  /// Initialize the service
  Future<bool> initialize() async {
    try {
      initializeFeature(); // FFI call to Rust
      _initialized = true;
      _setupUpdateStream();
      debugPrint('FeatureNameService: Initialized successfully');
      return true;
    } catch (e) {
      debugPrint('FeatureNameService: Failed to initialize: $e');
      return false;
    }
  }

  /// Stream of real-time updates from Rust core
  Stream<FeatureUpdate> get updateStream =>
      _updateStreamController?.stream ?? const Stream.empty();

  /// Perform an operation with proper error handling
  Future<ResultType> performOperation(String parameter) async {
    _ensureInitialized();

    try {
      final result = await featureOperation(parameter: parameter);
      debugPrint('FeatureNameService: Operation completed');
      return ResultType.fromRust(result);
    } on FeatureApiError catch (e) {
      debugPrint('FeatureNameService: Operation failed: $e');
      throw FeatureServiceException('Operation failed', e.errorType);
    } catch (e) {
      debugPrint('FeatureNameService: Unexpected error: $e');
      throw FeatureServiceException('Operation failed', 'UnknownError');
    }
  }

  /// Setup real-time update stream from Rust
  void _setupUpdateStream() {
    _updateStreamController = StreamController<FeatureUpdate>.broadcast();

    // Subscribe to Rust core updates
    subscribeToFeatureUpdates().listen((rustUpdate) {
      final dartUpdate = FeatureUpdate.fromRust(rustUpdate);
      _updateStreamController?.add(dartUpdate);
    });
  }

  void _ensureInitialized() {
    if (!_initialized) {
      throw const FeatureServiceException(
        'FeatureNameService not initialized',
        'Call initialize() first',
      );
    }
  }

  /// Dispose resources
  void dispose() {
    _updateStreamController?.close();
  }
}

/// Exception for service operations
class FeatureServiceException implements Exception {
  const FeatureServiceException(this.message, this.errorType);
  final String message;
  final String errorType;

  @override
  String toString() => 'FeatureServiceException: $message ($errorType)';
}
```

### API Client Configuration

The FFI bridge configuration follows flutter_rust_bridge patterns with type-safe communication:

```dart
// Generated FFI bindings location: lib/rust/api/{feature_name}.dart

/// FFI API calls to Rust core
external void initializeFeature();

external Future<RustResultType> featureOperation({required String parameter});

external Stream<RustUpdateType> subscribeToFeatureUpdates();

/// Error types from Rust core
class FeatureApiError implements Exception {
  const FeatureApiError(this.message, this.errorType);
  final String message;
  final String errorType;

  @override
  String toString() => 'FeatureApiError: $message ($errorType)';
}

/// Data transformation helpers
extension RustDataMapping on RustResultType {
  DartResultType toDart() {
    return DartResultType(
      id: this.id,
      name: this.name,
      // Map other fields...
    );
  }
}

class DartResultType {
  const DartResultType({
    required this.id,
    required this.name,
  });

  final String id;
  final String name;

  /// Create from Rust FFI type
  factory DartResultType.fromRust(RustResultType rust) => rust.toDart();
}
```

### API Integration Patterns

**Key Patterns Established:**

1. **Service Layer Abstraction**: Services wrap FFI calls and provide Dart-friendly APIs
2. **Singleton Pattern**: Services use singleton instances with factory constructors
3. **Initialization Guards**: All operations check initialization state before proceeding
4. **Error Translation**: FFI errors are caught and translated to Dart exceptions
5. **Type Mapping**: Rust types are mapped to Dart types with factory constructors
6. **Stream Integration**: Real-time updates from Rust are exposed as Dart Streams
7. **Debug Logging**: All operations include debug logging for development
8. **Testing Support**: Services provide testing utilities and reset methods

**Error Handling Strategy:**

- FFI errors are caught at the service boundary
- Rust error types are mapped to Dart exception types
- Error messages include context and error type information
- Services never expose raw FFI errors to business logic

**Performance Considerations:**

- Services maintain connection state to avoid re-initialization
- Streams are broadcast controllers for multiple subscribers
- Large data sets use streaming APIs rather than bulk transfers
- FFI calls are async by default to prevent UI blocking

**Security Patterns:**

- Sensitive data handling follows secure storage patterns
- FFI boundary validates all input parameters
- Services implement proper resource disposal
- Authentication tokens are managed by dedicated services

## Routing

SkiffyMessenger uses auto_route for type-safe navigation with declarative route configuration and code generation, providing compile-time route validation and parameter passing.

### Route Configuration

Based on the existing router configuration, here's the established pattern:

```dart
import 'package:auto_route/auto_route.dart';
import 'package:skiffy/features/authentication/view/login_page.dart';
import 'package:skiffy/features/chat/view/chat_page.dart';
import 'package:skiffy/features/chat/view/room_list_page.dart';

part 'router.gr.dart';

@AutoRouterConfig(replaceInRouteName: 'Screen|Page|View,Route')
class AppRouter extends RootStackRouter {
  @override
  RouteType get defaultRouteType => const RouteType.material();

  @override
  List<AutoRoute> get routes => [
    // Authentication flow
    AutoRoute(
      page: LoginRoute.page,
      path: '/login',
      initial: true,
    ),

    // Main application shell
    AutoRoute(
      page: MainShellRoute.page,
      path: '/app',
      children: [
        // Chat features
        AutoRoute(
          page: RoomListRoute.page,
          path: '/rooms',
        ),
        AutoRoute(
          page: ChatRoute.page,
          path: '/chat/:roomId',
        ),

        // Settings and profile
        AutoRoute(
          page: SettingsRoute.page,
          path: '/settings',
        ),
        AutoRoute(
          page: ProfileRoute.page,
          path: '/profile',
        ),
      ],
    ),

    // Redirect route for authenticated state
    RedirectRoute(
      path: '/',
      redirectTo: '/app/rooms',
    ),
  ];
}

/// Main shell for authenticated users
@RoutePage()
class MainShellPage extends StatelessWidget {
  const MainShellPage({super.key});

  @override
  Widget build(BuildContext context) {
    return AutoRouter(
      // Navigation shell with bottom navigation or drawer
    );
  }
}

/// Guard for protecting authenticated routes
class AuthGuard extends AutoRouteGuard {
  @override
  void onNavigation(NavigationResolver resolver, StackRouter router) {
    // Check authentication state
    final authService = context.read<AuthService>();
    if (authService.isAuthenticated) {
      resolver.next();
    } else {
      router.pushAndClearStack(const LoginRoute());
    }
  }
}
```

### Routing Patterns

**Route Organization:**

- **Authentication routes**: Login, registration, SSO flows
- **Main shell**: Authenticated user interface with navigation
- **Feature routes**: Chat, rooms, settings organized by domain
- **Modal routes**: Dialogs, bottom sheets, overlays

**Navigation Patterns:**

```dart
// Programmatic navigation in BLoCs/Cubits
class ChatCubit extends Cubit<ChatState> {
  final AppRouter router;

  ChatCubit({required this.router});

  void navigateToRoom(String roomId) {
    router.push(ChatRoute(roomId: roomId));
  }

  void goBackToRoomList() {
    router.pushAndClearStack(const RoomListRoute());
  }
}

// Navigation in widgets
class RoomTile extends StatelessWidget {
  final Room room;

  const RoomTile({required this.room, super.key});

  @override
  Widget build(BuildContext context) {
    return AppCard.clickable(
      onTap: () => context.router.push(ChatRoute(roomId: room.id)),
      child: Text(room.name),
    );
  }
}

// Deep linking support
@RoutePage()
class ChatPage extends StatelessWidget {
  final String roomId;

  const ChatPage({required this.roomId, super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => ChatCubit(roomId: roomId),
      child: ChatView(),
    );
  }
}
```

**Route Guards and Middleware:**

```dart
// Authentication guard
class AuthGuard extends AutoRouteGuard {
  @override
  void onNavigation(NavigationResolver resolver, StackRouter router) {
    final authCubit = context.read<AuthCubit>();

    if (authCubit.state is AuthAuthenticated) {
      resolver.next();
    } else {
      router.pushAndClearStack(const LoginRoute());
    }
  }
}

// Permission-based guards
class AdminGuard extends AutoRouteGuard {
  @override
  void onNavigation(NavigationResolver resolver, StackRouter router) {
    final authCubit = context.read<AuthCubit>();
    final currentUser = authCubit.currentUser;

    if (currentUser?.isAdmin ?? false) {
      resolver.next();
    } else {
      // Show error or redirect to appropriate page
      resolver.redirect(const UnauthorizedRoute());
    }
  }
}

// Apply guards to routes
@AutoRouterConfig()
class AppRouter extends RootStackRouter {
  @override
  List<AutoRoute> get routes => [
    AutoRoute(
      page: AdminPanelRoute.page,
      path: '/admin',
      guards: [AuthGuard, AdminGuard],
    ),
  ];
}
```

**Nested Navigation:**

```dart
// Tab-based navigation within main shell
@RoutePage()
class MainShellPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return AutoTabsScaffold(
      routes: [
        RoomListRoute(),
        DirectMessagesRoute(),
        SettingsRoute(),
      ],
      bottomNavigationBuilder: (context, tabsRouter) {
        return BottomNavigationBar(
          currentIndex: tabsRouter.activeIndex,
          onTap: tabsRouter.setActiveIndex,
          items: [
            BottomNavigationBarItem(
              icon: AppIcons.chat,
              label: context.l10n.rooms,
            ),
            BottomNavigationBarItem(
              icon: AppIcons.directMessage,
              label: context.l10n.directMessages,
            ),
            BottomNavigationBarItem(
              icon: AppIcons.settings,
              label: context.l10n.settings,
            ),
          ],
        );
      },
    );
  }
}
```

**Key Routing Features:**

1. **Type Safety**: All routes are generated with proper type checking
2. **Parameter Validation**: Route parameters are validated at compile time
3. **Deep Linking**: Support for handling URLs and navigation state restoration
4. **Guard System**: Authentication and permission-based route protection
5. **Nested Routing**: Tab bars, drawers, and complex navigation hierarchies
6. **State Management Integration**: Routes work seamlessly with BLoC pattern
7. **Internationalization**: Route names and parameters support localization
8. **Testing Support**: Routes can be easily mocked and tested

## Styling Guidelines

SkiffyMessenger uses a comprehensive design system with custom theming that explicitly excludes Material You and Dynamic Color, providing consistent visual experience across all platforms and user preferences.

### Styling Approach

The project implements a **custom design system** approach with the following characteristics:

- **Material 3 Foundation**: Uses Material 3 as a base but with custom color schemes
- **No Material You**: Explicitly disabled to maintain brand consistency
- **Custom Color Palette**: Amber primary (#FF9500) and Teal secondary (#008B8B)
- **Graphite Dark Theme**: Uses #1C1C1E background for dark mode
- **Inter Typography**: Primary font family for all UI text
- **SourceCodePro Monospace**: For technical content (IDs, code blocks)

### Global Theme Variables

Here's the CSS custom properties theme system integrated with Flutter's design tokens:

```css
:root {
  /* Primary Colors */
  --color-primary: #FF9500;
  --color-primary-container: #FFEFCE;
  --color-on-primary: #2D1600;
  --color-on-primary-container: #432B00;

  /* Secondary Colors */
  --color-secondary: #008B8B;
  --color-secondary-container: #B2DFDB;
  --color-on-secondary: #003734;
  --color-on-secondary-container: #00504C;

  /* Surface Colors (Light) */
  --color-surface: #FFFBFF;
  --color-on-surface: #1C1B1F;
  --color-surface-container-highest: #E6E1E5;
  --color-surface-container-high: #ECE6F0;
  --color-surface-container: #F2EDF1;
  --color-surface-container-low: #F7F2FA;

  /* Typography Scale */
  --font-size-headline-large: 32px;
  --font-size-headline-medium: 24px;
  --font-size-headline-small: 20px;
  --font-size-title-large: 18px;
  --font-size-title-medium: 16px;
  --font-size-body-large: 16px;
  --font-size-body-medium: 14px;
  --font-size-label-large: 14px;
  --font-size-label-medium: 12px;

  /* Font Weights */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Spacing Scale */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

  /* Animation */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;
  --easing-standard: cubic-bezier(0.4, 0.0, 0.2, 1);
}

/* Dark Theme Overrides */
[data-theme="dark"] {
  /* Primary Colors (Adapted for Dark) */
  --color-primary: #FFB784;
  --color-primary-container: #432B00;
  --color-on-primary: #2D1600;
  --color-on-primary-container: #FFDCC1;

  /* Secondary Colors (Adapted for Dark) */
  --color-secondary: #4DB6AC;
  --color-secondary-container: #00504C;
  --color-on-secondary: #003734;
  --color-on-secondary-container: #B2DFDB;

  /* Surface Colors (Graphite Base) */
  --color-surface: #1C1C1E;
  --color-on-surface: #E6E1E5;
  --color-surface-container-highest: #36343B;
  --color-surface-container-high: #2B2930;
  --color-surface-container: #211F26;
  --color-surface-container-low: #1C1B1F;

  /* Enhanced shadows for dark mode */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.3);
}
```

### Theme Integration with Flutter

The CSS variables above correspond to Flutter theme configuration:

```dart
// Accessing theme colors in Flutter components
class ExampleWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Container(
      color: colorScheme.surface,
      child: Text(
        'Hello World',
        style: theme.textTheme.bodyLarge?.copyWith(
          color: colorScheme.onSurface,
        ),
      ),
    );
  }
}

// Custom theme extensions for messenger-specific colors
class MessengerTheme extends ThemeExtension<MessengerTheme> {
  final Color onlineStatus;
  final Color offlineStatus;
  final Color ownMessageBubble;
  final Color otherMessageBubble;

  const MessengerTheme({
    required this.onlineStatus,
    required this.offlineStatus,
    required this.ownMessageBubble,
    required this.otherMessageBubble,
  });

  @override
  MessengerTheme copyWith({
    Color? onlineStatus,
    Color? offlineStatus,
    Color? ownMessageBubble,
    Color? otherMessageBubble,
  }) {
    return MessengerTheme(
      onlineStatus: onlineStatus ?? this.onlineStatus,
      offlineStatus: offlineStatus ?? this.offlineStatus,
      ownMessageBubble: ownMessageBubble ?? this.ownMessageBubble,
      otherMessageBubble: otherMessageBubble ?? this.otherMessageBubble,
    );
  }

  @override
  MessengerTheme lerp(ThemeExtension<MessengerTheme>? other, double t) {
    if (other is! MessengerTheme) return this;

    return MessengerTheme(
      onlineStatus: Color.lerp(onlineStatus, other.onlineStatus, t)!,
      offlineStatus: Color.lerp(offlineStatus, other.offlineStatus, t)!,
      ownMessageBubble: Color.lerp(ownMessageBubble, other.ownMessageBubble, t)!,
      otherMessageBubble: Color.lerp(otherMessageBubble, other.otherMessageBubble, t)!,
    );
  }
}
```

### Design System Integration

**Typography System:**

- Based on comprehensive `AppTextStyles` class with semantic naming
- 24 predefined text styles covering all use cases
- Supports both Inter (UI) and SourceCodePro (monospace) fonts
- Theme-aware utilities for color and style modifications

**Component Theming:**

- All components follow the established theme structure
- Colors are derived from the central `ColorScheme`
- Typography uses semantic styles (`titleMedium`, `bodyLarge`, etc.)
- Consistent spacing and elevation across all components

**Dark Mode Support:**

- Complete dark theme with graphite background (#1C1C1E)
- Adapted colors for better contrast and readability
- Enhanced shadows and borders for dark environments
- Maintained brand colors with appropriate lightness adjustments

**Key Styling Principles:**

1. **Consistency**: All components derive styling from central theme
2. **Accessibility**: High contrast ratios and semantic color usage
3. **Brand Adherence**: Custom colors override Material defaults
4. **Performance**: Efficient theme lookups and color calculations
5. **Maintainability**: Centralized theme definitions with utility methods
6. **Scalability**: Easy to extend with new colors and styles as needed

## Testing Requirements

SkiffyMessenger follows comprehensive testing practices with widget tests, unit tests, and integration tests to ensure code quality and reliability across the Flutter UI layer and FFI integration.

### Component Test Template

Based on the existing `AppButton` tests, here's the established pattern for testing UI components:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:skiffy/app/design_system/theme.dart';
import 'package:skiffy/widgets/app_component_name.dart';

void main() {
  group('AppComponentName', () {
    testWidgets('displays content correctly', (tester) async {
      const testValue = 'Test Content';

      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          home: Scaffold(
            body: AppComponentName(
              content: testValue,
            ),
          ),
        ),
      );

      expect(find.text(testValue), findsOneWidget);
    });

    testWidgets('calls callbacks when interacted with', (tester) async {
      var wasTriggered = false;

      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          home: Scaffold(
            body: AppComponentName(
              onAction: () {
                wasTriggered = true;
              },
            ),
          ),
        ),
      );

      await tester.tap(find.byType(AppComponentName));
      expect(wasTriggered, isTrue);
    });

    testWidgets('shows different states correctly', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          home: Scaffold(
            body: AppComponentName(
              isLoading: true,
            ),
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('handles disabled state correctly', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          home: const Scaffold(
            body: AppComponentName(
              onAction: null,
            ),
          ),
        ),
      );

      expect(find.byType(AppComponentName), findsOneWidget);
      await tester.tap(find.byType(AppComponentName));
      // Should not crash or throw
    });
  });
}
```

### Testing Best Practices

1. **Unit Tests**: Test individual components in isolation
   - Test component logic and state changes
   - Mock external dependencies (services, FFI calls)
   - Verify correct widget tree construction
   - Test error handling and edge cases

2. **Widget Tests**: Test component interactions and rendering
   - Use `flutter_test` framework with `testWidgets`
   - Wrap components in `MaterialApp` with proper theme
   - Test user interactions (tap, drag, input)
   - Verify UI state changes and animations

3. **Integration Tests**: Test complete user flows
   - Use `integration_test` package for end-to-end scenarios
   - Test navigation between screens
   - Verify state persistence across app lifecycle
   - Test real FFI integration with Rust core

4. **BLoC Testing**: Test state management logic
   - Use `bloc_test` package for testing Cubits/BLoCs
   - Mock service dependencies with `mocktail`
   - Test state transitions and event handling
   - Verify stream subscriptions and disposal

5. **Service Testing**: Test FFI integration and business logic
   - Mock FFI calls to isolate Dart layer logic
   - Test error handling and exception translation
   - Verify service initialization and disposal
   - Test stream-based real-time updates

### Service Test Template

Based on the existing `SecureStorageService` tests:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:skiffy/rust/api/feature_name.dart';
import 'package:skiffy/rust/frb_generated.dart';
import 'package:skiffy/services/feature_name_service.dart';

// Mock for FFI API
class MockRustLibApi extends Mock implements RustLibApi {}

void main() {
  group('FeatureNameService', () {
    late FeatureNameService service;
    late MockRustLibApi mockApi;

    setUpAll(() {
      mockApi = MockRustLibApi();
      RustLib.initMock(api: mockApi);
    });

    setUp(() {
      service = FeatureNameService.instance..resetForTesting();
    });

    group('initialization', () {
      test('should initialize successfully when FFI call succeeds', () async {
        // Arrange
        when(() => mockApi.crateApiFeatureNameInitialize())
            .thenAnswer((_) async {});

        // Act
        final result = await service.initialize();

        // Assert
        expect(result, isTrue);
        expect(service.isInitialized, isTrue);
        verify(() => mockApi.crateApiFeatureNameInitialize()).called(1);
      });

      test('should handle initialization failure gracefully', () async {
        // Arrange
        when(() => mockApi.crateApiFeatureNameInitialize())
            .thenThrow(Exception('FFI initialization failed'));

        // Act
        final result = await service.initialize();

        // Assert
        expect(result, isFalse);
        expect(service.isInitialized, isFalse);
      });
    });

    group('operations', () {
      setUp(() async {
        // Ensure service is initialized for operation tests
        when(() => mockApi.crateApiFeatureNameInitialize())
            .thenAnswer((_) async {});
        await service.initialize();
      });

      test('should perform operation successfully', () async {
        // Arrange
        const parameter = 'test-parameter';
        final expectedResult = MockRustResult();

        when(() => mockApi.crateApiFeatureNameOperation(parameter: parameter))
            .thenAnswer((_) async => expectedResult);

        // Act
        final result = await service.performOperation(parameter);

        // Assert
        expect(result, isA<DartResultType>());
        verify(() => mockApi.crateApiFeatureNameOperation(parameter: parameter))
            .called(1);
      });

      test('should handle FFI errors correctly', () async {
        // Arrange
        const parameter = 'test-parameter';
        final error = FeatureApiError(
          message: 'Operation failed',
          errorType: 'TestError',
        );

        when(() => mockApi.crateApiFeatureNameOperation(parameter: parameter))
            .thenThrow(error);

        // Act & Assert
        expect(
          () => service.performOperation(parameter),
          throwsA(isA<FeatureServiceException>()),
        );
      });
    });

    group('stream updates', () {
      test('should handle real-time updates correctly', () async {
        // Test stream subscriptions and updates
        // This requires mocking stream-based FFI calls
      });
    });
  });
}
```

### BLoC Test Template

```dart
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:skiffy/features/feature_name/cubit/feature_name_cubit.dart';
import 'package:skiffy/services/feature_name_service.dart';

class MockFeatureNameService extends Mock implements FeatureNameService {}

void main() {
  group('FeatureNameCubit', () {
    late FeatureNameCubit cubit;
    late MockFeatureNameService mockService;

    setUp(() {
      mockService = MockFeatureNameService();
      cubit = FeatureNameCubit(featureNameService: mockService);
    });

    tearDown(() {
      cubit.close();
    });

    test('initial state is correct', () {
      expect(cubit.state, const FeatureNameInitial());
    });

    blocTest<FeatureNameCubit, FeatureNameState>(
      'emits [loading, loaded] when initialization succeeds',
      build: () {
        when(() => mockService.initialize()).thenAnswer((_) async => true);
        when(() => mockService.getData()).thenAnswer((_) async => MockData());
        return cubit;
      },
      act: (cubit) => cubit.initialize(),
      expect: () => [
        const FeatureNameLoading(),
        isA<FeatureNameLoaded>(),
      ],
    );

    blocTest<FeatureNameCubit, FeatureNameState>(
      'emits [loading, error] when initialization fails',
      build: () {
        when(() => mockService.initialize()).thenAnswer((_) async => false);
        return cubit;
      },
      act: (cubit) => cubit.initialize(),
      expect: () => [
        const FeatureNameLoading(),
        const FeatureNameError('Initialization failed'),
      ],
    );
  });
}
```

### Testing Configuration

**Required Dependencies:**

- `flutter_test`: Built-in Flutter testing framework
- `bloc_test`: Testing utilities for BLoC pattern
- `mocktail`: Modern mocking library for Dart
- `integration_test`: End-to-end testing package

**Test Organization:**

- Mirror the `lib/` structure in `test/` directory
- Group related tests using `group()` descriptors
- Use descriptive test names that explain expected behavior
- Include both positive and negative test cases

**Coverage Goals:**

- Aim for 80% code coverage across the Flutter layer
- 100% coverage for critical business logic (authentication, messaging)
- Focus on testing public APIs and user-facing functionality
- Prioritize edge cases and error handling scenarios

**Mocking Strategy:**

- Mock FFI boundaries to isolate Flutter layer testing
- Use dependency injection for services to enable mocking
- Create reusable mock objects and test fixtures
- Avoid mocking internal Flutter framework components

## Environment Configuration

SkiffyMessenger uses flutter_dotenv for environment-specific configuration management, integrating seamlessly with the existing flavor system (development, staging, production) to provide secure and maintainable configuration across different deployment targets.

### Environment Files Structure

Environment variables are managed through flavor-specific .env files that are loaded during the bootstrap process:

```
.env.development      # Development environment configuration
.env.staging         # Staging environment configuration
.env.production      # Production environment configuration
```

### Required Environment Variables

Based on the Flutter framework requirements (Matrix homeserver is configured by user input and stored in app preferences):

**.env.development:**
```bash
# Development environment
FLUTTER_ENV=development
DEBUG_MODE=true

# Development-specific settings
ANALYTICS_ENABLED=false
CRASH_REPORTING_ENABLED=false
ENABLE_DEBUG_LOGGING=true

# Feature flags for development
ENABLE_VOICE_MESSAGES=true
ENABLE_VIDEO_CALLS=true
ENABLE_E2EE_BACKUP=true
```

**.env.staging:**
```bash
# Staging environment
FLUTTER_ENV=staging
DEBUG_MODE=false

# Staging-specific settings
ANALYTICS_ENABLED=true
CRASH_REPORTING_ENABLED=true
ENABLE_DEBUG_LOGGING=false

# Feature flags for staging
ENABLE_VOICE_MESSAGES=true
ENABLE_VIDEO_CALLS=false
ENABLE_E2EE_BACKUP=true
```

**.env.production:**
```bash
# Production environment
FLUTTER_ENV=production
DEBUG_MODE=false

# Production-specific settings
ANALYTICS_ENABLED=true
CRASH_REPORTING_ENABLED=true
ENABLE_DEBUG_LOGGING=false

# Feature flags for production
ENABLE_VOICE_MESSAGES=true
ENABLE_VIDEO_CALLS=false
ENABLE_E2EE_BACKUP=true

# Platform-specific variables (set via CI/CD)
# IOS_PUSH_CERTIFICATE_P12=<base64-encoded-certificate>
# IOS_PUSH_CERTIFICATE_PASSWORD=<certificate-password>
# ANDROID_FCM_SERVER_KEY=<firebase-server-key>
# ANDROID_FCM_SENDER_ID=<firebase-sender-id>
```

### Bootstrap Integration

Environment variables are loaded during the bootstrap process based on the current flavor:

```dart
// Updated bootstrap.dart
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:skiffy/flavors/flavors.dart';

Future<void> bootstrap(FutureOr<Widget> Function() builder) async {
  WidgetsFlutterBinding.ensureInitialized();

  // Load environment variables based on current flavor
  await _loadEnvironmentVariables();

  // Initialize Rust library (existing pattern)
  await RustLib.init();

  // Setup BLoC observer (existing pattern)
  Bloc.observer = AppBlocObserver();

  // Run the app
  runApp(await builder());
}

Future<void> _loadEnvironmentVariables() async {
  final flavor = Flavor.current;
  String envFile;

  switch (flavor) {
    case Flavor.development:
      envFile = '.env.development';
      break;
    case Flavor.staging:
      envFile = '.env.staging';
      break;
    case Flavor.production:
      envFile = '.env.production';
      break;
  }

  try {
    await dotenv.load(fileName: envFile);
  } catch (e) {
    // Log error but don't crash - use defaults
    debugPrint('Failed to load $envFile: $e');
  }
}
```

### Environment Configuration Service

Updated service to use flutter_dotenv instead of dart:io environment variables:

```dart
import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Environment configuration service using flutter_dotenv
class EnvironmentConfig {
  EnvironmentConfig._();

  // Environment getters using DotEnv
  static String get environment => dotenv.env['FLUTTER_ENV'] ?? 'development';
  static bool get isDebug => dotenv.env['DEBUG_MODE'] == 'true';
  static bool get isProduction => environment == 'production';
  static bool get isDevelopment => environment == 'development';
  static bool get isStaging => environment == 'staging';

  // Feature flags
  static bool get enableVoiceMessages => dotenv.env['ENABLE_VOICE_MESSAGES'] == 'true';
  static bool get enableVideoCalls => dotenv.env['ENABLE_VIDEO_CALLS'] == 'true';
  static bool get enableE2EEBackup => dotenv.env['ENABLE_E2EE_BACKUP'] == 'true';

  // Analytics and monitoring
  static bool get analyticsEnabled => dotenv.env['ANALYTICS_ENABLED'] == 'true';
  static bool get crashReportingEnabled => dotenv.env['CRASH_REPORTING_ENABLED'] == 'true';
  static bool get enableDebugLogging => dotenv.env['ENABLE_DEBUG_LOGGING'] == 'true';

  // Platform-specific (loaded from secure environment or CI/CD)
  static String? get iosPushCertificateP12 => dotenv.env['IOS_PUSH_CERTIFICATE_P12'];
  static String? get iosPushCertificatePassword => dotenv.env['IOS_PUSH_CERTIFICATE_PASSWORD'];
  static String? get androidFCMServerKey => dotenv.env['ANDROID_FCM_SERVER_KEY'];
  static String? get androidFCMSenderId => dotenv.env['ANDROID_FCM_SENDER_ID'];

  /// Validation method called during bootstrap
  static void validate() {
    assert(environment.isNotEmpty, 'FLUTTER_ENV must be set');

    if (isProduction) {
      assert(!isDebug, 'DEBUG_MODE should be false in production');
    }
  }
}

// Usage in services - Matrix homeserver now comes from user preferences
class MatrixService {
  MatrixService() {
    _debugMode = EnvironmentConfig.isDebug;
  }

  /// Initialize Matrix with user-configured homeserver
  Future<void> initialize(String homeserverUrl) async {
    await RustBridge.instance.initializeMatrix(
      homeserverUrl: homeserverUrl, // From user input/app preferences
      debugLogging: _debugMode,
    );
  }
}
```

### Assets Configuration

The .env files must be included in the assets configuration in `pubspec.yaml`:

```yaml
flutter:
  assets:
    - .env.development
    - .env.staging
    - .env.production
    # ... other assets
```

### Flavor Integration

The existing flavor system works unchanged with environment variable loading:

```dart
// lib/flavors/main_development.dart (existing pattern)
void main() {
  Flavor.current = Flavor.development;
  bootstrap(() => const App()); // Will load .env.development
}

// lib/flavors/main_staging.dart (existing pattern)
void main() {
  Flavor.current = Flavor.staging;
  bootstrap(() => const App()); // Will load .env.staging
}

// lib/flavors/main_production.dart (existing pattern)
void main() {
  Flavor.current = Flavor.production;
  bootstrap(() => const App()); // Will load .env.production
}
```

### Build Configuration

Building for different environments uses the existing flavor system:

**Development Build:**
```bash
# Uses .env.development automatically
flutter run --flavor development
flutter build apk --flavor development
flutter build ios --flavor development
```

**Staging Build:**
```bash
# Uses .env.staging automatically
flutter run --flavor staging
flutter build apk --flavor staging
flutter build ios --flavor staging
```

**Production Build:**
```bash
# Uses .env.production automatically
flutter run --flavor production
flutter build apk --flavor production --release
flutter build ios --flavor production --release
```

### Security Considerations

**Environment File Management:**

- .env files with sensitive data should NOT be committed to version control
- Use CI/CD pipeline to inject production values during builds
- Development and staging .env files can be committed (with non-sensitive values)
- Use .env.example files to document required variables

**Sensitive Variables:**

- Production secrets should be injected via CI/CD environment variables
- Use platform-specific secure storage for runtime-generated secrets
- Rotate keys and certificates regularly through CI/CD pipeline updates
- Never expose production credentials in development or staging environments

**Environment Validation:**

- Environment validation occurs during bootstrap, providing immediate feedback
- Missing critical variables cause app initialization to fail fast
- Different validation rules apply per environment (stricter for production)
- Meaningful error messages guide developers to correct configuration issues

**Development vs Production:**

- Development uses relaxed security settings and enables debug logging
- Staging mirrors production configuration for realistic testing
- Production enforces strict security, enables monitoring, and uses production certificates
- Feature flags allow gradual rollout and A/B testing across environments
- Matrix homeserver is user-configurable in all environments via app settings

## Frontend Developer Standards

### Critical Coding Rules

Essential rules that prevent common AI mistakes and ensure code quality:

#### Framework-Specific Rules (Flutter/Dart)

1. **Widget Lifecycle Management**
   - Always dispose controllers, streams, and animation controllers in `dispose()`
   - Use `mounted` check before calling `setState()` in async callbacks
   - Prefer `StatelessWidget` over `StatefulWidget` when possible

2. **BLoC/State Management**
   - Never call BLoC methods directly in `build()` method
   - Always provide BLoCs using `BlocProvider` at appropriate widget tree level
   - Use `context.read<Cubit>()` for actions, `context.watch<Cubit>()` for building UI
   - Close all BLoCs in their respective dispose methods

3. **FFI Integration**
   - Never call FFI functions directly from UI widgets
   - Always use service layer for FFI communication
   - Handle all FFI errors and convert to appropriate Dart exceptions
   - Never block UI thread with synchronous FFI calls

4. **Theme and Styling**
   - Always access colors via `Theme.of(context).colorScheme`
   - Use `AppTextStyles` constants instead of inline text styling
   - Never hardcode colors, spacing, or dimensions
   - Always test both light and dark themes

5. **Navigation**
   - Use auto_route generated routes instead of manual Navigator calls
   - Always provide route parameters via route configuration
   - Use context.router instead of Navigator.of(context)
   - Handle navigation errors and invalid routes gracefully

#### Universal Coding Rules

1. **Error Handling**
   - Wrap all async operations in try-catch blocks
   - Provide user-friendly error messages
   - Log errors with sufficient context for debugging
   - Never let exceptions bubble up to UI layer unhandled

2. **Null Safety**
   - Use null-aware operators (`?.`, `??`, `??=`) appropriately
   - Check for null before accessing object properties
   - Prefer nullable types over throwing exceptions for missing data
   - Use late keyword only when absolutely necessary

3. **Performance**
   - Avoid rebuilding expensive widgets unnecessarily
   - Use `const` constructors wherever possible
   - Implement `shouldRepaint` for custom painters
   - Cache computed values that don't change frequently

4. **Testing**
   - Write tests for all public APIs and user-facing functionality
   - Mock external dependencies (services, FFI, network)
   - Test error conditions and edge cases
   - Maintain test coverage above 80% for new code

### Quick Reference

#### Common Commands

```bash
# Development server
flutter run --debug

# Hot reload (in running app)
r (press r key in terminal)

# Hot restart (in running app)
R (press R key in terminal)

# Build for production
flutter build apk --release
flutter build ios --release

# Run tests
flutter test
flutter test --coverage

# Generate code (routes, assets, etc.)
flutter packages pub run build_runner build

# Clean and rebuild
flutter clean && flutter packages get
```

#### Key Import Patterns

```dart
// Framework imports first
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

// Third-party packages
import 'package:auto_route/auto_route.dart';
import 'package:equatable/equatable.dart';

// Local imports (grouped by type)
import 'package:skiffy/app/design_system/design_system.dart';
import 'package:skiffy/services/matrix_service.dart';
import 'package:skiffy/widgets/widgets.dart';

// Relative imports for same-feature files only
import '../cubit/auth_cubit.dart';
import 'login_form.dart';
```

#### File Naming Conventions

```
lib/widgets/app_button.dart          ✓ Good
lib/widgets/AppButton.dart           ✗ Bad (PascalCase)
lib/widgets/app-button.dart          ✗ Bad (kebab-case)

lib/features/chat/view/chat_page.dart     ✓ Good
lib/features/chat/ChatPage.dart           ✗ Bad (wrong location)
lib/features/chat/view/ChatView.dart      ✗ Bad (PascalCase)

test/widgets/app_button_test.dart     ✓ Good (mirrors lib structure)
test/widget_tests/button_test.dart    ✗ Bad (doesn't mirror lib)
```

#### Project-Specific Patterns and Utilities

**Design System Usage:**

```dart
// ✓ Correct way to use colors
color: Theme.of(context).colorScheme.primary

// ✗ Wrong - hardcoded color
color: Colors.blue

// ✓ Correct way to use text styles
style: AppTextStyles.headlineMedium

// ✗ Wrong - inline styling
style: TextStyle(fontSize: 24, fontWeight: FontWeight.w600)

// ✓ Correct theme-aware styling
style: AppTextStyles.withColor(
  AppTextStyles.bodyLarge,
  Theme.of(context).colorScheme.onSurface,
)
```

**BLoC Pattern Usage:**

```dart
// ✓ Correct - reading for actions
onPressed: () => context.read<AuthCubit>().login()

// ✗ Wrong - watching in action callback
onPressed: () => context.watch<AuthCubit>().login()

// ✓ Correct - watching for building UI
BlocBuilder<AuthCubit, AuthState>(
  builder: (context, state) {
    return Text(state.user?.name ?? 'Not logged in');
  },
)
```

**FFI Integration:**

```dart
// ✓ Correct - use service layer
final result = await MatrixService.instance.sendMessage(message);

// ✗ Wrong - direct FFI call from UI
final result = await RustBridge.instance.sendMessage(message);

// ✓ Correct - handle service errors
try {
  final result = await service.performOperation();
  // handle success
} on ServiceException catch (e) {
  // handle service-specific error
} catch (e) {
  // handle unexpected error
}
```

**Navigation Patterns:**

```dart
// ✓ Correct - using auto_route
context.router.push(const ChatRoute(roomId: 'room_123'));

// ✗ Wrong - manual navigation
Navigator.of(context).push(
  MaterialPageRoute(builder: (context) => ChatPage(roomId: 'room_123')),
);

// ✓ Correct - route parameters
@RoutePage()
class ChatPage extends StatelessWidget {
  final String roomId;
  const ChatPage({required this.roomId, super.key});
}
```

**Component Creation Checklist:**

- [ ] Extends appropriate base widget (StatelessWidget/StatefulWidget)
- [ ] Uses design system colors and typography
- [ ] Includes proper documentation comments
- [ ] Implements accessibility features (semantic labels, focus management)
- [ ] Handles loading and error states appropriately
- [ ] Uses dependency injection for services
- [ ] Includes comprehensive test coverage
- [ ] Follows established naming conventions
- [ ] Wraps with AppFocusableBorder for interactive elements

---

**Document Version:** 1.0.0
**Last Updated:** 2025-01-15
**Created by:** Winston (Architect Agent)
