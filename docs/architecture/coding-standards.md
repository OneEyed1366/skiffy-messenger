# SkiffyMessenger Coding Standards

## Version Control

- **Date**: 2025-09-15
- **Version**: 1.0
- **Status**: Active
- **Author**: Architecture Team

## Table of Contents

1. [General Principles](#general-principles)
2. [Dart/Flutter Standards](#dartflutter-standards)
3. [Rust Standards](#rust-standards)
4. [FFI Bridge Standards](#ffi-bridge-standards)
5. [Testing Standards](#testing-standards)
6. [Documentation Standards](#documentation-standards)
7. [Performance Standards](#performance-standards)
8. [Security Standards](#security-standards)
9. [Code Review Guidelines](#code-review-guidelines)

## General Principles

### Core Values
1. **Readability over cleverness** - Code is read more often than written
2. **Explicit over implicit** - Clear intent matters
3. **Consistency** - Follow established patterns
4. **Testability** - Design for testing from the start
5. **Performance** - Consider performance implications early
6. **Security** - Security is not optional

### Universal Rules
- No commented-out code in production
- No debug prints in production code
- All TODOs must include a ticket reference
- No magic numbers - use named constants
- Early returns for guard clauses
- Prefer composition over inheritance

## Dart/Flutter Standards

### Code Formatting

#### Mandatory Tools
```bash
# Format all Dart code
flutter format .

# Analyze code
flutter analyze

# Run before every commit
dart fix --apply
```

#### Linter Configuration
```yaml
# analysis_options.yaml
include: package:flutter_lints/flutter.yaml

linter:
  rules:
    # Error rules
    always_use_package_imports: true
    avoid_dynamic_calls: true
    avoid_print: true
    avoid_relative_lib_imports: true

    # Style rules
    prefer_single_quotes: true
    prefer_const_constructors: true
    prefer_final_fields: true
    unnecessary_await_in_return: true

    # Documentation
    public_member_api_docs: true

analyzer:
  errors:
    missing_required_param: error
    missing_return: error
    todo: warning
```

### Naming Conventions

#### Files and Directories
```dart
// ✅ Good
lib/features/auth/screens/login_screen.dart
lib/widgets/app_button.dart

// ❌ Bad
lib/features/Auth/Screens/LoginScreen.dart
lib/widgets/AppButton.dart
```

#### Classes and Types
```dart
// ✅ Good
class AuthenticationService {}
class MessageBubble extends StatelessWidget {}
typedef MessageCallback = void Function(Message);

// ❌ Bad
class authentication_service {}
class messageBubble extends StatelessWidget {}
```

#### Variables and Functions
```dart
// ✅ Good
final userName = 'John';
String formatMessage(String text) => text.trim();
const defaultTimeout = Duration(seconds: 30);

// ❌ Bad
final UserName = 'John';
String FormatMessage(String text) => text.trim();
const DEFAULT_TIMEOUT = Duration(seconds: 30);
```

### Flutter Widget Standards

#### Stateless vs Stateful
```dart
// ✅ Prefer StatelessWidget when possible
class MessageTile extends StatelessWidget {
  final Message message;
  const MessageTile({Key? key, required this.message}) : super(key: key);
}

// Use StatefulWidget only when needed
class AnimatedMessageInput extends StatefulWidget {
  // Only if internal state management is required
}
```

#### Widget Structure
```dart
/// A reusable button component following the app's design system.
class AppButton extends StatelessWidget {
  /// The text displayed on the button.
  final String text;

  /// Callback executed when the button is pressed.
  final VoidCallback? onPressed;

  /// Whether the button should show a loading state.
  final bool isLoading;

  const AppButton({
    Key? key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return FocusableBorder(  // Accessibility wrapper
      child: Material(
        // Implementation
      ),
    );
  }
}
```

#### BLoC Pattern Standards
```dart
// Event classes
abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

class LoginRequested extends AuthEvent {
  final String username;
  final String password;

  const LoginRequested({
    required this.username,
    required this.password,
  });

  @override
  List<Object?> get props => [username, password];
}

// State classes
abstract class AuthState extends Equatable {
  const AuthState();

  @override
  List<Object?> get props => [];
}

class AuthInitial extends AuthState {}
class AuthLoading extends AuthState {}
class AuthSuccess extends AuthState {
  final User user;
  const AuthSuccess(this.user);

  @override
  List<Object?> get props => [user];
}

// BLoC implementation
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthenticationService _authService;

  AuthBloc({
    required AuthenticationService authService,
  }) : _authService = authService,
       super(AuthInitial()) {
    on<LoginRequested>(_onLoginRequested);
  }

  Future<void> _onLoginRequested(
    LoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final user = await _authService.login(
        event.username,
        event.password,
      );
      emit(AuthSuccess(user));
    } catch (e) {
      emit(AuthError(e.toString()));
    }
  }
}
```

### Async Programming

#### Future Handling
```dart
// ✅ Good - explicit error handling
Future<void> sendMessage(String text) async {
  try {
    final message = await _api.sendMessage(text);
    _handleSuccess(message);
  } on NetworkException catch (e) {
    _handleNetworkError(e);
  } catch (e) {
    _handleGenericError(e);
  }
}

// ❌ Bad - no error handling
Future<void> sendMessage(String text) async {
  final message = await _api.sendMessage(text);
  _handleSuccess(message);
}
```

#### Stream Management
```dart
class TimelineBloc extends Bloc<TimelineEvent, TimelineState> {
  StreamSubscription? _messageSubscription;

  @override
  Future<void> close() {
    _messageSubscription?.cancel();  // Always cleanup
    return super.close();
  }
}
```

### Dependency Injection

```dart
// Use provider pattern for DI
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider<AuthenticationService>(
          create: (_) => AuthenticationService(),
        ),
        RepositoryProvider<MatrixClient>(
          create: (_) => MatrixClient(),
        ),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider<AuthBloc>(
            create: (context) => AuthBloc(
              authService: context.read<AuthenticationService>(),
            ),
          ),
        ],
        child: MaterialApp(),
      ),
    );
  }
}
```

## Rust Standards

### Code Formatting

```bash
# Format all Rust code
cargo fmt

# Check formatting
cargo fmt -- --check

# Lint with clippy
cargo clippy -- -D warnings
```

### Clippy Configuration
```toml
# .clippy.toml
cognitive-complexity-threshold = 30
max-fn-params-threshold = 7

# Deny certain lints
[[deny]]
name = "clippy::unwrap_used"
[[deny]]
name = "clippy::expect_used"
[[deny]]
name = "clippy::panic"
```

### Naming Conventions

```rust
// Modules and files: snake_case
mod auth_service;
mod message_handler;

// Types: PascalCase
struct MessageEvent {}
enum AuthState {}
type Result<T> = std::result::Result<T, Error>;

// Functions and variables: snake_case
fn process_message(text: &str) -> String {}
let user_name = "John";

// Constants: SCREAMING_SNAKE_CASE
const MAX_MESSAGE_LENGTH: usize = 1000;
static GLOBAL_CONFIG: Lazy<Config> = Lazy::new(Config::default);
```

### Error Handling

```rust
// ✅ Good - use Result type
use anyhow::{Result, Context};

pub fn send_message(text: &str) -> Result<Message> {
    validate_message(text)
        .context("Failed to validate message")?;

    let encrypted = encrypt_message(text)
        .context("Failed to encrypt message")?;

    matrix_client
        .send(encrypted)
        .await
        .context("Failed to send message to server")
}

// ❌ Bad - using unwrap
pub fn send_message(text: &str) -> Message {
    let encrypted = encrypt_message(text).unwrap();
    matrix_client.send(encrypted).await.unwrap()
}
```

### Async Patterns

```rust
// Use tokio for async runtime
#[tokio::main]
async fn main() -> Result<()> {
    let runtime = tokio::runtime::Builder::new_multi_thread()
        .worker_threads(4)
        .enable_all()
        .build()?;

    runtime.block_on(async {
        start_application().await
    })
}

// Proper async function structure
pub async fn sync_messages() -> Result<Vec<Message>> {
    let messages = matrix_client
        .sync()
        .await
        .context("Sync failed")?;

    // Process in parallel when possible
    let processed: Vec<_> = futures::stream::iter(messages)
        .map(|msg| async move { process_message(msg).await })
        .buffer_unordered(10)
        .collect()
        .await;

    Ok(processed)
}
```

### Memory Management

```rust
// ✅ Good - use references when possible
fn process_text(text: &str) -> String {
    text.trim().to_lowercase()
}

// ✅ Good - use Arc for shared ownership
use std::sync::Arc;
struct SharedState {
    client: Arc<MatrixClient>,
}

// ❌ Bad - unnecessary cloning
fn process_text(text: String) -> String {
    text.trim().to_lowercase()
}
```

### Module Organization

```rust
// api/auth/mod.rs
pub mod login;
pub mod register;
pub mod session;

pub use login::LoginRequest;
pub use register::RegisterRequest;
pub use session::Session;

// Re-export common types
pub use crate::core::models::{User, Credentials};
```

## FFI Bridge Standards

### API Design Principles

```rust
// ✅ Good - simple types, clear ownership
#[flutter_rust_bridge::frb]
pub async fn login(username: String, password: String) -> Result<User> {
    // Implementation
}

// ❌ Bad - complex lifetime management
pub async fn login<'a>(username: &'a str, password: &'a str) -> Result<&'a User> {
    // Avoid complex lifetimes in FFI
}
```

### Data Transfer Objects

```rust
// Define clear DTOs for FFI boundary
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessageDto {
    pub id: String,
    pub content: String,
    pub sender_id: String,
    pub timestamp: i64,
}

// Convert between internal and DTO
impl From<Message> for MessageDto {
    fn from(msg: Message) -> Self {
        MessageDto {
            id: msg.id.to_string(),
            content: msg.content,
            sender_id: msg.sender.id.to_string(),
            timestamp: msg.timestamp.timestamp(),
        }
    }
}
```

### Error Handling Across FFI

```rust
// Define FFI-safe error types
#[derive(Debug, thiserror::Error)]
pub enum ApiError {
    #[error("Network error: {0}")]
    Network(String),

    #[error("Authentication failed")]
    Authentication,

    #[error("Invalid input: {0}")]
    InvalidInput(String),
}

// Convert internal errors to API errors
impl From<matrix_sdk::Error> for ApiError {
    fn from(err: matrix_sdk::Error) -> Self {
        match err {
            // Map specific errors
            _ => ApiError::Network(err.to_string()),
        }
    }
}
```

## Testing Standards

### Test Organization

```dart
// Flutter test structure
void main() {
  group('AuthBloc', () {
    late AuthBloc authBloc;
    late MockAuthService mockAuthService;

    setUp(() {
      mockAuthService = MockAuthService();
      authBloc = AuthBloc(authService: mockAuthService);
    });

    tearDown(() {
      authBloc.close();
    });

    group('LoginRequested', () {
      test('emits [AuthLoading, AuthSuccess] when login succeeds', () {
        // Arrange
        when(() => mockAuthService.login(any(), any()))
            .thenAnswer((_) async => testUser);

        // Act & Assert
        expectLater(
          authBloc.stream,
          emitsInOrder([
            AuthLoading(),
            AuthSuccess(testUser),
          ]),
        );

        authBloc.add(LoginRequested(
          username: 'test',
          password: 'password',
        ));
      });
    });
  });
}
```

### Rust Testing

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_message_encryption() {
        // Arrange
        let message = "Test message";
        let key = generate_key();

        // Act
        let encrypted = encrypt_message(message, &key).await.unwrap();
        let decrypted = decrypt_message(&encrypted, &key).await.unwrap();

        // Assert
        assert_eq!(message, decrypted);
    }

    #[test]
    fn test_validation() {
        assert!(validate_username("john_doe").is_ok());
        assert!(validate_username("a").is_err());
    }
}
```

### Integration Testing

```dart
// integration_test/auth_flow_test.dart
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Complete authentication flow', (tester) async {
    await tester.pumpWidget(MyApp());

    // Navigate to login
    await tester.tap(find.text('Login'));
    await tester.pumpAndSettle();

    // Enter credentials
    await tester.enterText(
      find.byType(TextField).first,
      'test@example.com',
    );
    await tester.enterText(
      find.byType(TextField).last,
      'password123',
    );

    // Submit
    await tester.tap(find.text('Sign In'));
    await tester.pumpAndSettle();

    // Verify navigation
    expect(find.byType(RoomListScreen), findsOneWidget);
  });
}
```

## Documentation Standards

### Code Documentation

#### Dart Documentation
```dart
/// Manages the authentication state of the application.
///
/// This service handles login, logout, and session management.
/// It interfaces with the Rust core through the FFI bridge.
///
/// Example:
/// ```dart
/// final authService = AuthenticationService();
/// await authService.login('user@example.com', 'password');
/// ```
class AuthenticationService {
  /// Authenticates a user with the given [username] and [password].
  ///
  /// Returns a [User] object if successful.
  /// Throws [AuthenticationException] if authentication fails.
  Future<User> login(String username, String password) async {
    // Implementation
  }
}
```

#### Rust Documentation
```rust
/// Handles Matrix protocol authentication.
///
/// This module provides functions for user authentication,
/// session management, and device verification.
///
/// # Examples
///
/// ```
/// use crate::api::auth;
///
/// let user = auth::login("user@example.com", "password").await?;
/// ```
pub mod auth {
    /// Authenticates a user with the Matrix homeserver.
    ///
    /// # Arguments
    ///
    /// * `username` - The Matrix user ID or email
    /// * `password` - The user's password
    ///
    /// # Returns
    ///
    /// Returns `Ok(User)` on success, or an `Err` with details on failure.
    pub async fn login(username: String, password: String) -> Result<User> {
        // Implementation
    }
}
```

### README Standards

Every module should have a README:
```markdown
# Auth Module

## Overview
Handles user authentication and session management.

## Architecture
- Uses BLoC pattern for state management
- Interfaces with Rust core via FFI
- Supports SSO and password authentication

## Usage
```dart
final authBloc = AuthBloc();
authBloc.add(LoginRequested(username, password));
```

## Testing
Run tests with: `flutter test test/features/auth/`
```

## Performance Standards

### Flutter Performance

```dart
// ✅ Good - use const constructors
class MessageList extends StatelessWidget {
  const MessageList({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      // Use builder for large lists
      itemBuilder: (context, index) {
        return const MessageTile();  // Const where possible
      },
    );
  }
}

// ✅ Good - memoize expensive computations
final _processedMessage = memo1((String text) {
  return expensiveTextProcessing(text);
});
```

### Rust Performance

```rust
// ✅ Good - use references to avoid cloning
fn process_messages(messages: &[Message]) -> Vec<ProcessedMessage> {
    messages
        .par_iter()  // Use parallel iteration when appropriate
        .map(|msg| process_single_message(msg))
        .collect()
}

// ✅ Good - use lazy initialization
use once_cell::sync::Lazy;
static REGEX: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"@\w+").unwrap()
});
```

### Performance Monitoring

```dart
// Add performance tracking
class PerformanceMonitor {
  static void trackFrameTime(String operation) {
    Timeline.startSync(operation);
    // Operation code
    Timeline.finishSync();
  }
}
```

## Security Standards

### Input Validation

```dart
// Always validate user input
class InputValidator {
  static bool isValidMatrixId(String id) {
    final regex = RegExp(r'^@[\w.-]+:[\w.-]+$');
    return regex.hasMatch(id);
  }

  static String sanitizeHtml(String input) {
    // Remove potentially dangerous HTML
    return input.replaceAll(RegExp(r'<script.*?</script>'), '');
  }
}
```

### Secure Storage

```dart
// Use platform secure storage
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorage {
  static const _storage = FlutterSecureStorage();

  static Future<void> storeToken(String token) async {
    await _storage.write(key: 'auth_token', value: token);
  }

  static Future<String?> getToken() async {
    return await _storage.read(key: 'auth_token');
  }
}
```

### Rust Security

```rust
// Never log sensitive data
impl Debug for Credentials {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Credentials")
            .field("username", &self.username)
            .field("password", &"[REDACTED]")
            .finish()
    }
}

// Use secure random generation
use rand::Rng;
fn generate_session_id() -> String {
    let mut rng = rand::thread_rng();
    (0..32)
        .map(|_| rng.sample(rand::distributions::Alphanumeric) as char)
        .collect()
}
```

## Code Review Guidelines

### Review Checklist

#### Before Submitting PR
- [ ] Code compiles without warnings
- [ ] All tests pass
- [ ] Code is formatted (`flutter format` / `cargo fmt`)
- [ ] No linter warnings (`flutter analyze` / `cargo clippy`)
- [ ] Documentation is updated
- [ ] Performance impact considered
- [ ] Security implications reviewed

#### Review Focus Areas
1. **Correctness** - Does it work as intended?
2. **Performance** - Are there any bottlenecks?
3. **Security** - Are inputs validated?
4. **Maintainability** - Is it easy to understand?
5. **Testing** - Is it adequately tested?
6. **Documentation** - Is it well documented?

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots]

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
```

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Formatting, missing semicolons, etc.
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **test**: Adding missing tests
- **chore**: Maintenance tasks

#### Examples
```
feat(auth): add SSO login support

Implemented OAuth2 flow for Google and GitHub SSO providers.
Added new login screen with SSO buttons.

Closes #123
```

```
fix(timeline): prevent duplicate messages in offline mode

Messages were being duplicated when syncing after offline period.
Added deduplication logic based on message ID.

Fixes #456
```

## Enforcement

### Automated Checks

All code must pass the following automated checks:

1. **Pre-commit hooks** (via Husky or similar)
   - Format check
   - Lint check
   - Test execution

2. **CI Pipeline**
   - Build verification
   - Full test suite
   - Performance benchmarks
   - Security scan

3. **Code Coverage**
   - Minimum 80% coverage for new code
   - No decrease in overall coverage

### Exceptions

Exceptions to these standards require:
1. Technical justification
2. Team lead approval
3. Documentation of the exception
4. Plan for future compliance

---

*These coding standards ensure consistent, maintainable, and high-quality code across the SkiffyMessenger project. They should be reviewed and updated quarterly based on team feedback and project evolution.*