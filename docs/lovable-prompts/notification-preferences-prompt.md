# Lovable Prompt: Notification Preferences Management

## High-Level Goal

Create a comprehensive notification preferences management system for SkiffyMessenger that provides granular control over push notifications, in-app notifications, and privacy settings with seamless integration with the existing design system.

## Detailed, Step-by-Step Instructions

### 1. Component Structure

1. Create `lib/features/settings/screens/notification_preferences_screen.dart` - Main preferences screen
2. Create `lib/features/settings/widgets/notification_setting_group.dart` - Setting groups
3. Create `lib/features/settings/widgets/notification_setting_item.dart` - Individual settings
4. Create `lib/features/settings/widgets/notification_preview.dart` - Live preview
5. Create `lib/features/settings/bloc/notification_preferences_bloc.dart` - State management
6. Create `lib/services/notification_preferences_service.dart` - Service layer

### 2. Visual Design Implementation

1. Use AppColors for notification state indicators and toggles
2. Apply AppTextStyles for setting labels and descriptions
3. Implement clear visual hierarchy with section dividers
4. Add icons for different notification types and states
5. Include live preview of notification appearance

### 3. Interaction & Behavior

1. **Granular Controls**: Per-chat notification settings
2. **Live Preview**: Show how notifications will appear
3. **Smart Defaults**: Context-aware default settings
4. **Privacy Controls**: Read receipts and typing indicators
5. **Custom Sounds**: Per-chat notification sounds

### 4. Animation & UX

1. Smooth toggle animations with haptic feedback
2. Expandable sections with slide animations
3. Live preview updates with fade transitions
4. Success feedback for setting changes
5. Contextual help tooltips

### 5. Accessibility Features

1. Wrap all interactive elements with AppFocusableBorder
2. Add comprehensive Semantics for screen reader support
3. Keyboard navigation support for all controls
4. High contrast mode support for toggles and indicators
5. Clear labels and descriptions for all settings

## Code Examples, Data Structures & Constraints

### Notification Preferences Screen

