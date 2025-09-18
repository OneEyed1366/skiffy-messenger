# Skiffy Testing Strategy Architecture

## Overview

This document defines the comprehensive testing strategy for **Skiffy**, building upon the existing Flutter + Rust architecture with flutter_rust_bridge FFI integration. The strategy emphasizes performance-optimized testing patterns, comprehensive cross-boundary testing, and maintainable test suites that support rapid development while ensuring reliability.

## Testing Philosophy

### Core Principles

1. **Performance-Optimized Testing**: Use `blocTest` instead of `testWidgets` for BLoC logic testing (8-10x faster execution)
2. **Layer Isolation**: Test each architectural layer independently with comprehensive mocking
3. **Cross-Boundary Integration**: Dedicated tests for Flutter ↔ Rust FFI interactions
4. **Async-First Patterns**: Proper async testing with `wait` parameters and timeout handling
5. **Mock-Driven Development**: Comprehensive mock setup in `setUp()` before component creation

### Current Strengths (From Codebase Analysis)

✅ **Excellent BLoC Testing Foundation**

- `bloc_test` package for performance-optimized state testing
- Comprehensive mock setup for `AppLocalizations` and services
- Proper async operation handling with `wait` parameters

✅ **Robust Rust Testing Infrastructure**

- `tokio::test` for async unit testing
- `serial_test` for tests requiring serialization
- Integration tests with `#[ignore]` for manual execution
- In-memory storage testing with proper cleanup

✅ **Cross-Platform Testing Support**

- iOS, Android, macOS, Windows, Linux test configurations
- Platform-specific secure storage testing
- Matrix protocol integration testing

## Testing Architecture

### Testing Pyramid Structure

```text
                    E2E Tests (Cypress/Integration Test)
                   /                                    \
              Flutter Integration                    Rust Integration
             /                                    \                    \
    Flutter Unit Tests                    FFI Bridge Tests      Rust Unit Tests
   (BLoC, Widgets, Services)            (Cross-boundary)       (Matrix, Storage)
```

### Test Distribution Strategy

- **70% Unit Tests**: Fast, focused tests for individual components
- **20% Integration Tests**: Cross-component and cross-boundary testing
- **10% E2E Tests**: Full application flow testing

## Frontend Testing Strategy (Flutter/Dart)

### BLoC Testing (Performance Optimized)

**Pattern**: Use `bloc_test` for all BLoC logic testing instead of `testWidgets`

```dart
// ✅ CORRECT: Performance-optimized BLoC testing
blocTest<ServerSelectionBloc, ServerSelectionState>(
  'handles Matrix server verification with network timeout',
  setUp: () {
    // CRITICAL: Configure mocks BEFORE bloc creation
    when(() => mockRustApi.crateApiAuthVerifyHomeserver(
      homeServerUrl: 'https://slow-server.org',
    )).thenAnswer((_) => Future.delayed(
      Duration(seconds: 10),
      () => throw TimeoutException('Server timeout'),
    ));
  },
  build: () => ServerSelectionBloc(
    localizations: mockL10n,
    storageService: mockStorageService,
  ),
  act: (bloc) => bloc.add(ServerUrlChanged('https://slow-server.org')),
  wait: const Duration(seconds: 2), // Wait for async operations
  expect: () => [
    isA<ServerVerifying>(),
    isA<ServerInvalid>().having(
      (state) => state.errorType,
      'errorType',
      ServerErrorType.network,
    ),
  ],
  verify: (_) {
    verify(() => mockRustApi.crateApiAuthVerifyHomeserver(
      homeServerUrl: 'https://slow-server.org',
    )).called(1);
  },
);

// ❌ INCORRECT: Slow testWidgets pattern
testWidgets('server verification - AVOID THIS PATTERN', (tester) async {
  // This pattern can timeout and is 8-10x slower
  final expectation = expectLater(
    bloc.stream,
    emitsInOrder([isA<ServerVerifying>(), isA<ServerValid>()]),
  );
  // ... rest of test
});
```

### Mock Setup Strategy

**Create comprehensive mocks for all dependencies:**

