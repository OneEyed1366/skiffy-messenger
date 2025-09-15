part of 'secure_storage_cubit.dart';

/// Base state for secure storage operations
abstract class SecureStorageState extends Equatable {
  const SecureStorageState();

  @override
  List<Object?> get props => [];
}

/// Initial state before initialization
class SecureStorageInitial extends SecureStorageState {
  const SecureStorageInitial();
}

/// Loading state during initialization
class SecureStorageLoading extends SecureStorageState {
  const SecureStorageLoading();
}

/// State when secure storage is properly initialized and persistent
class SecureStoragePersistent extends SecureStorageState {
  const SecureStoragePersistent();
}

/// State when secure storage is using non-persistent fallback
class SecureStorageNonPersistent extends SecureStorageState {
  const SecureStorageNonPersistent({
    this.warningDismissed = false,
  });

  /// Whether the user has dismissed the warning banner
  final bool warningDismissed;

  /// Create a copy of this state with optionally updated fields
  SecureStorageNonPersistent copyWith({
    bool? warningDismissed,
  }) {
    return SecureStorageNonPersistent(
      warningDismissed: warningDismissed ?? this.warningDismissed,
    );
  }

  /// Whether the warning should be shown to the user
  bool get shouldShowWarning => !warningDismissed;

  @override
  List<Object?> get props => [warningDismissed];
}

/// Error state for secure storage operations
class SecureStorageError extends SecureStorageState {
  const SecureStorageError(this.message);

  /// Error message describing what went wrong
  final String message;

  @override
  List<Object?> get props => [message];
}
