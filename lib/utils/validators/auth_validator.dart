import 'package:skiffy/l10n/l10n.dart';

/// Validator for authentication-related inputs
class AuthValidator {
  /// Validates username or Matrix ID format
  static String? validateUsername(String? value, AppLocalizations l10n) {
    if (value == null || value.trim().isEmpty) {
      return l10n.validatorMatrixIdRequired;
    }

    final trimmed = value.trim();

    // If it starts with @, validate as Matrix ID
    if (trimmed.startsWith('@')) {
      return _validateMatrixId(trimmed, l10n);
    }

    // Otherwise, just check it's not empty (can be username)
    if (trimmed.isEmpty) {
      return l10n.validatorMatrixIdRequired;
    }

    return null;
  }

  /// Validates password input
  static String? validatePassword(String? value, AppLocalizations l10n) {
    if (value == null || value.isEmpty) {
      return l10n.validatorPasswordRequired;
    }

    // Basic length check - no complex requirements for login
    if (value.isEmpty) {
      return l10n.validatorPasswordRequired;
    }

    return null;
  }

  /// Validates Matrix ID format (@user:server.com)
  static String? _validateMatrixId(String value, AppLocalizations l10n) {
    if (value.isEmpty) {
      return l10n.validatorMatrixIdRequired;
    }

    // Basic Matrix ID pattern: @localpart:server.tld
    final matrixIdPattern = RegExp(r'^@[a-zA-Z0-9._=-]+:[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');

    if (!matrixIdPattern.hasMatch(value)) {
      return l10n.validatorMatrixIdInvalid;
    }

    return null;
  }
}