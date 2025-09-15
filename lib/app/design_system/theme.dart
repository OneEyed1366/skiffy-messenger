import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:skiffy/app/design_system/colors.dart';
import 'package:skiffy/app/design_system/typography.dart';

/// Comprehensive theming system for SkiffyMessenger v1.0
///
/// Provides complete light and dark themes with strict adherence to
/// the UI specification. Excludes Material You/Dynamic Color as required.
/// Uses graphite background (#1C1C1E) for dark theme as specified.
class AppTheme {
  /// Private constructor - class contains only static theme definitions
  AppTheme._();

  // ========================================================================
  // LIGHT THEME - Светлая тема
  // ========================================================================

  /// Светлая тема приложения
  ///
  /// ХАРАКТЕРИСТИКИ:
  /// - Белый/светлый фон для основного контента
  /// - Янтарный primary color для ключевых действий
  /// - Теаловый secondary для навигации
  /// - Высокий контраст для читаемости
  static ThemeData get lightTheme {
    return ThemeData(
      // Отключаем Material You и Dynamic Color
      useMaterial3: true,

      // Основная цветовая схема
      colorScheme: const ColorScheme.light(
        // Primary colors
        primary: AppColors.primary,
        primaryContainer: AppColors.primaryContainer,
        onPrimaryContainer: AppColors.onPrimaryContainer,

        // Secondary colors
        secondary: AppColors.secondary,
        onSecondary: AppColors.onSecondary,
        secondaryContainer: AppColors.secondaryContainer,
        onSecondaryContainer: AppColors.onSecondaryContainer,

        // Surface colors (фон приложения)
        surface: Color(0xFFFFFBFF), // Очень светлый теплый белый
        onSurface: Color(0xFF1C1B1F), // Темный текст
        surfaceContainerHighest: Color(0xFFE6E1E5), // Приподнятые элементы
        surfaceContainerHigh: Color(0xFFECE6F0), // Карточки
        surfaceContainer: Color(0xFFF2EDF1), // Контейнеры
        surfaceContainerLow: Color(0xFFF7F2FA), // Низкие элементы
        surfaceContainerLowest: Color(0xFFFFFFFF), // Текст на фоне
        // Error colors
        error: AppColors.error,
        errorContainer: AppColors.errorContainer,
        onErrorContainer: AppColors.onErrorContainer,

        // Outline colors
        outline: Color(0xFF79747E), // Границы
        outlineVariant: Color(0xFFCAC4D0), // Слабые границы
        shadow: Color(0xFF000000), // Тени
        scrim: Color(0xFF000000), // Затемнения модалов
        inverseSurface: Color(0xFF313033), // Обратная поверхность
        onInverseSurface: Color(0xFFF4EFF4), // Текст на обратной поверхности
        inversePrimary: Color(0xFFFFB784), // Обратный primary
      ),

      // Настройка AppBar
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.primaryContainer,
        foregroundColor: AppColors.onPrimaryContainer,
        elevation: 2,
        shadowColor: Color(0x1A000000),
        surfaceTintColor: Colors.transparent, // Отключаем tinting
        systemOverlayStyle: SystemUiOverlayStyle.dark,
        titleTextStyle: TextStyle(
          color: AppColors.onPrimaryContainer,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
      ),

      // Настройка текстовой темы
      textTheme: _buildTextTheme(
        baseColor: const Color(0xFF1C1B1F),
        displayColor: const Color(0xFF1C1B1F),
      ),

      // Настройка кнопок
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.onPrimary,
          elevation: 2,
          shadowColor: const Color(0x1A000000),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: AppTextStyles.buttonMedium,
        ),
      ),

      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.secondary,
          textStyle: AppTextStyles.buttonMedium,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primary,
          side: const BorderSide(color: AppColors.primary, width: 1.5),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: AppTextStyles.buttonMedium,
        ),
      ),

      // Настройка карточек
      cardTheme: const CardThemeData(
        color: Color(0xFFF7F2FA),
        surfaceTintColor: Colors.transparent,
        elevation: 1,
        shadowColor: Color(0x0A000000),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(16)),
        ),
        margin: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      ),

      // Настройка полей ввода
      inputDecorationTheme: const InputDecorationTheme(
        filled: true,
        fillColor: Color(0xFFF7F2FA),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
          borderSide: BorderSide(color: Color(0xFFCAC4D0)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
          borderSide: BorderSide(color: Color(0xFFCAC4D0)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
          borderSide: BorderSide(color: AppColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
          borderSide: BorderSide(color: AppColors.error),
        ),
        labelStyle: TextStyle(color: Color(0xFF49454F)),
        hintStyle: TextStyle(color: Color(0xFF79747E)),
      ),

      // Настройка Scaffold
      scaffoldBackgroundColor: const Color(0xFFFFFBFF),

      // Настройка Divider
      dividerTheme: const DividerThemeData(
        color: Color(0xFFCAC4D0),
        thickness: 1,
        space: 1,
      ),

      // Настройка Snackbar
      snackBarTheme: const SnackBarThemeData(
        backgroundColor: Color(0xFF313033),
        contentTextStyle: TextStyle(color: Color(0xFFF4EFF4)),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(8)),
        ),
        behavior: SnackBarBehavior.floating,
        elevation: 6,
      ),
    );
  }

  // ========================================================================
  // DARK THEME - Темная тема
  // ========================================================================

  /// Темная тема приложения с графитовым фоном
  ///
  /// ХАРАКТЕРИСТИКИ:
  /// - Графитовый фон (#1C1C1E) как указано в спецификации
  /// - Адаптированные цвета для темного режима
  /// - Улучшенная читаемость в условиях низкой освещенности
  /// - Строго запрещен Material You / Dynamic Color
  static ThemeData get darkTheme {
    return ThemeData(
      // Отключаем Material You и Dynamic Color
      useMaterial3: true,

      // Основная цветовая схема для темной темы
      colorScheme: const ColorScheme.dark(
        // Primary colors (адаптированы для темной темы)
        primary: Color(0xFFFFB784), // Более светлый янтарный
        onPrimary: Color(0xFF2D1600), // Темный текст на янтарном
        primaryContainer: Color(0xFF432B00), // Темный янтарный контейнер
        onPrimaryContainer: Color(0xFFFFDCC1), // Светлый текст в контейнере
        // Secondary colors (адаптированы для темной темы)
        secondary: Color(0xFF4DB6AC), // Более светлый теал
        onSecondary: Color(0xFF003734), // Темный текст на теале
        secondaryContainer: Color(0xFF00504C), // Темный теал контейнер
        onSecondaryContainer: Color(0xFFB2DFDB), // Светлый текст в контейнере
        // Surface colors (графитовая основа)
        surface: Color(0xFF1C1C1E), // Основной графитовый фон
        onSurface: Color(0xFFE6E1E5), // Светлый текст
        surfaceContainerHighest: Color(
          0xFF36343B,
        ), // Самые приподнятые элементы
        surfaceContainerHigh: Color(0xFF2B2930), // Карточки и высокие элементы
        surfaceContainer: Color(0xFF211F26), // Стандартные контейнеры
        surfaceContainerLow: Color(0xFF1C1B1F), // Низкие элементы
        surfaceContainerLowest: Color(0xFF0F0D13), // Светлый текст на фоне
        // Error colors (адаптированы для темной темы)
        error: Color(0xFFFFB4AB), // Более светлый красный
        onError: Color(0xFF690005), // Темный текст на ошибке
        errorContainer: Color(0xFF93000A), // Темный красный контейнер
        onErrorContainer: Color(0xFFFFDAD6), // Светлый текст в контейнере
        // Outline colors
        outline: Color(0xFF938F99), // Границы
        outlineVariant: Color(0xFF49454F), // Слабые границы
        shadow: Color(0xFF000000), // Тени
        scrim: Color(0xFF000000), // Затемнения модалов
        inverseSurface: Color(0xFFE6E1E5), // Обратная поверхность
        onInverseSurface: Color(
          0xFF313033,
        ), // Темный текст на обратной поверхности
        inversePrimary: AppColors.primary, // Обратный primary
      ),

      // Настройка AppBar для темной темы
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF432B00), // Темный янтарный контейнер
        foregroundColor: Color(0xFFFFDCC1), // Светлый текст
        elevation: 2,
        shadowColor: Color(0x33000000),
        surfaceTintColor: Colors.transparent, // Отключаем tinting
        systemOverlayStyle: SystemUiOverlayStyle.light,
        titleTextStyle: TextStyle(
          color: Color(0xFFFFDCC1),
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
      ),

      // Настройка текстовой темы для темной темы
      textTheme: _buildTextTheme(
        baseColor: const Color(0xFFE6E1E5),
        displayColor: const Color(0xFFE6E1E5),
      ),

      // Настройка кнопок для темной темы
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFFFFB784), // Светлый янтарный
          foregroundColor: const Color(0xFF2D1600), // Темный текст
          elevation: 2,
          shadowColor: const Color(0x33000000),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: AppTextStyles.buttonMedium,
        ),
      ),

      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: const Color(0xFF4DB6AC), // Светлый теал
          textStyle: AppTextStyles.buttonMedium,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: const Color(0xFFFFB784), // Светлый янтарный
          side: const BorderSide(color: Color(0xFFFFB784), width: 1.5),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: AppTextStyles.buttonMedium,
        ),
      ),

      // Настройка карточек для темной темы
      cardTheme: const CardThemeData(
        color: Color(0xFF2B2930), // Темная карточка
        surfaceTintColor: Colors.transparent,
        elevation: 1,
        shadowColor: Color(0x1A000000),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(16)),
        ),
        margin: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      ),

      // Настройка полей ввода для темной темы
      inputDecorationTheme: const InputDecorationTheme(
        filled: true,
        fillColor: Color(0xFF2B2930), // Темный фон поля
        border: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
          borderSide: BorderSide(color: Color(0xFF938F99)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
          borderSide: BorderSide(color: Color(0xFF938F99)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
          borderSide: BorderSide(
            color: Color(0xFFFFB784),
            width: 2,
          ), // Янтарный в фокусе
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
          borderSide: BorderSide(color: Color(0xFFFFB4AB)), // Светлый красный
        ),
        labelStyle: TextStyle(color: Color(0xFFCAC4D0)),
        hintStyle: TextStyle(color: Color(0xFF938F99)),
      ),

      // Настройка Scaffold для темной темы
      scaffoldBackgroundColor: const Color(0xFF1C1C1E), // Графитовый фон
      // Настройка Divider для темной темы
      dividerTheme: const DividerThemeData(
        color: Color(0xFF938F99),
        thickness: 1,
        space: 1,
      ),

      // Настройка Snackbar для темной темы
      snackBarTheme: const SnackBarThemeData(
        backgroundColor: Color(0xFFE6E1E5), // Светлый фон для контраста
        contentTextStyle: TextStyle(color: Color(0xFF1C1B1F)), // Темный текст
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(8)),
        ),
        behavior: SnackBarBehavior.floating,
        elevation: 6,
      ),
    );
  }

  // ========================================================================
  // UTILITY METHODS - Вспомогательные методы
  // ========================================================================

  /// Создать текстовую тему с заданными цветами
  ///
  /// [baseColor] - основной цвет текста
  /// [displayColor] - цвет заголовков
  /// Возвращает полную текстовую тему
  static TextTheme _buildTextTheme({
    required Color baseColor,
    required Color displayColor,
  }) {
    return TextTheme(
      // Display styles (самые крупные заголовки)
      displayLarge: AppTextStyles.headlineLarge.copyWith(color: displayColor),
      displayMedium: AppTextStyles.headlineMedium.copyWith(color: displayColor),
      displaySmall: AppTextStyles.headlineSmall.copyWith(color: displayColor),

      // Headline styles
      headlineLarge: AppTextStyles.headlineLarge.copyWith(color: displayColor),
      headlineMedium: AppTextStyles.headlineMedium.copyWith(
        color: displayColor,
      ),
      headlineSmall: AppTextStyles.headlineSmall.copyWith(color: displayColor),

      // Title styles
      titleLarge: AppTextStyles.titleLarge.copyWith(color: baseColor),
      titleMedium: AppTextStyles.titleMedium.copyWith(color: baseColor),
      titleSmall: AppTextStyles.titleSmall.copyWith(color: baseColor),

      // Body styles
      bodyLarge: AppTextStyles.bodyLarge.copyWith(color: baseColor),
      bodyMedium: AppTextStyles.bodyMedium.copyWith(color: baseColor),
      bodySmall: AppTextStyles.bodySmall.copyWith(color: baseColor),

      // Label styles
      labelLarge: AppTextStyles.labelLarge.copyWith(color: baseColor),
      labelMedium: AppTextStyles.labelMedium.copyWith(color: baseColor),
      labelSmall: AppTextStyles.labelSmall.copyWith(color: baseColor),
    );
  }

  /// Получить цветовую схему по типу темы
  ///
  /// [isDark] - флаг темной темы
  /// Возвращает соответствующую цветовую схему
  static ColorScheme colorSchemeFor({required bool isDark}) {
    return isDark ? darkTheme.colorScheme : lightTheme.colorScheme;
  }

  /// Получить тему по типу
  ///
  /// [isDark] - флаг темной темы
  /// Возвращает полную тему
  static ThemeData themeFor({required bool isDark}) {
    return isDark ? darkTheme : lightTheme;
  }

  /// Проверить является ли цвет темным
  ///
  /// [color] - проверяемый цвет
  /// Возвращает true для темных цветов
  static bool isColorDark(Color color) {
    final luminance = color.computeLuminance();
    return luminance < 0.5;
  }

  /// Получить контрастный цвет для заданного фона
  ///
  /// [backgroundColor] - цвет фона
  /// Возвращает белый или черный в зависимости от фона
  static Color contrastingColor(Color backgroundColor) {
    return isColorDark(backgroundColor) ? Colors.white : Colors.black;
  }

  // ========================================================================
  // THEME EXTENSIONS - Расширения тем
  // ========================================================================

  /// Кастомные цвета для специфичных случаев мессенджера
  ///
  /// Эти цвета не входят в стандартную Material схему,
  /// но нужны для специфичной функциональности
  static const Map<String, Color> customLightColors = {
    'online': AppColors.success,
    'offline': Color(0xFF6B7280),
    'away': AppColors.warning,
    'busy': AppColors.error,
    'messageBubbleOwn': AppColors.primaryContainer,
    'messageBubbleOther': Color(0xFFF3F4F6),
    'unreadBadge': AppColors.error,
    'mention': AppColors.warning,
  };

  static const Map<String, Color> customDarkColors = {
    'online': Color(0xFF4ADE80),
    'offline': Color(0xFF6B7280),
    'away': Color(0xFFFBBF24),
    'busy': Color(0xFFEF4444),
    'messageBubbleOwn': Color(0xFF432B00), // Темный янтарный контейнер
    'messageBubbleOther': Color(0xFF2B2930),
    'unreadBadge': Color(0xFFFFB4AB),
    'mention': Color(0xFFFBBF24),
  };

  /// Получить кастомный цвет по ключу
  ///
  /// [key] - ключ цвета
  /// [isDark] - флаг темной темы
  /// Возвращает соответствующий цвет или null
  static Color? getCustomColor(String key, {required bool isDark}) {
    final colors = isDark ? customDarkColors : customLightColors;
    return colors[key];
  }

  // ========================================================================
  // METADATA - Метаинформация
  // ========================================================================

  /// Версия системы тем
  static const String version = '1.0.0';

  /// Дата создания
  static const String createdDate = '2025-09-15';

  /// Поддержка Material You отключена
  static const bool supportsMaterialYou = false;

  /// Поддержка Dynamic Color отключена
  static const bool supportsDynamicColor = false;
}
