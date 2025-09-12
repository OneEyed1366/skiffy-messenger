# Lovable Prompt: AppVoiceRecorder Component

## High-Level Goal

Create an intuitive voice message recorder component for SkiffyMessenger with swipe-to-cancel gesture, visual feedback, accessibility support, and seamless integration with the existing design system and Rust core audio processing.

## Detailed, Step-by-Step Instructions

### 1. Component Structure

1. Create `lib/widgets/app_voice_recorder.dart`
2. Implement as a StatefulWidget with gesture recognition
3. Include audio recording capabilities with permission handling
4. Add visual feedback with animations and progress indicators
5. Integrate with Rust core for audio processing and storage

### 2. Visual Design Implementation

1. Use circular button design (60x60dp) with AppColors.primary
2. Include microphone icon that transforms during recording
3. Add circular progress indicator around button during recording
4. Show recording duration with large, clear text
5. Implement visual feedback for swipe-to-cancel gesture

### 3. Gesture & Interaction

1. Long press to start recording (500ms hold threshold)
2. Swipe left to cancel with visual feedback
3. Release to send the recording
4. Visual indicators for recording state changes
5. Haptic feedback for state transitions

### 4. Audio Recording Features

1. Request microphone permissions on first use
2. Record in high-quality format (WAV/MP3)
3. Show real-time audio waveform visualization
4. Implement maximum recording duration (15 minutes)
5. Handle recording interruptions gracefully

### 5. Accessibility Features

1. Wrap with AppFocusableBorder for keyboard navigation
2. Add comprehensive Semantics for screen readers
3. Support keyboard shortcuts (Space to record, Escape to cancel)
4. Announce recording state changes
5. Provide alternative text input option

## Code Examples, Data Structures & Constraints

### Component Interface

```dart
class AppVoiceRecorder extends StatefulWidget {
  final Function(File audioFile, Duration duration) onRecordingComplete;
  final Function()? onRecordingCancelled;
  final Duration maxDuration;
  final double buttonSize;

  const AppVoiceRecorder({
    Key? key,
    required this.onRecordingComplete,
    this.onRecordingCancelled,
    this.maxDuration = const Duration(minutes: 15),
    this.buttonSize = 60.0,
  }) : super(key: key);
}
```

### State Management

```dart
enum RecordingState {
  idle,
  preparing,
  recording,
  processing,
  cancelling,
}

class _AppVoiceRecorderState extends State<AppVoiceRecorder>
    with SingleTickerProviderStateMixin {

  RecordingState _state = RecordingState.idle;
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _progressAnimation;

  Duration _recordingDuration = Duration.zero;
  Timer? _durationTimer;
  File? _recordedFile;

  // Gesture tracking
  Offset _dragStart = Offset.zero;
  Offset _currentDrag = Offset.zero;
  bool _isDragging = false;

  @override
  void initState() {
    super.initState();
    _setupAnimations();
    _requestPermissions();
  }

  void _setupAnimations() {
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 1.2,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOut,
    ));

    _progressAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(_animationController);
  }

  Future<void> _requestPermissions() async {
    final status = await Permission.microphone.request();
    if (!status.isGranted) {
      // Handle permission denied
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Microphone permission is required for voice messages'),
          action: SnackBarAction(
            label: 'Settings',
            onPressed: () => openAppSettings(),
          ),
        ),
      );
    }
  }
}
```

### Gesture Handling

```dart
void _handlePanStart(DragStartDetails details) {
  if (_state != RecordingState.idle) return;

  _dragStart = details.globalPosition;
  setState(() => _isDragging = true);
}

void _handlePanUpdate(DragUpdateDetails details) {
  if (!_isDragging) return;

  _currentDrag = details.globalPosition;
  final dragDistance = _currentDrag.dx - _dragStart.dx;

  // Check if swipe distance exceeds cancel threshold
  if (dragDistance < -100) { // 100px left swipe
    setState(() => _state = RecordingState.cancelling);
    HapticFeedback.mediumImpact();
  } else if (_state == RecordingState.cancelling && dragDistance > -50) {
    // Return to recording if swipe back
    setState(() => _state = RecordingState.recording);
  }
}

void _handlePanEnd(DragEndDetails details) {
  if (!_isDragging) return;

  setState(() => _isDragging = false);

  if (_state == RecordingState.cancelling) {
    _cancelRecording();
  } else {
    _stopRecording();
  }
}
```

