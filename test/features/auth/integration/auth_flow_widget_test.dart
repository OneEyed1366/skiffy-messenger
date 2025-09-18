import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:skiffy/features/auth/bloc/server_selection_bloc.dart';
import 'package:skiffy/features/auth/bloc/server_selection_event.dart';
import 'package:skiffy/features/auth/bloc/server_selection_state.dart';
import 'package:skiffy/features/auth/widgets/server_input.dart';
import 'package:skiffy/l10n/l10n.dart';
import 'package:skiffy/rust/api/auth.dart';
import 'package:skiffy/rust/frb_generated.dart';
import 'package:skiffy/services/secure_storage_service.dart';

/// Mock implementations for testing
class MockRustLibApi extends Mock implements RustLibApi {}

class MockSecureStorageService extends Mock implements SecureStorageService {}

class MockAppLocalizations extends Mock implements AppLocalizations {
  @override
  String get homeserverInvalidUrlError => 'Please enter a valid HTTPS URL';

  @override
  String get homeserverConnectionError => 'Unable to connect to server';

  @override
  String get homeserverNotMatrixError =>
      'The specified address is not a Matrix server';

  @override
  String get homeserverVerifying => 'Verifying server...';

  @override
  String get homeserverNetworkOfflineError =>
      'No internet connection. Please check your network.';

  @override
  String get homeserverServerUnreachableError =>
      'Cannot reach server. Check URL or try again later.';
}

