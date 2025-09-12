# Lovable Prompt: VideoCallScreen Component

## High-Level Goal

Create a comprehensive video call interface for SkiffyMessenger with picture-in-picture local video, call controls, E2EE verification, and seamless integration with the existing design system and native call handling.

## Detailed, Step-by-Step Instructions

### 1. Screen Structure

1. Create `lib/features/calls/screens/video_call_screen.dart`
2. Implement full-screen video call interface
3. Include picture-in-picture local video overlay
4. Add call control buttons with proper spacing
5. Integrate E2EE verification overlay

### 2. Visual Design Implementation

1. Use full-screen layout with remote video as background
2. Position local video as PiP (Picture-in-Picture) in top-right corner
3. Include semi-transparent control bar at bottom
4. Add call status indicators and participant information
5. Implement E2EE verification UI overlay

### 3. Call Control Features

1. Mute/unmute microphone with visual indicator
2. Enable/disable camera with smooth transitions
3. Switch between front/rear cameras
4. End call with confirmation dialog
5. Speakerphone toggle for audio routing

### 4. Video Management

1. Handle video stream rendering for remote participant
2. Manage local video PiP with drag-to-move functionality
3. Implement video quality adaptation
4. Add video freeze detection and recovery
5. Support for multiple video streams (future group calls)

### 5. Accessibility Features

1. Screen reader announcements for call state changes
2. Keyboard shortcuts for all call controls
3. High contrast mode support for controls
4. Voice guidance for call setup and teardown
5. Focus management for control navigation

## Code Examples, Data Structures & Constraints

### Screen Interface

```dart
class VideoCallScreen extends StatefulWidget {
  final String roomId;
  final String callId;
  final bool isIncoming;
  final String remoteUserName;
  final String? remoteUserAvatar;

  const VideoCallScreen({
    Key? key,
    required this.roomId,
    required this.callId,
    required this.isIncoming,
    required this.remoteUserName,
    this.remoteUserAvatar,
  }) : super(key: key);
}
```

### State Management

```dart
enum CallState {
  connecting,
  connected,
  reconnecting,
  ended,
}

enum VideoState {
  enabled,
  disabled,
  frozen,
}

class _VideoCallScreenState extends State<VideoCallScreen>
    with WidgetsBindingObserver {

  CallState _callState = CallState.connecting;
  VideoState _localVideoState = VideoState.enabled;
  VideoState _remoteVideoState = VideoState.enabled;

  bool _isMuted = false;
  bool _isSpeakerOn = true;
  bool _isFrontCamera = true;

  // Video stream controllers
  StreamSubscription? _callStateSubscription;
  StreamSubscription? _videoStateSubscription;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initializeCall();
    _setupStreams();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _callStateSubscription?.cancel();
    _videoStateSubscription?.cancel();
    super.dispose();
  }

  void _initializeCall() async {
    try {
      if (widget.isIncoming) {
        // Handle incoming call
        await RustApi.instance.answerCall(widget.callId);
      } else {
        // Handle outgoing call
        await RustApi.instance.initiateCall(widget.roomId, video: true);
      }
    } catch (e) {
      _handleCallError(e.toString());
    }
  }

  void _setupStreams() {
    // Listen to call state changes from Rust core
    _callStateSubscription = RustApi.instance.callStateStream.listen(
      (state) => setState(() => _callState = _mapCallState(state)),
    );

    // Listen to video state changes
    _videoStateSubscription = RustApi.instance.videoStateStream.listen(
      (state) => _handleVideoStateChange(state),
    );
  }

  CallState _mapCallState(String rustState) {
    switch (rustState) {
      case 'connecting':
        return CallState.connecting;
      case 'connected':
        return CallState.connected;
      case 'reconnecting':
        return CallState.reconnecting;
      case 'ended':
        return CallState.ended;
      default:
        return CallState.connecting;
    }
  }

  void _handleVideoStateChange(Map<String, dynamic> state) {
    setState(() {
      _localVideoState = state['local'] == 'enabled'
          ? VideoState.enabled
          : VideoState.disabled;
      _remoteVideoState = state['remote'] == 'enabled'
          ? VideoState.enabled
          : VideoState.disabled;
    });
  }

  void _handleCallError(String error) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Call error: $error'),
        action: SnackBarAction(
          label: 'Retry',
          onPressed: _initializeCall,
        ),
      ),
    );
  }
}
```

