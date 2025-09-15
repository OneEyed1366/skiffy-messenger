# Epic 1: Foundation & Core Infrastructure

**Цель:** Создание архитектурного фундамента проекта, настройка FFI-моста для связи Flutter и Rust и обеспечение базового подключения к Matrix. Этот эпик закладывает основу для всех последующих этапов разработки.

**Ключевые UI-задачи (согласно `UI-Spec.md`):**

- **Design System:** Создание базовой палитры `AppColors` (более 50 семантических цветов), реализация светлой и темной тем через `AppTheme`.
- **UI-Kit:** Разработка набора переиспользуемых виджетов, включая `AppButton`, `AppTextField` и `FocusableBorder` для обеспечения доступности (accessibility).
- **Экраны:**
  - Реализация экрана входа (Login Screen) с использованием созданных компонентов.
  - Проектирование и верстка основного экрана чата (Main Chat Screen), включая список сообщений, поле ввода и панель закрепленных сообщений.
- **Приватность в UI:** Интеграция визуальных индикаторов E2EE-шифрования и других элементов, ориентированных на приватность.

## Story 1.1: Project Setup and Architecture

As a developer, I want to set up the Flutter+Rust project structure, so that I can build a cross-platform messaging app with clear separation of concerns.

**Acceptance Criteria:**

1. Flutter project initialized with proper directory structure
2. Rust core crate (`skiffy-core`) created with basic API facade
3. FFI bridge configured using `flutter_rust_bridge`
4. Basic project configuration and dependencies set up
5. Automated build process established for both platforms

## Story 1.2: Matrix SDK Integration

As a developer, I want to integrate the official `matrix-rust-sdk`, so that I can establish secure Matrix protocol connectivity.

**Acceptance Criteria:**

1. `matrix-rust-sdk` added as dependency in Rust core - done
2. Basic client initialization implemented - done
3. API facade provides high-level Matrix operations - in progress
4. Error handling for connection and authentication failures
5. Unit tests for SDK integration

## Story 1.3: Secure Credential Storage Implementation

As a developer, I want to implement a cross-platform secure storage mechanism, so that sensitive user credentials (tokens, keys) are protected using native OS capabilities.

**Acceptance Criteria:**

1. A `SecureStorage` trait is defined in the Rust core, abstracting `set`, `get`, and `delete` operations.
2. A platform-specific implementation for macOS/iOS is created using the `security-framework` crate to interact with the Keychain.
3. A platform-specific implementation for Windows is created using the `keyring` crate to interact with the Credential Manager.
4. A platform-specific implementation for Linux is created using the `keyring` crate to interact with the Secret Service API.
5. A secure fallback mechanism is implemented: If the Linux implementation fails to find a secret service, it defaults to an in-memory-only storage.
6. The Rust core can detect the fallback scenario and reports a "session-not-persistent" status via the FFI layer.
7. The Flutter UI displays a non-intrusive warning to the user when the "session-not-persistent" status is active.
8. Sensitive data is never written to unencrypted files or the local SQLite database.

## Story 1.4: Реализация базовой Design System и UI-кита

**Как** Flutter-разработчик,
**я хочу** реализовать фундаментальную, строго типизированную и централизованную `Design System` и базовый `UI-kit`,
**чтобы** обеспечить визуальную консистентность во всем приложении, ускорить последующую разработку экранов и гарантировать соответствие требованиям `UI-Spec.md`.

### Критерии приемки (Acceptance Criteria)

1. **Цветовая система (`AppColors`):**
    - Создан статический класс `AppColors` в `lib/app/design_system/colors.dart`.
    - В класс добавлены все утвержденные цветовые константы (~50) с семантическими именами в соответствии с `UI-Spec.md`, раздел 2.1.
    - Прямое использование "магических" цветов (например, `Color(0xFF...)`) за пределами этого файла запрещено на уровне статического анализа.