```dart
class MockAppLocalizations extends Mock implements AppLocalizations {
  @override
  String get homeserverInvalidUrlError => 'Please enter a valid HTTPS URL';

  @override
  String get homeserverNotMatrixError => 'Not a Matrix server';

  @override
  String get homeserverNetworkOfflineError => 'No internet connection';

  @override
  String get homeserverServerUnreachableError => 'Cannot reach server';
}

class MockSecureStorageService extends Mock implements SecureStorageService {}

class MockRustApi extends Mock implements RustLib {}

// CRITICAL: Setup in setUp() for consistent test state
setUp(() {
  mockL10n = MockAppLocalizations();
  mockStorageService = MockSecureStorageService();
  mockRustApi = MockRustApi();

  // Configure default behaviors
  when(() => mockStorageService.get(any()))
      .thenThrow(Exception('Key not found'));
  when(() => mockStorageService.set(any(), any()))
      .thenAnswer((_) async {});
});
```

### Widget Testing Strategy

**Use `testWidgets` only for actual widget interaction testing:**

```dart
testWidgets('ServerSelectionPage displays error messages correctly', (tester) async {
  await tester.pumpWidget(
    MaterialApp(
      home: BlocProvider.value(
        value: ServerSelectionBloc(localizations: mockL10n)
          ..add(ServerUrlChanged('invalid-url')),
        child: ServerSelectionPage(),
      ),
    ),
  );

  await tester.pump(); // Let the bloc process the event

  expect(find.text('Please enter a valid HTTPS URL'), findsOneWidget);
  expect(find.byIcon(Icons.error), findsOneWidget);
});
```

### Integration Testing (Flutter)

**Test feature flows across multiple components:**

```dart
testWidgets('Complete authentication flow integration', (tester) async {
  // Mock successful Rust API responses
  when(() => mockRustApi.crateApiAuthVerifyHomeserver(any()))
      .thenAnswer((_) => Future.value(true));
  when(() => mockRustApi.crateApiAuthLogin(any(), any()))
      .thenAnswer((_) => Future.value(mockSession));

  await tester.pumpWidget(MyApp());

  // Server selection
  await tester.enterText(find.byKey(Key('homeserver_input')), 'https://matrix.org');
  await tester.pump(Duration(seconds: 1)); // Wait for verification

  expect(find.byIcon(Icons.check), findsOneWidget);

  // Proceed to login
  await tester.tap(find.byKey(Key('continue_button')));
  await tester.pumpAndSettle();

  // Login form
  await tester.enterText(find.byKey(Key('username_input')), 'test_user');
  await tester.enterText(find.byKey(Key('password_input')), 'test_password');
  await tester.tap(find.byKey(Key('login_button')));

  await tester.pumpAndSettle();

  // Verify successful navigation
  expect(find.byType(MainAppPage), findsOneWidget);
});
```

## Backend Testing Strategy (Rust)

### Unit Testing Patterns

**Async testing with proper cleanup:**

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Arc;
    use crate::core::storage::{InMemoryStorage, SecureStorage};

    #[tokio::test]
    async fn test_matrix_client_initialization() -> Result<()> {
        let homeserver_url = "https://matrix.org";
        let client = MatrixClient::new(homeserver_url, None).await?;

        assert!(!client.is_logged_in());
        assert_eq!(client.homeserver_url(), homeserver_url);
        Ok(())
    }

    #[tokio::test]
    async fn test_login_with_invalid_credentials() -> Result<()> {
        let homeserver_url = "https://matrix.org";
        let mut client = MatrixClient::new(homeserver_url, None).await?;
        let storage: Arc<dyn SecureStorage> = Arc::new(InMemoryStorage::new());

        let result = client.login("invalid_user", "invalid_pass", &*storage).await;

        assert!(result.is_err());
        assert!(!client.is_logged_in());

        // Verify no tokens were stored on failed login
        assert!(storage.get(AuthKeys::ACCESS_TOKEN).await.is_err());
        Ok(())
    }

    #[tokio::test]
    async fn test_session_restoration_with_partial_data() -> Result<()> {
        let homeserver_url = "https://matrix.org";
        let mut client = MatrixClient::new(homeserver_url, None).await?;
        let storage: Arc<dyn SecureStorage> = Arc::new(InMemoryStorage::new());

        // Store incomplete session data (missing user_id)
        storage.set(AuthKeys::ACCESS_TOKEN, "test_token").await.unwrap();
        storage.set(AuthKeys::DEVICE_ID, "TEST_DEVICE").await.unwrap();
        // Deliberately omit user_id

        let result = client.restore_session(&*storage).await;

        // Should fail gracefully when required data is missing
        assert!(result.is_err());
        assert!(!client.is_logged_in());
        Ok(())
    }
}
```

### Integration Testing (Rust)

**Matrix server integration with environment-based testing:**

```rust
#[cfg(test)]
mod integration_tests {
    use super::*;
    use std::env;
    use serial_test::serial;

