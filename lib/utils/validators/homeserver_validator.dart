import 'package:skiffy/l10n/l10n.dart';

/// Validator for Matrix homeserver URLs
class HomeserverValidator {
  /// Validates a homeserver URL
  ///
  /// Returns null if valid, error message string if invalid
  static String? validate(String? url, AppLocalizations l10n) {
    if (url == null || url.trim().isEmpty) {
      return l10n.homeserverUrlRequired;
    }

    final trimmedUrl = url.trim();

    // Comprehensive regex for HTTPS URLs with proper validation
    // Supports international domains, proper port ranges, and paths
    final regex = RegExp(
      r'^https://([a-zA-Z0-9\u00a1-\uffff]([a-zA-Z0-9\u00a1-\uffff\-]*[a-zA-Z0-9\u00a1-\uffff])?\.)*[a-zA-Z0-9\u00a1-\uffff]([a-zA-Z0-9\u00a1-\uffff\-]*[a-zA-Z0-9\u00a1-\uffff])?(:[1-9]\d{0,4})?(/.*)?$',
      unicode: true,
    );

    if (!regex.hasMatch(trimmedUrl)) {
      // For non-HTTPS URLs, return specific error message
      if (!trimmedUrl.startsWith('https://')) {
        return l10n.homeserverNotHttpsError;
      }
      // For malformed HTTPS URLs, return generic invalid URL error
      return l10n.homeserverInvalidUrlError;
    }

    return null;
  }

  /// Checks if URL is properly formatted (basic validation)
  static bool isValidFormat(String url) {
    final trimmedUrl = url.trim();

    if (!trimmedUrl.startsWith('https://')) {
      return false;
    }

    // Use the same comprehensive regex as validate method
    final regex = RegExp(
      r'^https://([a-zA-Z0-9\u00a1-\uffff]([a-zA-Z0-9\u00a1-\uffff\-]*[a-zA-Z0-9\u00a1-\uffff])?\.)*[a-zA-Z0-9\u00a1-\uffff]([a-zA-Z0-9\u00a1-\uffff\-]*[a-zA-Z0-9\u00a1-\uffff])?(:[1-9]\d{0,4})?(/.*)?$',
      unicode: true,
    );

    return regex.hasMatch(trimmedUrl);
  }
}
