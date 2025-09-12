# Lovable Prompt: VoIP Call Interfaces Enhancement

## High-Level Goal

Create comprehensive VoIP call interface specifications for SkiffyMessenger that provide native-feeling call experiences with E2EE verification, picture-in-picture support, and seamless integration with the existing design system.

## Detailed, Step-by-Step Instructions

### 1. Component Structure

1. Create `lib/widgets/app_call_controls.dart` - Call control buttons
2. Create `lib/widgets/app_call_status.dart` - Call status indicators
3. Create `lib/widgets/app_e2ee_verification.dart` - E2EE verification overlay
4. Create `lib/features/calls/screens/incoming_call_screen.dart` - Native incoming call UI
5. Create `lib/features/calls/screens/active_call_screen.dart` - Active call interface
6. Create `lib/features/calls/screens/pip_video_overlay.dart` - Picture-in-picture video
7. Create `lib/services/voip_service.dart` - Call management service

### 2. Visual Design Implementation

1. Use AppColors for call state indicators (green for connected, red for error)
2. Apply AppTextStyles for call duration and participant names
3. Implement circular call controls with proper touch targets (minimum 44x44dp)
4. Add smooth animations for call state transitions
5. Include participant avatars and online status indicators

### 3. Interaction & Behavior

1. **Incoming Call Screen**: Full-screen overlay with accept/decline buttons
2. **Active Call Screen**: Minimize/maximize controls with participant grid
3. **Picture-in-Picture**: Draggable overlay for video calls during multitasking
4. **Call Controls**: Mute, video toggle, speaker, hangup with haptic feedback
5. **E2EE Verification**: Emoji comparison overlay for security verification

### 4. Animation & UX

1. Smooth slide-in animations for call screens (300ms ease-out)
2. Pulse animation for incoming call indicators
3. Scale animations for button presses (0.95x scale on press)
4. Fade transitions between call states
5. Bounce effect for successful connections

### 5. Accessibility Features

1. Wrap all interactive elements with AppFocusableBorder
2. Add comprehensive Semantics for screen reader support
3. Announce call state changes ("Call connected", "Participant joined")
4. Keyboard navigation support for all controls
5. High contrast mode support for call interfaces

## Code Examples, Data Structures & Constraints

### Call Control Buttons Component

```dart
class AppCallControls extends StatelessWidget {
  final bool isMuted;
  final bool isVideoEnabled;
  final bool isSpeakerOn;
  final VoidCallback onMuteToggle;
  final VoidCallback onVideoToggle;
  final VoidCallback onSpeakerToggle;
  final VoidCallback onHangup;
  final VoidCallback onMinimize;

  const AppCallControls({
    Key? key,
    required this.isMuted,
    required this.isVideoEnabled,
    required this.isSpeakerOn,
    required this.onMuteToggle,
    required this.onVideoToggle,
    required this.onSpeakerToggle,
    required this.onHangup,
    required this.onMinimize,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.shadow,
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildControlButton(
            context: context,
            icon: isMuted ? Icons.mic_off : Icons.mic,
            label: isMuted ? l10n.unmute : l10n.mute,
            color: isMuted ? AppColors.error : AppColors.primary,
            onPressed: onMuteToggle,
          ),
          _buildControlButton(
            context: context,
            icon: isVideoEnabled ? Icons.videocam : Icons.videocam_off,
            label: isVideoEnabled ? l10n.disableVideo : l10n.enableVideo,
            color: isVideoEnabled ? AppColors.primary : AppColors.error,
            onPressed: onVideoToggle,
          ),
          _buildControlButton(
            context: context,
            icon: isSpeakerOn ? Icons.volume_up : Icons.volume_off,
            label: isSpeakerOn ? l10n.speakerOff : l10n.speakerOn,
            color: AppColors.secondary,
            onPressed: onSpeakerToggle,
          ),
          _buildHangupButton(context),
          _buildMinimizeButton(context),
        ],
      ),
    );
  }

  Widget _buildControlButton({
    required BuildContext context,
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onPressed,
  }) {
    return AppFocusableBorder(
      child: Semantics(
        button: true,
        label: label,
        child: GestureDetector(
          onTap: onPressed,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              border: Border.all(color: color, width: 2),
              shape: BoxShape.circle,
            ),
            child: Icon(
              icon,
              color: color,
              size: 28,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHangupButton(BuildContext context) {
    final l10n = context.l10n;
    return AppFocusableBorder(
      child: Semantics(
        button: true,
        label: l10n.hangupCall,
        child: GestureDetector(
          onTap: onHangup,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            width: 64,
            height: 64,
            decoration: const BoxDecoration(
              color: AppColors.error,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.call_end,
              color: AppColors.onError,
              size: 28,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMinimizeButton(BuildContext context) {
    final l10n = context.l10n;
    return AppFocusableBorder(
      child: Semantics(
        button: true,
        label: l10n.minimizeCall,
        child: GestureDetector(
          onTap: onMinimize,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AppColors.surfaceVariant,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              Icons.keyboard_arrow_down,
              color: AppColors.onSurfaceVariant,
              size: 24,
            ),
          ),
        ),
      ),
    );
  }
}
```

