# Lovable Prompt: Pinned Messages Management System

## High-Level Goal

Create a comprehensive pinned messages management system for SkiffyMessenger that provides dynamic navigation, management controls, and seamless integration with the existing chat interface.

## Detailed, Step-by-Step Instructions

### 1. Component Structure

1. Create `lib/widgets/app_pinned_messages_bar.dart` - Dynamic pinned messages bar
2. Create `lib/widgets/app_pinned_message_item.dart` - Individual pinned message display
3. Create `lib/features/pinned_messages/screens/pinned_messages_screen.dart` - Full management screen
4. Create `lib/features/pinned_messages/bloc/pinned_messages_bloc.dart` - State management
5. Create `lib/services/pinned_messages_service.dart` - Service layer for pinned messages

### 2. Visual Design Implementation

1. Use AppColors for pinned message indicators and navigation
2. Apply AppTextStyles for message previews and timestamps
3. Implement smooth scrolling animations for navigation
4. Add visual indicators for pinned message count and status
5. Include participant avatars and message type icons

### 3. Interaction & Behavior

1. **Dynamic Bar**: Shows most recent pinned message with navigation controls
2. **Scroll Navigation**: Automatically updates bar content during chat scrolling
3. **Tap to Navigate**: Jump to original message position in chat
4. **Management Screen**: Full list view with pin/unpin controls
5. **Context Menu**: Quick actions for pinning/unpinning messages

### 4. Animation & UX

1. Smooth slide-in animations for the pinned bar (200ms ease-out)
2. Fade transitions when switching between pinned messages
3. Bounce effect when navigating to message location
4. Highlight animation for newly pinned messages
5. Collapse/expand animations for the management interface

### 5. Accessibility Features

1. Wrap all interactive elements with AppFocusableBorder
2. Add comprehensive Semantics for screen reader support
3. Announce pinned message navigation and counts
4. Keyboard navigation support for management interface
5. High contrast mode support for pinned indicators

## Code Examples, Data Structures & Constraints

### Pinned Messages Bar Component

