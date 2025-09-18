/// Application constants for SkiffyMessenger
class AppConstants {
  /// Default Matrix homeserver URL
  static const String defaultHomeserver = 'https://matrix.org';

  /// Homeserver URL validation regex pattern
  static const String homeserverUrlPattern = r'^https://[\w.-]+(?:\.\w+)+(?:/.*)?$';

  /// Matrix well-known endpoint path
  static const String wellKnownPath = '/.well-known/matrix/client';

  /// Network timeout constants
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration readTimeout = Duration(seconds: 15);
}