2. **Типографика (`AppTextStyles`):**
    - Создан класс `AppTextStyles` в `lib/app/design_system/typography.dart`.
    - В классе определены все семантические стили текста (`headline`, `body`, `caption` и т.д.), как указано в `UI-Spec.md`, раздел 2.2.
    - Файлы шрифтов интегрированы в проект как ассеты.

3. **Темизация (`AppTheme`):**
    - Создан класс `AppTheme` с двумя экземплярами `ThemeData`: `lightTheme` и `darkTheme`.
    - `darkTheme` использует графитовые оттенки для фона (`#1C1C1E`) в соответствии со спецификацией.
    - Использование `Material You / Dynamic Color` полностью **исключено**, как это явно указано в `UI-Spec.md`, раздел 3.2.
    - Корневой виджет `MaterialApp` настроен для корректного переключения между светлой и темной темами.

4. **Иконография (`AppIcons`):**
    - Векторные иконки (SVG) добавлены в ассеты проекта.
    - Создан централизованный класс `AppIcons` для типизированного доступа ко всем иконкам приложения, как указано в `UI-Spec.md`, раздел 2.3.

5. **Базовый UI-кит (Widgets):**
    - Созданы и добавлены в `lib/widgets/` первые переиспользуемые компоненты, определённые в `UI-Spec.md`: `AppButton`, `AppTextField`, `AppCard`.
    - Реализован и добавлен в UI-кит виджет `FocusableBorder` для обеспечения доступности (accessibility), как требует `UI-Spec.md`, раздел 3.1. Все интерактивные компоненты кита должны его использовать.

## Story 1.5: Внедрение инфраструктуры локализации (l10n)

**Как** Flutter-разработчик,
**я хочу** внедрить стандартный механизм локализации Flutter (`flutter_localizations` и `intl`),
**чтобы** все статичные текстовые значения в UI можно было легко переводить на разные языки, подготавливая приложение к глобальному релизу.

### Критерии приемки (Acceptance Criteria)

1. **Настройка зависимостей:**
    - В `pubspec.yaml` добавлена зависимость `flutter_localizations` (как часть Flutter SDK) и `intl`.
    - В `pubspec.yaml` в секции `flutter` включен флаг `generate: true` для активации кодогенерации.

2. **Конфигурация `l10n.yaml`:**
    - В корне проекта создан файл `l10n.yaml`.
    - В файле прописана конфигурация, указывающая на директорию с файлами переводов (`arb-dir: lib/l10n`) и имя файла-шаблона (`template-arb-file: app_en.arb`).

3. **Создание файлов локализации (.arb):**
    - Создана директория `lib/l10n`.
    - Внутри создан базовый файл для английского языка `app_en.arb`, содержащий как минимум один ключ-значение (например, `"loginButton": "Log In"`).
    - Создан файл для русского языка `app_ru.arb` с переводом того же ключа (`"loginButton": "Войти"`).

4. **Интеграция в приложение:**
    - После запуска `flutter pub get` или `flutter run` успешно сгенерированы файлы локализации в директории `.dart_tool/flutter_gen/gen_l10n/`.
    - Корневой виджет `MaterialApp` сконфигурирован для использования сгенерированных делегатов и списка поддерживаемых локалей:
        - `localizationsDelegates: AppLocalizations.localizationsDelegates`
        - `supportedLocales: AppLocalizations.supportedLocales`

5. **Применение в коде:**
    - Как минимум один статичный текст в UI (например, на кнопке входа на экране `Login Screen` из `Epic 1`) заменен с хардкодного значения на вызов `AppLocalizations.of(context)!.loginButton`.
    - Приложение корректно отображает "Log In" или "Войти" в зависимости от языка системы.

### Критическое замечание и решение

**Проблема:** Внедрение механизма локализации — это только полдела. Пользователю может потребоваться сменить язык вручную, независимо от системных настроек. Простое следование языку ОС не всегда является достаточным.

