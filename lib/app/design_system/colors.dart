import 'package:flutter/material.dart' show Color;

/// Enum для состояний взаимодействия с UI элементами
enum InteractionState {
  /// Обычное состояние без взаимодействия
  normal,

  /// Курсор наведен на элемент (desktop/tablet)
  hovered,

  /// Элемент в фокусе (клавиатурная навигация, accessibility)
  focused,

  /// Элемент нажат/тап активен (основное для mobile)
  pressed,
}

/// Полная цветовая система SkiffyMessenger v1.0
///
/// Содержит все цветовые константы приложения с подробной документацией
/// по использованию каждого цвета. Базируется на Material 3 принципах
/// с кастомной семантикой для Matrix-мессенджера.
class AppColors {
  /// Приватный конструктор - класс содержит только статические константы
  AppColors._();

  // ========================================================================
  // PRIMARY COLORS (Янтарный) - Основные интерактивные элементы
  // ========================================================================

  /// Основной янтарный цвет для ключевых действий
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - FAB (создание нового чата)
  /// - Кнопка "Отправить сообщение"
  /// - CTA аутентификации ("Войти", "Подключиться")
  /// - Активные состояния (выбранная комната, активный таб)
  ///
  /// НЕ ИСПОЛЬЗУЙ ДЛЯ:
  /// - Системных предупреждений (используй warning)
  /// - Навигационных элементов (используй secondary)
  /// - Информационных элементов (используй info)
  static const Color primary = Color(0xFFFF7F50);

  /// Янтарный при наведении курсора (desktop/tablet)
  /// Используй для hover-эффектов на кнопках и интерактивных элементах
  static const Color primaryHover = Color(0xFFFFAB76);

  /// Янтарный в состоянии фокуса (accessibility, клавиатурная навигация)
  /// Обязателен для соответствия WCAG - используй для outline при focus
  static const Color primaryFocus = Color(0xFFFFCC99);

  /// Янтарный при нажатии/тапе - основное состояние для мобильных устройств
  /// Используй для feedback при тапе на кнопки, карточки, списки
  static const Color primaryPressed = Color(0xFFE55A2B);

  /// Текст и иконки поверх янтарного фона
  /// Гарантирует контраст 4.5:1 - используй для текста на primary кнопках
  static const Color onPrimary = Color(0xFFFFFFFF);

  /// Светлый янтарный для контейнеров второстепенной важности
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Выделенных карточек в списках
  /// - Активных областей (текущая комната)
  /// - Подсветки важных блоков
  static const Color primaryContainer = Color(0xFFFFE4D6);

  /// Темный текст поверх светлого янтарного контейнера
  static const Color onPrimaryContainer = Color(0xFF2D1B0F);

  // ========================================================================
  // SECONDARY COLORS (Холодный теал) - Навигация и ссылки
  // ========================================================================

  /// Холодный теал для навигационных элементов и ссылок
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Ссылки в сообщениях и описаниях
  /// - Кнопки второстепенной важности ("Отмена", "Позже")
  /// - Навигационные элементы (табы, меню)
  /// - Брендовые акценты где нужна "технологичность"
  ///
  /// НЕ ИСПОЛЬЗУЙ ДЛЯ:
  /// - Основных CTA (используй primary)
  /// - Системных сообщений (используй info)
  static const Color secondary = Color(0xFF008B8B);

  /// Теал при наведении - для десктопных ссылок и кнопок
  static const Color secondaryHover = Color(0xFF26A69A);

  /// Теал в фокусе - для клавиатурной навигации по ссылкам
  static const Color secondaryFocus = Color(0xFF4DB6AC);

  /// Теал при нажатии - для тапа по ссылкам и второстепенным кнопкам
  static const Color secondaryPressed = Color(0xFF00695C);

  /// Белый текст поверх теалового фона
  static const Color onSecondary = Color(0xFFFFFFFF);

  /// Светлый теал для контейнеров навигации
  /// Используй для подсветки активных навигационных элементов
  static const Color secondaryContainer = Color(0xFFB2DFDB);

  /// Темный текст поверх светлого теалового контейнера
  static const Color onSecondaryContainer = Color(0xFF004D40);

  // ========================================================================
  // INFO COLORS (Сине-циановый) - Нейтральная информация
  // ========================================================================

