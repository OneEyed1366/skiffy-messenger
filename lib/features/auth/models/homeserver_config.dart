import 'package:equatable/equatable.dart';

/// Configuration model for Matrix homeserver settings
class HomeserverConfig extends Equatable {
  /// Creates a homeserver configuration
  const HomeserverConfig({
    required this.url,
    this.isVerified = false,
    this.displayName,
  });

  /// Creates an unverified config from URL
  factory HomeserverConfig.unverified(String url) {
    return HomeserverConfig(url: url);
  }

  /// The homeserver URL
  final String url;

  /// Whether the server has been verified as a valid Matrix server
  final bool isVerified;

  /// Optional display name for the server
  final String? displayName;

  /// Creates a copy with updated values
  HomeserverConfig copyWith({
    String? url,
    bool? isVerified,
    String? displayName,
  }) {
    return HomeserverConfig(
      url: url ?? this.url,
      isVerified: isVerified ?? this.isVerified,
      displayName: displayName ?? this.displayName,
    );
  }

  @override
  List<Object?> get props => [url, isVerified, displayName];

  @override
  String toString() {
    return 'HomeserverConfig(url: $url, isVerified: $isVerified, displayName: $displayName)';
  }
}