    #[tokio::test]
    #[ignore] // Requires actual credentials - run manually with: cargo test -- --ignored
    #[serial] // Prevent parallel execution
    async fn test_real_matrix_login() -> Result<()> {
        let homeserver_url = env::var("TEST_MATRIX_HOMESERVER")
            .unwrap_or_else(|_| "https://matrix.org".to_string());
        let username = env::var("TEST_MATRIX_USERNAME").expect("TEST_MATRIX_USERNAME required");
        let password = env::var("TEST_MATRIX_PASSWORD").expect("TEST_MATRIX_PASSWORD required");

        let mut client = MatrixClient::new(&homeserver_url, None).await?;
        let storage: Arc<dyn SecureStorage> = Arc::new(InMemoryStorage::new());

        // Test actual login
        client.login(&username, &password, &*storage).await?;

        assert!(client.is_logged_in());

        // Test session persistence
        assert!(storage.get(AuthKeys::ACCESS_TOKEN).await.is_ok());
        assert!(storage.get(AuthKeys::USER_ID).await.is_ok());

        // Test logout cleanup
        client.logout(&*storage).await?;
        assert!(!client.is_logged_in());
        assert!(storage.get(AuthKeys::ACCESS_TOKEN).await.is_err());

        Ok(())
    }

    #[tokio::test]
    async fn test_homeserver_verification() -> Result<()> {
        let test_cases = vec![
            ("https://matrix.org", true),
            ("https://chat.mozilla.org", true),
            ("https://google.com", false),
            ("http://insecure.com", false),
            ("not-a-url", false),
        ];

        for (url, expected) in test_cases {
            let result = verify_homeserver(url).await;
            match expected {
                true => assert!(result.is_ok(), "Expected {} to be valid", url),
                false => assert!(result.is_err(), "Expected {} to be invalid", url),
            }
        }
        Ok(())
    }
}
```

### Storage Testing Strategy

**Cross-platform storage testing:**

```rust
#[cfg(test)]
mod storage_tests {
    use super::*;
    use crate::core::storage::*;

    async fn test_storage_implementation<T: SecureStorage>(storage: T) {
        // Test basic operations
        storage.set("test_key", "test_value").await.unwrap();

        let retrieved = storage.get("test_key").await.unwrap();
        assert_eq!(retrieved, "test_value");

        // Test deletion
        storage.delete("test_key").await.unwrap();
        assert!(storage.get("test_key").await.is_err());

        // Test clear all
        storage.set("key1", "value1").await.unwrap();
        storage.set("key2", "value2").await.unwrap();
        storage.clear().await.unwrap();

        assert!(storage.get("key1").await.is_err());
        assert!(storage.get("key2").await.is_err());
    }

    #[tokio::test]
    async fn test_in_memory_storage() {
        let storage = InMemoryStorage::new();
        test_storage_implementation(storage).await;
    }

    #[cfg(target_os = "macos")]
    #[tokio::test]
    async fn test_keychain_storage() {
        let storage = KeychainStorage::new();
        test_storage_implementation(storage).await;
    }
}
```

## Cross-Boundary Testing (FFI)

### FFI Integration Testing

**Test Flutter ↔ Rust communication:**

```dart
// Flutter side
void main() {
  group('FFI Bridge Integration Tests', () {
    late RustLib rustLib;

    setUpAll(() async {
      rustLib = await RustLib.init();
    });

    test('verify homeserver through FFI', () async {
      final result = await rustLib.crateApiAuthVerifyHomeserver(
        homeServerUrl: 'https://matrix.org',
      );
      expect(result, isTrue);
    });

    test('login flow through FFI', () async {
      // This would typically use a test server
      try {
        await rustLib.crateApiAuthLogin(
          username: 'test_user',
          password: 'test_password',
        );
        fail('Should throw with invalid credentials');
      } catch (e) {
        expect(e, isA<Exception>());
      }
    });

    test('error propagation across FFI boundary', () async {
      try {
        await rustLib.crateApiAuthVerifyHomeserver(
          homeServerUrl: 'invalid-url-format',
        );
        fail('Should throw with invalid URL');
      } catch (e) {
        expect(e.toString(), contains('Invalid URL format'));
      }
    });
  });
}
```

```rust
// Rust side FFI testing
#[cfg(test)]
mod ffi_tests {
    use super::*;
    use crate::ffi::*;

