import 'package:equatable/equatable.dart';
import 'package:skiffy/features/auth/models/homeserver_config.dart';

/// Base class for server selection states
abstract class ServerSelectionState extends Equatable {
  const ServerSelectionState();

  @override
  List<Object?> get props => [];
}

/// Initial state for server selection
class ServerSelectionInitial extends ServerSelectionState {
  const ServerSelectionInitial({this.defaultUrl});

  final String? defaultUrl;

  @override
  List<Object?> get props => [defaultUrl];

  @override
  String toString() => 'ServerSelectionInitial(defaultUrl: $defaultUrl)';
}

/// State when server is being verified
class ServerVerifying extends ServerSelectionState {
  const ServerVerifying(this.url);

  final String url;

  @override
  List<Object?> get props => [url];

  @override
  String toString() => 'ServerVerifying(url: $url)';
}

/// State when server verification succeeds
class ServerValid extends ServerSelectionState {
  const ServerValid(this.config);

  final HomeserverConfig config;

  @override
  List<Object?> get props => [config];

  @override
  String toString() => 'ServerValid(config: $config)';
}

/// State when server verification fails
class ServerInvalid extends ServerSelectionState {
  const ServerInvalid({
    required this.url,
    required this.errorMessage,
    required this.errorType,
  });

  final String url;
  final String errorMessage;
  final ServerErrorType errorType;

  @override
  List<Object?> get props => [url, errorMessage, errorType];

  @override
  String toString() => 'ServerInvalid(url: $url, errorMessage: $errorMessage, errorType: $errorType)';
}

/// Types of server validation errors
enum ServerErrorType {
  /// Network connectivity issues
  network,

  /// URL format or validation issues
  validation,

  /// Server is not a Matrix server
  notMatrix,

  /// Unknown error
  unknown,
}