### Call Control Methods

```dart
Future<void> _toggleMute() async {
  try {
    await RustApi.instance.toggleMute(!_isMuted);
    setState(() => _isMuted = !_isMuted);
    HapticFeedback.lightImpact();
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Failed to toggle mute: $e')),
    );
  }
}

Future<void> _toggleVideo() async {
  try {
    await RustApi.instance.toggleVideo(_localVideoState == VideoState.disabled);
    setState(() {
      _localVideoState = _localVideoState == VideoState.enabled
          ? VideoState.disabled
          : VideoState.enabled;
    });
    HapticFeedback.lightImpact();
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Failed to toggle video: $e')),
    );
  }
}

Future<void> _switchCamera() async {
  try {
    await RustApi.instance.switchCamera(!_isFrontCamera);
    setState(() => _isFrontCamera = !_isFrontCamera);
    HapticFeedback.lightImpact();
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Failed to switch camera: $e')),
    );
  }
}

Future<void> _toggleSpeaker() async {
  try {
    await RustApi.instance.toggleSpeaker(!_isSpeakerOn);
    setState(() => _isSpeakerOn = !_isSpeakerOn);
    HapticFeedback.lightImpact();
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Failed to toggle speaker: $e')),
    );
  }
}

Future<void> _endCall() async {
  final shouldEnd = await showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      title: Text('End Call'),
      content: Text('Are you sure you want to end this call?'),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(false),
          child: Text('Cancel'),
        ),
        TextButton(
          onPressed: () => Navigator.of(context).pop(true),
          child: Text('End Call'),
        ),
      ],
    ),
  );

  if (shouldEnd == true) {
    try {
      await RustApi.instance.endCall(widget.callId);
      if (mounted) {
        Navigator.of(context).pop();
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to end call: $e')),
      );
    }
  }
}
```

### Visual Implementation

