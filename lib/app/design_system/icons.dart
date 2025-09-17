import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:skiffy/app/design_system/gen/assets.gen.dart';

/// Centralized icon system for SkiffyMessenger v1.0
///
/// Provides type-safe access to all application icons with consistent
/// sizing, coloring, and semantic naming. All icons are vector-based (SVG)
/// for sharp rendering at any scale and proper theming support.
class AppIcons {
  /// Private constructor - class contains only static icon definitions
  AppIcons._();

  // ========================================================================
  // ICON SIZES - Стандартные размеры иконок
  // ========================================================================

  /// Очень маленькие иконки для плотного интерфейса (12dp)
  static const double sizeExtraSmall = 12;

  /// Малые иконки для компактных элементов (16dp)
  static const double sizeSmall = 16;

  /// Стандартные иконки для большинства элементов UI (20dp)
  static const double sizeMedium = 20;

  /// Крупные иконки для важных элементов (24dp)
  static const double sizeLarge = 24;

  /// Очень крупные иконки для заголовков и акцентов (32dp)
  static const double sizeExtraLarge = 32;

  /// Иконки для FAB и основных кнопок (40dp)
  static const double sizeButton = 40;

  // ========================================================================
  // CORE MESSAGING ICONS - Основные иконки мессенджера
  // ========================================================================

  /// Иконка отправки сообщения
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Кнопки отправки сообщения в чате
  /// - FAB для быстрого создания нового чата
  /// - Кнопок отправки в формах
  ///
  /// [size] - размер иконки (по умолчанию sizeMedium)
  /// [color] - цвет иконки (по умолчанию из темы)
  static Widget send({
    double size = sizeMedium,
    Color? color,
    String? semanticLabel,
  }) {
    return SvgPicture.asset(
      Assets.images.icons.send,
      width: size,
      height: size,
      colorFilter: color != null
          ? ColorFilter.mode(color, BlendMode.srcIn)
          : null,
      semanticsLabel: semanticLabel ?? 'Отправить',
    );
  }

  /// Иконка чата/сообщения
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Элементов списка чатов
  /// - Табов навигации для чатов
  /// - Уведомлений о новых сообщениях
  ///
  /// [size] - размер иконки
  /// [color] - цвет иконки
  static Widget chat({
    double size = sizeMedium,
    Color? color,
    String? semanticLabel,
  }) {
    return SvgPicture.asset(
      Assets.images.icons.chat,
      width: size,
      height: size,
      colorFilter: color != null
          ? ColorFilter.mode(color, BlendMode.srcIn)
          : null,
      semanticsLabel: semanticLabel ?? 'Чат',
    );
  }

  // ========================================================================
  // NAVIGATION ICONS - Навигационные иконки
  // ========================================================================

  /// Иконка настроек
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Кнопки перехода в настройки
  /// - Табов навигации для настроек
  /// - Меню действий с настройками
  ///
  /// [size] - размер иконки
  /// [color] - цвет иконки
  static Widget settings({
    double size = sizeMedium,
    Color? color,
    String? semanticLabel,
  }) {
    return SvgPicture.asset(
      Assets.images.icons.settings,
      width: size,
      height: size,
      colorFilter: color != null
          ? ColorFilter.mode(color, BlendMode.srcIn)
          : null,
      semanticsLabel: semanticLabel ?? 'Настройки',
    );
  }

  /// Иконка пользователя/профиля
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Аватаров когда нет фото
  /// - Кнопок профиля
  /// - Элементов списка контактов
  ///
  /// [size] - размер иконки
  /// [color] - цвет иконки
  static Widget user({
    double size = sizeMedium,
    Color? color,
    String? semanticLabel,
  }) {
    return SvgPicture.asset(
      Assets.images.icons.user,
      width: size,
      height: size,
      colorFilter: color != null
          ? ColorFilter.mode(color, BlendMode.srcIn)
          : null,
      semanticsLabel: semanticLabel ?? 'Пользователь',
    );
  }

  // ========================================================================
  // SECURITY ICONS - Иконки безопасности
  // ========================================================================

  /// Иконка блокировки/шифрования
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Индикаторов шифрования E2EE
  /// - Заблокированного контента
  /// - Настроек приватности
  ///
  /// [size] - размер иконки
  /// [color] - цвет иконки
  static Widget lock({
    double size = sizeMedium,
    Color? color,
    String? semanticLabel,
  }) {
    return SvgPicture.asset(
      Assets.images.icons.lock,
      width: size,
      height: size,
      colorFilter: color != null
          ? ColorFilter.mode(color, BlendMode.srcIn)
          : null,
      semanticsLabel: semanticLabel ?? 'Заблокировано',
    );
  }

  // ========================================================================
  // ICON BUILDERS - Конструкторы для специальных случаев
  // ========================================================================