```dart
class NotificationPreferencesScreen extends StatefulWidget {
  const NotificationPreferencesScreen({Key? key}) : super(key: key);

  @override
  State<NotificationPreferencesScreen> createState() => _NotificationPreferencesScreenState();
}

class _NotificationPreferencesScreenState extends State<NotificationPreferencesScreen> {
  @override
  void initState() {
    super.initState();
    context.read<NotificationPreferencesBloc>().add(LoadNotificationPreferences());
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.notificationPreferences),
        actions: [
          AppFocusableBorder(
            child: Semantics(
              button: true,
              label: l10n.resetToDefaults,
              child: TextButton(
                onPressed: _showResetDialog,
                child: Text(l10n.reset),
              ),
            ),
          ),
        ],
      ),
      body: BlocBuilder<NotificationPreferencesBloc, NotificationPreferencesState>(
        builder: (context, state) {
          if (state.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          return _buildPreferencesContent(context, state);
        },
      ),
    );
  }

  Widget _buildPreferencesContent(BuildContext context, NotificationPreferencesState state) {
    final l10n = context.l10n;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Live Preview Section
        AppNotificationSettingGroup(
          title: l10n.preview,
          children: [
            AppNotificationPreview(
              settings: state.globalSettings,
              sampleMessage: l10n.sampleNotificationMessage,
            ),
          ],
        ),

        const SizedBox(height: 24),

        // Global Settings
        AppNotificationSettingGroup(
          title: l10n.globalSettings,
          children: [
            AppNotificationSettingItem(
              title: l10n.pushNotifications,
              subtitle: l10n.pushNotificationsDescription,
              value: state.globalSettings.pushEnabled,
              onChanged: (value) => _updateGlobalSetting(
                state.globalSettings.copyWith(pushEnabled: value),
              ),
            ),
            AppNotificationSettingItem(
              title: l10n.inAppNotifications,
              subtitle: l10n.inAppNotificationsDescription,
              value: state.globalSettings.inAppEnabled,
              onChanged: (value) => _updateGlobalSetting(
                state.globalSettings.copyWith(inAppEnabled: value),
              ),
            ),
            AppNotificationSettingItem(
              title: l10n.soundEnabled,
              subtitle: l10n.soundEnabledDescription,
              value: state.globalSettings.soundEnabled,
              onChanged: (value) => _updateGlobalSetting(
                state.globalSettings.copyWith(soundEnabled: value),
              ),
            ),
            AppNotificationSettingItem(
              title: l10n.vibrationEnabled,
              subtitle: l10n.vibrationEnabledDescription,
              value: state.globalSettings.vibrationEnabled,
              onChanged: (value) => _updateGlobalSetting(
                state.globalSettings.copyWith(vibrationEnabled: value),
              ),
            ),
          ],
        ),

        const SizedBox(height: 24),

        // Chat-specific Settings
        AppNotificationSettingGroup(
          title: l10n.chatSpecificSettings,
          children: [
            _buildChatTypeSetting(
              context,
              l10n.directChats,
              state.directChatSettings,
              (settings) => _updateChatTypeSetting(ChatType.direct, settings),
            ),
            _buildChatTypeSetting(
              context,
              l10n.groupChats,
              state.groupChatSettings,
              (settings) => _updateChatTypeSetting(ChatType.group, settings),
            ),
          ],
        ),

        const SizedBox(height: 24),

        // Privacy Settings
        AppNotificationSettingGroup(
          title: l10n.privacySettings,
          children: [
            AppNotificationSettingItem(
              title: l10n.showMessagePreview,
              subtitle: l10n.showMessagePreviewDescription,
              value: state.privacySettings.showPreview,
              onChanged: (value) => _updatePrivacySetting(
                state.privacySettings.copyWith(showPreview: value),
              ),
            ),
            AppNotificationSettingItem(
              title: l10n.showSenderName,
              subtitle: l10n.showSenderNameDescription,
              value: state.privacySettings.showSender,
              onChanged: (value) => _updatePrivacySetting(
                state.privacySettings.copyWith(showSender: value),
              ),
            ),
            AppNotificationSettingItem(
              title: l10n.sendReadReceipts,
              subtitle: l10n.sendReadReceiptsDescription,
              value: state.privacySettings.sendReadReceipts,
              onChanged: (value) => _updatePrivacySetting(
                state.privacySettings.copyWith(sendReadReceipts: value),
              ),
            ),
            AppNotificationSettingItem(
              title: l10n.sendTypingIndicators,
              subtitle: l10n.sendTypingIndicatorsDescription,
              value: state.privacySettings.sendTyping,
              onChanged: (value) => _updatePrivacySetting(
                state.privacySettings.copyWith(sendTyping: value),
              ),
            ),
          ],
        ),

        const SizedBox(height: 24),

        // Advanced Settings
        AppNotificationSettingGroup(
          title: l10n.advancedSettings,
          children: [
            ListTile(
              title: Text(l10n.customSounds),
              subtitle: Text(l10n.customSoundsDescription),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => _navigateToCustomSounds(context),
            ),
            ListTile(
              title: Text(l10n.doNotDisturb),
              subtitle: Text(l10n.doNotDisturbDescription),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => _navigateToDoNotDisturb(context),
            ),
            ListTile(
              title: Text(l10n.notificationSchedule),
              subtitle: Text(l10n.notificationScheduleDescription),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => _navigateToSchedule(context),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildChatTypeSetting(
    BuildContext context,
    String title,
    ChatNotificationSettings settings,
    Function(ChatNotificationSettings) onUpdate,
  ) {
    final l10n = context.l10n;
    return ExpansionTile(
      title: Text(title),
      children: [
        AppNotificationSettingItem(
          title: l10n.notificationsEnabled,
          value: settings.enabled,
          onChanged: (value) => onUpdate(settings.copyWith(enabled: value)),
        ),
        if (settings.enabled) ...[
          AppNotificationSettingItem(
            title: l10n.mentionOnly,
            subtitle: l10n.mentionOnlyDescription,
            value: settings.mentionOnly,
            onChanged: (value) => onUpdate(settings.copyWith(mentionOnly: value)),
          ),
          ListTile(
            title: Text(l10n.customSound),
            subtitle: Text(settings.customSound ?? l10n.defaultSound),
            trailing: const Icon(Icons.music_note),
            onTap: () => _selectCustomSound(context, settings, onUpdate),
          ),
        ],
      ],
    );
  }

  void _updateGlobalSetting(GlobalNotificationSettings settings) {
    context.read<NotificationPreferencesBloc>().add(
      UpdateGlobalSettings(settings),
    );
  }

  void _updateChatTypeSetting(ChatType type, ChatNotificationSettings settings) {
    context.read<NotificationPreferencesBloc>().add(
      UpdateChatTypeSettings(type, settings),
    );
  }

  void _updatePrivacySetting(PrivacyNotificationSettings settings) {
    context.read<NotificationPreferencesBloc>().add(
      UpdatePrivacySettings(settings),
    );
  }

  void _showResetDialog() {
    final l10n = context.l10n;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.resetPreferences),
        content: Text(l10n.resetPreferencesDescription),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text(l10n.cancel),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              context.read<NotificationPreferencesBloc>().add(ResetToDefaults());
            },
            child: Text(l10n.reset),
          ),
        ],
      ),
    );
  }

  void _navigateToCustomSounds(BuildContext context) {
    // Navigate to custom sounds screen
  }

  void _navigateToDoNotDisturb(BuildContext context) {
    // Navigate to DND settings
  }

  void _navigateToSchedule(BuildContext context) {
    // Navigate to schedule settings
  }

  void _selectCustomSound(
    BuildContext context,
    ChatNotificationSettings settings,
    Function(ChatNotificationSettings) onUpdate,
  ) {
    // Show sound picker dialog
  }
}
```

