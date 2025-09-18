- # Testing and mocking

In this section, we discuss some of the ways to test an application / library
that uses flutter_rust_bridge.

## Testing Dart code without Rust code

A common practice in testing is to check the layers one by one.
Suppose we want to test the Dart code without the real Rust code.
Then, we can do mocking on the `RustLibApi` abstract class (or other name if you customized the names).
For example, we can use [mockito](https://pub.dev/packages/mockito),
[mocktail](https://pub.dev/packages/mocktail), etc.

`RustLibApi` class is designed with testability and mockability in mind.
It is designed such that all generated functions must eventually call methods in this class.
Or, think of it like a "central dispatcher".
Therefore, as long as you mocked this class, everything related to the Rust side is under your mock.

### Critical: Initialize RustLib Mock in Tests

**IMPORTANT**: When testing BLoCs or any code that calls Rust FFI functions, you MUST initialize the mock RustLib API in `setUpAll()` to avoid runtime errors:

```dart
import 'package:mocktail/mocktail.dart';
import 'package:skiffy/rust/frb_generated.dart';

class MockRustLibApi extends Mock implements RustLibApi {}

void main() {
  late MockRustLibApi mockRustApi;

  setUpAll(() async {
    // CRITICAL: Initialize mock Rust API to avoid FFI linking issues
    mockRustApi = MockRustLibApi();
    RustLib.initMock(api: mockRustApi);
  });

  group('Your Tests', () {
    setUp(() {
      // Setup default mock behaviors
      when(() => mockRustApi.crateApiAuthVerifyHomeserver(
            homeServerUrl: any(named: 'homeServerUrl'),
          )).thenThrow(Exception('Connection failed'));
    });

    // Your tests here...
  });
}
```

**Common Error Without Mock Initialization:**
```
Bad state: flutter_rust_bridge has not been initialized.
Did you forget to call `await RustLib.init();`?
```

### Complete Example with BLoC Testing

```dart
// Surely, you can use Mockito or whatever other mocking packages
class MockRustLibApi extends Mock implements RustLibApi {}

void main() {
  late MockRustLibApi mockApi;

  setUpAll(() async {
    mockApi = MockRustLibApi();
    await RustLib.initMock(api: mockApi);  // Use initMock for testing
  });

  test('can mock Rust calls', () async {
    when(() => mockApi.simpleAdderTwinNormal(a: 1, b: 2))
        .thenAnswer((_) async => 123456789);
    final actualResult = await simpleAdderTwinNormal(a: 1, b: 2);
    expect(actualResult, isNot(3));
    expect(actualResult, equals(123456789));
    verify(() => mockApi.simpleAdderTwinNormal(a: 1, b: 2)).called(1);
  });
}
```

## Testing Rust code without Dart code

Indeed just use standard methods to test the standard Rust code -
there is nothing special about the Rust code in your app.
For example, [the Rust book](https://doc.rust-lang.org/book/ch11-00-testing.html) explains how to do it.

## Testing Dart code and Rust code

Similarly, just use standard Flutter/Dart testing techniques.
If you want examples, have a look at various packages in `frb_example`.
Our CI runs the tests on every commit.

By default, the Rust compilation and Rust library loading should be done
automatically without manual intervention.
In other words, there is no need to manually configure anything in order to make tests run.

# BLoC Testing with blocTest

When testing BLoC state management logic in Flutter applications, use `blocTest` from the `bloc_test` package rather than `testWidgets` with stream expectations. This approach provides better performance and more reliable async testing.

## Performance Issues with testWidgets + expectLater

**❌ Problematic Pattern:**

```dart
testWidgets('Server verification scenarios', (tester) async {
  final bloc = ServerSelectionBloc(localizations: l10n);

  // This pattern can cause timeouts and unreliable tests
  final expectation = expectLater(
    bloc.stream,
    emitsInOrder([
      isA<ServerVerifying>(),
      isA<ServerValid>(),
    ]),
  );

  bloc.add(ServerUrlChanged('https://matrix.org'));
  await expectation; // May timeout waiting for state changes
});
```

**Issues:**

- Tests may timeout (15+ seconds) waiting for state changes that never come
- `expectLater` with `emitsInOrder` can miss initial state transitions
- Difficult to debug when state sequence doesn't match expectations
- Poor performance due to widget testing overhead for pure BLoC logic

## Recommended Solution: blocTest

**✅ Correct Pattern:**

```dart
blocTest<ServerSelectionBloc, ServerSelectionState>(
  'handles valid Matrix server',
  setUp: () {
    // Configure mocks BEFORE bloc creation
    when(() => mockRustApi.crateApiAuthVerifyHomeserver(
      homeServerUrl: 'https://matrix.org',
    )).thenAnswer((_) => Future.value(true));
  },
  build: () => ServerSelectionBloc(localizations: mockL10n),
  act: (bloc) => bloc.add(ServerUrlChanged('https://matrix.org')),
  wait: const Duration(milliseconds: 500), // Wait for async operations
  expect: () => [
    isA<ServerVerifying>(),
    isA<ServerValid>(),
  ],
);
```

**Benefits:**

- **8-10x faster execution** (1-3 seconds vs 15+ second timeouts)
- Built-in support for async operations with `wait` parameter
- Proper lifecycle management (automatic bloc creation/disposal)
- Clear test structure with `setUp`, `build`, `act`, `expect` pattern
- Better error messages when state expectations fail

## Mock Setup for Dependencies

Create comprehensive mocks for dependencies like `AppLocalizations`:

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
```

Initialize mocks in `setUp()`:

```dart
setUp(() {
  mockL10n = MockAppLocalizations();
  // Configure other mocks...
});
```

## Key Guidelines

1. **Use `blocTest` for pure BLoC logic testing** - faster and more reliable
2. **Reserve `testWidgets` for actual widget interaction testing** - UI behavior only
3. **Setup mocks BEFORE bloc creation** in `setUp()` or test-level `setUp`
4. **Use `wait` parameter** for async operations like network calls
5. **Test state transitions, not implementation details** - focus on the state sequence
6. **Create comprehensive mocks** for all dependencies the BLoC uses

This approach resolved critical test performance issues in Story 2.0 homeserver setup, reducing test execution time from 2+ minutes to under 5 seconds.

# Linting and Code Style Fixes

## Why Fix Linting Issues

Linting issues, while often non-blocking for functionality, impact code quality and maintainability:

1. **Consistency**: Uniform code style makes the codebase easier to read and maintain
2. **Future-proofing**: Deprecated APIs (like `withOpacity`) will eventually be removed
3. **Best practices**: Linting rules encode community-agreed best practices
4. **Team velocity**: Clean code with no warnings reduces cognitive load

## How to Fix Common Flutter Linting Issues

### 1. Deprecated API Usage

**Issue**: `'withOpacity' is deprecated and shouldn't be used`

**Fix**: Replace with modern API

```dart
// Before
color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7)

// After
color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.7)
```

**Why**: Flutter is moving to `withValues()` for better precision and consistency with the new color system.

### 2. Catch Clauses Without Type Specification

**Issue**: `Catch clause should use 'on' to specify the type of exception being caught`

**Fix**: Add exception type specification

```dart
// Before
} catch (error) {
  handleError(error);
}

// After
} on Exception catch (error) {
  handleError(error);
}
```

**Why**: Specific exception handling prevents catching system errors unintentionally and makes error handling more predictable.

### 3. Missing End-of-File Newlines

**Issue**: `Missing a newline at the end of the file`

**Fix**: Ensure files end with a newline character

**Why**: POSIX standard requires text files to end with newline; helps with git diffs and concatenation.

### 4. Line Length Violations

**Issue**: `The line length exceeds the 80-character limit`

**Fix**: Break long lines appropriately

```dart
// Before
final veryLongVariableName = someVeryLongMethodCall(withMany, parameters, thatMakeTheLineTooLong);

// After
final veryLongVariableName = someVeryLongMethodCall(
  withMany,
  parameters,
  thatMakeTheLineTooLong,
);
```

**Why**: 80-character limit improves readability on various screen sizes and in side-by-side diffs.

## Systematic Approach to Fixing Linting Issues

1. **Start with automated fixes**: Run `dart fix --apply` first
2. **Fix deprecated APIs**: These are most likely to break in future updates
3. **Address type safety issues**: Like untyped catch clauses
4. **Handle style issues last**: Line length, formatting, etc.

## When to Apply Fixes

- **During QA fixes**: Address linting issues found during quality gates
- **Before PR submission**: Clean code should be the default
- **NOT during feature development**: Focus on functionality first, then clean up

## Bulk Fixing with Edit Tools

When fixing multiple instances of the same issue:

```dart
// Use replace_all parameter for consistent fixes
Edit(
  file_path: "/path/to/file.dart",
  old_string: "withOpacity(0.7)",
  new_string: "withValues(alpha: 0.7)",
  replace_all: true  // Fix all instances at once
)
```

## Verification After Fixes

Always verify after applying fixes:

1. Run `flutter analyze` to confirm issue reduction
2. Run tests to ensure no functionality broken
3. Document the changes in the story file