```dart
class AppPinnedMessagesBar extends StatefulWidget {
  final String roomId;
  final VoidCallback? onNavigateToMessage;
  final VoidCallback? onOpenManagement;

  const AppPinnedMessagesBar({
    Key? key,
    required this.roomId,
    this.onNavigateToMessage,
    this.onOpenManagement,
  }) : super(key: key);

  @override
  State<AppPinnedMessagesBar> createState() => _AppPinnedMessagesBarState();
}

class _AppPinnedMessagesBarState extends State<AppPinnedMessagesBar>
    with SingleTickerProviderStateMixin {

  late AnimationController _animationController;
  late Animation<Offset> _slideAnimation;
  late Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();
    _setupAnimations();
  }

  void _setupAnimations() {
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 200),
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

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<PinnedMessagesBloc, PinnedMessagesState>(
      builder: (context, state) {
        if (state.pinnedMessages.isEmpty) {
          return const SizedBox.shrink();
        }

        return AnimatedBuilder(
          animation: _animationController,
          builder: (context, child) {
            return SlideTransition(
              position: _slideAnimation,
              child: Opacity(
                opacity: _opacityAnimation.value,
                child: _buildPinnedBar(context, state),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildPinnedBar(BuildContext context, PinnedMessagesState state) {
    final l10n = context.l10n;
    final currentMessage = state.currentPinnedMessage;

    return AppFocusableBorder(
      child: Semantics(
        label: l10n.pinnedMessagesBarLabel,
        button: true,
        child: GestureDetector(
          onTap: widget.onNavigateToMessage,
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.outline),
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
                // Pin Icon
                Icon(
                  Icons.push_pin,
                  color: AppColors.primary,
                  size: 20,
                ),
                const SizedBox(width: 12),

                // Message Preview
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Sender and Preview
                      RichText(
                        text: TextSpan(
                          children: [
                            TextSpan(
                              text: '${currentMessage.senderName}: ',
                              style: AppTextStyles.labelMedium.copyWith(
                                color: AppColors.primary,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            TextSpan(
                              text: currentMessage.previewText,
                              style: AppTextStyles.bodyMedium,
                            ),
                          ],
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),

                      // Timestamp
                      Text(
                        _formatTimestamp(currentMessage.timestamp),
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),

                // Navigation Controls
                Row(
                  children: [
                    // Previous Button
                    if (state.canNavigatePrevious)
                      AppFocusableBorder(
                        child: Semantics(
                          button: true,
                          label: l10n.previousPinnedMessage,
                          child: IconButton(
                            icon: const Icon(Icons.chevron_left),
                            onPressed: () => context.read<PinnedMessagesBloc>()
                                .add(NavigateToPreviousPinnedMessage()),
                            iconSize: 24,
                            color: AppColors.onSurfaceVariant,
                          ),
                        ),
                      ),

                    // Pinned Count
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primaryContainer,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        '${state.currentIndex + 1}/${state.pinnedMessages.length}',
                        style: AppTextStyles.labelSmall.copyWith(
                          color: AppColors.onPrimaryContainer,
                        ),
                      ),
                    ),

                    // Next Button
                    if (state.canNavigateNext)
                      AppFocusableBorder(
                        child: Semantics(
                          button: true,
                          label: l10n.nextPinnedMessage,
                          child: IconButton(
                            icon: const Icon(Icons.chevron_right),
                            onPressed: () => context.read<PinnedMessagesBloc>()
                                .add(NavigateToNextPinnedMessage()),
                            iconSize: 24,
                            color: AppColors.onSurfaceVariant,
                          ),
                        ),
                      ),

                    // Management Button
                    AppFocusableBorder(
                      child: Semantics(
                        button: true,
                        label: l10n.managePinnedMessages,
                        child: IconButton(
                          icon: const Icon(Icons.more_vert),
                          onPressed: widget.onOpenManagement,
                          iconSize: 24,
                          color: AppColors.onSurfaceVariant,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _formatTimestamp(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);

    if (difference.inDays == 0) {
      return '${timestamp.hour}:${timestamp.minute.toString().padLeft(2, '0')}';
    } else if (difference.inDays == 1) {
      return context.l10n.yesterday;
    } else if (difference.inDays < 7) {
      return context.l10n.daysAgo(difference.inDays);
    } else {
      return '${timestamp.day}/${timestamp.month}/${timestamp.year}';
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }
}
```

### Pinned Messages Management Screen

```dart
class PinnedMessagesScreen extends StatefulWidget {
  final String roomId;

  const PinnedMessagesScreen({
    Key? key,
    required this.roomId,
  }) : super(key: key);

  @override
  State<PinnedMessagesScreen> createState() => _PinnedMessagesScreenState();
}

class _PinnedMessagesScreenState extends State<PinnedMessagesScreen> {
  @override
  void initState() {
    super.initState();
    context.read<PinnedMessagesBloc>().add(LoadPinnedMessages(widget.roomId));
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.pinnedMessages),
        actions: [
          AppFocusableBorder(
            child: Semantics(
              button: true,
              label: l10n.close,
              child: IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ),
          ),
        ],
      ),
      body: BlocBuilder<PinnedMessagesBloc, PinnedMessagesState>(
        builder: (context, state) {
          if (state.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state.pinnedMessages.isEmpty) {
            return _buildEmptyState(context);
          }

          return _buildPinnedMessagesList(context, state);
        },
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    final l10n = context.l10n;
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.push_pin_outlined,
            size: 64,
            color: AppColors.onSurfaceVariant,
          ),
          const SizedBox(height: 16),
          Text(
            l10n.noPinnedMessages,
            style: AppTextStyles.headlineSmall,
          ),
          const SizedBox(height: 8),
          Text(
            l10n.noPinnedMessagesDescription,
            style: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildPinnedMessagesList(BuildContext context, PinnedMessagesState state) {
    final l10n = context.l10n;
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: state.pinnedMessages.length,
      itemBuilder: (context, index) {
        final pinnedMessage = state.pinnedMessages[index];
        return AppPinnedMessageItem(
          pinnedMessage: pinnedMessage,
          onUnpin: () => context.read<PinnedMessagesBloc>().add(
            UnpinMessage(pinnedMessage.messageId),
          ),
          onNavigate: () => _navigateToMessage(pinnedMessage),
        );
      },
    );
  }

  void _navigateToMessage(PinnedMessage pinnedMessage) {
    // Navigate back to chat and scroll to message
    Navigator.of(context).pop();
    // Trigger navigation to specific message in chat
    context.read<ChatBloc>().add(NavigateToMessage(pinnedMessage.messageId));
  }
}
```

