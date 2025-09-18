import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:skiffy/features/auth/bloc/auth_bloc.dart';
import 'package:skiffy/features/auth/bloc/auth_event.dart';
import 'package:skiffy/features/auth/bloc/auth_state.dart';
import 'package:skiffy/l10n/l10n.dart';
import 'package:skiffy/rust/api/auth.dart' as auth_api;

// Mock classes
class MockAppLocalizations extends Mock implements AppLocalizations {
  @override
  String get homeserverCapabilityTimeoutError =>
      'Connection timeout. Please check your network and try again.';

  @override
  String get homeserverCapabilityNetworkError =>
      'Network error. Please check your connection and try again.';

  @override
  String get homeserverCapabilityInvalidHomeserver =>
      'Cannot determine authentication methods. Please verify your homeserver URL.';

  @override
  String get homeserverCapabilityServerUnreachableError =>
      'Cannot reach homeserver. Please check the URL and your connection.';
}

void main() {
  group('AuthBloc', () {
    late AuthBloc authBloc;
    late MockAppLocalizations mockL10n;

    setUp(() {
      mockL10n = MockAppLocalizations();
      authBloc = AuthBloc(localizations: mockL10n);
    });

    tearDown(() {
      authBloc.close();
    });

    test('initial state is AuthInitial', () {
      expect(authBloc.state, equals(const AuthInitial()));
    });

    group('AuthReset', () {
      blocTest<AuthBloc, AuthState>(
        'emits [AuthInitial] when reset is requested',
        build: () => AuthBloc(localizations: mockL10n),
        seed: () => const AuthError(
          message: 'Some error',
          errorType: AuthErrorType.network,
        ),
        act: (bloc) => bloc.add(const AuthReset()),
        expect: () => [
          isA<AuthInitial>(),
        ],
      );
    });

    group('Getter methods', () {
      test('currentCapabilities returns null when not loaded', () {
        final bloc = AuthBloc(localizations: mockL10n);
        expect(bloc.currentCapabilities, isNull);
        expect(bloc.supportsPasswordLogin, isFalse);
        expect(bloc.supportsSSO, isFalse);
        bloc.close();
      });

      test('supportsPasswordLogin returns correct value when loaded', () {
        final bloc = AuthBloc(localizations: mockL10n);

        const capabilities = auth_api.HomeserverCapabilities(
          supportsPasswordLogin: true,
          supportsSso: false,
          ssoProviders: [],
          supportsRegistration: false,
          supportsGuestAccess: false,
        );

        bloc.emit(
          const HomeserverCapabilitiesLoaded(
            homeserverUrl: 'https://matrix.org',
            capabilities: capabilities,
          ),
        );

        expect(bloc.supportsPasswordLogin, isTrue);
        expect(bloc.supportsSSO, isFalse);
        bloc.close();
      });

      test('supportsSSO returns correct value when loaded', () {
        final bloc = AuthBloc(localizations: mockL10n);

        const capabilities = auth_api.HomeserverCapabilities(
          supportsPasswordLogin: false,
          supportsSso: true,
          ssoProviders: [auth_api.SsoProvider.google],
          supportsRegistration: false,
          supportsGuestAccess: false,
        );

        bloc.emit(
          const HomeserverCapabilitiesLoaded(
            homeserverUrl: 'https://matrix.org',
            capabilities: capabilities,
          ),
        );

        expect(bloc.supportsPasswordLogin, isFalse);
        expect(bloc.supportsSSO, isTrue);
        bloc.close();
      });
    });
  });
}
