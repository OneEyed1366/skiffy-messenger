import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:skiffy/app/config/constants.dart';
import 'package:skiffy/features/auth/bloc/server_selection_event.dart';
import 'package:skiffy/features/auth/bloc/server_selection_state.dart';
import 'package:skiffy/features/auth/models/homeserver_config.dart';
import 'package:skiffy/l10n/l10n.dart';
import 'package:skiffy/rust/api/auth.dart' as auth_api;
import 'package:skiffy/services/secure_storage_service.dart';
import 'package:skiffy/utils/validators/homeserver_validator.dart';

/// BLoC for managing homeserver selection and verification
class ServerSelectionBloc
    extends Bloc<ServerSelectionEvent, ServerSelectionState> {
  /// Creates a server selection BLoC
  ServerSelectionBloc({
    required this.localizations,
    SecureStorageService? storageService,
  }) : _storageService = storageService ?? SecureStorageService.instance,
       super(const ServerSelectionInitial()) {
    on<ServerUrlChanged>(_onServerUrlChanged);
    on<ServerVerificationRequested>(_onServerVerificationRequested);
    on<ServerSelectionReset>(_onServerSelectionReset);
  }

  final AppLocalizations localizations;
  final SecureStorageService _storageService;

  /// Key for storing the homeserver URL
  static const String _homeserverUrlKey = 'homeserver_url';

  /// Handles server URL change events
  Future<void> _onServerUrlChanged(
    ServerUrlChanged event,
    Emitter<ServerSelectionState> emit,
  ) async {
    final url = event.url.trim();

    // Basic validation
    final validationError = HomeserverValidator.validate(url, localizations);
    if (validationError != null) {
      emit(
        ServerInvalid(
          url: url,
          errorMessage: validationError,
          errorType: ServerErrorType.validation,
        ),
      );
      return;
    }

    // If validation passes, automatically trigger verification
    add(ServerVerificationRequested(url));
  }

  /// Handles server verification requests
  Future<void> _onServerVerificationRequested(
    ServerVerificationRequested event,
    Emitter<ServerSelectionState> emit,
  ) async {
    final url = event.url.trim();

    // Emit verifying state
    emit(ServerVerifying(url));

    try {
      // Call Rust verification function
      final isValid = await auth_api.verifyHomeserver(homeServerUrl: url);

      if (isValid) {
        final config = HomeserverConfig(url: url, isVerified: true);
        emit(ServerValid(config));

        // Store the verified server URL
        await _storeHomeserverUrl(url);
      } else {
        emit(
          ServerInvalid(
            url: url,
            errorMessage: localizations.homeserverNotMatrixError,
            errorType: ServerErrorType.notMatrix,
          ),
        );
      }
    } catch (error) {
      // Map Rust errors to user-friendly messages
      final (errorMessage, errorType) = _mapErrorToUserMessage(error);

      emit(
        ServerInvalid(
          url: url,
          errorMessage: errorMessage,
          errorType: errorType,
        ),
      );
    }
  }

  /// Handles server selection reset events
  Future<void> _onServerSelectionReset(
    ServerSelectionReset event,
    Emitter<ServerSelectionState> emit,
  ) async {
    // Load stored server URL if available
    final storedUrl = await _getStoredHomeserverUrl();
    emit(
      ServerSelectionInitial(
        defaultUrl: storedUrl ?? AppConstants.defaultHomeserver,
      ),
    );
  }

  /// Maps Rust errors to user-friendly messages and error types
  (String message, ServerErrorType type) _mapErrorToUserMessage(Object error) {
    final errorString = error.toString().toLowerCase();

    if (errorString.contains('timeout') || errorString.contains('connection')) {
      return (
        localizations.homeserverServerUnreachableError,
        ServerErrorType.network,
      );
    } else if (errorString.contains('dns') || errorString.contains('network')) {
      return (
        localizations.homeserverNetworkOfflineError,
        ServerErrorType.network,
      );
    } else if (errorString.contains('not a matrix server') ||
        errorString.contains('notmatrixserver')) {
      return (
        localizations.homeserverNotMatrixError,
        ServerErrorType.notMatrix,
      );
    } else if (errorString.contains('invalid url') ||
        errorString.contains('not https')) {
      return (
        localizations.homeserverInvalidUrlError,
        ServerErrorType.validation,
      );
    } else {
      return (localizations.homeserverConnectionError, ServerErrorType.unknown);
    }
  }

  /// Stores the homeserver URL in secure storage
  Future<void> _storeHomeserverUrl(String url) async {
    try {
      await _storageService.set(_homeserverUrlKey, url);
    } catch (e) {
      // Log error but don't fail the verification process
      // In a production app, you might want to use a logging service here
    }
  }

  /// Retrieves the stored homeserver URL
  Future<String?> _getStoredHomeserverUrl() async {
    try {
      return await _storageService.get(_homeserverUrlKey);
    } catch (e) {
      return null;
    }
  }

  /// Gets the currently selected or verified homeserver URL
  String? get currentHomeserverUrl {
    final currentState = state;
    if (currentState is ServerValid) {
      return currentState.config.url;
    } else if (currentState is ServerVerifying) {
      return currentState.url;
    } else if (currentState is ServerInvalid) {
      return currentState.url;
    } else if (currentState is ServerSelectionInitial) {
      return currentState.defaultUrl;
    }
    return null;
  }

  /// Whether the currently selected server is verified and valid
  bool get isCurrentServerValid {
    final currentState = state;
    return currentState is ServerValid && currentState.config.isVerified;
  }
}