### Recording Logic

```dart
Future<void> _startRecording() async {
  try {
    setState(() => _state = RecordingState.preparing);

    // Initialize recording
    final directory = await getTemporaryDirectory();
    final fileName = 'voice_${DateTime.now().millisecondsSinceEpoch}.wav';
    final filePath = '${directory.path}/$fileName';

    // Start recording with Rust core
    await RustApi.instance.startVoiceRecording(filePath);

    setState(() {
      _state = RecordingState.recording;
      _recordedFile = File(filePath);
    });

    // Start duration timer
    _durationTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _recordingDuration += const Duration(seconds: 1);
      });

      // Check max duration
      if (_recordingDuration >= widget.maxDuration) {
        _stopRecording();
      }
    });

    _animationController.forward();
    HapticFeedback.lightImpact();

  } catch (e) {
    setState(() => _state = RecordingState.idle);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Failed to start recording: $e')),
    );
  }
}

Future<void> _stopRecording() async {
  if (_state != RecordingState.recording) return;

  setState(() => _state = RecordingState.processing);
  _durationTimer?.cancel();

  try {
    // Stop recording via Rust core
    await RustApi.instance.stopVoiceRecording();

    if (_recordedFile != null) {
      widget.onRecordingComplete(_recordedFile!, _recordingDuration);
    }

    // Reset state
    setState(() {
      _state = RecordingState.idle;
      _recordingDuration = Duration.zero;
      _recordedFile = null;
    });

    _animationController.reverse();
    HapticFeedback.success();

  } catch (e) {
    setState(() => _state = RecordingState.idle);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Failed to save recording: $e')),
    );
  }
}

void _cancelRecording() {
  if (_state == RecordingState.recording) {
    RustApi.instance.cancelVoiceRecording();
  }

  _durationTimer?.cancel();

  setState(() {
    _state = RecordingState.idle;
    _recordingDuration = Duration.zero;
    _recordedFile = null;
  });

  _animationController.reverse();
  widget.onRecordingCancelled?.call();

  HapticFeedback.mediumImpact();
}
```

### Visual Implementation

```dart
@override
Widget build(BuildContext context) {
  return AppFocusableBorder(
    child: Semantics(
      label: _getAccessibilityLabel(),
      hint: _getAccessibilityHint(),
      button: true,
      child: GestureDetector(
        onLongPressStart: (_) => _startRecording(),
        onLongPressEnd: (_) => _stopRecording(),
        onPanStart: _handlePanStart,
        onPanUpdate: _handlePanUpdate,
        onPanEnd: _handlePanEnd,
        child: AnimatedBuilder(
          animation: _animationController,
          builder: (context, child) {
            return Stack(
              alignment: Alignment.center,
              children: [
                // Progress circle
                if (_state == RecordingState.recording)
                  SizedBox(
                    width: widget.buttonSize + 20,
                    height: widget.buttonSize + 20,
                    child: CircularProgressIndicator(
                      value: _progressAnimation.value,
                      strokeWidth: 3,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        _state == RecordingState.cancelling
                            ? AppColors.error
                            : AppColors.primary,
                      ),
                    ),
                  ),

                // Main button
                Transform.scale(
                  scale: _scaleAnimation.value,
                  child: Container(
                    width: widget.buttonSize,
                    height: widget.buttonSize,
                    decoration: BoxDecoration(
                      color: _getButtonColor(),
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: _getButtonColor().withOpacity(0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Icon(
                      _getButtonIcon(),
                      color: AppColors.onPrimary,
                      size: 24,
                    ),
                  ),
                ),

                // Recording duration
                if (_state == RecordingState.recording)
                  Positioned(
                    bottom: -30,
                    child: Text(
                      _formatDuration(_recordingDuration),
                      style: AppTextStyles.caption.copyWith(
                        color: AppColors.onSurface,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),

                // Cancel indicator
                if (_state == RecordingState.cancelling)
                  Positioned(
                    top: -40,
                    child: Row(
                      children: [
                        Icon(
                          Icons.cancel,
                          color: AppColors.error,
                          size: 20,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'Release to cancel',
                          style: AppTextStyles.caption.copyWith(
                            color: AppColors.error,
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            );
          },
        ),
      ),
    ),
  );
}

Color _getButtonColor() {
  switch (_state) {
    case RecordingState.recording:
      return _state == RecordingState.cancelling
          ? AppColors.error
          : AppColors.primary;
    case RecordingState.processing:
      return AppColors.secondary;
    default:
      return AppColors.primary;
  }
}

IconData _getButtonIcon() {
  switch (_state) {
    case RecordingState.recording:
      return Icons.mic;
    case RecordingState.processing:
      return Icons.hourglass_top;
    default:
      return Icons.mic_none;
  }
}

String _formatDuration(Duration duration) {
  final minutes = duration.inMinutes;
  final seconds = duration.inSeconds % 60;
  return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
}

String _getAccessibilityLabel() {
  switch (_state) {
    case RecordingState.recording:
      return 'Recording voice message, ${_formatDuration(_recordingDuration)} elapsed';
    case RecordingState.processing:
      return 'Processing voice message';
    case RecordingState.cancelling:
      return 'Recording will be cancelled when released';
    default:
      return 'Voice message recorder, long press to start recording';
  }
}

String _getAccessibilityHint() {
  switch (_state) {
    case RecordingState.recording:
      return 'Swipe left to cancel, release to send';
    default:
      return 'Hold to record, swipe left while recording to cancel';
  }
}
```

