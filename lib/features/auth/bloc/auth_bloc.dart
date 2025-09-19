import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:skiffy/features/auth/bloc/auth_event.dart';
import 'package:skiffy/features/auth/bloc/auth_state.dart';
import 'package:skiffy/l10n/l10n.dart';
import 'package:skiffy/rust/api/auth.dart' as auth_api;

/// BLoC for managing authentication and capability detection
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  /// Creates an authentication BLoC
  AuthBloc({
    required this.localizations,
  }) : super(const AuthInitial()) {
    on<CheckHomeserverCapabilities>(_onCheckHomeserverCapabilities);
    on<LoginRequested>(_onLoginRequested);
    on<RestoreSession>(_onRestoreSession);
    on<AuthReset>(_onAuthReset);
  }

  final AppLocalizations localizations;

  /// Handles homeserver capability detection events
  Future<void> _onCheckHomeserverCapabilities(
    CheckHomeserverCapabilities event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());

    try {
      // Call Rust function to check homeserver capabilities with timeout
      final capabilities = await auth_api
          .checkHomeserverCapabilities(homeServerUrl: event.homeserverUrl)
          .timeout(
            const Duration(
              seconds: 45,
            ), // UI loading timeout as per story requirements
            onTimeout: () {
              throw TimeoutException(
                'Capability detection timed out',
                const Duration(seconds: 45),
              );
            },
          );

      emit(
        HomeserverCapabilitiesLoaded(
          homeserverUrl: event.homeserverUrl,
          capabilities: capabilities,
        ),
      );
    } on Exception catch (error) {
      // Map error to user-friendly message and error type
      final (errorMessage, errorType) = _mapErrorToUserMessage(error);

      emit(
        AuthError(
          message: errorMessage,
          errorType: errorType,
        ),
      );
    }
  }

  /// Handles login request events
  Future<void> _onLoginRequested(
    LoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    // Get current homeserver URL from the capabilities state
    final currentState = state;
    if (currentState is! HomeserverCapabilitiesLoaded) {
      emit(
        const AuthError(
          message: 'Please select a homeserver first',
          errorType: AuthErrorType.validation,
        ),
      );
      return;
    }

    emit(const AuthLoading());

    try {
      final user = await auth_api.login(
        homeServerUrl: currentState.homeserverUrl,
        username: event.username,
        password: event.password,
      );

      emit(AuthSuccess(user));
    } on Exception catch (error) {
      final (errorMessage, errorType) = _mapErrorToUserMessage(error);
      emit(
        AuthError(
          message: errorMessage,
          errorType: errorType,
        ),
      );
    }
  }

  /// Handles session restoration events
  Future<void> _onRestoreSession(
    RestoreSession event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());

    try {
      final user = await auth_api.restoreSession(
        homeServerUrl: event.homeserverUrl,
      );

      if (user != null) {
        emit(AuthSuccess(user));
      } else {
        // No saved session found, return to initial state
        emit(const AuthInitial());
      }
    } on Exception catch (error) {
      final (errorMessage, errorType) = _mapErrorToUserMessage(error);
      emit(
        AuthError(
          message: errorMessage,
          errorType: errorType,
        ),
      );
    }
  }

  /// Handles authentication reset events
  Future<void> _onAuthReset(
    AuthReset event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthInitial());
  }

  /// Maps Rust errors to user-friendly messages and error types
  (String message, AuthErrorType type) _mapErrorToUserMessage(Object error) {
    final errorString = error.toString().toLowerCase();

    if (error is TimeoutException) {
      return (
        localizations.homeserverCapabilityTimeoutError,
        AuthErrorType.timeout,
      );
    } else if (errorString.contains('timeout') ||
        errorString.contains('connection timeout')) {
      return (
        localizations.homeserverCapabilityTimeoutError,
        AuthErrorType.timeout,
      );
    } else if (errorString.contains('network') ||
        errorString.contains('cannot reach server') ||
        errorString.contains('dns resolution failed')) {
      return (
        localizations.homeserverCapabilityNetworkError,
        AuthErrorType.network,
      );
    } else if (errorString.contains('invalid url') ||
        errorString.contains('https') ||
        errorString.contains('malformed url')) {
      return (
        localizations.homeserverCapabilityInvalidHomeserver,
        AuthErrorType.validation,
      );
    } else if (errorString.contains('server error') ||
        errorString.contains('invalid server response') ||
        errorString.contains('no login flows found')) {
      return (
        localizations.homeserverCapabilityServerUnreachableError,
        AuthErrorType.capabilityDetection,
      );
    } else if (errorString.contains('authentication') ||
        errorString.contains('login') ||
        errorString.contains('credentials') ||
        errorString.contains('invalid credentials')) {
      return (
        localizations.authInvalidCredentialsError,
        AuthErrorType.authentication,
      );
    } else if (errorString.contains('server error')) {
      return (
        localizations.authServerError,
        AuthErrorType.authentication,
      );
    } else {
      return (
        localizations.homeserverCapabilityNetworkError,
        AuthErrorType.unknown,
      );
    }
  }

  /// Gets the current homeserver capabilities if available
  auth_api.HomeserverCapabilities? get currentCapabilities {
    final currentState = state;
    if (currentState is HomeserverCapabilitiesLoaded) {
      return currentState.capabilities;
    }
    return null;
  }

  /// Whether password login is supported by current homeserver
  bool get supportsPasswordLogin {
    return currentCapabilities?.supportsPasswordLogin ?? false;
  }

  /// Whether SSO login is supported by current homeserver
  bool get supportsSSO {
    return currentCapabilities?.supportsSso ?? false;
  }
}