    #[tokio::test]
    async fn test_ffi_error_handling() {
        let result = crate_api_auth_verify_homeserver("invalid-url".to_string()).await;
        assert!(result.is_err());

        // Ensure error messages are user-friendly
        let error_msg = format!("{}", result.unwrap_err());
        assert!(!error_msg.contains("internal error")); // No technical jargon
    }

    #[tokio::test]
    async fn test_ffi_data_serialization() {
        // Test that complex data structures serialize properly across FFI
        let session_data = SessionData {
            user_id: "@test:matrix.org".to_string(),
            access_token: "test_token".to_string(),
            device_id: "TEST_DEVICE".to_string(),
        };

        // Serialize to bytes (as FFI would)
        let serialized = serde_json::to_vec(&session_data).unwrap();
        let deserialized: SessionData = serde_json::from_slice(&serialized).unwrap();

        assert_eq!(session_data.user_id, deserialized.user_id);
        assert_eq!(session_data.access_token, deserialized.access_token);
    }
}
```

## E2E Testing Strategy

### Integration Test Framework

**Use Flutter's integration_test package:**

```dart
// integration_test/complete_auth_flow_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:skiffy/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Complete Authentication Flow E2E', () {
    testWidgets('Full authentication flow with real Matrix server', (tester) async {
      // Start the app
      app.main();
      await tester.pumpAndSettle();

      // Verify initial state
      expect(find.byType(ServerSelectionPage), findsOneWidget);

      // Enter homeserver URL
      await tester.enterText(
        find.byKey(const Key('homeserver_input')),
        'https://matrix.org',
      );

      // Wait for server verification
      await tester.pump(const Duration(seconds: 3));

      // Check for success indicator
      expect(find.byIcon(Icons.check_circle), findsOneWidget);

      // Proceed to login
      await tester.tap(find.byKey(const Key('continue_button')));
      await tester.pumpAndSettle();

      // Verify navigation to login screen
      expect(find.byType(LoginPage), findsOneWidget);

      // Enter test credentials (would use test account)
      await tester.enterText(
        find.byKey(const Key('username_input')),
        'skiffy_test_user',
      );
      await tester.enterText(
        find.byKey(const Key('password_input')),
        'skiffy_test_password',
      );

      // Submit login
      await tester.tap(find.byKey(const Key('login_button')));

      // Wait for login processing
      await tester.pump(const Duration(seconds: 5));

      // Verify successful navigation to main app
      expect(find.byType(MainAppPage), findsOneWidget);

      // Verify user info is displayed
      expect(find.text('@skiffy_test_user:matrix.org'), findsOneWidget);

      // Test logout
      await tester.tap(find.byIcon(Icons.logout));
      await tester.pumpAndSettle();

      // Verify return to login screen
      expect(find.byType(ServerSelectionPage), findsOneWidget);
    });

    testWidgets('Offline behavior handling', (tester) async {
      // Simulate offline conditions and verify graceful degradation
      app.main();
      await tester.pumpAndSettle();

      // Disconnect network (would need network simulation)
      // ... test offline behaviors
    });
  });
}
```

### Performance E2E Testing

```dart
// integration_test/performance_test.dart
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Performance E2E Tests', () {
    testWidgets('Message list scrolling performance', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Navigate to a room with many messages
      // ... authentication and navigation code

      // Test scrolling performance
      final timeline = find.byType(MessageTimeline);
      expect(timeline, findsOneWidget);

      // Measure frame rate during scrolling
      final stopwatch = Stopwatch()..start();
      int frameCount = 0;

      // Perform rapid scrolling
      for (int i = 0; i < 50; i++) {
        await tester.fling(timeline, Offset(0, -300), 1000);
        await tester.pump();
        frameCount++;
      }

      stopwatch.stop();
      final fps = frameCount / (stopwatch.elapsedMilliseconds / 1000);

      // Assert 60 FPS target (with some tolerance)
      expect(fps, greaterThan(55.0), reason: 'Scrolling should maintain ~60 FPS');
    });

    testWidgets('Memory usage during extended use', (tester) async {
      // Test for memory leaks during typical usage patterns
      // This would require additional tooling for memory monitoring
    });
  });
}
```

## Test Organization & Structure

### Flutter Test Structure

```
test/
├── unit/                                    # Pure unit tests
│   ├── bloc/
│   │   ├── server_selection_bloc_test.dart
│   │   └── auth_bloc_test.dart
│   ├── services/
│   │   ├── secure_storage_service_test.dart
│   │   └── navigation_service_test.dart
│   └── utils/
│       └── validators_test.dart
├── widget/                                  # Widget interaction tests
│   ├── pages/
│   │   ├── server_selection_page_test.dart
│   │   └── login_page_test.dart
│   └── components/
│       ├── app_button_test.dart
│       └── app_text_field_test.dart
├── integration/                             # Feature integration tests
│   ├── auth_flow_integration_test.dart
│   └── navigation_integration_test.dart
└── mocks/                                   # Shared mock objects
    ├── mock_localizations.dart
    ├── mock_storage_service.dart
    └── mock_rust_api.dart