### Notification Setting Group Component

```dart
class AppNotificationSettingGroup extends StatelessWidget {
  final String title;
  final List<Widget> children;

  const AppNotificationSettingGroup({
    Key? key,
    required this.title,
    required this.children,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Text(
            title,
            style: AppTextStyles.titleMedium.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        Container(
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.outline),
          ),
          child: Column(
            children: children,
          ),
        ),
      ],
    );
  }
}
```

### Notification Setting Item Component

```dart
class AppNotificationSettingItem extends StatefulWidget {
  final String title;
  final String? subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;
  final bool enabled;

  const AppNotificationSettingItem({
    Key? key,
    required this.title,
    this.subtitle,
    required this.value,
    required this.onChanged,
    this.enabled = true,
  }) : super(key: key);

  @override
  State<AppNotificationSettingItem> createState() => _AppNotificationSettingItemState();
}

class _AppNotificationSettingItemState extends State<AppNotificationSettingItem>
    with SingleTickerProviderStateMixin {

  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _setupAnimations();
  }

  void _setupAnimations() {
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.95,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  Widget build(BuildContext context) {
    return AppFocusableBorder(
      child: Semantics(
        label: widget.title,
        hint: widget.subtitle,
        toggled: widget.value,
        enabled: widget.enabled,
        child: AnimatedBuilder(
          animation: _animationController,
          builder: (context, child) {
            return Transform.scale(
              scale: _scaleAnimation.value,
              child: SwitchListTile(
                title: Text(
                  widget.title,
                  style: AppTextStyles.bodyLarge.copyWith(
                    color: widget.enabled ? AppColors.onSurface : AppColors.onSurfaceVariant,
                  ),
                ),
                subtitle: widget.subtitle != null
                    ? Text(
                        widget.subtitle!,
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.onSurfaceVariant,
                        ),
                      )
                    : null,
                value: widget.value,
                onChanged: widget.enabled
                    ? (value) {
                        _animationController.forward().then((_) {
                          _animationController.reverse();
                        });
                        widget.onChanged(value);
                      }
                    : null,
                activeColor: AppColors.primary,
                inactiveTrackColor: AppColors.surfaceVariant,
              ),
            );
          },
        ),
      ),
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }
}
```

