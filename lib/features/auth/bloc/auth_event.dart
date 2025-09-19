import 'package:equatable/equatable.dart';

/// Base class for authentication events
abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

/// Event to check homeserver capabilities for authentication methods
class CheckHomeserverCapabilities extends AuthEvent {
  const CheckHomeserverCapabilities(this.homeserverUrl);

  final String homeserverUrl;

  @override
  List<Object?> get props => [homeserverUrl];

  @override
  String toString() =>
      'CheckHomeserverCapabilities(homeserverUrl: $homeserverUrl)';
}

/// Event triggered when login is requested
class LoginRequested extends AuthEvent {
  const LoginRequested({
    required this.username,
    required this.password,
  });

  final String username;
  final String password;

  @override
  List<Object?> get props => [username, password];

  @override
  String toString() => 'LoginRequested(username: $username)';
}

/// Event to restore session from secure storage
class RestoreSession extends AuthEvent {
  const RestoreSession(this.homeserverUrl);

  final String homeserverUrl;

  @override
  List<Object?> get props => [homeserverUrl];

  @override
  String toString() => 'RestoreSession(homeserverUrl: $homeserverUrl)';
}

/// Event to reset the authentication state
class AuthReset extends AuthEvent {
  const AuthReset();

  @override
  String toString() => 'AuthReset()';
}
