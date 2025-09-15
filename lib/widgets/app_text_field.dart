import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:skiffy/app/design_system/typography.dart';
import 'package:skiffy/l10n/l10n.dart';
import 'package:skiffy/widgets/app_focusable_border.dart';

/// Premium text field component for SkiffyMessenger
///
/// Provides a consistent, accessible text input implementation following
/// the design system specifications. All text fields are wrapped with
/// FocusableBorder for WCAG compliance and keyboard navigation.
///
/// Features:
/// - Multiple text field variants (filled, outlined)
/// - Icon support (leading and trailing)
/// - Error state handling
/// - Password visibility toggle
/// - Character counter
/// - Input validation
/// - Accessibility compliance
/// - Proper focus management
class AppTextField extends StatefulWidget {
  const AppTextField({
    super.key,
    this.initialValue,
    this.controller,
    this.labelText,
    this.hintText,
    this.helperText,
    this.errorText,
    this.leadingIcon,
    this.trailingIcon,
    this.isPassword = false,
    this.isMultiline = false,
    this.maxLines,
    this.maxLength,
    this.keyboardType = TextInputType.text,
    this.textInputAction = TextInputAction.done,
    this.inputFormatters,
    this.validator,
    this.onChanged,
    this.onSubmitted,
    this.onTap,
    this.enabled = true,
    this.readOnly = false,
    this.showCounter = false,
    this.variant = AppTextFieldVariant.filled,
    this.focusNode,
    this.autofocus = false,
    this.textCapitalization = TextCapitalization.none,
    this.textAlign = TextAlign.start,
    this.semanticLabel,
  }) : assert(
         controller == null || initialValue == null,
         'Cannot provide both controller and initialValue',
       );

  /// Create a filled text field (default)
  const AppTextField.filled({
    super.key,
    this.initialValue,
    this.controller,
    this.labelText,
    this.hintText,
    this.helperText,
    this.errorText,
    this.leadingIcon,
    this.trailingIcon,
    this.isPassword = false,
    this.isMultiline = false,
    this.maxLines,
    this.maxLength,
    this.keyboardType = TextInputType.text,
    this.textInputAction = TextInputAction.done,
    this.inputFormatters,
    this.validator,
    this.onChanged,
    this.onSubmitted,
    this.onTap,
    this.enabled = true,
    this.readOnly = false,
    this.showCounter = false,
    this.focusNode,
    this.autofocus = false,
    this.textCapitalization = TextCapitalization.none,
    this.textAlign = TextAlign.start,
    this.semanticLabel,
  }) : variant = AppTextFieldVariant.filled;

  /// Create an outlined text field
  const AppTextField.outlined({
    super.key,
    this.initialValue,
    this.controller,
    this.labelText,
    this.hintText,
    this.helperText,
    this.errorText,
    this.leadingIcon,
    this.trailingIcon,
    this.isPassword = false,
    this.isMultiline = false,
    this.maxLines,
    this.maxLength,
    this.keyboardType = TextInputType.text,
    this.textInputAction = TextInputAction.done,
    this.inputFormatters,
    this.validator,
    this.onChanged,
    this.onSubmitted,
    this.onTap,
    this.enabled = true,
    this.readOnly = false,
    this.showCounter = false,
    this.focusNode,
    this.autofocus = false,
    this.textCapitalization = TextCapitalization.none,
    this.textAlign = TextAlign.start,
    this.semanticLabel,
  }) : variant = AppTextFieldVariant.outlined;

  /// Create a password text field
  const AppTextField.password({
    super.key,
    this.initialValue,
    this.controller,
    this.labelText,
    this.hintText,
    this.helperText,
    this.errorText,
    this.leadingIcon,
    this.variant = AppTextFieldVariant.filled,
    this.keyboardType = TextInputType.visiblePassword,
    this.textInputAction = TextInputAction.done,
    this.inputFormatters,
    this.validator,
    this.onChanged,
    this.onSubmitted,
    this.onTap,
    this.enabled = true,
    this.readOnly = false,
    this.focusNode,
    this.autofocus = false,
    this.textCapitalization = TextCapitalization.none,
    this.semanticLabel,
  }) : isPassword = true,
       trailingIcon = null,
       isMultiline = false,
       maxLines = 1,
       maxLength = null,
       showCounter = false,
       textAlign = TextAlign.start;

