import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:skiffy/rust/api/secure_storage.dart';

/// Service for secure storage operations
///
/// This service wraps the Rust FFI secure storage API and provides
/// a convenient Dart interface for storing and retrieving sensitive data.
class SecureStorageService {
  SecureStorageService._();
  static SecureStorageService? _instance;
  static SecureStorageService get instance =>
      _instance ??= SecureStorageService._();

  bool _initialized = false;

  /// Reset the service state (for testing only)
  /// This allows tests to start with a clean state
  @visibleForTesting
  void resetForTesting() {
    _initialized = false;
  }

  /// Initialize the secure storage service
  ///
  /// This must be called before using any other methods.
  /// Returns true if initialization was successful.
  Future<bool> initialize() async {
    try {
      initializeSecureStorage();
      _initialized = true;
      debugPrint('SecureStorageService: Initialized successfully');
      return true;
    } catch (e) {
      debugPrint('SecureStorageService: Failed to initialize: $e');
      return false;
    }
  }

  /// Check if the service is initialized
  bool get isInitialized => _initialized;

  /// Store a key-value pair securely
  ///
  /// [key] - The key to store the value under
  /// [value] - The sensitive value to store
  ///
  /// Throws [SecureStorageException] if the operation fails.
  Future<void> set(String key, String value) async {
    _ensureInitialized();

    try {
      secureStorageSet(key: key, value: value);
      debugPrint('SecureStorageService: Stored key "$key"');
    } on SecureStorageApiError catch (e) {
      debugPrint('SecureStorageService: Failed to store key "$key": $e');
      throw SecureStorageException('Failed to store key "$key"', e.errorType);
    } catch (e) {
      debugPrint('SecureStorageService: Failed to store key "$key": $e');
      throw SecureStorageException('Failed to store key "$key"', 'UnknownError');
    }
  }

  /// Retrieve a value by key
  ///
  /// [key] - The key to retrieve
  ///
  /// Returns the stored value, or throws [SecureStorageException] if not found.
  Future<String> get(String key) async {
    _ensureInitialized();

    try {
      final value = secureStorageGet(key: key);
      debugPrint('SecureStorageService: Retrieved key "$key"');
      return value;
    } on SecureStorageApiError catch (e) {
      debugPrint('SecureStorageService: Failed to retrieve key "$key": $e');
      throw SecureStorageException(
        'Failed to retrieve key "$key"',
        e.errorType,
      );
    } catch (e) {
      debugPrint('SecureStorageService: Failed to retrieve key "$key": $e');
      throw SecureStorageException(
        'Failed to retrieve key "$key"',
        'UnknownError',
      );
    }
  }

  /// Delete a key-value pair
  ///
  /// [key] - The key to delete
  ///
  /// Throws [SecureStorageException] if the operation fails.
  Future<void> delete(String key) async {
    _ensureInitialized();

    try {
      secureStorageDelete(key: key);
      debugPrint('SecureStorageService: Deleted key "$key"');
    } catch (e) {
      debugPrint('SecureStorageService: Failed to delete key "$key": $e');
      throw SecureStorageException('Failed to delete key "$key"', e.toString());
    }
  }

  /// Clear all stored values
  ///
  /// Throws [SecureStorageException] if the operation fails.
  Future<void> clear() async {
    _ensureInitialized();

    try {
      secureStorageClear();
      debugPrint('SecureStorageService: Cleared all keys');
    } catch (e) {
      debugPrint('SecureStorageService: Failed to clear storage: $e');
      throw SecureStorageException('Failed to clear storage', e.toString());
    }
  }

  /// Get the session persistence status
  ///
  /// Returns [SessionPersistenceStatus] indicating whether data will persist
  /// across app restarts.
  Future<SessionPersistenceStatus> getSessionStatus() async {
    _ensureInitialized();

    try {
      final status = await secureStorageSessionStatus();
      switch (status) {
        case FfiSessionStatus.persistent:
          return SessionPersistenceStatus.persistent;
        case FfiSessionStatus.nonPersistent:
          return SessionPersistenceStatus.nonPersistent;
      }
    } catch (e) {
      debugPrint('SecureStorageService: Failed to get session status: $e');
      throw SecureStorageException(
        'Failed to get session status',
        e.toString(),
      );
    }
  }

  /// Check if a key exists in storage
  ///
  /// [key] - The key to check
  ///
  /// Returns true if the key exists, false otherwise.
  Future<bool> containsKey(String key) async {
    try {
      await get(key);
      return true;
    } on SecureStorageException catch (e) {
      if (e.errorType == 'KeyNotFound') {
        return false;
      }
      rethrow;
    }
  }

  void _ensureInitialized() {
    if (!_initialized) {
      throw const SecureStorageException(
        'SecureStorageService not initialized',
        'Call initialize() first',
      );
    }
  }
}

/// Session persistence status
enum SessionPersistenceStatus {
  /// Data will persist across app restarts
  persistent,

  /// Data is only stored in memory and will be lost on restart
  nonPersistent,
}

/// Exception thrown by secure storage operations
class SecureStorageException implements Exception {
  const SecureStorageException(this.message, this.errorType);
  final String message;
  final String errorType;

  @override
  String toString() => 'SecureStorageException: $message ($errorType)';
}
