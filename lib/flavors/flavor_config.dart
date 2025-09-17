/// Configuration for application flavors
///
/// This class manages the current flavor state and provides
/// utilities for flavor-specific configuration loading.
enum AppFlavor {
  development,
  staging,
  production
}

/// Manages flavor configuration for the application
class FlavorConfig {
  static AppFlavor? _currentFlavor;

  /// Sets the current application flavor
  ///
  /// This should be called from flavor entry points before calling bootstrap
  static void setFlavor(AppFlavor flavor) {
    _currentFlavor = flavor;
  }

  /// Gets the current application flavor
  ///
  /// Defaults to development if no flavor is set
  static AppFlavor get currentFlavor =>
    _currentFlavor ?? AppFlavor.development;

  /// Gets the flavor name as string for file loading
  static String get flavorName => currentFlavor.name;
}