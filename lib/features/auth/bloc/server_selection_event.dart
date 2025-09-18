import 'package:equatable/equatable.dart';

/// Base class for server selection events
abstract class ServerSelectionEvent extends Equatable {
  const ServerSelectionEvent();

  @override
  List<Object?> get props => [];
}

/// Event triggered when the server URL is changed
class ServerUrlChanged extends ServerSelectionEvent {
  const ServerUrlChanged(this.url);

  final String url;

  @override
  List<Object?> get props => [url];

  @override
  String toString() => 'ServerUrlChanged(url: $url)';
}

/// Event triggered when server verification is requested
class ServerVerificationRequested extends ServerSelectionEvent {
  const ServerVerificationRequested(this.url);

  final String url;

  @override
  List<Object?> get props => [url];

  @override
  String toString() => 'ServerVerificationRequested(url: $url)';
}

/// Event triggered to reset the server selection state
class ServerSelectionReset extends ServerSelectionEvent {
  const ServerSelectionReset();

  @override
  String toString() => 'ServerSelectionReset()';
}