  /// Create a search text field
  const AppTextField.search({
    super.key,
    this.initialValue,
    this.controller,
    this.hintText,
    this.helperText,
    this.errorText,
    this.trailingIcon,
    this.variant = AppTextFieldVariant.filled,
    this.textInputAction = TextInputAction.search,
    this.inputFormatters,
    this.onChanged,
    this.onSubmitted,
    this.onTap,
    this.enabled = true,
    this.readOnly = false,
    this.focusNode,
    this.autofocus = false,
    this.semanticLabel,
  }) : labelText = null,
       leadingIcon = const Icon(Icons.search),
       isPassword = false,
       isMultiline = false,
       maxLines = 1,
       maxLength = null,
       keyboardType = TextInputType.text,
       validator = null,
       showCounter = false,
       textCapitalization = TextCapitalization.none,
       textAlign = TextAlign.start;

  /// Initial text value
  final String? initialValue;

  /// Controller for the text field
  final TextEditingController? controller;

  /// Label text displayed above/inside the field
  final String? labelText;

  /// Hint text shown when field is empty
  final String? hintText;

  /// Helper text shown below the field
  final String? helperText;

  /// Error text shown when validation fails
  final String? errorText;

  /// Icon displayed at the start of the field
  final Widget? leadingIcon;

  /// Icon displayed at the end of the field
  final Widget? trailingIcon;

  /// Whether this is a password field
  final bool isPassword;

  /// Whether this is a multiline field
  final bool isMultiline;

  /// Maximum number of lines (null for unlimited)
  final int? maxLines;

  /// Maximum number of characters
  final int? maxLength;

  /// Text input type
  final TextInputType keyboardType;

  /// Text input action
  final TextInputAction textInputAction;

  /// Input formatters
  final List<TextInputFormatter>? inputFormatters;

  /// Validation function
  final String? Function(String?)? validator;

  /// Callback when text changes
  final ValueChanged<String>? onChanged;

  /// Callback when editing is complete
  final ValueChanged<String>? onSubmitted;

  /// Callback when field is tapped
  final VoidCallback? onTap;

  /// Whether the field is enabled
  final bool enabled;

  /// Whether the field is read-only
  final bool readOnly;

  /// Whether to show character counter
  final bool showCounter;

  /// Text field variant
  final AppTextFieldVariant variant;

  /// Custom focus node
  final FocusNode? focusNode;

  /// Auto focus on widget creation
  final bool autofocus;

  /// Text capitalization behavior
  final TextCapitalization textCapitalization;

  /// Text alignment
  final TextAlign textAlign;

  /// Semantic label for accessibility
  final String? semanticLabel;

  @override
  State<AppTextField> createState() => _AppTextFieldState();
}

class _AppTextFieldState extends State<AppTextField> {
  late TextEditingController _controller;
  late FocusNode _focusNode;
  bool _obscurePassword = true;
  bool _isFocused = false;

  @override
  void initState() {
    super.initState();
    _controller = widget.controller ?? TextEditingController();
    _focusNode = widget.focusNode ?? FocusNode();

    if (widget.initialValue != null) {
      _controller.text = widget.initialValue!;
    }

    _focusNode.addListener(_handleFocusChanged);
  }

  @override
  void dispose() {
    _focusNode.removeListener(_handleFocusChanged);
    if (widget.controller == null) {
      _controller.dispose();
    }
    if (widget.focusNode == null) {
      _focusNode.dispose();
    }
    super.dispose();
  }

  void _handleFocusChanged() {
    setState(() {
      _isFocused = _focusNode.hasFocus;
    });
  }

