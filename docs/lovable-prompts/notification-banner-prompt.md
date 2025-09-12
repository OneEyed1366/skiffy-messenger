# Lovable Prompt: AppNotificationBanner Component

## High-Level Goal

Create an in-app notification banner component for SkiffyMessenger that displays real-time notifications with smooth animations, accessibility support, and integration with the existing design system.

## Detailed, Step-by-Step Instructions

### 1. Component Structure

1. Create `lib/widgets/app_notification_banner.dart`
2. Implement as a StatefulWidget with animation capabilities
3. Include proper accessibility features with FocusableBorder
4. Add slide-down animation for appearance and slide-up for dismissal

### 2. Visual Design Implementation

1. Use AppColors.infoContainer as background color
2. Apply AppTextStyles.body for message text
3. Include sender avatar (circular, 32x32dp) on the left
4. Add notification icon (bell or message icon) next to text
5. Implement auto-dismiss after 5 seconds with progress indicator

### 3. Animation & Interaction

1. Slide-down animation from top of screen (300ms ease-out)
2. Bounce effect on initial appearance (200ms)
3. Swipe-up gesture for manual dismissal
4. Tap to navigate to the relevant chat/room
5. Auto-dismiss with smooth fade-out animation

### 4. Accessibility Features

1. Wrap entire component with AppFocusableBorder
2. Add Semantics with proper labels and hints
3. Screen reader announcement: "New message from [sender] in [room]"
4. Keyboard navigation support (Enter to open, Escape to dismiss)
5. High contrast mode support

### 5. State Management Integration

1. Connect to NotificationBloc for state management
2. Listen to notification stream from Rust core
3. Handle multiple notifications with queue system
4. Update notification preferences integration

## Code Examples, Data Structures & Constraints

### Component Interface

```dart
class AppNotificationBanner extends StatefulWidget {
  final String roomId;
  final String roomName;
  final String senderName;
  final String messagePreview;
  final String? avatarUrl;
  final VoidCallback? onTap;
  final VoidCallback? onDismiss;
  final Duration autoDismissDuration;

  const AppNotificationBanner({
    Key? key,
    required this.roomId,
    required this.roomName,
    required this.senderName,
    required this.messagePreview,
    this.avatarUrl,
    this.onTap,
    this.onDismiss,
    this.autoDismissDuration = const Duration(seconds: 5),
  }) : super(key: key);
}
```

### Animation Implementation

```dart
class _AppNotificationBannerState extends State<AppNotificationBanner>
    with SingleTickerProviderStateMixin {

  late AnimationController _animationController;
  late Animation<Offset> _slideAnimation;
  late Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();
    _setupAnimations();
    _startAutoDismissTimer();
  }

  void _setupAnimations() {
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, -1),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOut,
    ));

    _opacityAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOut,
    ));

    _animationController.forward();
  }
}
```

### BLoC Integration

```dart
// In the widget's build method
@override
Widget build(BuildContext context) {
  return BlocBuilder<NotificationBloc, NotificationState>(
    builder: (context, state) {
      if (state is NotificationReceived) {
        return _buildNotificationBanner(state.notification);
      }
      return const SizedBox.shrink();
    },
  );
}
```

### Localization Integration

```dart
// Import localization
import 'package:skiffy/l10n/l10n.dart';

// Use l10n in component
@override
Widget build(BuildContext context) {
  final l10n = context.l10n;
  return BlocBuilder<NotificationBloc, NotificationState>(
    builder: (context, state) {
      if (state is NotificationReceived) {
        return _buildNotificationBanner(context, state.notification);
      }
      return const SizedBox.shrink();
    },
  );
}
```

### Accessibility Implementation

```dart
Widget _buildNotificationBanner(BuildContext context, NotificationData notification) {
  final l10n = context.l10n;
  return AppFocusableBorder(
    child: Semantics(
      label: l10n.notificationFromSenderInRoom(notification.senderName, notification.roomName),
      hint: l10n.notificationTapToOpen,
      button: true,
      child: GestureDetector(
        onTap: _handleTap,
        child: Dismissible(
          key: Key(notification.id),
          direction: DismissDirection.up,
          onDismissed: _handleDismiss,
          child: AnimatedBuilder(
            animation: _animationController,
            builder: (context, child) {
              return SlideTransition(
                position: _slideAnimation,
                child: Opacity(
                  opacity: _opacityAnimation.value,
                  child: _buildBannerContent(context, notification),
                ),
              );
            },
          ),
        ),
      ),
    ),
  );
}
```

## Strict Scope Definition

### Files to Create

- `lib/widgets/app_notification_banner.dart` - Main component implementation

### Files to Modify

- `lib/widgets/widgets.dart` - Add export for AppNotificationBanner
- `lib/features/notifications/bloc/notification_bloc.dart` - Add banner display logic
- `lib/features/notifications/bloc/notification_event.dart` - Add banner events
- `lib/features/notifications/bloc/notification_state.dart` - Add banner states

### Files to Leave Untouched

- `lib/app/design_system/colors.dart` - Use existing colors
- `lib/app/design_system/theme.dart` - Use existing theme
- `android/` and `ios/` - Native notification handling separate

### Critical Constraints

- **MOBILE-FIRST**: Design for 320-414px width screens first
- **PERFORMANCE**: Animations must maintain 60 FPS
- **ACCESSIBILITY**: Must pass WCAG AA contrast requirements
- **BLoC INTEGRATION**: Must work with existing notification system
- **AUTO-DISMISS**: 5-second timer with visual progress indicator
- **GESTURE SUPPORT**: Swipe up to dismiss, tap to open
- **QUEUE SYSTEM**: Handle multiple notifications gracefully

## Additional Context

### Notification Types to Support

1. **New Message**: Standard notification with sender and preview
2. **Mention**: Special highlighting for @mentions
3. **Room Notification**: @room mentions for all participants
4. **Call Invitation**: Incoming voice/video call notifications
5. **System Notification**: App updates, security alerts

### Privacy Considerations

- Respect user's notification preferences per room
- Don't show message content if privacy settings restrict it
- Allow disabling auto-dismiss for important notifications
- Support "Do Not Disturb" mode integration

### Performance Requirements

- Smooth 60 FPS animations on all supported devices
- Minimal memory footprint for notification queue
- Efficient avatar image loading and caching
- Background processing for notification handling

### Testing Requirements

- Unit tests for animation states
- Widget tests for interaction handling
- Integration tests with NotificationBloc
- Accessibility tests for screen readers
- Performance tests for animation smoothness