### Incoming Call Screen

```dart
class IncomingCallScreen extends StatefulWidget {
  final String callerName;
  final String? callerAvatarUrl;
  final String roomName;
  final VoidCallback onAccept;
  final VoidCallback onDecline;
  final bool isVideoCall;

  const IncomingCallScreen({
    Key? key,
    required this.callerName,
    this.callerAvatarUrl,
    required this.roomName,
    required this.onAccept,
    required this.onDecline,
    this.isVideoCall = false,
  }) : super(key: key);

  @override
  State<IncomingCallScreen> createState() => _IncomingCallScreenState();
}

class _IncomingCallScreenState extends State<IncomingCallScreen>
    with SingleTickerProviderStateMixin {

  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _setupPulseAnimation();
  }

  void _setupPulseAnimation() {
    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(
      begin: 1.0,
      end: 1.1,
    ).animate(CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Caller Avatar with Pulse Animation
              AnimatedBuilder(
                animation: _pulseAnimation,
                builder: (context, child) {
                  return Transform.scale(
                    scale: _pulseAnimation.value,
                    child: CircleAvatar(
                      radius: 80,
                      backgroundImage: widget.callerAvatarUrl != null
                          ? NetworkImage(widget.callerAvatarUrl!)
                          : null,
                      backgroundColor: AppColors.primaryContainer,
                      child: widget.callerAvatarUrl == null
                          ? Text(
                              widget.callerName[0].toUpperCase(),
                              style: AppTextStyles.headlineLarge.copyWith(
                                color: AppColors.onPrimaryContainer,
                              ),
                            )
                          : null,
                    ),
                  );
                },
              ),
              const SizedBox(height: 32),

              // Call Type Indicator
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.primaryContainer,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  widget.isVideoCall ? l10n.videoCall : l10n.voiceCall,
                  style: AppTextStyles.labelLarge.copyWith(
                    color: AppColors.onPrimaryContainer,
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Caller Name
              Text(
                widget.callerName,
                style: AppTextStyles.headlineMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),

              // Room Name
              Text(
                widget.roomName,
                style: AppTextStyles.bodyLarge.copyWith(
                  color: AppColors.onSurfaceVariant,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 64),

              // Call Action Buttons
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  // Decline Button
                  AppFocusableBorder(
                    child: Semantics(
                      button: true,
                      label: l10n.declineCall,
                      child: GestureDetector(
                        onTap: widget.onDecline,
                        child: Container(
                          width: 80,
                          height: 80,
                          decoration: const BoxDecoration(
                            color: AppColors.error,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.call_end,
                            color: AppColors.onError,
                            size: 32,
                          ),
                        ),
                      ),
                    ),
                  ),

                  // Accept Button
                  AppFocusableBorder(
                    child: Semantics(
                      button: true,
                      label: l10n.acceptCall,
                      child: GestureDetector(
                        onTap: widget.onAccept,
                        child: Container(
                          width: 80,
                          height: 80,
                          decoration: const BoxDecoration(
                            color: AppColors.success,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            widget.isVideoCall ? Icons.videocam : Icons.call,
                            color: AppColors.onSuccess,
                            size: 32,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }
}
```

### E2EE Verification Overlay

