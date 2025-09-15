import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:skiffy/services/secure_storage_service.dart';

part 'secure_storage_state.dart';

/// Cubit for managing secure storage state and session warnings
///
/// This cubit handles the initialization of secure storage and manages
/// the display state of session persistence warnings.
class SecureStorageCubit extends Cubit<SecureStorageState> {
  SecureStorageCubit({
    SecureStorageService? secureStorageService,
  }) : _secureStorageService =
           secureStorageService ?? SecureStorageService.instance,
       super(const SecureStorageInitial());

  final SecureStorageService _secureStorageService;

  /// Initialize secure storage and check session persistence status
  Future<void> initialize() async {
    emit(const SecureStorageLoading());

    try {
      final initialized = await _secureStorageService.initialize();
      if (!initialized) {
        emit(const SecureStorageError('Failed to initialize secure storage'));
        return;
      }

      await checkSessionPersistence();
    } catch (e) {
      emit(SecureStorageError('Initialization error: $e'));
    }
  }

  /// Check the session persistence status and update state accordingly
  Future<void> checkSessionPersistence() async {
    try {
      final status = await _secureStorageService.getSessionStatus();

      switch (status) {
        case SessionPersistenceStatus.persistent:
          emit(const SecureStoragePersistent());
        case SessionPersistenceStatus.nonPersistent:
          emit(const SecureStorageNonPersistent());
      }
    } catch (e) {
      emit(SecureStorageError('Failed to check session status: $e'));
    }
  }

  /// Dismiss the session warning
  void dismissWarning() {
    if (state is SecureStorageNonPersistent) {
      emit(
        (state as SecureStorageNonPersistent).copyWith(warningDismissed: true),
      );
    }
  }

  /// Show the session warning again (for testing or when conditions change)
  void showWarning() {
    if (state is SecureStorageNonPersistent) {
      emit(
        (state as SecureStorageNonPersistent).copyWith(warningDismissed: false),
      );
    }
  }

  /// Store a value in secure storage
  Future<void> setValue(String key, String value) async {
    try {
      await _secureStorageService.set(key, value);
    } catch (e) {
      emit(SecureStorageError('Failed to store value: $e'));
    }
  }

  /// Retrieve a value from secure storage
  Future<String?> getValue(String key) async {
    try {
      return await _secureStorageService.get(key);
    } catch (e) {
      if (e is SecureStorageException && e.errorType == 'KeyNotFound') {
        return null;
      }
      emit(SecureStorageError('Failed to retrieve value: $e'));
      return null;
    }
  }

  /// Delete a value from secure storage
  Future<void> deleteValue(String key) async {
    try {
      await _secureStorageService.delete(key);
    } catch (e) {
      emit(SecureStorageError('Failed to delete value: $e'));
    }
  }

  /// Clear all values from secure storage
  Future<void> clearAll() async {
    try {
      await _secureStorageService.clear();
    } catch (e) {
      emit(SecureStorageError('Failed to clear storage: $e'));
    }
  }

  /// Check if a key exists in storage
  Future<bool> containsKey(String key) async {
    try {
      return await _secureStorageService.containsKey(key);
    } catch (e) {
      emit(SecureStorageError('Failed to check key existence: $e'));
      return false;
    }
  }
}
