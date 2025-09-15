import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:skiffy/features/secure_storage/cubit/secure_storage_cubit.dart';
import 'package:skiffy/widgets/widgets.dart';

/// Wrapper widget that provides secure storage functionality and session warnings
///
/// This widget should wrap the main application content and will automatically
/// display session persistence warnings when appropriate.
class SecureStorageWrapper extends StatefulWidget {
  const SecureStorageWrapper({
    required this.child,
    super.key,
    this.autoInitialize = true,
    this.customWarningMessage,
  });

  /// The child widget to wrap
  final Widget child;

  /// Whether to initialize secure storage automatically
  final bool autoInitialize;

  /// Custom message for the session warning banner
  final String? customWarningMessage;

  @override
  State<SecureStorageWrapper> createState() => _SecureStorageWrapperState();
}

class _SecureStorageWrapperState extends State<SecureStorageWrapper> {
  @override
  void initState() {
    super.initState();
    if (widget.autoInitialize) {
      // Initialize after the first frame to avoid calling BLoC during build
      WidgetsBinding.instance.addPostFrameCallback((_) {
        context.read<SecureStorageCubit>().initialize();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<SecureStorageCubit, SecureStorageState>(
      builder: (context, state) {
        return Column(
          children: [
            // Session warning banner (shown only for non-persistent storage)
            if (state is SecureStorageNonPersistent && state.shouldShowWarning)
              AppSessionWarningBanner(
                isVisible: true,
                customMessage: widget.customWarningMessage,
                onDismissed: () {
                  context.read<SecureStorageCubit>().dismissWarning();
                },
              ),
            // Main content
            Expanded(child: widget.child),
          ],
        );
      },
    );
  }
}

/// Provider widget that injects SecureStorageCubit into the widget tree
///
/// Use this widget at the root of your app to provide secure storage
/// functionality throughout the application.
class SecureStorageProvider extends StatelessWidget {
  const SecureStorageProvider({
    required this.child,
    super.key,
  });

  /// The child widget tree
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => SecureStorageCubit(),
      child: child,
    );
  }
}

/// A widget that shows secure storage status information (for debugging/admin)
class SecureStorageStatusWidget extends StatelessWidget {
  const SecureStorageStatusWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<SecureStorageCubit, SecureStorageState>(
      builder: (context, state) {
        final theme = Theme.of(context);

        var statusText = 'Unknown';
        var statusColor = theme.colorScheme.outline;
        var statusIcon = Icons.help_outline;

        switch (state) {
          case SecureStorageInitial():
            statusText = 'Not initialized';
            statusColor = theme.colorScheme.outline;
            statusIcon = Icons.hourglass_empty;
          case SecureStorageLoading():
            statusText = 'Initializing...';
            statusColor = theme.colorScheme.primary;
            statusIcon = Icons.hourglass_bottom;
          case SecureStoragePersistent():
            statusText = 'Secure storage active';
            statusColor = Colors.green;
            statusIcon = Icons.security;
          case SecureStorageNonPersistent():
            statusText = 'Fallback storage (in-memory only)';
            statusColor = Colors.orange;
            statusIcon = Icons.warning_outlined;
          case SecureStorageError():
            statusText = 'Error: ${state.message}';
            statusColor = theme.colorScheme.error;
            statusIcon = Icons.error_outline;
        }

        return Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Secure Storage Status',
                  style: theme.textTheme.titleMedium,
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(
                      statusIcon,
                      color: statusColor,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        statusText,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: statusColor,
                        ),
                      ),
                    ),
                  ],
                ),
                if (state is SecureStorageNonPersistent) ...[
                  const SizedBox(height: 8),
                  Text(
                    'Session data will be lost when the app is closed.',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.outline,
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }
}
