import 'package:dotted_border/dotted_border.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:skiffy/app/design_system/colors.dart';

/// Accessibility-compliant focusable border widget
///
/// Provides visual focus indicators for all interactive elements
/// in accordance with WCAG guidelines. This widget MUST wrap all
/// interactive components in the UI kit to ensure keyboard navigation
/// and screen reader compatibility.
///
/// Features:
/// - Dotted border on focus for high visibility
/// - Customizable focus colors following design system
/// - Supports semantic labeling and hints
/// - Hover states for desktop/tablet interactions
/// - Proper focus management and keyboard navigation
class AppFocusableBorder extends StatefulWidget {
  const AppFocusableBorder({
    required this.child,
    super.key,
    this.focusColor,
    this.borderWidth = 2.0,
    this.borderRadius,
    this.padding = const EdgeInsets.all(2),
    this.canFocus = true,
    this.onFocusChanged,
    this.onHoverChanged,
    this.onTap,
    this.semanticLabel,
    this.semanticHint,
    this.isButton = false,
    this.hoverColor,
    this.animationDuration = const Duration(milliseconds: 150),
    this.focusNode,
  });

  /// The child widget to wrap with focusable border
  final Widget child;

  /// Color of the focus border (defaults to primary focus color)
  final Color? focusColor;

  /// Width of the focus border stroke
  final double borderWidth;

  /// Border radius for rounded corners
  final BorderRadius? borderRadius;

  /// Padding inside the border
  final EdgeInsets padding;

  /// Whether this widget can receive focus
  final bool canFocus;

  /// Callback when focus state changes
  final ValueChanged<bool>? onFocusChanged;

  /// Callback when hover state changes (desktop/tablet)
  final ValueChanged<bool>? onHoverChanged;

  /// Callback when the widget is tapped
  final VoidCallback? onTap;

  /// Semantic label for screen readers
  final String? semanticLabel;

  /// Semantic hint for screen readers
  final String? semanticHint;

  /// Whether this represents a button for semantic purposes
  final bool isButton;

  /// Hover color for desktop interactions
  final Color? hoverColor;

  /// Duration of focus animations
  final Duration animationDuration;

  /// Custom focus node (optional)
  final FocusNode? focusNode;

  @override
  State<AppFocusableBorder> createState() => _AppFocusableBorderState();
}

class _AppFocusableBorderState extends State<AppFocusableBorder> {
  late FocusNode _focusNode;
  bool _isFocused = false;
  bool _isHovered = false;

  @override
  void initState() {
    super.initState();
    _focusNode = widget.focusNode ?? FocusNode();
    _focusNode.addListener(_handleFocusChanged);
  }

  @override
  void dispose() {
    _focusNode.removeListener(_handleFocusChanged);
    if (widget.focusNode == null) {
      _focusNode.dispose();
    }
    super.dispose();
  }

  void _handleFocusChanged() {
    final isFocused = _focusNode.hasFocus;
    if (_isFocused != isFocused) {
      setState(() {
        _isFocused = isFocused;
      });
      widget.onFocusChanged?.call(isFocused);
    }
  }

  void _handleHoverChanged(bool isHovered) {
    if (_isHovered != isHovered) {
      setState(() {
        _isHovered = isHovered;
      });
      widget.onHoverChanged?.call(isHovered);
    }
  }

  void _handleTap() {
    if (widget.canFocus && !_focusNode.hasFocus) {
      _focusNode.requestFocus();
    }
    widget.onTap?.call();
  }

  Color _getFocusColor(BuildContext context) {
    if (widget.focusColor != null) {
      return widget.focusColor!;
    }

    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    // Используем primary focus color из дизайн-системы
    return isDark
        ? const Color(
            0xFFFFCC99,
          ) // primaryFocus для темной темы (более светлый)
        : AppColors.primaryFocus; // primaryFocus для светлой темы
  }

  Color? _getHoverColor(BuildContext context) {
    if (widget.hoverColor != null) {
      return widget.hoverColor;
    }

    if (!_isHovered) return null;

    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    // Легкий hover эффект
    return isDark
        ? AppColors.primaryHover.withOpacity(
            0.1,
          ) // Светлый янтарный с прозрачностью
        : AppColors.primaryHover.withOpacity(0.1);
  }