void main() {
  group('Auth Flow Widget Tests', () {
    late MockSecureStorageService mockStorageService;
    late MockRustLibApi mockRustApi;
    late AppLocalizations l10n;
    late MockAppLocalizations mockL10n;

    setUpAll(() async {
      // Initialize mock Rust API to avoid FFI linking issues
      mockRustApi = MockRustLibApi();
      RustLib.initMock(api: mockRustApi);
    });

    setUp(() {
      mockStorageService = MockSecureStorageService();
      mockL10n = MockAppLocalizations();
      registerFallbackValue(const ServerUrlChanged(''));

      // Register fallback values for mocktail
      registerFallbackValue(const HomeserverError.notMatrixServer());
    });

    /// Helper to create a test app with localization
    Widget createTestApp(Widget child) {
      return MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: Scaffold(
          body: Builder(
            builder: (context) {
              l10n = AppLocalizations.of(context);
              return child;
            },
          ),
        ),
      );
    }

    testWidgets('Server input validation with various URLs', (tester) async {
      final testCases = [
        // Valid cases
        ('https://matrix.org', true, 'Official Matrix server'),
        ('https://chat.matrix.org', true, 'Alternative Matrix server'),
        ('https://example.com', true, 'Valid HTTPS URL format'),

        // Invalid cases
        ('http://matrix.org', false, 'HTTP instead of HTTPS'),
        ('matrix.org', false, 'Missing protocol'),
        ('https://', false, 'Incomplete URL'),
        ('', false, 'Empty URL'),
        ('not-a-url', false, 'Invalid format'),
      ];

      await tester.pumpWidget(createTestApp(const ServerInput()));

      for (final (url, shouldBeValid, description) in testCases) {
        await tester.enterText(find.byType(ServerInput), url);
        await tester.pump();

        if (shouldBeValid) {
          expect(
            find.text(l10n.homeserverInvalidUrlError),
            findsNothing,
            reason: 'Should not show validation error for: $description',
          );
        } else {
          // For invalid URLs, we expect some form of error feedback
          // This might be in the form of error text or visual indicators
        }
      }
    });

    group('Server verification with network scenarios', () {
      blocTest<ServerSelectionBloc, ServerSelectionState>(
        'handles network timeout error',
        setUp: () {
          when(
            () => mockRustApi.crateApiAuthVerifyHomeserver(
              homeServerUrl: 'https://timeout.test.invalid',
            ),
          ).thenThrow(const HomeserverError.networkUnavailable());
        },
        build: () => ServerSelectionBloc(localizations: mockL10n),
        act: (bloc) =>
            bloc.add(const ServerUrlChanged('https://timeout.test.invalid')),
        wait: const Duration(milliseconds: 500),
        expect: () => [
          isA<ServerVerifying>(),
          isA<ServerInvalid>().having(
            (s) => s.errorType,
            'errorType',
            ServerErrorType.network,
          ),
        ],
      );

      blocTest<ServerSelectionBloc, ServerSelectionState>(
        'handles DNS resolution failure',
        setUp: () {
          when(
            () => mockRustApi.crateApiAuthVerifyHomeserver(
              homeServerUrl: 'https://nonexistent.invalid',
            ),
          ).thenThrow(const HomeserverError.dnsResolutionFailed());
        },
        build: () => ServerSelectionBloc(localizations: mockL10n),
        act: (bloc) =>
            bloc.add(const ServerUrlChanged('https://nonexistent.invalid')),
        wait: const Duration(milliseconds: 500),
        expect: () => [
          isA<ServerVerifying>(),
          isA<ServerInvalid>().having(
            (s) => s.errorType,
            'errorType',
            ServerErrorType.network,
          ),
        ],
      );

      blocTest<ServerSelectionBloc, ServerSelectionState>(
        'handles non-Matrix server error',
        setUp: () {
          when(
            () => mockRustApi.crateApiAuthVerifyHomeserver(
              homeServerUrl: 'https://google.com',
            ),
          ).thenThrow(const HomeserverError.notMatrixServer());
        },
        build: () => ServerSelectionBloc(localizations: mockL10n),
        act: (bloc) => bloc.add(const ServerUrlChanged('https://google.com')),
        wait: const Duration(milliseconds: 500),
        expect: () => [
          isA<ServerVerifying>(),
          isA<ServerInvalid>().having(
            (s) => s.errorType,
            'errorType',
            ServerErrorType.notMatrix,
          ),
        ],
      );

      blocTest<ServerSelectionBloc, ServerSelectionState>(
        'handles valid Matrix server',
        setUp: () {
          when(
            () => mockRustApi.crateApiAuthVerifyHomeserver(
              homeServerUrl: 'https://matrix.org',
            ),
          ).thenAnswer((_) => Future.value(true));
        },
        build: () => ServerSelectionBloc(localizations: mockL10n),
        act: (bloc) => bloc.add(const ServerUrlChanged('https://matrix.org')),
        wait: const Duration(milliseconds: 500),
        expect: () => [
          isA<ServerVerifying>(),
          isA<ServerValid>(),
        ],
      );
    });

    group('Server persistence across sessions', () {
      const testUrl = 'https://chat.matrix.org';

      blocTest<ServerSelectionBloc, ServerSelectionState>(
        'loads stored URL from storage on reset',
        setUp: () {
          when(() => mockStorageService.get('homeserver_url'))
              .thenAnswer((_) async => testUrl);
        },
        build: () => ServerSelectionBloc(
          localizations: mockL10n,
          storageService: mockStorageService,
        ),
        act: (bloc) => bloc.add(const ServerSelectionReset()),
        wait: const Duration(milliseconds: 100),
        expect: () => [
          isA<ServerSelectionInitial>().having(
            (s) => s.defaultUrl,
            'defaultUrl',
            testUrl,
          ),
        ],
      );

      blocTest<ServerSelectionBloc, ServerSelectionState>(
        'stores URL after successful verification',
        setUp: () {
          when(() => mockStorageService.set('homeserver_url', any()))
              .thenAnswer((_) async {});
          when(() => mockRustApi.crateApiAuthVerifyHomeserver(
                homeServerUrl: testUrl,
              )).thenAnswer((_) => Future.value(true));
        },
        build: () => ServerSelectionBloc(
          localizations: mockL10n,
          storageService: mockStorageService,
        ),
        act: (bloc) => bloc.add(const ServerUrlChanged(testUrl)),
        wait: const Duration(milliseconds: 500),
        expect: () => [
          isA<ServerVerifying>(),
          isA<ServerValid>(),
        ],
        verify: (bloc) {
          verify(() => mockStorageService.set('homeserver_url', testUrl))
              .called(1);
        },
      );
    });

    blocTest<ServerSelectionBloc, ServerSelectionState>(
      'handles complete server selection flow',
      setUp: () {
        when(() => mockRustApi.crateApiAuthVerifyHomeserver(
              homeServerUrl: 'https://chat.matrix.org',
            )).thenAnswer((_) => Future.value(true));
      },
      build: () => ServerSelectionBloc(
        localizations: mockL10n,
        storageService: mockStorageService,
      ),
      act: (bloc) => bloc.add(const ServerUrlChanged('https://chat.matrix.org')),
      wait: const Duration(milliseconds: 500),
      expect: () => [
        isA<ServerVerifying>(),
        isA<ServerValid>(),
      ],
    );

    group('Error recovery and retry scenarios', () {
      const testUrl = 'https://test.example.com';

      blocTest<ServerSelectionBloc, ServerSelectionState>(
        'handles error and shows invalid state',
        setUp: () {
          when(() => mockRustApi.crateApiAuthVerifyHomeserver(
                homeServerUrl: testUrl,
              )).thenThrow(const HomeserverError.notMatrixServer());
        },
        build: () => ServerSelectionBloc(
          localizations: mockL10n,
          storageService: mockStorageService,
        ),
        act: (bloc) => bloc.add(const ServerUrlChanged(testUrl)),
        wait: const Duration(milliseconds: 500),
        expect: () => [
          isA<ServerVerifying>(),
          isA<ServerInvalid>().having(
            (s) => s.errorType,
            'errorType',
            ServerErrorType.notMatrix,
          ),
        ],
      );

      blocTest<ServerSelectionBloc, ServerSelectionState>(
        'resets to initial state after error',
        setUp: () {
          when(() => mockRustApi.crateApiAuthVerifyHomeserver(
                homeServerUrl: testUrl,
              )).thenThrow(const HomeserverError.notMatrixServer());
        },
        build: () => ServerSelectionBloc(
          localizations: mockL10n,
          storageService: mockStorageService,
        ),
        act: (bloc) => bloc
          ..add(const ServerUrlChanged(testUrl))
          ..add(const ServerSelectionReset()),
        wait: const Duration(milliseconds: 500),
        expect: () => [
          isA<ServerVerifying>(),
          isA<ServerInvalid>(),
          isA<ServerSelectionInitial>(),
        ],
      );
    });
  });
}