### Pinned Message Item Component

```dart
class AppPinnedMessageItem extends StatefulWidget {
  final PinnedMessage pinnedMessage;
  final VoidCallback onUnpin;
  final VoidCallback onNavigate;

  const AppPinnedMessageItem({
    Key? key,
    required this.pinnedMessage,
    required this.onUnpin,
    required this.onNavigate,
  }) : super(key: key);

  @override
  State<AppPinnedMessageItem> createState() => _AppPinnedMessageItemState();
}

class _AppPinnedMessageItemState extends State<AppPinnedMessageItem>
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
    final l10n = context.l10n;
    return AppFocusableBorder(
      child: Semantics(
        label: l10n.pinnedMessageItemLabel(widget.pinnedMessage.senderName),
        button: true,
        child: GestureDetector(
          onTap: _handleTap,
          onLongPress: _showContextMenu,
          child: AnimatedBuilder(
            animation: _animationController,
            builder: (context, child) {
              return Transform.scale(
                scale: _scaleAnimation.value,
                child: Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Header with sender and timestamp
                        Row(
                          children: [
                            // Sender Avatar
                            CircleAvatar(
                              radius: 16,
                              backgroundImage: widget.pinnedMessage.senderAvatarUrl != null
                                  ? NetworkImage(widget.pinnedMessage.senderAvatarUrl!)
                                  : null,
                              backgroundColor: AppColors.primaryContainer,
                              child: widget.pinnedMessage.senderAvatarUrl == null
                                  ? Text(
                                      widget.pinnedMessage.senderName[0].toUpperCase(),
                                      style: AppTextStyles.labelSmall.copyWith(
                                        color: AppColors.onPrimaryContainer,
                                      ),
                                    )
                                  : null,
                            ),
                            const SizedBox(width: 12),

                            // Sender Name and Timestamp
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    widget.pinnedMessage.senderName,
                                    style: AppTextStyles.labelLarge.copyWith(
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  Text(
                                    _formatTimestamp(widget.pinnedMessage.timestamp),
                                    style: AppTextStyles.bodySmall.copyWith(
                                      color: AppColors.onSurfaceVariant,
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            // Pin Icon
                            Icon(
                              Icons.push_pin,
                              color: AppColors.primary,
                              size: 20,
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),

                        // Message Content
                        Text(
                          widget.pinnedMessage.content,
                          style: AppTextStyles.bodyMedium,
                        ),

                        // Message Type Indicator (if applicable)
                        if (widget.pinnedMessage.messageType != MessageType.text)
                          Padding(
                            padding: const EdgeInsets.only(top: 8),
                            child: Row(
                              children: [
                                Icon(
                                  _getMessageTypeIcon(widget.pinnedMessage.messageType),
                                  size: 16,
                                  color: AppColors.onSurfaceVariant,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  _getMessageTypeLabel(widget.pinnedMessage.messageType),
                                  style: AppTextStyles.bodySmall.copyWith(
                                    color: AppColors.onSurfaceVariant,
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  void _handleTap() {
    _animationController.forward().then((_) {
      _animationController.reverse();
    });
    widget.onNavigate();
  }

  void _showContextMenu() {
    final l10n = context.l10n;
    showModalBottomSheet(
      context: context,
      builder: (context) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            leading: const Icon(Icons.push_pin_outlined),
            title: Text(l10n.unpinMessage),
            onTap: () {
              Navigator.of(context).pop();
              widget.onUnpin();
            },
          ),
          ListTile(
            leading: const Icon(Icons.navigation),
            title: Text(l10n.navigateToMessage),
            onTap: () {
              Navigator.of(context).pop();
              widget.onNavigate();
            },
          ),
        ],
      ),
    );
  }

  IconData _getMessageTypeIcon(MessageType type) {
    switch (type) {
      case MessageType.image:
        return Icons.image;
      case MessageType.video:
        return Icons.videocam;
      case MessageType.audio:
        return Icons.audio_file;
      case MessageType.file:
        return Icons.attach_file;
      default:
        return Icons.textsms;
    }
  }

  String _getMessageTypeLabel(MessageType type) {
    final l10n = context.l10n;
    switch (type) {
      case MessageType.image:
        return l10n.image;
      case MessageType.video:
        return l10n.video;
      case MessageType.audio:
        return l10n.audio;
      case MessageType.file:
        return l10n.file;
      default:
        return l10n.message;
    }
  }

  String _formatTimestamp(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);

    if (difference.inDays == 0) {
      return '${timestamp.hour}:${timestamp.minute.toString().padLeft(2, '0')}';
    } else if (difference.inDays == 1) {
      return context.l10n.yesterday;
    } else if (difference.inDays < 7) {
      return context.l10n.daysAgo(difference.inDays);
    } else {
      return '${timestamp.day}/${timestamp.month}/${timestamp.year}';
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }
}
```