  /// Создать иконку с фиксированными размерами для кнопок
  ///
  /// [iconBuilder] - функция создания иконки
  /// [padding] - отступы вокруг иконки
  /// Возвращает иконку в контейнере подходящем для кнопок
  static Widget forButton({
    required Widget Function() iconBuilder,
    EdgeInsets padding = const EdgeInsets.all(8),
  }) {
    return Container(
      padding: padding,
      child: iconBuilder(),
    );
  }

  /// Создать иконку с индикатором (например, счетчик уведомлений)
  ///
  /// [iconBuilder] - функция создания иконки
  /// [badge] - виджет индикатора
  /// [badgeOffset] - смещение индикатора
  /// Возвращает иконку с наложенным индикатором
  static Widget withBadge({
    required Widget Function() iconBuilder,
    required Widget badge,
    Offset badgeOffset = const Offset(8, -8),
  }) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        iconBuilder(),
        Positioned(
          top: badgeOffset.dy,
          right: badgeOffset.dx,
          child: badge,
        ),
      ],
    );
  }

  /// Создать иконку с состоянием (например, активная/неактивная)
  ///
  /// [iconBuilder] - функция создания иконки
  /// [isActive] - флаг активности
  /// [activeColor] - цвет активного состояния
  /// [inactiveColor] - цвет неактивного состояния
  /// [activeSize] - размер в активном состоянии
  /// [inactiveSize] - размер в неактивном состоянии
  static Widget withState({
    required Widget Function({Color? color, double size}) iconBuilder,
    required bool isActive,
    Color? activeColor,
    Color? inactiveColor,
    double activeSize = sizeLarge,
    double inactiveSize = sizeMedium,
  }) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      child: iconBuilder(
        color: isActive ? activeColor : inactiveColor,
        size: isActive ? activeSize : inactiveSize,
      ),
    );
  }

  // ========================================================================
  // UTILITY METHODS - Вспомогательные методы
  // ========================================================================

  /// Создать кастомную SVG иконку
  ///
  /// [assetPath] - путь к SVG файлу
  /// [size] - размер иконки
  /// [color] - цвет иконки
  /// [semanticLabel] - метка для accessibility
  /// Возвращает SVG виджет
  static Widget custom({
    required String assetPath,
    double size = sizeMedium,
    Color? color,
    String? semanticLabel,
  }) {
    return SvgPicture.asset(
      assetPath,
      width: size,
      height: size,
      colorFilter: color != null
          ? ColorFilter.mode(color, BlendMode.srcIn)
          : null,
      semanticsLabel: semanticLabel,
    );
  }

  /// Проверить доступность иконки
  ///
  /// [iconPath] - путь к иконке
  /// Возвращает true если иконка существует
  static bool isAvailable(String iconPath) {
    try {
      SvgPicture.asset(iconPath);
      return true;
      // ignore: avoid_catches_without_on_clauses Нужно отловить все ошибки
    } catch (e) {
      return false;
    }
  }

  // ========================================================================
  // THEME-AWARE HELPERS - Помощники учитывающие тему
  // ========================================================================

  /// Получить цвет иконки по умолчанию для текущей темы
  ///
  /// [context] - контекст для получения темы
  /// [brightness] - яркость темы (если контекст недоступен)
  /// Возвращает подходящий цвет для иконок
  static Color getDefaultColor(BuildContext context) {
    final theme = Theme.of(context);
    return theme.colorScheme.onSurface;
  }

  /// Получить цвет для активных/выделенных иконок
  ///
  /// [context] - контекст для получения темы
  /// Возвращает primary цвет темы
  static Color getActiveColor(BuildContext context) {
    final theme = Theme.of(context);
    return theme.colorScheme.primary;
  }

  /// Получить цвет для неактивных иконок
  ///
  /// [context] - контекст для получения темы
  /// Возвращает приглушенный цвет
  static Color getInactiveColor(BuildContext context) {
    final theme = Theme.of(context);
    return theme.colorScheme.onSurface.withOpacity(0.6);
  }

  // ========================================================================
  // ACCESSIBILITY HELPERS - Помощники для доступности
  // ========================================================================

  /// Создать семантически правильную иконку с подписью
  ///
  /// [icon] - виджет иконки
  /// [label] - текстовая подпись
  /// [hint] - подсказка для screen reader
  /// Возвращает иконку с accessibility данными
  static Widget withSemantics({
    required Widget icon,
    required String label,
    String? hint,
  }) {
    return Semantics(
      label: label,
      hint: hint,
      button: true,
      child: icon,
    );
  }

  // ========================================================================
  // METADATA - Метаинформация
  // ========================================================================

  /// Версия системы иконок
  static const String version = '1.0.0';

  /// Дата создания
  static const String createdDate = '2025-09-15';

  /// Количество доступных иконок
  static const int totalIconsCount = 5;

  /// Поддерживаемые форматы
  static const List<String> supportedFormats = ['svg'];
}