```dart
class AppE2EEVerification extends StatefulWidget {
  final List<String> localEmojis;
  final List<String> remoteEmojis;
  final VoidCallback onVerified;
  final VoidCallback onCancel;

  const AppE2EEVerification({
    Key? key,
    required this.localEmojis,
    required this.remoteEmojis,
    required this.onVerified,
    required this.onCancel,
  }) : super(key: key);

  @override
  State<AppE2EEVerification> createState() => _AppE2EEVerificationState();
}

class _AppE2EEVerificationState extends State<AppE2EEVerification>
    with SingleTickerProviderStateMixin {

  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _setupAnimations();
  }

  void _setupAnimations() {
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(
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
    final l10n = context.l10n;
    return AnimatedBuilder(
      animation: _animationController,
      builder: (context, child) {
        return Opacity(
          opacity: _fadeAnimation.value,
          child: Container(
            color: AppColors.scrim,
            child: Center(
              child: AppFocusableBorder(
                child: Container(
                  margin: const EdgeInsets.all(24),
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.shadow,
                        blurRadius: 16,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Header
                      Text(
                        l10n.verifyCallSecurity,
                        style: AppTextStyles.headlineSmall,
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),

                      // Description
                      Text(
                        l10n.verifyCallDescription,
                        style: AppTextStyles.bodyMedium,
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 32),

                      // Emoji Comparison
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          // Local Device Emojis
                          Column(
                            children: [
                              Text(
                                l10n.yourDevice,
                                style: AppTextStyles.labelMedium,
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: widget.localEmojis.map((emoji) {
                                  return Padding(
                                    padding: const EdgeInsets.symmetric(horizontal: 4),
                                    child: Text(
                                      emoji,
                                      style: const TextStyle(fontSize: 32),
                                    ),
                                  );
                                }).toList(),
                              ),
                            ],
                          ),

                          // Remote Device Emojis
                          Column(
                            children: [
                              Text(
                                l10n.otherDevice,
                                style: AppTextStyles.labelMedium,
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: widget.remoteEmojis.map((emoji) {
                                  return Padding(
                                    padding: const EdgeInsets.symmetric(horizontal: 4),
                                    child: Text(
                                      emoji,
                                      style: const TextStyle(fontSize: 32),
                                    ),
                                  );
                                }).toList(),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 32),

                      // Verification Status
                      _buildVerificationStatus(context),
                      const SizedBox(height: 24),

                      // Action Buttons
                      Row(
                        children: [
                          Expanded(
                            child: AppFocusableBorder(
                              child: Semantics(
                                button: true,
                                label: l10n.cancelVerification,
                                child: OutlinedButton(
                                  onPressed: widget.onCancel,
                                  child: Text(l10n.cancel),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: AppFocusableBorder(
                              child: Semantics(
                                button: true,
                                label: l10n.confirmVerification,
                                child: ElevatedButton(
                                  onPressed: _handleVerification,
                                  child: Text(l10n.verify),
                                ),
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
          ),
        );
      },
    );
  }

  Widget _buildVerificationStatus(BuildContext context) {
    final l10n = context.l10n;
    final isVerified = _compareEmojis();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: isVerified
            ? AppColors.successContainer
            : AppColors.errorContainer,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isVerified ? Icons.check_circle : Icons.error,
            color: isVerified ? AppColors.success : AppColors.error,
            size: 20,
          ),
          const SizedBox(width: 8),
          Text(
            isVerified ? l10n.emojisMatch : l10n.emojisDontMatch,
            style: AppTextStyles.bodyMedium.copyWith(
              color: isVerified ? AppColors.onSuccessContainer : AppColors.onErrorContainer,
            ),
          ),
        ],
      ),
    );
  }

  bool _compareEmojis() {
    if (widget.localEmojis.length != widget.remoteEmojis.length) {
      return false;
    }

    for (int i = 0; i < widget.localEmojis.length; i++) {
      if (widget.localEmojis[i] != widget.remoteEmojis[i]) {
        return false;
      }
    }

    return true;
  }

  void _handleVerification() {
    final isVerified = _compareEmojis();
    if (isVerified) {
      widget.onVerified();
    } else {
      // Show error and keep overlay open
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(context.l10n.verificationFailed),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }
}
```

### Picture-in-Picture Video Overlay

