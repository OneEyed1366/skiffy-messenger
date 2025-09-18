import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:skiffy/l10n/l10n.dart';
import 'package:skiffy/utils/validators/homeserver_validator.dart';

class MockAppLocalizations extends Mock implements AppLocalizations {}

void main() {
  group('HomeserverValidator', () {
    late MockAppLocalizations mockL10n;

    setUp(() {
      mockL10n = MockAppLocalizations();

      // Setup common mock returns
      when(() => mockL10n.homeserverUrlRequired)
          .thenReturn('Homeserver URL is required');
      when(() => mockL10n.homeserverNotHttpsError)
          .thenReturn('URL must start with https://');
      when(() => mockL10n.homeserverInvalidUrlError)
          .thenReturn('Please enter a valid HTTPS URL');
    });

    group('validate', () {
      test('returns null for valid HTTPS URLs', () {
        final testCases = [
          'https://matrix.org',
          'https://chat.matrix.org',
          'https://example.com',
          'https://my-server.example.org',
          'https://matrix.example.com/path',
          'https://localhost:8080',
        ];

        for (final url in testCases) {
          final result = HomeserverValidator.validate(url, mockL10n);
          expect(result, isNull, reason: 'URL should be valid: $url');
        }
      });

      test('returns error for null or empty URLs', () {
        expect(
          HomeserverValidator.validate(null, mockL10n),
          'Homeserver URL is required',
        );
        expect(
          HomeserverValidator.validate('', mockL10n),
          'Homeserver URL is required',
        );
        expect(
          HomeserverValidator.validate('   ', mockL10n),
          'Homeserver URL is required',
        );
      });

      test('returns error for non-HTTPS URLs', () {
        final testCases = [
          'http://matrix.org',
          'ftp://example.com',
          'matrix.org',
          'www.matrix.org',
        ];

        for (final url in testCases) {
          final result = HomeserverValidator.validate(url, mockL10n);
          expect(
            result,
            'URL must start with https://',
            reason: 'Should reject non-HTTPS URL: $url',
          );
        }
      });

      test('returns error for invalid URL formats', () {
        final testCases = [
          'https://',
          'https://.',
          'https://..',
          'https://localhost:',
          'https://localhost:abc',
          'https://spaces in url',
        ];

        for (final url in testCases) {
          final result = HomeserverValidator.validate(url, mockL10n);
          expect(
            result,
            'Please enter a valid HTTPS URL',
            reason: 'Should reject invalid URL format: $url',
          );
        }

        // Special case for completely invalid URLs (not starting with https://)
        expect(
          HomeserverValidator.validate('not-a-url-at-all', mockL10n),
          'URL must start with https://',
          reason: 'Should reject non-HTTPS URL with specific message',
        );
      });
    });

    group('isValidFormat', () {
      test('returns true for valid HTTPS URLs', () {
        final testCases = [
          'https://matrix.org',
          'https://chat.matrix.org',
          'https://localhost:8080',
          'https://example.com/path',
        ];

        for (final url in testCases) {
          expect(
            HomeserverValidator.isValidFormat(url),
            isTrue,
            reason: 'Should accept valid URL: $url',
          );
        }
      });

      test('returns false for invalid URLs', () {
        final testCases = [
          'http://matrix.org',
          'matrix.org',
          'https://',
          'not-a-url',
          '',
        ];

        for (final url in testCases) {
          expect(
            HomeserverValidator.isValidFormat(url),
            isFalse,
            reason: 'Should reject invalid URL: $url',
          );
        }
      });
    });

    group('edge cases', () {
      test('handles URLs with ports', () {
        final validUrls = [
          'https://matrix.org:443',
          'https://localhost:8080',
          'https://example.com:9000',
        ];

        for (final url in validUrls) {
          expect(
            HomeserverValidator.validate(url, mockL10n),
            isNull,
            reason: 'Should accept URL with port: $url',
          );
        }
      });

      test('handles URLs with paths', () {
        final validUrls = [
          'https://example.com/matrix',
          'https://example.com/path/to/matrix',
          'https://example.com/matrix/',
        ];

        for (final url in validUrls) {
          expect(
            HomeserverValidator.validate(url, mockL10n),
            isNull,
            reason: 'Should accept URL with path: $url',
          );
        }
      });

      test('handles international domain names', () {
        final validUrls = [
          'https://пример.рф',
          'https://例え.テスト',
          'https://مثال.آزمایشی',
        ];

        for (final url in validUrls) {
          expect(
            HomeserverValidator.validate(url, mockL10n),
            isNull,
            reason: 'Should accept international domain: $url',
          );
        }
      });

      test('trims whitespace from URLs', () {
        final urlsWithWhitespace = [
          '  https://matrix.org  ',
          '\thttps://example.com\n',
          ' https://test.com ',
        ];

        for (final url in urlsWithWhitespace) {
          expect(
            HomeserverValidator.validate(url, mockL10n),
            isNull,
            reason: 'Should handle whitespace in URL: "$url"',
          );
        }
      });
    });
  });
}
