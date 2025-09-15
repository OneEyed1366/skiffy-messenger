import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:skiffy/rust/api/secure_storage.dart';
import 'package:skiffy/rust/frb_generated.dart';
import 'package:skiffy/services/secure_storage_service.dart';

// Mock for the RustLibApi to test the Dart layer without Rust FFI
class MockRustLibApi extends Mock implements RustLibApi {}

void main() {
  group('SecureStorageService', () {
    late SecureStorageService service;
    late MockRustLibApi mockApi;

    setUpAll(() {
      mockApi = MockRustLibApi();
      // Initialize flutter_rust_bridge with our mock only once
      RustLib.initMock(api: mockApi);
    });

    setUp(() {
      service = SecureStorageService.instance
        // Reset the service state for each test
        ..resetForTesting();
    });

    group('initialization', () {
      test('should initialize successfully when FFI call succeeds', () async {
        // Arrange
        when(
          () => mockApi.crateApiSecureStorageInitializeSecureStorage(),
        ).thenAnswer((_) async {});

        // Act
        final result = await service.initialize();

        // Assert
        expect(result, isTrue);
        expect(service.isInitialized, isTrue);
        verify(
          () => mockApi.crateApiSecureStorageInitializeSecureStorage(),
        ).called(1);
      });

      test('should handle initialization failure gracefully', () async {
        // Arrange
        when(
          () => mockApi.crateApiSecureStorageInitializeSecureStorage(),
        ).thenThrow(Exception('FFI initialization failed'));

        // Act & Assert
        expect(await service.initialize(), isFalse);
        expect(service.isInitialized, isFalse);
      });

      test('should track initialization state correctly', () async {
        // Arrange
        when(
          () => mockApi.crateApiSecureStorageInitializeSecureStorage(),
        ).thenAnswer((_) async {});

        // Act & Assert
        expect(service.isInitialized, isFalse);
        await service.initialize();
        expect(service.isInitialized, isTrue);
      });
    });

    group('storage operations', () {
      setUp(() async {
        // Mock successful initialization
        when(
          () => mockApi.crateApiSecureStorageInitializeSecureStorage(),
        ).thenAnswer((_) async {});
        await service.initialize();
      });

      test('should store and retrieve values successfully', () async {
        // Arrange
        const key = 'test_key';
        const value = 'test_value';

        when(
          () => mockApi.crateApiSecureStorageSecureStorageSet(
            key: key,
            value: value,
          ),
        ).thenAnswer((_) async {});

        when(
          () => mockApi.crateApiSecureStorageSecureStorageGet(key: key),
        ).thenAnswer((_) async => value);

        // Act
        await service.set(key, value);
        final retrievedValue = await service.get(key);

        // Assert
        expect(retrievedValue, equals(value));
        verify(
          () => mockApi.crateApiSecureStorageSecureStorageSet(
            key: key,
            value: value,
          ),
        ).called(1);
        verify(
          () => mockApi.crateApiSecureStorageSecureStorageGet(key: key),
        ).called(1);
      });

      test('should handle storage errors gracefully', () async {
        // Arrange
        const key = 'test_key';
        const value = 'test_value';

        when(
          () => mockApi.crateApiSecureStorageSecureStorageSet(
            key: key,
            value: value,
          ),
        ).thenThrow(
          const SecureStorageApiError(
            message: 'Storage failed',
            errorType: 'InternalError',
          ),
        );

        // Act & Assert
        expect(
          () => service.set(key, value),
          throwsA(isA<SecureStorageException>()),
        );
      });

      test('should handle key not found errors', () async {
        // Arrange
        const key = 'nonexistent_key';

        when(
          () => mockApi.crateApiSecureStorageSecureStorageGet(key: key),
        ).thenThrow(
          const SecureStorageApiError(
            message: 'Key not found: $key',
            errorType: 'KeyNotFound',
          ),
        );

        // Act & Assert
        expect(
          () => service.get(key),
          throwsA(isA<SecureStorageException>()),
        );
      });

      test('should delete keys successfully', () async {
        // Arrange
        const key = 'test_key_delete';

        when(
          () => mockApi.crateApiSecureStorageSecureStorageDelete(key: key),
        ).thenAnswer((_) async {});

        // Act
        await service.delete(key);

        // Assert
        verify(
          () => mockApi.crateApiSecureStorageSecureStorageDelete(key: key),
        ).called(1);
      });

      test('should clear all data successfully', () async {
        // Arrange
        when(
          () => mockApi.crateApiSecureStorageSecureStorageClear(),
        ).thenAnswer((_) async {});

        // Act
        await service.clear();

        // Assert
        verify(
          () => mockApi.crateApiSecureStorageSecureStorageClear(),
        ).called(1);
      });

      test('should check if key exists using containsKey', () async {
        // Arrange
        const existingKey = 'existing_key';
        const nonExistentKey = 'nonexistent_key';
        const value = 'test_value';

        when(
          () => mockApi.crateApiSecureStorageSecureStorageGet(
            key: existingKey,
          ),
        ).thenAnswer((_) async => value);

        when(
          () => mockApi.crateApiSecureStorageSecureStorageGet(
            key: nonExistentKey,
          ),
        ).thenThrow(
          const SecureStorageApiError(
            message: 'Key not found: $nonExistentKey',
            errorType: 'KeyNotFound',
          ),
        );

        // Act & Assert
        expect(await service.containsKey(existingKey), isTrue);
        expect(await service.containsKey(nonExistentKey), isFalse);
      });
    });

    group('session status', () {
      setUp(() async {
        // Mock successful initialization
        when(
          () => mockApi.crateApiSecureStorageInitializeSecureStorage(),
        ).thenAnswer((_) async {});
        await service.initialize();
      });

      test('should report persistent session status', () async {
        // Arrange
        when(
          () => mockApi.crateApiSecureStorageSecureStorageSessionStatus(),
        ).thenAnswer((_) async => FfiSessionStatus.persistent);

        // Act
        final status = await service.getSessionStatus();

        // Assert
        expect(status, equals(SessionPersistenceStatus.persistent));
        verify(
          () => mockApi.crateApiSecureStorageSecureStorageSessionStatus(),
        ).called(1);
      });

      test('should report non-persistent session status', () async {
        // Arrange
        when(
          () => mockApi.crateApiSecureStorageSecureStorageSessionStatus(),
        ).thenAnswer((_) async => FfiSessionStatus.nonPersistent);

        // Act
        final status = await service.getSessionStatus();

        // Assert
        expect(status, equals(SessionPersistenceStatus.nonPersistent));
      });

      test('should handle session status errors gracefully', () async {
        // Arrange
        when(
          () => mockApi.crateApiSecureStorageSecureStorageSessionStatus(),
        ).thenThrow(Exception('Session status check failed'));

        // Act & Assert
        expect(
          () => service.getSessionStatus(),
          throwsA(isA<SecureStorageException>()),
        );
      });
    });

    group('error handling', () {
      test(
        'should handle FFI errors and convert to SecureStorageException',
        () async {
          // Arrange
          when(
            () => mockApi.crateApiSecureStorageInitializeSecureStorage(),
          ).thenAnswer((_) async {});
          await service.initialize();

          when(
            () => mockApi.crateApiSecureStorageSecureStorageSet(
              key: any(named: 'key'),
              value: any(named: 'value'),
            ),
          ).thenThrow(
            const SecureStorageApiError(
              message: 'Access denied',
              errorType: 'AccessDenied',
            ),
          );

          // Act & Assert
          await expectLater(
            () => service.set('test_key', 'test_value'),
            throwsA(isA<SecureStorageException>()),
          );
        },
      );
    });

    group('authentication integration', () {
      setUp(() async {
        // Mock successful initialization
        when(
          () => mockApi.crateApiSecureStorageInitializeSecureStorage(),
        ).thenAnswer((_) async {});
        await service.initialize();
      });

      test('should work with authentication flow', () async {
        // Arrange
        const authToken = 'matrix_auth_token_xyz';
        const refreshToken = 'refresh_token_abc';

        // Mock set operations
        when(
          () => mockApi.crateApiSecureStorageSecureStorageSet(
            key: 'auth_token',
            value: authToken,
          ),
        ).thenAnswer((_) async {});

        when(
          () => mockApi.crateApiSecureStorageSecureStorageSet(
            key: 'refresh_token',
            value: refreshToken,
          ),
        ).thenAnswer((_) async {});

        // Mock get operations for retrieving tokens
        when(
          () => mockApi.crateApiSecureStorageSecureStorageGet(
            key: 'auth_token',
          ),
        ).thenAnswer((_) async => authToken);

        when(
          () => mockApi.crateApiSecureStorageSecureStorageGet(
            key: 'refresh_token',
          ),
        ).thenAnswer((_) async => refreshToken);

        // Mock delete operations
        when(
          () => mockApi.crateApiSecureStorageSecureStorageDelete(
            key: 'auth_token',
          ),
        ).thenAnswer((_) async {});

        when(
          () => mockApi.crateApiSecureStorageSecureStorageDelete(
            key: 'refresh_token',
          ),
        ).thenAnswer((_) async {});

        // Act
        // Store authentication tokens
        await service.set('auth_token', authToken);
        await service.set('refresh_token', refreshToken);

        // Verify tokens can be retrieved
        final retrievedAuthToken = await service.get('auth_token');
        final retrievedRefreshToken = await service.get('refresh_token');

        expect(retrievedAuthToken, equals(authToken));
        expect(retrievedRefreshToken, equals(refreshToken));

        // Clear tokens on logout
        await service.delete('auth_token');
        await service.delete('refresh_token');

        // Now mock the containsKey checks (after deletion) to return false
        when(
          () => mockApi.crateApiSecureStorageSecureStorageGet(
            key: 'auth_token',
          ),
        ).thenThrow(
          const SecureStorageApiError(
            message: 'Key not found: auth_token',
            errorType: 'KeyNotFound',
          ),
        );

        when(
          () => mockApi.crateApiSecureStorageSecureStorageGet(
            key: 'refresh_token',
          ),
        ).thenThrow(
          const SecureStorageApiError(
            message: 'Key not found: refresh_token',
            errorType: 'KeyNotFound',
          ),
        );

        // Verify tokens are gone
        expect(await service.containsKey('auth_token'), isFalse);
        expect(await service.containsKey('refresh_token'), isFalse);

        // Assert
        verify(
          () => mockApi.crateApiSecureStorageSecureStorageSet(
            key: 'auth_token',
            value: authToken,
          ),
        ).called(1);
        verify(
          () => mockApi.crateApiSecureStorageSecureStorageSet(
            key: 'refresh_token',
            value: refreshToken,
          ),
        ).called(1);
      });
    });
  });

  group('SecureStorageException', () {
    test('should format exception messages correctly', () {
      const exception = SecureStorageException('Test message', 'TestError');

      expect(exception.message, equals('Test message'));
      expect(exception.errorType, equals('TestError'));
      expect(
        exception.toString(),
        equals('SecureStorageException: Test message (TestError)'),
      );
    });
  });

  group('SessionPersistenceStatus', () {
    test('should have correct enum values', () {
      expect(SessionPersistenceStatus.persistent.name, equals('persistent'));
      expect(
        SessionPersistenceStatus.nonPersistent.name,
        equals('nonPersistent'),
      );
    });
  });
}
