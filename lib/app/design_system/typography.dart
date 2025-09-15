import 'package:flutter/material.dart';
import 'package:skiffy/app/design_system/gen/gen.dart';

/// Comprehensive typography system for SkiffyMessenger v1.0
///
/// Provides semantic text styles following Material 3 principles
/// with custom messenger-specific typography hierarchy.
/// All styles are optimized for readability across different screen sizes
/// and support both light and dark themes.
class AppTextStyles {
  /// Private constructor - class contains only static constants
  AppTextStyles._();

  // ========================================================================
  // HEADLINE STYLES - Заголовки и крупный текст
  // ========================================================================

  /// Главный заголовок приложения (логотип, название экрана)
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Логотипа SkiffyMessenger на экране входа
  /// - Заголовков основных экранов ("Чаты", "Настройки")
  /// - Крупных заголовков в пустых состояниях
  ///
  /// Размер: 32sp, вес: 700 (Bold)
  static const TextStyle headlineLarge = TextStyle(
    fontSize: 32,
    fontWeight: FontWeight.w700,
    height: 1.25, // 40px line height
    letterSpacing: -0.5,
    fontFamily: FontFamily.inter,
  );

  /// Заголовок секции (название комнаты, заголовки диалогов)
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Названий комнат в верхней панели таймлайна
  /// - Заголовков модальных окон и диалогов
  /// - Заголовков разделов настроек
  ///
  /// Размер: 24sp, вес: 600 (SemiBold)
  static const TextStyle headlineMedium = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.w600,
    height: 1.33, // 32px line height
    letterSpacing: -0.25,
    fontFamily: FontFamily.inter,
  );

  /// Подзаголовок (названия карточек, второстепенные заголовки)
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Подзаголовков в карточках настроек
  /// - Заголовков списков (например, "Недавние чаты")
  /// - Названий групп в контактах
  ///
  /// Размер: 20sp, вес: 600 (SemiBold)
  static const TextStyle headlineSmall = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.w600,
    height: 1.4, // 28px line height
    letterSpacing: 0,
    fontFamily: FontFamily.inter,
  );

  // ========================================================================
  // TITLE STYLES - Заголовки среднего уровня
  // ========================================================================

  /// Крупный заголовок для списков и контента
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Имен пользователей в списке чатов
  /// - Заголовков сообщений с файлами
  /// - Названий разделов в длинных списках
  ///
  /// Размер: 18sp, вес: 600 (SemiBold)
  static const TextStyle titleLarge = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w600,
    height: 1.44, // 26px line height
    letterSpacing: 0,
  );

  /// Стандартный заголовок элементов списка
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Имен контактов в списках
  /// - Заголовков элементов настроек
  /// - Названий файлов в сообщениях
  ///
  /// Размер: 16sp, вес: 500 (Medium)
  static const TextStyle titleMedium = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w500,
    height: 1.5, // 24px line height
    letterSpacing: 0.1,
  );

  /// Малый заголовок для плотного контента
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Меток времени в заголовках сообщений
  /// - Подписей к медиа-контенту
  /// - Заголовков в компактных списках
  ///
  /// Размер: 14sp, вес: 500 (Medium)
  static const TextStyle titleSmall = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    height: 1.43, // 20px line height
    letterSpacing: 0.1,
  );

  // ========================================================================
  // BODY STYLES - Основной текст контента
  // ========================================================================

  /// Крупный основной текст
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Текста сообщений в таймлайне
  /// - Основного контента в диалогах
  /// - Длинного читабельного текста
  ///
  /// Размер: 16sp, вес: 400 (Regular)
  static const TextStyle bodyLarge = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    height: 1.5, // 24px line height
    letterSpacing: 0.15,
  );

  /// Стандартный основной текст
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Описаний в настройках
  /// - Вторичного текста в карточках
  /// - Текста уведомлений
  ///
  /// Размер: 14sp, вес: 400 (Regular)
  static const TextStyle bodyMedium = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    height: 1.43, // 20px line height
    letterSpacing: 0.25,
  );

  /// Малый основной текст
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Подписей под основным контентом
  /// - Пояснительного текста
  /// - Текста в плотных интерфейсах
  ///
  /// Размер: 12sp, вес: 400 (Regular)
  static const TextStyle bodySmall = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    height: 1.33, // 16px line height
    letterSpacing: 0.4,
  );

  // ========================================================================
  // LABEL STYLES - Метки и вспомогательный текст
  // ========================================================================

  /// Крупные метки и лейблы
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Меток времени сообщений
  /// - Статусов пользователей ("онлайн", "офлайн")
  /// - Счетчиков непрочитанных сообщений
  ///
  /// Размер: 14sp, вес: 500 (Medium)
  static const TextStyle labelLarge = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    height: 1.43, // 20px line height
    letterSpacing: 0.1,
  );

  /// Стандартные метки
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Подписей полей ввода
  /// - Меток в формах
  /// - Вспомогательного текста в интерфейсе
  ///
  /// Размер: 12sp, вес: 500 (Medium)
  static const TextStyle labelMedium = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    height: 1.33, // 16px line height
    letterSpacing: 0.5,
  );

  /// Малые метки
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Очень мелких подписей
  /// - Меток в компактных элементах
  /// - Технической информации (размеры файлов и т.д.)
  ///
  /// Размер: 11sp, вес: 500 (Medium)
  static const TextStyle labelSmall = TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.w500,
    height: 1.36, // 15px line height
    letterSpacing: 0.5,
  );

  // ========================================================================
  // BUTTON STYLES - Специализированные стили для кнопок
  // ========================================================================

  /// Текст крупных кнопок (основные CTA)
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Кнопок "Войти", "Присоединиться"
  /// - Основных действий в диалогах
  /// - FAB текста (если есть)
  ///
  /// Размер: 16sp, вес: 600 (SemiBold)
  static const TextStyle buttonLarge = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    height: 1.25, // 20px line height
    letterSpacing: 0.1,
  );

  /// Текст стандартных кнопок
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Кнопок в интерфейсе
  /// - Текста на кнопках действий
  /// - Ссылок-кнопок
  ///
  /// Размер: 14sp, вес: 500 (Medium)
  static const TextStyle buttonMedium = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    height: 1.43, // 20px line height
    letterSpacing: 0.1,
  );

  /// Текст малых кнопок
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Компактных кнопок действий
  /// - Кнопок в плотном интерфейсе
  /// - Второстепенных действий
  ///
  /// Размер: 12sp, вес: 500 (Medium)
  static const TextStyle buttonSmall = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    height: 1.33, // 16px line height
    letterSpacing: 0.2,
  );

  // ========================================================================
  // SPECIAL STYLES - Специализированные стили
  // ========================================================================

  /// Моноширинный текст для кода и технической информации
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Кодовых блоков в сообщениях
  /// - ID пользователей и комнат
  /// - Технических данных (хеши, ключи)
  ///
  /// Размер: 14sp, семейство: monospace
  static const TextStyle monospace = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    height: 1.5, // 21px line height
    letterSpacing: 0,
    fontFamily: FontFamily.sourceCodePro,
  );

  /// Стиль для ссылок
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Ссылок в сообщениях
  /// - Навигационных ссылок
  /// - Интерактивного текста
  ///
  /// Размер: наследует от контекста, добавляет подчеркивание
  static const TextStyle link = TextStyle(
    decoration: TextDecoration.underline,
    decorationColor: Color(0xFF008B8B), // secondary color
  );

  /// Зачеркнутый текст
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Удаленных сообщений (если видимы)
  /// - Отмененного текста в редактировании
  ///
  /// Добавляет зачеркивание к базовому стилю
  static const TextStyle strikethrough = TextStyle(
    decoration: TextDecoration.lineThrough,
  );

  /// Стиль для выделения текста (жирный)
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Выделенного текста в сообщениях
  /// - Важного контента
  /// - Упоминаний пользователей
  ///
  /// Добавляет жирность к базовому стилю
  static const TextStyle bold = TextStyle(
    fontWeight: FontWeight.w700,
  );

  /// Стиль для курсивного текста
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Курсива в сообщениях
  /// - Эмоционального выделения
  /// - Цитат и примечаний
  ///
  /// Добавляет курсив к базовому стилю
  static const TextStyle italic = TextStyle(
    fontStyle: FontStyle.italic,
  );

  // ========================================================================
  // UTILITY METHODS - Вспомогательные методы
  // ========================================================================

  /// Применить цвет к любому текстовому стилю
  ///
  /// [style] - базовый стиль
  /// [color] - цвет для применения
  /// Возвращает стиль с примененным цветом
  static TextStyle withColor(TextStyle style, Color color) {
    return style.copyWith(color: color);
  }

  /// Создать стиль с измененным размером шрифта
  ///
  /// [style] - базовый стиль
  /// [fontSize] - новый размер шрифта
  /// Возвращает стиль с новым размером
  static TextStyle withFontSize(TextStyle style, double fontSize) {
    return style.copyWith(fontSize: fontSize);
  }

  /// Применить семейство шрифтов Inter к стилю
  ///
  /// [style] - базовый стиль
  /// Возвращает стиль с шрифтом Inter
  static TextStyle withInterFont(TextStyle style) {
    return style.copyWith(fontFamily: FontFamily.inter);
  }

  /// Применить моноширинный шрифт SourceCodePro к стилю
  ///
  /// [style] - базовый стиль
  /// Возвращает стиль с шрифтом SourceCodePro
  static TextStyle withMonospaceFont(TextStyle style) {
    return style.copyWith(fontFamily: FontFamily.sourceCodePro);
  }

  /// Создать стиль с измененным весом шрифта
  ///
  /// [style] - базовый стиль
  /// [fontWeight] - новый вес шрифта
  /// Возвращает стиль с новым весом
  static TextStyle withFontWeight(TextStyle style, FontWeight fontWeight) {
    return style.copyWith(fontWeight: fontWeight);
  }

  /// Применить прозрачность к стилю
  ///
  /// [style] - базовый стиль
  /// [opacity] - прозрачность от 0.0 до 1.0
  /// Возвращает стиль с примененной прозрачностью
  static TextStyle withOpacity(TextStyle style, double opacity) {
    return style.copyWith(
      color: (style.color ?? const Color(0xFF000000)).withOpacity(opacity),
    );
  }

  // ========================================================================
  // THEME-AWARE UTILITIES - Утилиты учитывающие тему
  // ========================================================================

  /// Получить стиль текста адаптированный для темной темы
  ///
  /// [style] - базовый стиль
  /// [isDark] - флаг темной темы
  /// Возвращает стиль оптимизированный для текущей темы
  static TextStyle forTheme(TextStyle style, {required bool isDark}) {
    if (!isDark) return style;

    // Для темной темы увеличиваем межбуквенное расстояние для лучшей читаемости
    return style.copyWith(
      letterSpacing: (style.letterSpacing ?? 0.0) + 0.1,
    );
  }

  // ========================================================================
  // METADATA - Метаинформация
  // ========================================================================

  /// Версия типографической системы
  static const String version = '1.0.0';

  /// Дата создания системы
  static const String createdDate = '2025-09-15';

  /// Количество определенных текстовых стилей
  static const int totalStylesCount = 24;

  /// Список всех доступных стилей для тестирования
  static const Map<String, TextStyle> allStyles = {
    'headlineLarge': headlineLarge,
    'headlineMedium': headlineMedium,
    'headlineSmall': headlineSmall,
    'titleLarge': titleLarge,
    'titleMedium': titleMedium,
    'titleSmall': titleSmall,
    'bodyLarge': bodyLarge,
    'bodyMedium': bodyMedium,
    'bodySmall': bodySmall,
    'labelLarge': labelLarge,
    'labelMedium': labelMedium,
    'labelSmall': labelSmall,
    'buttonLarge': buttonLarge,
    'buttonMedium': buttonMedium,
    'buttonSmall': buttonSmall,
    'monospace': monospace,
    'link': link,
    'strikethrough': strikethrough,
    'bold': bold,
    'italic': italic,
  };
}