### BLoC Implementation

```dart
// Events
abstract class PinnedMessagesEvent {}

class LoadPinnedMessages extends PinnedMessagesEvent {
  final String roomId;
  LoadPinnedMessages(this.roomId);
}

class PinMessage extends PinnedMessagesEvent {
  final String messageId;
  PinMessage(this.messageId);
}

class UnpinMessage extends PinnedMessagesEvent {
  final String messageId;
  UnpinMessage(this.messageId);
}

class NavigateToPreviousPinnedMessage extends PinnedMessagesEvent {}

class NavigateToNextPinnedMessage extends PinnedMessagesEvent {}

// States
class PinnedMessagesState {
  final List<PinnedMessage> pinnedMessages;
  final int currentIndex;
  final bool isLoading;
  final String? error;

  PinnedMessagesState({
    required this.pinnedMessages,
    this.currentIndex = 0,
    this.isLoading = false,
    this.error,
  });

  PinnedMessage get currentPinnedMessage => pinnedMessages[currentIndex];
  bool get canNavigatePrevious => currentIndex > 0;
  bool get canNavigateNext => currentIndex < pinnedMessages.length - 1;
}

// BLoC
class PinnedMessagesBloc extends Bloc<PinnedMessagesEvent, PinnedMessagesState> {
  final PinnedMessagesService _service;

  PinnedMessagesBloc(this._service) : super(PinnedMessagesState(pinnedMessages: [])) {
    on<LoadPinnedMessages>(_onLoadPinnedMessages);
    on<PinMessage>(_onPinMessage);
    on<UnpinMessage>(_onUnpinMessage);
    on<NavigateToPreviousPinnedMessage>(_onNavigateToPrevious);
    on<NavigateToNextPinnedMessage>(_onNavigateToNext);
  }

  Future<void> _onLoadPinnedMessages(
    LoadPinnedMessages event,
    Emitter<PinnedMessagesState> emit,
  ) async {
    emit(state.copyWith(isLoading: true));
    try {
      final pinnedMessages = await _service.getPinnedMessages(event.roomId);
      emit(state.copyWith(
        pinnedMessages: pinnedMessages,
        isLoading: false,
      ));
    } catch (error) {
      emit(state.copyWith(
        error: error.toString(),
        isLoading: false,
      ));
    }
  }

  Future<void> _onPinMessage(
    PinMessage event,
    Emitter<PinnedMessagesState> emit,
  ) async {
    try {
      await _service.pinMessage(event.messageId);
      // Reload pinned messages
      add(LoadPinnedMessages(_service.currentRoomId));
    } catch (error) {
      emit(state.copyWith(error: error.toString()));
    }
  }

  Future<void> _onUnpinMessage(
    UnpinMessage event,
    Emitter<PinnedMessagesState> emit,
  ) async {
    try {
      await _service.unpinMessage(event.messageId);
      // Reload pinned messages
      add(LoadPinnedMessages(_service.currentRoomId));
    } catch (error) {
      emit(state.copyWith(error: error.toString()));
    }
  }

  void _onNavigateToPrevious(
    NavigateToPreviousPinnedMessage event,
    Emitter<PinnedMessagesState> emit,
  ) {
    if (state.canNavigatePrevious) {
      emit(state.copyWith(currentIndex: state.currentIndex - 1));
    }
  }

  void _onNavigateToNext(
    NavigateToNextPinnedMessage event,
    Emitter<PinnedMessagesState> emit,
  ) {
    if (state.canNavigateNext) {
      emit(state.copyWith(currentIndex: state.currentIndex + 1));
    }
  }
}
```