### Notification Preview Component

```dart
class AppNotificationPreview extends StatelessWidget {
  final GlobalNotificationSettings settings;
  final String sampleMessage;

  const AppNotificationPreview({
    Key? key,
    required this.settings,
    required this.sampleMessage,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceVariant,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.outline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.notificationPreview,
            style: AppTextStyles.labelMedium.copyWith(
              color: AppColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 12),

          // Mock Notification
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(8),
              boxShadow: [
                BoxShadow(
                  color: AppColors.shadow,
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              children: [
                // App Icon
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    Icons.chat,
                    color: AppColors.onPrimary,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 12),

                // Notification Content
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'SkiffyMessenger',
                        style: AppTextStyles.labelMedium.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        settings.showPreview ? sampleMessage : l10n.newMessage,
                        style: AppTextStyles.bodyMedium,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '2 min ago',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),

                // Notification Actions
                if (settings.soundEnabled || settings.vibrationEnabled)
                  Column(
                    children: [
                      if (settings.soundEnabled)
                        Icon(
                          Icons.volume_up,
                          size: 16,
                          color: AppColors.onSurfaceVariant,
                        ),
                      if (settings.vibrationEnabled)
                        Icon(
                          Icons.vibration,
                          size: 16,
                          color: AppColors.onSurfaceVariant,
                        ),
                    ],
                  ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // Preview Settings Indicator
          Row(
            children: [
              Icon(
                Icons.info_outline,
                size: 16,
                color: AppColors.onSurfaceVariant,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  _getPreviewDescription(context),
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.onSurfaceVariant,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _getPreviewDescription(BuildContext context) {
    final l10n = context.l10n;
    final features = <String>[];

    if (settings.pushEnabled) features.add(l10n.push);
    if (settings.inAppEnabled) features.add(l10n.inApp);
    if (settings.soundEnabled) features.add(l10n.sound);
    if (settings.vibrationEnabled) features.add(l10n.vibration);

    if (features.isEmpty) {
      return l10n.notificationsDisabled;
    }

    return l10n.previewShows(features.join(', '));
  }
}
```

### BLoC Implementation