  /// Спокойный сине-циановый для нейтральных системных сообщений
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Системных сообщений в таймлайне ("Пользователь присоединился")
  /// - Баннеров состояния ("Синхронизация...", "Обновлено")
  /// - Tooltip и подсказок о приватности
  /// - Индикаторов E2EE без предупреждения
  ///
  /// НЕ ИСПОЛЬЗУЙ ДЛЯ:
  /// - CTA и ссылок (используй secondary)
  /// - Предупреждений (используй warning)
  static const Color info = Color(0xFF006399);

  /// Info при наведении - для интерактивных инфо-элементов
  static const Color infoHover = Color(0xFF0288D1);

  /// Info в фокусе - для доступности инфо-элементов
  static const Color infoFocus = Color(0xFF29B6F6);

  /// Info при нажатии - для тапа по инфо-баннерам
  static const Color infoPressed = Color(0xFF004D73);

  /// Белый текст поверх info фона
  static const Color onInfo = Color(0xFFFFFFFF);

  /// Светлый сине-циановый для инфо-контейнеров
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Фона информационных баннеров
  /// - Плашек системных сообщений
  /// - Tooltip контейнеров
  static const Color infoContainer = Color(0xFFCFE5FF);

  /// Темный текст поверх светлого info контейнера
  static const Color onInfoContainer = Color(0xFF001D33);

  // ========================================================================
  // WARNING COLORS (Оранжевый) - Предупреждения средней критичности
  // ========================================================================

  /// Оранжевый для предупреждений, требующих внимания но не критичных
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Неблокирующих проблем ("Слабое соединение")
  /// - Рекомендаций ("Обновите ключи", "Настройте бэкап")
  /// - Временных состояний ("Сервер перегружен")
  /// - Предупреждений о настройках приватности
  ///
  /// НЕ ИСПОЛЬЗУЙ ДЛЯ:
  /// - Критических ошибок (используй error)
  /// - Основных действий (используй primary)
  /// - Нейтральной информации (используй info)
  static const Color warning = Color(0xFFE65100);

  /// Warning при наведении - для интерактивных предупреждений
  static const Color warningHover = Color(0xFFEF6C00);

  /// Warning в фокусе - ВНИМАНИЕ: близок к primary, добавляй доп. индикаторы
  static const Color warningFocus = Color(0xFFF57C00);

  /// Warning при нажатии - для кнопок в предупреждающих баннерах
  static const Color warningPressed = Color(0xFFBF360C);

  /// Белый текст поверх оранжевого фона
  static const Color onWarning = Color(0xFFFFFFFF);

  /// Светлый оранжевый для контейнеров предупреждений
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Фона баннеров с предупреждениями
  /// - Плашек рекомендаций
  /// - Выделения элементов требующих внимания
  static const Color warningContainer = Color(0xFFFFF3E0);

  /// Интерактивные состояния warning контейнеров
  static const Color warningContainerHover = Color(0xFFFFE0B2);
  static const Color warningContainerFocus = Color(0xFFFFCC02);
  static const Color warningContainerPressed = Color(0xFFFFE082);

  /// Темный текст поверх светлого warning контейнера
  static const Color onWarningContainer = Color(0xFFBF360C);

  // ========================================================================
  // ERROR COLORS (Красный) - Критические ошибки
  // ========================================================================

  /// Красный для критических ошибок и блокирующих проблем
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Критических сбоев ("Не удается подключиться")
  /// - Ошибок шифрования и безопасности
  /// - Блокирующих ошибок (невалидные данные форм)
  /// - Предупреждений о компрометации
  /// - Кнопок деструктивных действий ("Удалить", "Покинуть")
  ///
  /// НЕ ИСПОЛЬЗУЙ ДЛЯ:
  /// - Неблокирующих предупреждений (используй warning)
  /// - Основных действий (используй primary)
  static const Color error = Color(0xFFD32F2F);

  /// Error при наведении - для деструктивных кнопок
  static const Color errorHover = Color(0xFFE53935);

  /// Error в фокусе - для доступности критических элементов
  static const Color errorFocus = Color(0xFFF44336);

  /// Error при нажатии - для подтверждения деструктивных действий
  static const Color errorPressed = Color(0xFFB71C1C);

