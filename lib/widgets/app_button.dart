import 'package:flutter/material.dart';
import 'package:skiffy/app/design_system/typography.dart';
import 'package:skiffy/widgets/app_focusable_border.dart';

/// Premium button component for SkiffyMessenger
///
/// Provides a consistent, accessible button implementation following
/// the design system specifications. All buttons are wrapped with
/// FocusableBorder for WCAG compliance and keyboard navigation.
///
/// Features:
/// - Multiple button variants (primary, secondary, tertiary)
/// - Loading states with spinner
/// - Icon support (leading and trailing)
/// - Accessibility compliance
/// - Responsive sizing
/// - Proper focus management
class AppButton extends StatelessWidget {
  const AppButton({
    super.key,
    this.text,
    this.onPressed,
    this.variant = AppButtonVariant.primary,
    this.size = AppButtonSize.medium,
    this.isLoading = false,
    this.leadingIcon,
    this.trailingIcon,
    this.isExpanded = false,
    this.semanticLabel,
    this.backgroundColor,
    this.foregroundColor,
    this.borderRadius,
    this.focusNode,
    this.margin,
  }) : assert(
         text != null || leadingIcon != null || trailingIcon != null,
         'Button must have text or at least one icon',
       );

  /// Create a primary button
  const AppButton.primary({
    required String text,
    required VoidCallback? onPressed,
    super.key,
    this.size = AppButtonSize.medium,
    this.isLoading = false,
    this.leadingIcon,
    this.trailingIcon,
    this.isExpanded = false,
    this.semanticLabel,
    this.focusNode,
    this.margin,
  }) : text = text,
       onPressed = onPressed,
       variant = AppButtonVariant.primary,
       backgroundColor = null,
       foregroundColor = null,
       borderRadius = null;

  /// Create a secondary button
  const AppButton.secondary({
    required String text,
    required VoidCallback? onPressed,
    super.key,
    this.size = AppButtonSize.medium,
    this.isLoading = false,
    this.leadingIcon,
    this.trailingIcon,
    this.isExpanded = false,
    this.semanticLabel,
    this.focusNode,
    this.margin,
  }) : text = text,
       onPressed = onPressed,
       variant = AppButtonVariant.secondary,
       backgroundColor = null,
       foregroundColor = null,
       borderRadius = null;

  /// Create a tertiary/text button
  const AppButton.tertiary({
    required String text,
    required VoidCallback? onPressed,
    super.key,
    this.size = AppButtonSize.medium,
    this.isLoading = false,
    this.leadingIcon,
    this.trailingIcon,
    this.isExpanded = false,
    this.semanticLabel,
    this.focusNode,
    this.margin,
  }) : text = text,
       onPressed = onPressed,
       variant = AppButtonVariant.tertiary,
       backgroundColor = null,
       foregroundColor = null,
       borderRadius = null;

  /// Create an icon-only button
  const AppButton.icon({
    required Widget icon,
    required VoidCallback? onPressed,
    super.key,
    this.size = AppButtonSize.medium,
    this.variant = AppButtonVariant.tertiary,
    this.isLoading = false,
    this.isExpanded = false,
    this.semanticLabel,
    this.focusNode,
    this.margin,
  }) : text = null,
       onPressed = onPressed,
       leadingIcon = icon,
       trailingIcon = null,
       backgroundColor = null,
       foregroundColor = null,
       borderRadius = null;

  /// Text displayed on the button
  final String? text;

  /// Callback when button is pressed
  final VoidCallback? onPressed;

  /// Button style variant
  final AppButtonVariant variant;

  /// Button size
  final AppButtonSize size;

  /// Whether to show loading spinner
  final bool isLoading;

  /// Icon to display before text
  final Widget? leadingIcon;

  /// Icon to display after text
  final Widget? trailingIcon;

  /// Whether button should expand to fill available width
  final bool isExpanded;

  /// Custom semantic label for accessibility
  final String? semanticLabel;

  /// Custom background color (overrides variant)
  final Color? backgroundColor;

  /// Custom foreground color (overrides variant)
  final Color? foregroundColor;

  /// Border radius override
  final BorderRadius? borderRadius;

  /// Custom focus node for focus management
  final FocusNode? focusNode;

  /// Additional margin around button
  final EdgeInsets? margin;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    final buttonColors = _getButtonColors(context);
    final buttonSizes = _getButtonSizes();
    final textStyle = _getTextStyle(context);

    var child = _buildButtonContent(context, buttonColors.foreground);

    // Wrap in Container for proper sizing and padding
    child = Container(
      height: buttonSizes.height,
      padding: buttonSizes.padding,
      child: child,
    );

