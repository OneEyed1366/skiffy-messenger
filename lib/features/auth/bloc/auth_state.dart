import 'package:equatable/equatable.dart';
import 'package:skiffy/rust/api/auth.dart';

/// Base class for authentication states
abstract class AuthState extends Equatable {
  const AuthState();

  @override
  List<Object?> get props => [];
}

/// Initial authentication state
class AuthInitial extends AuthState {
  const AuthInitial();

  @override
  String toString() => 'AuthInitial()';
}

/// State when checking homeserver capabilities
class AuthLoading extends AuthState {
  const AuthLoading();

  @override
  String toString() => 'AuthLoading()';
}

/// State when homeserver capabilities have been successfully loaded
class HomeserverCapabilitiesLoaded extends AuthState {
  const HomeserverCapabilitiesLoaded({
    required this.homeserverUrl,
    required this.capabilities,
  });

  final String homeserverUrl;
  final HomeserverCapabilities capabilities;

  @override
  List<Object?> get props => [homeserverUrl, capabilities];

  @override
  String toString() => 'HomeserverCapabilitiesLoaded(homeserverUrl: $homeserverUrl, capabilities: $capabilities)';
}

/// State when authentication is successful
class AuthSuccess extends AuthState {
  const AuthSuccess(this.user);

  final User user;

  @override
  List<Object?> get props => [user];

  @override
  String toString() => 'AuthSuccess(user: $user)';
}

/// State when authentication or capability detection fails
class AuthError extends AuthState {
  const AuthError({
    required this.message,
    required this.errorType,
  });

  final String message;
  final AuthErrorType errorType;

  @override
  List<Object?> get props => [message, errorType];

  @override
  String toString() => 'AuthError(message: $message, errorType: $errorType)';
}

/// Types of authentication errors
enum AuthErrorType {
  /// Network connectivity issues
  network,

  /// Invalid input or validation issues
  validation,

  /// Homeserver capability detection issues
  capabilityDetection,

  /// Authentication credential issues
  authentication,

  /// Timeout during operations
  timeout,

  /// Unknown error
  unknown,
}