  /// Белый текст поверх красного фона
  static const Color onError = Color(0xFFFFFFFF);

  /// Светлый красный для контейнеров ошибок
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Фона баннеров критических ошибок
  /// - Обводки невалидных полей ввода
  /// - Плашек предупреждений безопасности
  static const Color errorContainer = Color(0xFFFFEBEE);

  /// Интерактивные состояния error контейнеров
  static const Color errorContainerHover = Color(0xFFFFCDD2);
  static const Color errorContainerFocus = Color(0xFFEF9A9A);
  static const Color errorContainerPressed = Color(0xFFE57373);

  /// Темный текст поверх светлого error контейнера
  static const Color onErrorContainer = Color(0xFFB71C1C);

  // ========================================================================
  // SUCCESS COLORS (Зеленый) - Успешные операции
  // ========================================================================

  /// Зеленый для подтверждения успешных операций
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Подтверждений ("Ключи верифицированы", "Бэкап создан")
  /// - Индикаторов успешного подключения
  /// - Статусов "Онлайн", "Синхронизировано"
  /// - Кнопок подтверждающих действий
  ///
  /// НЕ ИСПОЛЬЗУЙ ДЛЯ:
  /// - Основных CTA (используй primary)
  /// - Нейтральной информации (используй info)
  static const Color success = Color(0xFF2E7D32);

  /// Success при наведении - для подтверждающих кнопок
  static const Color successHover = Color(0xFF388E3C);

  /// Success в фокусе - для доступности успешных элементов
  static const Color successFocus = Color(0xFF43A047);

  /// Success при нажатии - для финальных подтверждений
  static const Color successPressed = Color(0xFF1B5E20);

  /// Белый текст поверх зеленого фона
  static const Color onSuccess = Color(0xFFFFFFFF);

  /// Светлый зеленый для контейнеров успеха
  ///
  /// ИСПОЛЬЗУЙ ДЛЯ:
  /// - Фона баннеров успешных операций
  /// - Плашек подтверждений
  /// - Индикаторов успешного статуса
  static const Color successContainer = Color(0xFFE8F5E8);

  /// Интерактивные состояния success контейнеров
  static const Color successContainerHover = Color(0xFFC8E6C9);
  static const Color successContainerFocus = Color(0xFFA5D6A7);
  static const Color successContainerPressed = Color(0xFF81C784);

  /// Темный текст поверх светлого success контейнера
  static const Color onSuccessContainer = Color(0xFF1B5E20);

  // ========================================================================
  // UTILITY METHODS - Вспомогательные методы
  // ========================================================================

  /// Получить цвет состояния для primary элементов
  ///
  /// [state] - текущее состояние взаимодействия
  /// Возвращает соответствующий primary цвет
  static Color getPrimaryStateColor(InteractionState state) {
    switch (state) {
      case InteractionState.pressed:
        return primaryPressed;
      case InteractionState.focused:
        return primaryFocus;
      case InteractionState.hovered:
        return primaryHover;
      default:
        return primary;
    }
  }

  /// Получить цвет состояния для warning элементов
  ///
  /// [state] - текущее состояние взаимодействия
  /// Возвращает соответствующий warning цвет
  static Color getWarningStateColor(InteractionState state) {
    switch (state) {
      case InteractionState.pressed:
        return warningPressed;
      case InteractionState.focused:
        return warningFocus;
      case InteractionState.hovered:
        return warningHover;
      default:
        return warning;
    }
  }

  /// Получить цвет состояния для error элементов
  ///
  /// [state] - текущее состояние взаимодействия
  /// Возвращает соответствующий error цвет
  static Color getErrorStateColor(InteractionState state) {
    switch (state) {
      case InteractionState.pressed:
        return errorPressed;
      case InteractionState.focused:
        return errorFocus;
      case InteractionState.hovered:
        return errorHover;
      default:
        return error;
    }
  }

  // ========================================================================
  // METADATA - Метаинформация
  // ========================================================================

  /// Версия цветовой системы для отслеживания изменений
  static const String version = '1.0.0';

  /// Дата создания системы
  static const String createdDate = '2025-09-11';

  /// Количество определенных цветовых констант
  static const int totalColorCount = 50;
}