```dart
// Events
abstract class NotificationPreferencesEvent {}

class LoadNotificationPreferences extends NotificationPreferencesEvent {}

class UpdateGlobalSettings extends NotificationPreferencesEvent {
  final GlobalNotificationSettings settings;
  UpdateGlobalSettings(this.settings);
}

class UpdateChatTypeSettings extends NotificationPreferencesEvent {
  final ChatType chatType;
  final ChatNotificationSettings settings;
  UpdateChatTypeSettings(this.chatType, this.settings);
}

class UpdatePrivacySettings extends NotificationPreferencesEvent {
  final PrivacyNotificationSettings settings;
  UpdatePrivacySettings(this.settings);
}

class ResetToDefaults extends NotificationPreferencesEvent {}

// States
class NotificationPreferencesState {
  final GlobalNotificationSettings globalSettings;
  final ChatNotificationSettings directChatSettings;
  final ChatNotificationSettings groupChatSettings;
  final PrivacyNotificationSettings privacySettings;
  final bool isLoading;
  final String? error;

  NotificationPreferencesState({
    required this.globalSettings,
    required this.directChatSettings,
    required this.groupChatSettings,
    required this.privacySettings,
    this.isLoading = false,
    this.error,
  });
}

// Data Classes
class GlobalNotificationSettings {
  final bool pushEnabled;
  final bool inAppEnabled;
  final bool soundEnabled;
  final bool vibrationEnabled;

  GlobalNotificationSettings({
    required this.pushEnabled,
    required this.inAppEnabled,
    required this.soundEnabled,
    required this.vibrationEnabled,
  });

  GlobalNotificationSettings copyWith({
    bool? pushEnabled,
    bool? inAppEnabled,
    bool? soundEnabled,
    bool? vibrationEnabled,
  }) {
    return GlobalNotificationSettings(
      pushEnabled: pushEnabled ?? this.pushEnabled,
      inAppEnabled: inAppEnabled ?? this.inAppEnabled,
      soundEnabled: soundEnabled ?? this.soundEnabled,
      vibrationEnabled: vibrationEnabled ?? this.vibrationEnabled,
    );
  }
}

class ChatNotificationSettings {
  final bool enabled;
  final bool mentionOnly;
  final String? customSound;

  ChatNotificationSettings({
    required this.enabled,
    required this.mentionOnly,
    this.customSound,
  });

  ChatNotificationSettings copyWith({
    bool? enabled,
    bool? mentionOnly,
    String? customSound,
  }) {
    return ChatNotificationSettings(
      enabled: enabled ?? this.enabled,
      mentionOnly: mentionOnly ?? this.mentionOnly,
      customSound: customSound ?? this.customSound,
    );
  }
}

class PrivacyNotificationSettings {
  final bool showPreview;
  final bool showSender;
  final bool sendReadReceipts;
  final bool sendTyping;

  PrivacyNotificationSettings({
    required this.showPreview,
    required this.showSender,
    required this.sendReadReceipts,
    required this.sendTyping,
  });

  PrivacyNotificationSettings copyWith({
    bool? showPreview,
    bool? showSender,
    bool? sendReadReceipts,
    bool? sendTyping,
  }) {
    return PrivacyNotificationSettings(
      showPreview: showPreview ?? this.showPreview,
      showSender: showSender ?? this.showSender,
      sendReadReceipts: sendReadReceipts ?? this.sendReadReceipts,
      sendTyping: sendTyping ?? this.sendTyping,
    );
  }
}

// BLoC
class NotificationPreferencesBloc extends Bloc<NotificationPreferencesEvent, NotificationPreferencesState> {
  final NotificationPreferencesService _service;

  NotificationPreferencesBloc(this._service) : super(_getInitialState()) {
    on<LoadNotificationPreferences>(_onLoadPreferences);
    on<UpdateGlobalSettings>(_onUpdateGlobalSettings);
    on<UpdateChatTypeSettings>(_onUpdateChatTypeSettings);
    on<UpdatePrivacySettings>(_onUpdatePrivacySettings);
    on<ResetToDefaults>(_onResetToDefaults);
  }

  static NotificationPreferencesState _getInitialState() {
    return NotificationPreferencesState(
      globalSettings: GlobalNotificationSettings(
        pushEnabled: true,
        inAppEnabled: true,
        soundEnabled: true,
        vibrationEnabled: true,
      ),
      directChatSettings: ChatNotificationSettings(
        enabled: true,
        mentionOnly: false,
      ),
      groupChatSettings: ChatNotificationSettings(
        enabled: true,
        mentionOnly: true,
      ),
      privacySettings: PrivacyNotificationSettings(
        showPreview: true,
        showSender: true,
        sendReadReceipts: true,
        sendTyping: true,
      ),
    );
  }

  Future<void> _onLoadPreferences(
    LoadNotificationPreferences event,
    Emitter<NotificationPreferencesState> emit,
  ) async {
    emit(state.copyWith(isLoading: true));
    try {
      final preferences = await _service.loadPreferences();
      emit(preferences.copyWith(isLoading: false));
    } catch (error) {
      emit(state.copyWith(
        error: error.toString(),
        isLoading: false,
      ));
    }
  }

  Future<void> _onUpdateGlobalSettings(
    UpdateGlobalSettings event,
    Emitter<NotificationPreferencesState> emit,
  ) async {
    try {
      await _service.saveGlobalSettings(event.settings);
      emit(state.copyWith(globalSettings: event.settings));
    } catch (error) {
      emit(state.copyWith(error: error.toString()));
    }
  }

  Future<void> _onUpdateChatTypeSettings(
    UpdateChatTypeSettings event,
    Emitter<NotificationPreferencesState> emit,
  ) async {
    try {
      await _service.saveChatTypeSettings(event.type, event.settings);
      if (event.type == ChatType.direct) {
        emit(state.copyWith(directChatSettings: event.settings));
      } else {
        emit(state.copyWith(groupChatSettings: event.settings));
      }
    } catch (error) {
      emit(state.copyWith(error: error.toString()));
    }
  }

  Future<void> _onUpdatePrivacySettings(
    UpdatePrivacySettings event,
    Emitter<NotificationPreferencesState> emit,
  ) async {
    try {
      await _service.savePrivacySettings(event.settings);
      emit(state.copyWith(privacySettings: event.settings));
    } catch (error) {
      emit(state.copyWith(error: error.toString()));
    }
  }

  Future<void> _onResetToDefaults(
    ResetToDefaults event,
    Emitter<NotificationPreferencesState> emit,
  ) async {
    try {
      await _service.resetToDefaults();
      emit(_getInitialState());
    } catch (error) {
      emit(state.copyWith(error: error.toString()));
    }
  }
}
```

