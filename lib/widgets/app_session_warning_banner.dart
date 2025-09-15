import 'package:flutter/material.dart';

/// A warning banner that displays when session data is not persistent
///
/// This widget shows a non-intrusive warning to users when the secure storage
/// system has fallen back to in-memory storage, meaning their session data
/// will be lost when the app is closed.
class AppSessionWarningBanner extends StatefulWidget {
  const AppSessionWarningBanner({
    required this.isVisible,
    super.key,
    this.onDismissed,
    this.customMessage,
  });

  /// Whether to show the warning banner
  final bool isVisible;

  /// Callback when the user dismisses the banner
  final VoidCallback? onDismissed;

  /// Custom message to display (optional)
  final String? customMessage;

  @override
  State<AppSessionWarningBanner> createState() =>
      _AppSessionWarningBannerState();
}

class _AppSessionWarningBannerState extends State<AppSessionWarningBanner>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _heightAnimation;
  late Animation<double> _opacityAnimation;

  bool _isDismissed = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );

    _heightAnimation =
        Tween<double>(
          begin: 0,
          end: 1,
        ).animate(
          CurvedAnimation(
            parent: _animationController,
            curve: Curves.easeInOut,
          ),
        );

    _opacityAnimation =
        Tween<double>(
          begin: 0,
          end: 1,
        ).animate(
          CurvedAnimation(
            parent: _animationController,
            curve: Curves.easeInOut,
          ),
        );

    if (widget.isVisible && !_isDismissed) {
      _animationController.forward();
    }
  }

  @override
  void didUpdateWidget(AppSessionWarningBanner oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (widget.isVisible && !oldWidget.isVisible && !_isDismissed) {
      _animationController.forward();
    } else if (!widget.isVisible && oldWidget.isVisible) {
      _animationController.reverse();
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _dismiss() {
    setState(() {
      _isDismissed = true;
    });
    _animationController.reverse().then((_) {
      widget.onDismissed?.call();
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.isVisible || _isDismissed) {
      return const SizedBox.shrink();
    }

    final theme = Theme.of(context);

    return AnimatedBuilder(
      animation: _animationController,
      builder: (context, child) {
        return SizeTransition(
          sizeFactor: _heightAnimation,
          child: FadeTransition(
            opacity: _opacityAnimation,
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: theme.colorScheme.secondaryContainer,
                border: Border(
                  bottom: BorderSide(
                    color: theme.colorScheme.outline.withOpacity(0.2),
                  ),
                ),
              ),
              child: SafeArea(
                bottom: false,
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.warning_outlined,
                        color: theme.colorScheme.onSecondaryContainer,
                        size: 20,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          widget.customMessage ??
                              'Session data is temporarily stored in memory and will be lost when the app is closed.',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSecondaryContainer,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton(
                        icon: Icon(
                          Icons.close,
                          color: theme.colorScheme.onSecondaryContainer,
                          size: 18,
                        ),
                        onPressed: _dismiss,
                        visualDensity: VisualDensity.compact,
                        constraints: const BoxConstraints(
                          minWidth: 32,
                          minHeight: 32,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

/// A simplified version of the session warning banner for specific use cases
class SessionWarningSnackBar {
  /// Show a snackbar warning about non-persistent session data
  static void show(BuildContext context, {String? customMessage}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(
              Icons.warning_outlined,
              color: Colors.white,
              size: 20,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                customMessage ?? 'Session data will be lost when app closes.',
                style: const TextStyle(color: Colors.white),
              ),
            ),
          ],
        ),
        backgroundColor: Colors.orange,
        behavior: SnackBarBehavior.floating,
        action: SnackBarAction(
          label: 'Dismiss',
          textColor: Colors.white,
          onPressed: () {
            ScaffoldMessenger.of(context).hideCurrentSnackBar();
          },
        ),
      ),
    );
  }
}