```

### Rust Test Structure

```
rust/src/
├── core/
│   ├── matrix_client/
│   │   ├── unit_tests.rs              # Matrix client unit tests
│   │   ├── integration_tests.rs       # Matrix server integration
│   │   └── mock_tests.rs               # Tests with mocked dependencies
│   ├── storage/
│   │   ├── tests.rs                   # Storage implementation tests
│   │   └── platform_tests.rs          # Platform-specific tests
│   └── auth/
│       ├── session_tests.rs
│       └── sso_tests.rs
├── ffi/
│   └── bridge_tests.rs                 # FFI boundary tests
└── test_utils/                         # Shared test utilities
    ├── mock_matrix_server.rs
    ├── test_storage.rs
    └── fixtures.rs
```

### E2E Test Structure

```
integration_test/
├── flows/                              # Complete user flows
│   ├── auth_flow_test.dart
│   ├── messaging_flow_test.dart
│   └── settings_flow_test.dart
├── performance/                        # Performance validation
│   ├── scrolling_performance_test.dart
│   ├── memory_usage_test.dart
│   └── startup_time_test.dart
├── edge_cases/                         # Edge case scenarios
│   ├── network_connectivity_test.dart
│   ├── low_memory_test.dart
│   └── background_behavior_test.dart
└── helpers/                           # Test helper functions
    ├── test_server_setup.dart
    └── performance_monitoring.dart
```

## Test Execution Strategy

### Local Development

```bash
# Run all Flutter unit tests (fast feedback)
flutter test

# Run specific test files
flutter test test/unit/bloc/server_selection_bloc_test.dart

# Run Rust unit tests
cd rust && cargo test

# Run Rust integration tests (requires setup)
cd rust && cargo test -- --ignored

# Run Flutter integration tests
flutter test integration_test/

# Performance testing
flutter drive --target=test_driver/perf_test.dart
```

### CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  flutter-unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
      - run: flutter pub get
      - run: flutter test --coverage
      - uses: codecov/codecov-action@v1

  rust-unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions-rs/toolchain@v1
      - run: cd rust && cargo test
      - run: cd rust && cargo test --release

  integration-tests:
    runs-on: ubuntu-latest
    needs: [flutter-unit-tests, rust-unit-tests]
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
      - run: flutter test integration_test/

  performance-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
      - run: flutter drive --target=test_driver/perf_test.dart --profile
```

### Test Coverage Strategy

**Coverage Targets:**

- **Unit Tests**: 90%+ coverage for business logic
- **Integration Tests**: 80%+ coverage for user journeys
- **E2E Tests**: 70%+ coverage for critical flows

**Coverage Exclusions:**

- Generated FFI code
- Platform-specific conditional compilation
- Test utilities and mocks
- Debug-only code paths

```bash
# Generate coverage reports
flutter test --coverage
cd rust && cargo tarpaulin --out Html

# Combine coverage reports
lcov --add-tracefile coverage/lcov.info --add-tracefile rust/tarpaulin-report.info
```