```dart
@override
Widget build(BuildContext context) {
  return Scaffold(
    backgroundColor: Colors.black,
    body: Stack(
      children: [
        // Remote video (full screen background)
        _buildRemoteVideo(),

        // Local video (PiP overlay)
        _buildLocalVideoPiP(),

        // Call status overlay
        _buildCallStatusOverlay(),

        // E2EE verification overlay
        if (_showVerification)
          _buildVerificationOverlay(),

        // Call controls
        _buildCallControls(),

        // Connection quality indicator
        _buildConnectionIndicator(),
      ],
    ),
  );
}

Widget _buildRemoteVideo() {
  return Container(
    width: double.infinity,
    height: double.infinity,
    color: Colors.black,
    child: _remoteVideoState == VideoState.enabled
        ? RemoteVideoView(
            callId: widget.callId,
            onVideoFrozen: () => setState(() => _remoteVideoState = VideoState.frozen),
          )
        : _buildNoVideoPlaceholder(),
  );
}

Widget _buildNoVideoPlaceholder() {
  return Container(
    color: AppColors.surface,
    child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        CircleAvatar(
          radius: 60,
          backgroundImage: widget.remoteUserAvatar != null
              ? NetworkImage(widget.remoteUserAvatar!)
              : null,
          child: widget.remoteUserAvatar == null
              ? Text(
                  widget.remoteUserName[0].toUpperCase(),
                  style: AppTextStyles.headline.copyWith(
                    color: AppColors.onSurface,
                  ),
                )
              : null,
        ),
        const SizedBox(height: 16),
        Text(
          widget.remoteUserName,
          style: AppTextStyles.headline.copyWith(
            color: AppColors.onSurface,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          _getCallStatusText(),
          style: AppTextStyles.body.copyWith(
            color: AppColors.onSurfaceVariant,
          ),
        ),
      ],
    ),
  );
}

Widget _buildLocalVideoPiP() {
  const pipSize = 120.0;
  const pipMargin = 16.0;

  return Positioned(
    top: pipMargin,
    right: pipMargin,
    child: GestureDetector(
      onPanUpdate: _handlePiPDrag,
      child: Container(
        width: pipSize,
        height: pipSize * 4 / 3, // 4:3 aspect ratio
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: Colors.white.withOpacity(0.5),
            width: 2,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(6),
          child: _localVideoState == VideoState.enabled
              ? LocalVideoView(
                  callId: widget.callId,
                  isFrontCamera: _isFrontCamera,
                )
              : Container(
                  color: AppColors.surface,
                  child: Icon(
                    Icons.videocam_off,
                    color: AppColors.onSurface,
                    size: 32,
                  ),
                ),
        ),
      ),
    ),
  );
}

Widget _buildCallControls() {
  return Positioned(
    bottom: 40,
    left: 0,
    right: 0,
    child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildControlButton(
            icon: _isMuted ? Icons.mic_off : Icons.mic,
            label: _isMuted ? 'Unmute' : 'Mute',
            color: _isMuted ? AppColors.error : AppColors.surface,
            onPressed: _toggleMute,
          ),
          _buildControlButton(
            icon: _localVideoState == VideoState.enabled
                ? Icons.videocam
                : Icons.videocam_off,
            label: _localVideoState == VideoState.enabled
                ? 'Turn off'
                : 'Turn on',
            color: AppColors.surface,
            onPressed: _toggleVideo,
          ),
          _buildControlButton(
            icon: Icons.flip_camera_ios,
            label: 'Switch',
            color: AppColors.surface,
            onPressed: _switchCamera,
          ),
          _buildControlButton(
            icon: _isSpeakerOn ? Icons.volume_up : Icons.volume_off,
            label: 'Speaker',
            color: AppColors.surface,
            onPressed: _toggleSpeaker,
          ),
          _buildControlButton(
            icon: Icons.call_end,
            label: 'End',
            color: AppColors.error,
            onPressed: _endCall,
          ),
        ],
      ),
    ),
  );
}

Widget _buildControlButton({
  required IconData icon,
  required String label,
  required Color color,
  required VoidCallback onPressed,
}) {
  return Column(
    mainAxisSize: MainAxisSize.min,
    children: [
      AppFocusableBorder(
        child: ElevatedButton(
          onPressed: onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: color,
            foregroundColor: color == AppColors.error
                ? AppColors.onError
                : AppColors.onSurface,
            shape: const CircleBorder(),
            padding: const EdgeInsets.all(16),
            elevation: 4,
          ),
          child: Icon(icon, size: 24),
        ),
      ),
      const SizedBox(height: 8),
      Text(
        label,
        style: AppTextStyles.caption.copyWith(
          color: Colors.white,
        ),
      ),
    ],
  );
}

Widget _buildCallStatusOverlay() {
  if (_callState == CallState.connected) return const SizedBox.shrink();

  return Positioned(
    top: 100,
    left: 0,
    right: 0,
    child: Center(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.7),
          borderRadius: BorderRadius.circular(24),
        ),
        child: Text(
          _getCallStatusText(),
          style: AppTextStyles.body.copyWith(
            color: Colors.white,
          ),
        ),
      ),
    ),
  );
}

Widget _buildVerificationOverlay() {
  return Container(
    color: Colors.black.withOpacity(0.8),
    child: Center(
      child: Container(
        margin: const EdgeInsets.all(24),
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.verified_user,
              size: 48,
              color: AppColors.success,
            ),
            const SizedBox(height: 16),
            Text(
              'Verify Call Security',
              style: AppTextStyles.headline,
            ),
            const SizedBox(height: 8),
            Text(
              'Compare the emoji shown on both devices',
              style: AppTextStyles.body,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Display verification emojis
                for (final emoji in _verificationEmojis)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: Text(
                      emoji,
                      style: const TextStyle(fontSize: 32),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => setState(() => _showVerification = false),
                    child: Text('They match'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: OutlinedButton(
                    onPressed: _handleVerificationMismatch,
                    child: Text('They don\'t match'),
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

Widget _buildConnectionIndicator() {
  return Positioned(
    top: 50,
    right: 16,
    child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: _getConnectionColor().withOpacity(0.9),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            _getConnectionIcon(),
            color: Colors.white,
            size: 16,
          ),
          const SizedBox(width: 4),
          Text(
            _getConnectionText(),
            style: AppTextStyles.caption.copyWith(
              color: Colors.white,
            ),
          ),
        ],
      ),
    ),
  );
}

String _getCallStatusText() {
  switch (_callState) {
    case CallState.connecting:
      return 'Connecting...';
    case CallState.connected:
      return '${widget.remoteUserName} • Connected';
    case CallState.reconnecting:
      return 'Reconnecting...';
    case CallState.ended:
      return 'Call ended';
    default:
      return 'Connecting...';
  }
}

Color _getConnectionColor() {
  // Implementation for connection quality color
  return AppColors.success; // Placeholder
}

IconData _getConnectionIcon() {
  // Implementation for connection quality icon
  return Icons.wifi; // Placeholder
}

String _getConnectionText() {
  // Implementation for connection quality text
  return 'Good'; // Placeholder
}

void _handlePiPDrag(DragUpdateDetails details) {
  // Implementation for PiP drag handling
  // Update PiP position based on drag
}

void _handleVerificationMismatch() {
  // Implementation for verification mismatch handling
  // Show warning and potentially end call
}
```

