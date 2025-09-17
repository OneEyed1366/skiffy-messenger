import 'package:flutter/material.dart';
import 'package:skiffy/app/design_system/colors.dart';
import 'package:skiffy/app/design_system/typography.dart';
import 'package:skiffy/widgets/app_focusable_border.dart';

/// Premium card component for SkiffyMessenger
///
/// Provides a consistent, accessible card implementation following
/// the design system specifications. All interactive cards are wrapped with
/// FocusableBorder for WCAG compliance and keyboard navigation.
///
/// Features:
/// - Multiple card variants (elevated, outlined, filled)
/// - Optional header and footer sections
/// - Interactive and non-interactive modes
/// - Proper elevation and shadows
/// - Accessibility compliance
/// - Responsive padding and spacing
class AppCard extends StatelessWidget {
  const AppCard({
    required this.child,
    super.key,
    this.header,
    this.footer,
    this.variant = AppCardVariant.elevated,
    this.elevation = AppCardElevation.low,
    this.isInteractive = false,
    this.onTap,
    this.onLongPress,
    this.backgroundColor,
    this.borderColor,
    this.borderRadius,
    this.padding,
    this.margin,
    this.isLoading = false,
    this.focusNode,
    this.semanticLabel,
    this.semanticHint,
    this.clipBehavior = Clip.antiAlias,
  });

  /// Create an elevated card (default)
  const AppCard.elevated({
    required this.child,
    super.key,
    this.header,
    this.footer,
    this.elevation = AppCardElevation.low,
    this.isInteractive = false,
    this.onTap,
    this.onLongPress,
    this.backgroundColor,
    this.borderRadius,
    this.padding,
    this.margin,
    this.isLoading = false,
    this.focusNode,
    this.semanticLabel,
    this.semanticHint,
    this.clipBehavior = Clip.antiAlias,
  }) : variant = AppCardVariant.elevated,
       borderColor = null;

  /// Create an outlined card
  const AppCard.outlined({
    required this.child,
    super.key,
    this.header,
    this.footer,
    this.isInteractive = false,
    this.onTap,
    this.onLongPress,
    this.backgroundColor,
    this.borderColor,
    this.borderRadius,
    this.padding,
    this.margin,
    this.isLoading = false,
    this.focusNode,
    this.semanticLabel,
    this.semanticHint,
    this.clipBehavior = Clip.antiAlias,
  }) : variant = AppCardVariant.outlined,
       elevation = AppCardElevation.none;

  /// Create a filled card
  const AppCard.filled({
    required this.child,
    super.key,
    this.header,
    this.footer,
    this.isInteractive = false,
    this.onTap,
    this.onLongPress,
    this.backgroundColor,
    this.borderRadius,
    this.padding,
    this.margin,
    this.isLoading = false,
    this.focusNode,
    this.semanticLabel,
    this.semanticHint,
    this.clipBehavior = Clip.antiAlias,
  }) : variant = AppCardVariant.filled,
       elevation = AppCardElevation.none,
       borderColor = null;

  /// Create an interactive card (automatically sets isInteractive to true)
  const AppCard.interactive({
    required this.child,
    required this.onTap,
    super.key,
    this.header,
    this.footer,
    this.variant = AppCardVariant.elevated,
    this.elevation = AppCardElevation.low,
    this.onLongPress,
    this.backgroundColor,
    this.borderColor,
    this.borderRadius,
    this.padding,
    this.margin,
    this.isLoading = false,
    this.focusNode,
    this.semanticLabel,
    this.semanticHint,
    this.clipBehavior = Clip.antiAlias,
  }) : isInteractive = true;

  /// Main content of the card
  final Widget child;

  /// Optional header widget (appears at the top)
  final Widget? header;

  /// Optional footer widget (appears at the bottom)
  final Widget? footer;

  /// Card style variant
  final AppCardVariant variant;

  /// Card elevation level
  final AppCardElevation elevation;

  /// Whether the card is interactive (clickable)
  final bool isInteractive;

  /// Callback when card is tapped (makes card interactive)
  final VoidCallback? onTap;

  /// Callback when card is long pressed
  final VoidCallback? onLongPress;