## Quality Assurance & Best Practices

### Test Quality Checklist

**Every test should:**

- [ ] Have a clear, descriptive name
- [ ] Test one specific behavior
- [ ] Be deterministic (no flaky tests)
- [ ] Run quickly (< 1 second for unit tests)
- [ ] Clean up after itself
- [ ] Use appropriate mocking level

**BLoC tests should:**

- [ ] Use `bloc_test` instead of `testWidgets`
- [ ] Configure mocks in `setUp()` before bloc creation
- [ ] Use `wait` parameter for async operations
- [ ] Test state transitions, not implementation details
- [ ] Verify side effects (storage calls, API calls)

**FFI tests should:**

- [ ] Test error propagation across boundaries
- [ ] Verify data serialization/deserialization
- [ ] Handle timeouts and network failures
- [ ] Test with realistic data sizes

### Common Anti-Patterns to Avoid

❌ **Testing Implementation Details:**

```dart
// BAD: Testing private method behavior
test('_validateUrl returns false for invalid URL', () {
  expect(bloc._validateUrl('invalid'), isFalse);
});

// GOOD: Testing public behavior
blocTest<ServerSelectionBloc, ServerSelectionState>(
  'emits invalid state when URL is malformed',
  act: (bloc) => bloc.add(ServerUrlChanged('invalid')),
  expect: () => [isA<ServerInvalid>()],
);
```

❌ **Overly Complex Setup:**

```dart
// BAD: Complex setup in individual tests
test('complex test', () async {
  final mockA = MockA();
  final mockB = MockB();
  // ... 20 lines of setup
});

// GOOD: Setup in setUp() or test utilities
setUp(() {
  setupMockDefaults();
});
```

❌ **Flaky Async Tests:**

```dart
// BAD: Racing conditions
test('async operation', () async {
  bloc.add(SomeEvent());
  await Future.delayed(Duration(milliseconds: 100)); // Arbitrary delay
  expect(bloc.state, isA<SomeState>());
});

// GOOD: Proper async waiting
blocTest<MyBloc, MyState>(
  'handles async operation',
  act: (bloc) => bloc.add(SomeEvent()),
  wait: const Duration(milliseconds: 500),
  expect: () => [isA<SomeState>()],
);
```

## Performance Monitoring in Tests

### Test Performance Benchmarks

**Target Performance:**

- Unit tests: < 100ms each
- Widget tests: < 500ms each
- Integration tests: < 5 seconds each
- E2E tests: < 30 seconds each

### Continuous Performance Monitoring

```dart
// performance_test_helper.dart
class PerformanceMonitor {
  static Future<T> measurePerformance<T>(
    String testName,
    Future<T> Function() test, {
    Duration? maxDuration,
  }) async {
    final stopwatch = Stopwatch()..start();
    final result = await test();
    stopwatch.stop();

    print('$testName took ${stopwatch.elapsedMilliseconds}ms');

    if (maxDuration != null && stopwatch.elapsed > maxDuration) {
      fail('$testName exceeded max duration of ${maxDuration.inMilliseconds}ms');
    }

    return result;
  }
}

// Usage in tests
test('server verification performance', () async {
  await PerformanceMonitor.measurePerformance(
    'Server verification',
    () => verifyHomeserver('https://matrix.org'),
    maxDuration: Duration(seconds: 2),
  );
});
```

## Conclusion

This testing strategy provides a comprehensive, performance-optimized approach to testing Skiffy's Flutter + Rust architecture. By following these patterns:

1. **8-10x faster** BLoC testing with `bloc_test`
2. **Comprehensive cross-boundary testing** for FFI integration
3. **Proper async patterns** with timeout handling
4. **Maintainable test organization** with clear separation of concerns
5. **Performance monitoring** built into the test suite

The strategy supports rapid development while maintaining high quality standards and providing confidence in the application's reliability across all platforms.

Key takeaways:

- Always use `bloc_test` for BLoC logic testing
- Set up mocks in `setUp()` before component creation
- Use appropriate wait times for async operations
- Test behavior, not implementation
- Maintain clear test organization and documentation

This approach will scale with the project as new features are added and ensure that testing remains a productivity multiplier rather than a bottleneck.