    // Create the actual button based on variant
    switch (variant) {
      case AppButtonVariant.primary:
      case AppButtonVariant.secondary:
        child = ElevatedButton(
          onPressed: isLoading ? null : onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: buttonColors.background,
            foregroundColor: buttonColors.foreground,
            elevation: variant == AppButtonVariant.primary ? 2 : 1,
            shadowColor: colorScheme.shadow.withOpacity(0.1),
            shape: RoundedRectangleBorder(
              borderRadius: borderRadius ?? BorderRadius.circular(12),
            ),
            padding: EdgeInsets.zero, // We handle padding with Container
            textStyle: textStyle,
            minimumSize: Size.zero,
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
          child: child,
        );
      case AppButtonVariant.tertiary:
        child = TextButton(
          onPressed: isLoading ? null : onPressed,
          style: TextButton.styleFrom(
            foregroundColor: buttonColors.foreground,
            backgroundColor: Colors.transparent,
            shape: RoundedRectangleBorder(
              borderRadius: borderRadius ?? BorderRadius.circular(8),
            ),
            padding: EdgeInsets.zero,
            textStyle: textStyle,
            minimumSize: Size.zero,
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
          child: child,
        );
      case AppButtonVariant.outlined:
        child = OutlinedButton(
          onPressed: isLoading ? null : onPressed,
          style: OutlinedButton.styleFrom(
            foregroundColor: buttonColors.foreground,
            backgroundColor: Colors.transparent,
            side: BorderSide(
              color: buttonColors.border ?? buttonColors.foreground,
              width: 1.5,
            ),
            shape: RoundedRectangleBorder(
              borderRadius: borderRadius ?? BorderRadius.circular(12),
            ),
            padding: EdgeInsets.zero,
            textStyle: textStyle,
            minimumSize: Size.zero,
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
          child: child,
        );
    }

    // Make expanded if needed
    if (isExpanded) {
      child = SizedBox(
        width: double.infinity,
        child: child,
      );
    }

    // Wrap with FocusableBorder for accessibility
    child = AppFocusableBorderFactory.forButton(
      child: child,
      onPressed: isLoading ? null : onPressed,
      semanticLabel: semanticLabel ?? text,
      focusNode: focusNode,
    );

    // Apply margin if provided
    if (margin != null) {
      child = Padding(
        padding: margin!,
        child: child,
      );
    }

    return child;
  }

  /// Build the content inside the button (text, icons, loading)
  Widget _buildButtonContent(BuildContext context, Color foregroundColor) {
    final children = <Widget>[];

    // Add loading spinner if loading
    if (isLoading) {
      children.add(
        SizedBox(
          width: 16,
          height: 16,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            color: foregroundColor,
          ),
        ),
      );

      // Add spacing if there's text
      if (text != null) {
        children.add(const SizedBox(width: 8));
      }
    } else {
      // Add leading icon if provided and not loading
      if (leadingIcon != null) {
        children.add(
          IconTheme(
            data: IconThemeData(color: foregroundColor),
            child: leadingIcon!,
          ),
        );

        // Add spacing if there's text
        if (text != null) {
          children.add(const SizedBox(width: 8));
        }
      }
    }

    // Add text if provided
    if (text != null) {
      children.add(
        Text(
          text!,
          textAlign: TextAlign.center,
          overflow: TextOverflow.ellipsis,
          maxLines: 1,
        ),
      );
    }

    // Add trailing icon if provided and not loading
    if (!isLoading && trailingIcon != null) {
      // Add spacing if there's text
      if (text != null) {
        children.add(const SizedBox(width: 8));
      }

      children.add(
        IconTheme(
          data: IconThemeData(color: foregroundColor),
          child: trailingIcon!,
        ),
      );
    }

    // Return Row or single child
    if (children.length == 1) {
      return children.first;
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: children,
    );
  }

  /// Get button colors based on variant and theme
  _ButtonColors _getButtonColors(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    // Handle custom colors
    if (backgroundColor != null || foregroundColor != null) {
      return _ButtonColors(
        background: backgroundColor ?? Colors.transparent,
        foreground: foregroundColor ?? colorScheme.onSurface,
        border: foregroundColor,
      );
    }

    switch (variant) {
      case AppButtonVariant.primary:
        return _ButtonColors(
          background: colorScheme.primary,
          foreground: colorScheme.onPrimary,
        );
      case AppButtonVariant.secondary:
        return _ButtonColors(
          background: colorScheme.secondary,
          foreground: colorScheme.onSecondary,
        );
      case AppButtonVariant.tertiary:
        return _ButtonColors(
          background: Colors.transparent,
          foreground: colorScheme.primary,
        );
      case AppButtonVariant.outlined:
        return _ButtonColors(
          background: Colors.transparent,
          foreground: colorScheme.primary,
          border: colorScheme.outline,
        );
    }
  }

  /// Get button sizes based on size enum
  _ButtonSizes _getButtonSizes() {
    switch (size) {
      case AppButtonSize.small:
        return const _ButtonSizes(
          height: 36,
          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        );
      case AppButtonSize.medium:
        return const _ButtonSizes(
          height: 44,
          padding: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        );
      case AppButtonSize.large:
        return const _ButtonSizes(
          height: 52,
          padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        );
    }
  }

  /// Get text style based on size
  TextStyle _getTextStyle(BuildContext context) {
    switch (size) {
      case AppButtonSize.small:
        return AppTextStyles.buttonSmall;
      case AppButtonSize.medium:
        return AppTextStyles.buttonMedium;
      case AppButtonSize.large:
        return AppTextStyles.buttonLarge;
    }
  }
}

/// Button style variants
enum AppButtonVariant {
  /// Primary button - main actions (uses primary color)
  primary,

  /// Secondary button - secondary actions (uses secondary color)
  secondary,

  /// Tertiary button - text only (transparent background)
  tertiary,

  /// Outlined button - outlined style with transparent background
  outlined,
}

/// Button size variants
enum AppButtonSize {
  /// Small button (36dp height)
  small,

  /// Medium button (44dp height) - default
  medium,

  /// Large button (52dp height)
  large,
}

/// Internal class for button color configuration
class _ButtonColors {
  const _ButtonColors({
    required this.background,
    required this.foreground,
    this.border,
  });
  final Color background;
  final Color foreground;
  final Color? border;
}

/// Internal class for button size configuration
class _ButtonSizes {
  const _ButtonSizes({
    required this.height,
    required this.padding,
  });
  final double height;
  final EdgeInsets padding;
}