  @override
  Widget build(BuildContext context) {
    final focusColor = _getFocusColor(context);
    final hoverColor = _getHoverColor(context);

    var content = widget.child;

    // Добавляем hover эффект если нужно
    if (hoverColor != null) {
      content = Container(
        decoration: BoxDecoration(
          color: hoverColor,
          borderRadius: widget.borderRadius ?? BorderRadius.circular(8),
        ),
        child: content,
      );
    }

    // Оборачиваем в фокусируемый контейнер если может фокусироваться
    if (widget.canFocus) {
      content = Focus(
        focusNode: _focusNode,
        child: content,
      );
    }

    // Добавляем обработчики жестов
    content = GestureDetector(
      onTap: widget.onTap != null ? _handleTap : null,
      child: MouseRegion(
        onEnter: (_) => _handleHoverChanged(true),
        onExit: (_) => _handleHoverChanged(false),
        child: content,
      ),
    );

    // Добавляем фокусную рамку когда в фокусе
    if (_isFocused) {
      content = AnimatedContainer(
        duration: widget.animationDuration,
        child: DottedBorder(
          options: RectDottedBorderOptions(
            color: focusColor,
            strokeWidth: widget.borderWidth,
            dashPattern: const [4, 2], // Пунктирная линия для четкой видимости
          ),

          child: Container(
            padding: widget.padding,
            child: content,
          ),
        ),
      );
    } else {
      content = Container(
        padding: widget.padding,
        child: content,
      );
    }

    // Оборачиваем в семантику для accessibility
    if (widget.semanticLabel != null ||
        widget.semanticHint != null ||
        widget.isButton) {
      content = Semantics(
        label: widget.semanticLabel,
        hint: widget.semanticHint,
        button: widget.isButton,
        focusable: widget.canFocus,
        focused: _isFocused,
        child: content,
      );
    }

    return content;
  }
}

/// Удобные конструкторы для типовых случаев использования
extension AppFocusableBorderFactory on AppFocusableBorder {
  /// Создать фокусируемую рамку для кнопки
  static AppFocusableBorder forButton({
    required Widget child,
    required VoidCallback? onPressed,
    Key? key,
    String? semanticLabel,
    Color? focusColor,
    FocusNode? focusNode,
  }) {
    return AppFocusableBorder(
      key: key,
      onTap: onPressed,
      isButton: true,
      semanticLabel: semanticLabel,
      focusColor: focusColor,
      focusNode: focusNode,
      canFocus: onPressed != null,
      borderRadius: BorderRadius.circular(12),
      child: child,
    );
  }

  /// Создать фокусируемую рамку для текстового поля
  static AppFocusableBorder forTextField({
    required Widget child,
    Key? key,
    String? semanticLabel,
    String? semanticHint,
    Color? focusColor,
    FocusNode? focusNode,
  }) {
    return AppFocusableBorder(
      key: key,
      semanticLabel: semanticLabel,
      semanticHint: semanticHint,
      focusColor: focusColor,
      focusNode: focusNode,
      padding: const EdgeInsets.all(1),
      borderRadius: BorderRadius.circular(12),
      borderWidth: 1.5,
      child: child,
    );
  }

  /// Создать фокусируемую рамку для элемента списка
  static AppFocusableBorder forListItem({
    required Widget child,
    required VoidCallback? onTap,
    Key? key,
    String? semanticLabel,
    Color? focusColor,
    Color? hoverColor,
  }) {
    return AppFocusableBorder(
      key: key,
      onTap: onTap,
      semanticLabel: semanticLabel,
      focusColor: focusColor,
      hoverColor: hoverColor,
      canFocus: onTap != null,
      padding: const EdgeInsets.all(1),
      borderRadius: BorderRadius.circular(8),
      borderWidth: 1.5,
      child: child,
    );
  }

  /// Создать фокусируемую рамку для карточки
  static AppFocusableBorder forCard({
    required Widget child,
    Key? key,
    VoidCallback? onTap,
    String? semanticLabel,
    Color? focusColor,
    Color? hoverColor,
    FocusNode? focusNode,
  }) {
    return AppFocusableBorder(
      key: key,
      onTap: onTap,
      semanticLabel: semanticLabel,
      focusColor: focusColor,
      hoverColor: hoverColor,
      canFocus: onTap != null,
      borderRadius: BorderRadius.circular(16),
      child: child,
    );
  }
}

/// Utility class для работы с фокусом
class FocusUtils {
  FocusUtils._();

  /// Проверить поддерживает ли платформа hover
  static bool get supportsHover {
    return defaultTargetPlatform == TargetPlatform.windows ||
        defaultTargetPlatform == TargetPlatform.macOS ||
        defaultTargetPlatform == TargetPlatform.linux;
  }

  /// Получить следующий фокусируемый элемент
  static void focusNext(BuildContext context) {
    FocusScope.of(context).nextFocus();
  }

  /// Получить предыдущий фокусируемый элемент
  static void focusPrevious(BuildContext context) {
    FocusScope.of(context).previousFocus();
  }

  /// Убрать фокус со всех элементов
  static void unfocus(BuildContext context) {
    FocusScope.of(context).unfocus();
  }

  /// Запросить фокус для конкретного узла
  static void requestFocus(BuildContext context, FocusNode focusNode) {
    FocusScope.of(context).requestFocus(focusNode);
  }
}
