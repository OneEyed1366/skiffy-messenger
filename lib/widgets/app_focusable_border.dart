import 'package:dotted_border/dotted_border.dart';
import 'package:flutter/material.dart';
import 'package:skiffy/app/design_system/design_system.dart';

// Enum остается без изменений
enum SemanticRole { primary, warning, error, info, success, secondary }

class AppFocusableBorder extends StatelessWidget {
  const AppFocusableBorder({
    required this.child,
    required this.isFocused,
    super.key,
    this.role = SemanticRole.primary,
    this.borderRadius = 12.0, // Дефолтный радиус
  });

  final Widget child;
  final bool isFocused;
  final SemanticRole role;
  // Добавляем радиус скругления как параметр
  final double borderRadius;

  @override
  Widget build(BuildContext context) {
    if (!isFocused) {
      return child;
    }

    switch (role) {
      case SemanticRole.warning:
      case SemanticRole.error:
        // Для Warning и Error используем DottedBorder
        final focusColor = (role == SemanticRole.warning)
            ? AppColors.warningFocus
            : AppColors.errorFocus;

        return DottedBorder(
          options: RectDottedBorderOptions(
            color: focusColor,
            strokeWidth: 2,
            dashPattern: const [4, 4],
          ),
          child: child,
        );

      // ignore: no_default_cases Для всех остальных (Primary, Secondary, Info, Success) используем сплошную линию
      default:
        Color focusColor;
        switch (role) {
          case SemanticRole.secondary:
            focusColor = AppColors.secondaryFocus;
          case SemanticRole.info:
            focusColor = AppColors.infoFocus;
          case SemanticRole.success:
            focusColor = AppColors.successFocus;
          case SemanticRole.primary:
          // ignore: no_default_cases Primary
          default:
            focusColor = AppColors.primaryFocus;
        }

        return Container(
          decoration: BoxDecoration(
            border: Border.all(
              color: focusColor,
              width: 2,
            ),
            borderRadius: BorderRadius.circular(borderRadius),
          ),
          child: child,
        );
    }
  }
}