  /// Custom background color (overrides variant)
  final Color? backgroundColor;

  /// Custom border color (for outlined variant)
  final Color? borderColor;

  /// Border radius override
  final BorderRadius? borderRadius;

  /// Custom padding inside the card
  final EdgeInsets? padding;

  /// Custom margin around the card
  final EdgeInsets? margin;

  /// Whether to show a loading state
  final bool isLoading;

  /// Custom focus node for focus management
  final FocusNode? focusNode;

  /// Custom semantic label for accessibility
  final String? semanticLabel;

  /// Custom semantic hint for accessibility
  final String? semanticHint;

  /// Whether to clip the card contents
  final Clip clipBehavior;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    final effectiveOnTap = isInteractive ? onTap : null;
    final cardColors = _getCardColors(context);
    final cardElevation = _getElevationValue();

    // Build card content
    var cardContent = _buildCardContent(context);

    // Apply loading overlay if needed
    if (isLoading) {
      cardContent = Stack(
        children: [
          cardContent,
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                color: colorScheme.surface.withOpacity(0.8),
                borderRadius: borderRadius ?? BorderRadius.circular(16),
              ),
              child: const Center(
                child: CircularProgressIndicator(),
              ),
            ),
          ),
        ],
      );
    }

    // Create the Material card
    Widget card = Material(
      type: variant == AppCardVariant.outlined
          ? MaterialType.card
          : MaterialType.card,
      color: cardColors.background,
      elevation: cardElevation,
      shadowColor: colorScheme.shadow.withOpacity(0.1),
      shape: _buildCardShape(cardColors.borderColor),
      clipBehavior: clipBehavior,
      child: cardContent,
    );

    // Make card interactive if needed
    if (effectiveOnTap != null || onLongPress != null) {
      card = InkWell(
        onTap: effectiveOnTap,
        onLongPress: onLongPress,
        borderRadius: borderRadius ?? BorderRadius.circular(16),
        child: card,
      );
    }

    // Wrap with FocusableBorder for accessibility if interactive
    if (isInteractive) {
      card = AppFocusableBorderFactory.forCard(
        child: card,
        onTap: effectiveOnTap,
        semanticLabel: semanticLabel,
        focusNode: focusNode,
      );
    }

    // Apply margin if provided
    if (margin != null) {
      card = Padding(
        padding: margin!,
        child: card,
      );
    }

    return card;
  }

  /// Build the content inside the card
  Widget _buildCardContent(BuildContext context) {
    final effectivePadding = padding ?? const EdgeInsets.all(16);

    final children = <Widget>[];

    // Add header if provided
    if (header != null) {
      children
        ..add(
          Padding(
            padding: EdgeInsets.only(
              left: effectivePadding.left,
              right: effectivePadding.right,
              top: effectivePadding.top,
            ),
            child: header,
          ),
        )
        // Add spacing between header and main content
        ..add(const SizedBox(height: 8));
    }

    // Add main content
    children.add(
      Padding(
        padding: EdgeInsets.only(
          left: effectivePadding.left,
          right: effectivePadding.right,
          top: header != null ? 0 : effectivePadding.top,
          bottom: footer != null ? 0 : effectivePadding.bottom,
        ),
        child: child,
      ),
    );

    // Add footer if provided
    if (footer != null) {
      // Add spacing between main content and footer
      children
        ..add(const SizedBox(height: 8))
        ..add(
          Padding(
            padding: EdgeInsets.only(
              left: effectivePadding.left,
              right: effectivePadding.right,
              bottom: effectivePadding.bottom,
            ),
            child: footer,
          ),
        );
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: children,
    );
  }

  /// Get card colors based on variant and theme
  _CardColors _getCardColors(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    // Handle custom colors
    if (backgroundColor != null) {
      return _CardColors(
        background: backgroundColor!,
        borderColor: borderColor,
      );
    }

    switch (variant) {
      case AppCardVariant.elevated:
        return _CardColors(
          background: colorScheme.surface,
        );
      case AppCardVariant.outlined:
        return _CardColors(
          background: Colors.transparent,
          borderColor: borderColor ?? colorScheme.outline,
        );
      case AppCardVariant.filled:
        return _CardColors(
          background: colorScheme.surfaceContainerHigh,
        );
    }
  }

  /// Get elevation value based on elevation enum
  double _getElevationValue() {
    switch (elevation) {
      case AppCardElevation.none:
        return 0;
      case AppCardElevation.low:
        return 1;
      case AppCardElevation.medium:
        return 3;
      case AppCardElevation.high:
        return 6;
    }
  }

  /// Build card shape with optional border
  ShapeBorder _buildCardShape(Color? borderColor) {
    final radius = borderRadius ?? BorderRadius.circular(16);

    if (borderColor != null) {
      return RoundedRectangleBorder(
        borderRadius: radius,
        side: BorderSide(
          color: borderColor,
        ),
      );
    }

    return RoundedRectangleBorder(borderRadius: radius);
  }
}

