import 'package:flutter/material.dart';
import 'package:skiffy/app/config/constants.dart';
import 'package:skiffy/l10n/l10n.dart';
import 'package:skiffy/utils/validators/homeserver_validator.dart';
import 'package:skiffy/widgets/app_text_field.dart';

/// Server input widget for homeserver URL configuration
///
/// Provides a specialized text field for entering Matrix homeserver URLs
/// with built-in validation and proper styling following the design system.
class ServerInput extends StatefulWidget {
  /// Creates a server input widget
  const ServerInput({
    super.key,
    this.controller,
    this.onChanged,
    this.errorText,
    this.enabled = true,
    this.autofocus = false,
  });

  /// Text editing controller for the input
  final TextEditingController? controller;

  /// Called when the input value changes
  final ValueChanged<String>? onChanged;

  /// Error text to display below the field
  final String? errorText;

  /// Whether the field is enabled
  final bool enabled;

  /// Whether to auto-focus this field
  final bool autofocus;

  @override
  State<ServerInput> createState() => _ServerInputState();
}

class _ServerInputState extends State<ServerInput> {
  late TextEditingController _controller;
  bool _isControllerOwned = false;

  @override
  void initState() {
    super.initState();
    if (widget.controller == null) {
      _controller = TextEditingController(text: AppConstants.defaultHomeserver);
      _isControllerOwned = true;
    } else {
      _controller = widget.controller!;
    }
  }

  @override
  void dispose() {
    if (_isControllerOwned) {
      _controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    return AppTextField.outlined(
      controller: _controller,
      labelText: l10n.homeserverUrlLabel,
      hintText: l10n.homeserverUrlPlaceholder,
      helperText: l10n.homeserverUrlHint,
      errorText: widget.errorText,
      keyboardType: TextInputType.url,
      textInputAction: TextInputAction.done,
      enabled: widget.enabled,
      autofocus: widget.autofocus,
      validator: (value) => HomeserverValidator.validate(value, l10n),
      onChanged: widget.onChanged,
      semanticLabel: l10n.homeserverUrlLabel,
    );
  }
}