  void _togglePasswordVisibility() {
    setState(() {
      _obscurePassword = !_obscurePassword;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    var trailingIcon = widget.trailingIcon ?? const SizedBox.shrink();

    // Add password visibility toggle for password fields
    if (widget.isPassword) {
      trailingIcon = IconButton(
        onPressed: _togglePasswordVisibility,
        icon: Icon(
          _obscurePassword ? Icons.visibility : Icons.visibility_off,
          size: 20,
        ),
        padding: EdgeInsets.zero,
        constraints: const BoxConstraints(minWidth: 40, minHeight: 40),
        tooltip: _obscurePassword
            ? context.l10n.textFieldShowPassword
            : context.l10n.textFieldHidePassword,
      );
    }

    final textField = TextFormField(
      controller: _controller,
      focusNode: _focusNode,
      obscureText: widget.isPassword ? _obscurePassword : false,
      maxLines: widget.isMultiline
          ? (widget.maxLines ?? 5)
          : (widget.isPassword ? 1 : widget.maxLines ?? 1),
      maxLength: widget.maxLength,
      keyboardType: widget.keyboardType,
      textInputAction: widget.textInputAction,
      inputFormatters: widget.inputFormatters,
      validator: widget.validator,
      onChanged: widget.onChanged,
      onFieldSubmitted: widget.onSubmitted,
      onTap: widget.onTap,
      enabled: widget.enabled,
      readOnly: widget.readOnly,
      autofocus: widget.autofocus,
      textCapitalization: widget.textCapitalization,
      textAlign: widget.textAlign,
      style: AppTextStyles.bodyMedium.copyWith(
        color: widget.enabled
            ? colorScheme.onSurface
            : colorScheme.onSurface.withOpacity(0.6),
      ),
      decoration: _buildInputDecoration(context, trailingIcon),
    );

    // Wrap with FocusableBorder for accessibility
    // Note: Don't pass focusNode to avoid circular reference since TextFormField already has it
    Widget result = AppFocusableBorderFactory.forTextField(
      child: textField,
      semanticLabel: widget.semanticLabel ?? widget.labelText,
      semanticHint: widget.hintText,
    );

    // Add character counter if needed
    if (widget.showCounter && widget.maxLength != null) {
      result = Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          result,
          const SizedBox(height: 4),
          ValueListenableBuilder<TextEditingValue>(
            valueListenable: _controller,
            builder: (context, value, child) {
              final currentLength = value.text.length;
              final maxLength = widget.maxLength!;
              final isOverLimit = currentLength > maxLength;

              return Text(
                '$currentLength / $maxLength',
                style: AppTextStyles.labelSmall.copyWith(
                  color: isOverLimit
                      ? colorScheme.error
                      : colorScheme.onSurface.withOpacity(0.6),
                ),
              );
            },
          ),
        ],
      );
    }

    return result;
  }

  InputDecoration _buildInputDecoration(
    BuildContext context,
    Widget trailingIcon,
  ) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    // Determine hint text - use provided hint or default for search field
    String? hintText = widget.hintText;
    if (hintText == null && widget.leadingIcon is Icon && (widget.leadingIcon as Icon).icon == Icons.search) {
      hintText = context.l10n.textFieldSearchHint;
    }

    // Base decoration
    var decoration = InputDecoration(
      labelText: widget.labelText,
      hintText: hintText,
      helperText: widget.helperText,
      errorText: widget.errorText,
      prefixIcon: widget.leadingIcon,
      suffixIcon: trailingIcon,
      contentPadding: const EdgeInsets.symmetric(
        horizontal: 16,
        vertical: 16,
      ),
      counterText: widget.showCounter ? null : '', // Hide default counter
    );

    // Apply variant-specific styling
    switch (widget.variant) {
      case AppTextFieldVariant.filled:
        decoration = decoration.copyWith(
          filled: true,
          fillColor: widget.errorText != null
              ? colorScheme.errorContainer.withOpacity(0.1)
              : _isFocused
              ? colorScheme.primaryContainer.withOpacity(0.1)
              : colorScheme.surfaceContainerHigh,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(
              color: widget.errorText != null
                  ? colorScheme.error
                  : colorScheme.primary,
              width: 2,
            ),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(
              color: colorScheme.error,
            ),
          ),
          focusedErrorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(
              color: colorScheme.error,
              width: 2,
            ),
          ),
        );

      case AppTextFieldVariant.outlined:
        decoration = decoration.copyWith(
          filled: false,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(
              color: colorScheme.outline,
            ),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(
              color: widget.errorText != null
                  ? colorScheme.error
                  : colorScheme.outline,
            ),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(
              color: widget.errorText != null
                  ? colorScheme.error
                  : colorScheme.primary,
              width: 2,
            ),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(
              color: colorScheme.error,
            ),
          ),
          focusedErrorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(
              color: colorScheme.error,
              width: 2,
            ),
          ),
        );
    }

    // Apply text styles
    return decoration.copyWith(
      labelStyle: AppTextStyles.bodyMedium.copyWith(
        color: widget.errorText != null
            ? colorScheme.error
            : colorScheme.onSurfaceVariant,
      ),
      hintStyle: AppTextStyles.bodyMedium.copyWith(
        color: colorScheme.onSurfaceVariant.withOpacity(0.6),
      ),
      helperStyle: AppTextStyles.labelMedium.copyWith(
        color: colorScheme.onSurfaceVariant,
      ),
      errorStyle: AppTextStyles.labelMedium.copyWith(
        color: colorScheme.error,
      ),
    );
  }
}