## Strict Scope Definition

### Files to Create

- `lib/features/calls/screens/video_call_screen.dart` - Main video call screen
- `lib/features/calls/widgets/remote_video_view.dart` - Remote video rendering
- `lib/features/calls/widgets/local_video_view.dart` - Local video PiP
- `lib/features/calls/bloc/call_bloc.dart` - Call state management
- `lib/features/calls/bloc/call_event.dart` - Call events
- `lib/features/calls/bloc/call_state.dart` - Call states

### Files to Modify

- `lib/app/router/router.dart` - Add video call route
- `lib/features/timeline/widgets/message_input.dart` - Add video call button
- `lib/services/voip_service.dart` - Extend for video calls

### Files to Leave Untouched

- `lib/app/design_system/colors.dart` - Use existing colors
- `lib/app/design_system/theme.dart` - Use existing theme
- `android/` and `ios/` - Native camera/permission handling separate

### Critical Constraints

- **FULL-SCREEN**: Video call must use entire screen real estate
- **PICTURE-IN-PICTURE**: Local video must be draggable PiP overlay
- **PERFORMANCE**: Maintain 30+ FPS for video rendering
- **ACCESSIBILITY**: Full keyboard navigation and screen reader support
- **E2EE VERIFICATION**: Visual emoji verification for call security
- **CONNECTION HANDLING**: Graceful handling of network interruptions
- **BATTERY OPTIMIZATION**: Efficient video processing to preserve battery

## Additional Context

### Call States Management

1. **Connecting**: Initial call setup and ICE negotiation
2. **Connected**: Active call with video/audio streams
3. **Reconnecting**: Network interruption recovery
4. **Ended**: Call termination with cleanup

### Video Quality Adaptation

- **Adaptive Bitrate**: Adjust video quality based on network conditions
- **Resolution Scaling**: 720p → 480p → 360p → 240p fallback
- **Frame Rate Control**: 30fps → 15fps → 10fps based on CPU/battery
- **Bandwidth Monitoring**: Real-time network condition assessment

### E2EE Verification Flow

- **Automatic Trigger**: Show verification on first call with new contact
- **Emoji Comparison**: Display 4 random emojis for visual verification
- **Manual Verification**: User can trigger verification anytime
- **Verification Storage**: Remember verified contacts between calls

### Connection Quality Indicators

- **Excellent**: >2 Mbps, <50ms latency
- **Good**: 1-2 Mbps, 50-100ms latency
- **Poor**: 0.5-1 Mbps, 100-200ms latency
- **Critical**: <0.5 Mbps, >200ms latency

### Privacy & Security

- **Camera Permissions**: Clear permission requests with explanation
- **Screen Recording Protection**: Prevent screenshots during calls
- **Background Blur**: Option to blur background for privacy
- **Call Recording**: Visual indicators when call is being recorded

### Performance Optimizations

- **Hardware Acceleration**: Use platform video decoding/encoding
- **Memory Management**: Proper cleanup of video buffers
- **Thermal Management**: Reduce video quality when device overheats
- **Background Processing**: Move non-UI video processing to isolates

### Testing Requirements

- Unit tests for call state management
- Widget tests for control interactions
- Integration tests with VoIP service
- Performance tests for video rendering
- Accessibility tests for screen readers
- Network interruption simulation tests