**Решение:** Данная `Story 1.5` сознательно фокусируется только на **технической имплементации** механизма `l10n`. Это является обязательным фундаментом для `Story 10.13: Выбор языка интерфейса`, в рамках которой и будет реализован UI для ручного переключения языка пользователем. Сейчас мы создаем инструмент, а позже — дадим его в руки пользователю.

## Story 1.6: Интеграция `MatrixClient` с `SecureStorage`

**Как** разработчик `skiffy-core`,
**я хочу** полностью интегрировать модуль `MatrixClient` с реализованной в `Story 1.3` абстракцией `SecureStorage`,
**чтобы** обеспечить безопасное, персистентное хранение токенов доступа и данных сессии, устранив замечания из аудита безопасности.

### Критерии приемки (Acceptance Criteria)

1. **Модификация метода `login`:**
    - Сигнатура метода `login` в `MatrixClient` изменена и теперь принимает ссылку на `&dyn SecureStorage`, как рекомендовано в отчете об аудите.
    - После успешной аутентификации через `matrix-rust-sdk` полученные `access_token` и `refresh_token` **немедленно** сохраняются в `SecureStorage` с использованием стандартизированных ключей (например, `"matrix_access_token"`).
    - `user_id` и `device_id` также сохраняются в `SecureStorage` для последующего восстановления сессии.

2. **Реализация восстановления сессии:**
    - Создан новый метод `restore_session`, который вызывается при старте приложения.
    - Этот метод пытается загрузить `access_token`, `user_id` и `device_id` из `SecureStorage`.
    - В случае успеха, `matrix-rust-sdk` инициализируется с использованием этих данных, что позволяет восстановить сессию без повторного ввода пароля.

3. **Корректная реализация `logout`:**
    - Метод `logout` теперь не только завершает сессию на сервере, но и **полностью очищает** все связанные с ней данные (`access_token`, `refresh_token`, `user_id`, `device_id`) из `SecureStorage`.

4. **Соответствие аудиту:**
    - Проблема "⚠️ ATTENTION REQUIRED: Matrix Client Authentication" из отчета `SECURITY_AUDIT.md` полностью решена.
    - Приложение больше не передает и не хранит учетные данные в виде простого текста после этапа первичного входа.

### Критическое замечание

Это действие напрямую закрывает главный "Action Item" из аудита и делает всю архитектуру аутентификации завершенной и безопасной.

## Story 1.7: Environment Variable Management with Flutter DotEnv

**Как** разработчик,
**я хочу** управлять конфигурацией для различных сред через .env файлы используя flutter_dotenv,
**чтобы** легко настраивать различные параметры для development, staging, и production окружений без захардкоженных значений.

### Критерии приемки (Acceptance Criteria)

1. **Интеграция пакета:**
   - flutter_dotenv пакет добавлен в зависимости pubspec.yaml
   - .env файлы включены в конфигурацию assets

2. **Структура окружений:**
   - Созданы файлы .env.development, .env.staging, .env.production
   - Каждый файл содержит окружение-специфичные переменные

3. **Интеграция с bootstrap:**
   - Процесс bootstrap расширен для загрузки соответствующего .env файла на основе текущего flavor
   - Загрузка переменных окружения происходит после инициализации RustLib

4. **Доступность переменных:**
   - Переменные окружения доступны через DotEnv.env во всем приложении после завершения bootstrap
   - Существующая функциональность flavor не нарушена

### Технические заметки

- **Подход к интеграции:** Расширение существующего процесса bootstrap для загрузки соответствующего .env файла
- **Ссылка на существующий паттерн:** Следование паттерну flavor-специфичных точек входа в `lib/flavors/main_*.dart`
- **Ключевые ограничения:** Должна сохраняться совместимость с существующей инициализацией Rust библиотеки и настройкой bloc observer

---

*This is a shard of the complete SkiffyMessenger PRD. For the full document, see: [../prd.md](../prd.md)*