## Strict Scope Definition

### Files to Create

- `lib/widgets/app_pinned_messages_bar.dart` - Dynamic pinned messages bar
- `lib/widgets/app_pinned_message_item.dart` - Individual pinned message display
- `lib/features/pinned_messages/screens/pinned_messages_screen.dart` - Management screen
- `lib/features/pinned_messages/bloc/pinned_messages_bloc.dart` - State management
- `lib/features/pinned_messages/bloc/pinned_messages_event.dart` - Events
- `lib/features/pinned_messages/bloc/pinned_messages_state.dart` - States
- `lib/services/pinned_messages_service.dart` - Service layer

### Files to Modify

- `lib/widgets/widgets.dart` - Add exports for pinned message components
- `lib/features/timeline/widgets/message_bubble.dart` - Add pin/unpin context menu
- `lib/features/timeline/bloc/timeline_bloc.dart` - Add pinned message integration
- `lib/app/routes/app_router.dart` - Add pinned messages routes

### Files to Leave Untouched

- `lib/app/design_system/colors.dart` - Use existing colors
- `lib/app/design_system/theme.dart` - Use existing theme
- `android/` and `ios/` - Native integration separate

### Critical Constraints

- **MOBILE-FIRST**: Design for 320-414px width screens first
- **PERFORMANCE**: Smooth scrolling and navigation animations
- **ACCESSIBILITY**: Full WCAG AA compliance for navigation
- **BLoC INTEGRATION**: Must work with existing timeline state
- **FFI INTEGRATION**: Use existing Matrix pinned events
- **REAL-TIME UPDATES**: Sync pinned messages across devices
- **PERMISSION-BASED**: Respect room power levels for pinning

## Additional Context

### Permission Model

1. **1-on-1 Chats**: Both participants can pin/unpin any message
2. **Group Chats**: Only administrators and moderators can manage pins
3. **Room Settings**: Option to disable pinning for regular users

### Navigation Features

- **Dynamic Bar**: Updates content based on scroll position
- **Jump to Message**: Smooth scroll animation to original location
- **Visual Indicators**: Highlight pinned messages in chat
- **Breadcrumb Navigation**: Show pin position in message history

### Message Types Support

- **Text Messages**: Full preview with formatting
- **Media Messages**: Thumbnail preview with type indicators
- **System Messages**: Special handling for events
- **Deleted Messages**: Graceful handling of removed pins

### Performance Optimizations

- **Lazy Loading**: Load pinned message content on demand
- **Caching**: Cache pinned message data locally
- **Debounced Updates**: Prevent excessive UI updates
- **Memory Management**: Efficient handling of large pin lists

### Testing Requirements

- Unit tests for navigation logic
- Widget tests for pin/unpin interactions
- Integration tests with timeline scrolling
- Accessibility tests for screen readers
- Performance tests for large pin collections
- End-to-end tests for cross-device sync