## Strict Scope Definition

### Files to Create

- `lib/widgets/app_voice_recorder.dart` - Main component implementation

### Files to Modify

- `lib/widgets/widgets.dart` - Add export for AppVoiceRecorder
- `lib/features/timeline/widgets/message_input.dart` - Integrate voice recorder
- `lib/features/timeline/bloc/timeline_bloc.dart` - Add voice message handling

### Files to Leave Untouched

- `lib/app/design_system/colors.dart` - Use existing colors
- `lib/app/design_system/theme.dart` - Use existing theme
- `android/` and `ios/` - Native permission handling separate

### Critical Constraints

- **MOBILE-FIRST**: Touch-friendly gesture-based interaction
- **PERFORMANCE**: Efficient audio processing without blocking UI
- **ACCESSIBILITY**: Full keyboard and screen reader support
- **PERMISSIONS**: Proper microphone permission handling
- **MAX DURATION**: 15-minute limit with clear feedback
- **GESTURE RECOGNITION**: Reliable swipe-to-cancel detection
- **AUDIO QUALITY**: High-quality recording with compression

## Additional Context

### Recording States

1. **Idle**: Ready to record, shows microphone icon
2. **Preparing**: Initializing recording, brief loading state
3. **Recording**: Active recording with duration counter
4. **Processing**: Saving/compressing audio file
5. **Cancelling**: User swiped to cancel, shows cancel indicator

### Audio Specifications

- **Format**: WAV for quality, compressed to MP3 for storage
- **Sample Rate**: 44.1kHz for high quality
- **Channels**: Mono for voice messages
- **Bit Depth**: 16-bit for clarity
- **Compression**: Lossy compression for file size optimization

### Gesture Requirements

- **Long Press Threshold**: 500ms to prevent accidental recording
- **Swipe Sensitivity**: 100px left movement to trigger cancel
- **Multi-touch**: Ignore if multiple fingers detected
- **Interruptions**: Handle call interruptions gracefully

### Privacy & Security

- **Permission Transparency**: Clear explanation for microphone access
- **Temporary Storage**: Use app temp directory, clean up after sending
- **Encryption Ready**: Prepare for E2EE integration
- **No Background Recording**: Only active when user explicitly starts

### Performance Optimizations

- **Lazy Initialization**: Initialize recorder only when needed
- **Memory Management**: Proper cleanup of audio resources
- **Background Processing**: Audio compression off main thread
- **Battery Awareness**: Efficient recording to preserve battery

### Testing Requirements

- Unit tests for gesture recognition logic
- Widget tests for state transitions
- Integration tests with TimelineBloc
- Permission handling tests
- Audio recording quality tests
- Accessibility tests for screen readers
