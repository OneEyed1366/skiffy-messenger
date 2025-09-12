# Master Context Prompt for SkiffyMessenger Flutter UI Generation (v1.1)

## High-Level Goal

Generate Flutter UI components for SkiffyMessenger v1.1, building upon the existing design system to implement advanced messaging features including notifications, VoIP calls, search, mentions, and enhanced accessibility.

## Detailed, Step-by-Step Instructions

### 1. Project Context & Existing Foundation

- **Existing Design System**: Reference the established AppColors, AppTextStyles, and AppTheme classes in `lib/app/design_system/`
- **Architecture**: Flutter thin client with BLoC state management and FFI integration to Rust core
- **Navigation**: auto_route with AuthGuard protection
- **Accessibility**: FocusableBorder wrapper for all interactive elements

### 2. New Feature Implementation Priority

1. **Notification System**: In-app banners, push notifications, mention handling
2. **VoIP Integration**: Voice and video call interfaces with native system integration
3. **Advanced Messaging**: Mentions, pinned messages, voice messages, search functionality
4. **Enhanced UI Components**: New widgets for the updated messaging interface
5. **Accessibility Enhancements**: Screen reader support, keyboard navigation, WCAG AA compliance

### 3. Component Generation Strategy

- **Mobile-First**: Design for mobile screens first, then adapt for tablet/desktop
- **BLoC Integration**: All new components must integrate with BLoC pattern
- **FFI Ready**: Include hooks for Rust core integration points
- **Accessibility First**: Every component must meet WCAG AA standards
- **Performance Focused**: Optimize for 60 FPS scrolling and smooth animations

### 4. Key Integration Points

- **Rust Core Communication**: Use existing FFI bridge for messaging, notifications, and VoIP
- **Background Services**: Integrate with flutter_background_service for push notifications
- **Native Features**: Use flutter_callkit_incoming for system call UI
- **State Management**: Extend existing BLoC structure for new features

## Code Examples, Data Structures & Constraints

### Existing Design System Usage

```dart
// Reference existing colors and styles
import 'package:skiffy/app/design_system/colors.dart';
import 'package:skiffy/app/design_system/theme.dart';

// Use established patterns
class NewComponent extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return AppFocusableBorder(
      child: Container(
        color: AppColors.primaryContainer,
        child: Text(
          'Content',
          style: AppTextStyles.body,
        ),
      ),
    );
  }
}
```

### BLoC Integration Pattern

```dart
// Extend existing BLoC structure
class NotificationBloc extends Bloc<NotificationEvent, NotificationState> {
  final RustApi _rustApi;

  NotificationBloc(this._rustApi) : super(NotificationInitial()) {
    on<LoadNotifications>(_onLoadNotifications);
    on<MarkAsRead>(_onMarkAsRead);
    on<ShowInAppBanner>(_onShowInAppBanner);
  }
}
```

### FFI Integration Points

```dart
// New FFI methods for v1.1 features
class RustApi {
  // Existing methods...
  Future<void> pinMessage(String roomId, String messageId);
  Future<List<PinnedMessage>> getPinnedMessages(String roomId);
  Future<List<SearchResult>> searchMessages(String roomId, String query);
  Future<void> registerPushToken(String token);
  Stream<NotificationEvent> getNotificationStream();
  Future<void> initiateCall(String roomId, {bool video = false});
  Future<void> sendVoiceMessage(String roomId, File audioFile);
}
```

### Localization (l10n) Integration

```dart
// Follow existing localization pattern from counter_page.dart
import 'package:skiffy/l10n/l10n.dart';

// Use context.l10n for all user-facing strings
class NewComponent extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Scaffold(
      appBar: AppBar(title: Text(l10n.someFeatureTitle)),
      body: Center(
        child: Text(l10n.someFeatureDescription),
      ),
    );
  }
}
```

### New Widget Structure

```dart
// Follow existing patterns for new components
class AppNotificationBanner extends StatefulWidget {
  final String roomName;
  final String senderName;
  final String messagePreview;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return AppFocusableBorder(
      child: AnimatedContainer(
        // Implementation following existing design patterns
      ),
    );
  }
}
```

## Strict Scope Definition

### Files to Create (New Components)

- `lib/widgets/app_notification_banner.dart` - In-app notification system
- `lib/widgets/app_mention_input.dart` - Mention autocomplete input
- `lib/widgets/app_voice_recorder.dart` - Voice message recording
- `lib/widgets/app_video_recorder.dart` - Video message interface
- `lib/features/notifications/` - Complete notification feature
- `lib/features/calls/` - VoIP call management
- `lib/features/search/` - Message search functionality
- `lib/services/notification_service.dart` - Push notification handling
- `lib/services/voip_service.dart` - Call management service

### Files to Extend (Existing Components)

- `lib/features/timeline/` - Add pinned messages, reactions, mentions
- `lib/app/design_system/theme.dart` - Add new component themes
- `lib/widgets/widgets.dart` - Export new components

### Files to Leave Untouched

- `lib/app/design_system/colors.dart` - Existing color system (already complete)
- `lib/app/design_system/typography.dart` - Existing text styles
- `lib/api/frb_generated.dart` - Auto-generated FFI code
- `android/` and `ios/` - Native implementations
- `rust/` - Core business logic

### Critical Constraints

- **PRESERVE EXISTING DESIGN SYSTEM**: Do not modify or recreate AppColors, AppTextStyles, or AppTheme
- **MAINTAIN BLoC PATTERN**: All new features must use BLoC for state management
- **ACCESSIBILITY FIRST**: Every new component must include FocusableBorder and proper semantics
- **MOBILE-FIRST DESIGN**: Start with mobile layout, adapt for larger screens
- **PERFORMANCE REQUIREMENTS**: Maintain 60 FPS for all scrolling and animations
- **E2EE INTEGRATION**: Include encryption status indicators where applicable
- **PRIVACY FOCUS**: No telemetry or data collection without explicit consent

## Additional Context for v1.1 Features

### Notification System Requirements

- **Push Notifications**: Firebase integration with background processing
- **In-App Banners**: Slide-down animations with auto-dismiss
- **Mention Handling**: Special highlighting and notification preferences
- **Privacy Controls**: Granular notification settings per room/channel

### VoIP Integration Requirements

- **System UI**: Use flutter_callkit_incoming for native call screens
- **Background Processing**: Maintain WebSocket connection during calls
- **E2EE Verification**: Visual indicators for call security
- **Picture-in-Picture**: Local video overlay during calls

### Advanced Messaging Features

- **Mention System**: @username autocomplete with user search
- **Pinned Messages**: Dynamic bar with navigation controls
- **Voice Messages**: Swipe-to-cancel recording with visual feedback
- **Message Search**: Real-time search with result highlighting
- **Reactions**: Emoji reactions with user counts

### Accessibility Enhancements

- **Screen Reader Support**: Comprehensive labeling for all new features
- **Keyboard Navigation**: Full keyboard accessibility for complex components
- **Focus Management**: Proper focus flow through new UI elements
- **Color Contrast**: All new elements meet WCAG AA standards
- **Touch Targets**: Minimum 44x44dp for all interactive elements

This master prompt provides the foundation for generating all new v1.1 components while preserving and building upon the existing design system and architecture.