## Strict Scope Definition

### Files to Create

- `lib/features/settings/screens/notification_preferences_screen.dart` - Main preferences screen
- `lib/features/settings/widgets/notification_setting_group.dart` - Setting groups
- `lib/features/settings/widgets/notification_setting_item.dart` - Individual settings
- `lib/features/settings/widgets/notification_preview.dart` - Live preview
- `lib/features/settings/bloc/notification_preferences_bloc.dart` - State management
- `lib/features/settings/bloc/notification_preferences_event.dart` - Events
- `lib/features/settings/bloc/notification_preferences_state.dart` - States
- `lib/services/notification_preferences_service.dart` - Service layer

### Files to Modify

- `lib/features/settings/bloc/settings_bloc.dart` - Add notification preferences integration
- `lib/app/routes/app_router.dart` - Add notification preferences route
- `lib/widgets/widgets.dart` - Add exports for notification components

### Files to Leave Untouched

- `lib/app/design_system/colors.dart` - Use existing colors
- `lib/app/design_system/theme.dart` - Use existing theme
- `android/` and `ios/` - Native notification integration separate

### Critical Constraints

- **MOBILE-FIRST**: Design for 320-414px width screens first
- **PRIVACY-FOCUSED**: Respect user privacy preferences
- **ACCESSIBILITY**: Full WCAG AA compliance for all controls
- **BLoC INTEGRATION**: Must work with existing settings system
- **FFI INTEGRATION**: Sync preferences with Rust core
- **REAL-TIME PREVIEW**: Live preview of notification changes
- **PERFORMANCE**: Efficient preference storage and retrieval

## Additional Context

### Notification Types Hierarchy

1. **Global Settings**: Master switches for all notifications
2. **Chat Type Settings**: Different rules for direct vs group chats
3. **Per-Chat Overrides**: Individual chat notification preferences
4. **Privacy Settings**: Read receipts and typing indicators
5. **Advanced Settings**: Custom sounds, DND, schedules

### Privacy Considerations

- **Granular Control**: Users can disable previews for privacy
- **Read Receipts**: Optional sending of read confirmations
- **Typing Indicators**: Optional sharing of typing status
- **Sender Information**: Option to hide sender in notifications
- **Content Preview**: Toggle for message content in notifications

### Performance Optimizations

- **Lazy Loading**: Load preferences on demand
- **Caching**: Cache preference values locally
- **Debounced Saves**: Prevent excessive preference updates
- **Background Sync**: Sync preferences across devices

### Testing Requirements

- Unit tests for preference logic
- Widget tests for setting interactions
- Integration tests with notification system
- Accessibility tests for screen readers
- Performance tests for preference loading
- End-to-end tests for preference persistence