/// Card style variants
enum AppCardVariant {
  /// Elevated card with shadow
  elevated,

  /// Card with border outline
  outlined,

  /// Card with filled background
  filled,
}

/// Card elevation levels
enum AppCardElevation {
  /// No elevation (0dp)
  none,

  /// Low elevation (1dp)
  low,

  /// Medium elevation (3dp)
  medium,

  /// High elevation (6dp)
  high,
}

/// Internal class for card color configuration
class _CardColors {
  const _CardColors({
    required this.background,
    this.borderColor,
  });
  final Color background;
  final Color? borderColor;
}

/// Utility class for common card layouts
class AppCardLayouts {
  AppCardLayouts._();

  /// Create a list item card
  static AppCard listItem({
    required Widget title,
    Key? key,
    Widget? subtitle,
    Widget? leading,
    Widget? trailing,
    VoidCallback? onTap,
    bool isSelected = false,
  }) {
    return AppCard.interactive(
      key: key,
      onTap: onTap ?? () {},
      variant: isSelected ? AppCardVariant.filled : AppCardVariant.elevated,
      child: Row(
        children: [
          if (leading != null) ...[
            leading,
            const SizedBox(width: 12),
          ],
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                DefaultTextStyle(
                  style: AppTextStyles.titleMedium,
                  child: title,
                ),
                if (subtitle != null) ...[
                  const SizedBox(height: 2),
                  DefaultTextStyle(
                    style: AppTextStyles.bodySmall,
                    child: subtitle,
                  ),
                ],
              ],
            ),
          ),
          if (trailing != null) ...[
            const SizedBox(width: 12),
            trailing,
          ],
        ],
      ),
    );
  }

  /// Create a settings item card
  static AppCard settingsItem({
    required String title,
    Key? key,
    String? subtitle,
    Widget? leading,
    Widget? trailing,
    VoidCallback? onTap,
  }) {
    return AppCard.interactive(
      key: key,
      onTap: onTap ?? () {},
      variant: AppCardVariant.filled,
      child: Builder(
        builder: (BuildContext context) {
          return Row(
            children: [
              if (leading != null) ...[
                leading,
                const SizedBox(width: 16),
              ],
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: AppTextStyles.titleMedium,
                    ),
                    if (subtitle != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        subtitle,
                        style: AppTextStyles.bodySmall,
                      ),
                    ],
                  ],
                ),
              ),
              if (trailing != null) ...[
                const SizedBox(width: 16),
                trailing,
              ] else ...[
                const SizedBox(width: 16),
                Icon(
                  Icons.chevron_right,
                  size: 20,
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
              ],
            ],
          );
        },
      ),
    );
  }

  /// Create an information card
  static AppCard info({
    required String title,
    required String description,
    Key? key,
    Widget? icon,
    VoidCallback? onTap,
    Color? backgroundColor,
  }) {
    return AppCard(
      key: key,
      variant: AppCardVariant.filled,
      backgroundColor: backgroundColor,
      onTap: onTap,
      isInteractive: onTap != null,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (icon != null) ...[
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color:
                    backgroundColor?.withOpacity(0.2) ??
                    AppColors.primaryContainer,
                borderRadius: BorderRadius.circular(8),
              ),
              child: icon,
            ),
            const SizedBox(width: 12),
          ],
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTextStyles.titleMedium,
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: AppTextStyles.bodyMedium,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