/// Text field style variants
enum AppTextFieldVariant {
  /// Filled text field with background color
  filled,

  /// Outlined text field with border
  outlined,
}

/// Utility methods for text field validation
class TextFieldValidators {
  TextFieldValidators._();

  /// Validate email address
  static String? email(String? value, BuildContext? context) {
    if (value == null || value.isEmpty) {
      return context?.l10n.validatorEmailRequired ?? 'Enter email address';
    }

    final emailRegex = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    );

    if (!emailRegex.hasMatch(value)) {
      return context?.l10n.validatorEmailInvalid ?? 'Enter valid email address';
    }

    return null;
  }

  /// Validate password
  static String? password(String? value, {int minLength = 8, BuildContext? context}) {
    if (value == null || value.isEmpty) {
      return context?.l10n.validatorPasswordRequired ?? 'Enter password';
    }

    if (value.length < minLength) {
      return context?.l10n.validatorPasswordMinLength(minLength) ?? 'Password must contain at least $minLength characters';
    }

    // Check for at least one uppercase letter
    if (!value.contains(RegExp('[A-Z]'))) {
      return context?.l10n.validatorPasswordUppercase ?? 'Password must contain an uppercase letter';
    }

    // Check for at least one lowercase letter
    if (!value.contains(RegExp('[a-z]'))) {
      return context?.l10n.validatorPasswordLowercase ?? 'Password must contain a lowercase letter';
    }

    // Check for at least one digit
    if (!value.contains(RegExp('[0-9]'))) {
      return context?.l10n.validatorPasswordDigit ?? 'Password must contain a digit';
    }

    return null;
  }

  /// Validate Matrix user ID
  static String? matrixUserId(String? value, BuildContext? context) {
    if (value == null || value.isEmpty) {
      return context?.l10n.validatorMatrixIdRequired ?? 'Enter Matrix ID';
    }

    final matrixIdRegex = RegExp(r'^@[\w.-]+:[\w.-]+$');

    if (!matrixIdRegex.hasMatch(value)) {
      return context?.l10n.validatorMatrixIdInvalid ?? 'Enter valid Matrix ID (@user:server.com)';
    }

    return null;
  }

  /// Validate required field
  static String? required(String? value, {String? fieldName, BuildContext? context}) {
    if (value == null || value.trim().isEmpty) {
      final fieldNameFormatted = fieldName != null ? ' "$fieldName"' : '';
      return context?.l10n.validatorFieldRequired(fieldNameFormatted) ?? 'Field$fieldNameFormatted is required';
    }

    return null;
  }

  /// Validate minimum length
  static String? minLength(String? value, int minLength, {BuildContext? context}) {
    if (value == null || value.isEmpty) {
      return null; // Let required validator handle empty values
    }

    if (value.length < minLength) {
      return context?.l10n.validatorMinLength(minLength) ?? 'Minimum length: $minLength characters';
    }

    return null;
  }

  /// Validate maximum length
  static String? maxLength(String? value, int maxLength, {BuildContext? context}) {
    if (value == null || value.isEmpty) {
      return null;
    }

    if (value.length > maxLength) {
      return context?.l10n.validatorMaxLength(maxLength) ?? 'Maximum length: $maxLength characters';
    }

    return null;
  }

  /// Combine multiple validators
  static String? Function(String?) combine(
    List<String? Function(String?)> validators,
  ) {
    return (String? value) {
      for (final validator in validators) {
        final result = validator(value);
        if (result != null) {
          return result;
        }
      }
      return null;
    };
  }
}
