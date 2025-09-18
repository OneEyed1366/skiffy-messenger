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

Please refer to [this file](https://github.com/fzyzcjy/flutter_rust_bridge/blob/master/frb_example/pure_dart/test/mockability_test.dart)
for an example (and it is tested on the CI).
The code may look like:

```dart
// Surely, you can use Mockito or whatever other mocking packages
class MockRustLibApi extends Mock implements RustLibApi {}

Future<void> main() async {
  final mockApi = MockRustLibApi();
  await RustLib.init(api: mockApi);

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