```dart
class PipVideoOverlay extends StatefulWidget {
  final Widget videoWidget;
  final VoidCallback onTap;
  final VoidCallback onClose;
  final double aspectRatio;

  const PipVideoOverlay({
    Key? key,
    required this.videoWidget,
    required this.onTap,
    required this.onClose,
    this.aspectRatio = 16 / 9,
  }) : super(key: key);

  @override
  State<PipVideoOverlay> createState() => _PipVideoOverlayState();
}

class _PipVideoOverlayState extends State<PipVideoOverlay> {
  Offset _position = const Offset(16, 100);
  bool _isDragging = false;

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;

    return Positioned(
      left: _position.dx,
      top: _position.dy,
      child: AppFocusableBorder(
        child: Semantics(
          label: context.l10n.pictureInPictureVideo,
          button: true,
          child: GestureDetector(
            onPanStart: _handlePanStart,
            onPanUpdate: _handlePanUpdate,
            onPanEnd: _handlePanEnd,
            onTap: widget.onTap,
            child: Container(
              width: 120,
              height: 120 / widget.aspectRatio,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.shadow,
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Stack(
                  children: [
                    // Video Content
                    Positioned.fill(
                      child: widget.videoWidget,
                    ),

                    // Close Button
                    Positioned(
                      top: 4,
                      right: 4,
                      child: GestureDetector(
                        onTap: widget.onClose,
                        child: Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            color: AppColors.surface.withOpacity(0.8),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.close,
                            size: 16,
                            color: AppColors.onSurface,
                          ),
                        ),
                      ),
                    ),

                    // Drag Handle
                    if (_isDragging)
                      Positioned(
                        bottom: 4,
                        left: 4,
                        right: 4,
                        child: Container(
                          height: 4,
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.5),
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _handlePanStart(DragStartDetails details) {
    setState(() => _isDragging = true);
  }

  void _handlePanUpdate(DragUpdateDetails details) {
    final screenSize = MediaQuery.of(context).size;
    final overlaySize = const Size(120, 120 / (16 / 9));

    setState(() {
      _position = Offset(
        (_position.dx + details.delta.dx).clamp(0, screenSize.width - overlaySize.width),
        (_position.dy + details.delta.dy).clamp(0, screenSize.height - overlaySize.height),
      );
    });
  }

  void _handlePanEnd(DragEndDetails details) {
    setState(() => _isDragging = false);
  }
}
```

## Strict Scope Definition

### Files to Create

- `lib/widgets/app_call_controls.dart` - Call control buttons component
- `lib/widgets/app_call_status.dart` - Call status indicators
- `lib/widgets/app_e2ee_verification.dart` - E2EE verification overlay
- `lib/features/calls/screens/incoming_call_screen.dart` - Native incoming call UI
- `lib/features/calls/screens/active_call_screen.dart` - Active call interface
- `lib/features/calls/screens/pip_video_overlay.dart` - Picture-in-picture video
- `lib/services/voip_service.dart` - Call management service

### Files to Modify

- `lib/widgets/widgets.dart` - Add exports for new call components
- `lib/features/calls/bloc/call_bloc.dart` - Add call state management
- `lib/features/calls/bloc/call_event.dart` - Add call events
- `lib/features/calls/bloc/call_state.dart` - Add call states
- `lib/app/routes/app_router.dart` - Add call screen routes

### Files to Leave Untouched

- `lib/app/design_system/colors.dart` - Use existing colors
- `lib/app/design_system/theme.dart` - Use existing theme
- `android/` and `ios/` - Native CallKit integration separate

### Critical Constraints

- **MOBILE-FIRST**: Design for 320-414px width screens first
- **PERFORMANCE**: All animations must maintain 60 FPS
- **ACCESSIBILITY**: Full WCAG AA compliance for all call interfaces
- **BLoC INTEGRATION**: Must work with existing call management system
- **NATIVE INTEGRATION**: Use flutter_callkit_incoming for system UI
- **E2EE VERIFICATION**: Mandatory emoji-based verification for security
- **PICTURE-IN-PICTURE**: Draggable overlay for multitasking support

## Additional Context

### Call States to Support

1. **Incoming Call**: Full-screen native UI with accept/decline
2. **Outgoing Call**: Ringing state with cancel option
3. **Active Call**: Connected state with controls and status
4. **Call Ended**: Post-call summary with duration
5. **Call Failed**: Error state with retry option

### Security Features

- **E2EE Verification**: Mandatory emoji comparison for new calls
- **Call Encryption**: Visual indicators for encrypted calls
- **Participant Verification**: Trust status for group call participants
- **Screen Sharing Security**: Confirmation dialogs for screen sharing

### Performance Requirements

- **Low Latency**: <100ms for control button responses
- **Smooth Video**: 30 FPS minimum for video calls
- **Battery Efficient**: Optimized for extended call durations
- **Memory Efficient**: Minimal memory footprint for call UI

### Testing Requirements

- Unit tests for call state management
- Widget tests for call control interactions
- Integration tests with VoIP service
- Accessibility tests for screen readers
- Performance tests for call UI smoothness
- End-to-end tests for complete call flows
