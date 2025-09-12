# Lovable Prompts for SkiffyMessenger v1.1

This directory contains detailed prompts for generating Flutter UI components using Lovable.ai, based on the comprehensive UI specification v1.1 for SkiffyMessenger.

## Overview

These prompts are designed to generate high-quality Flutter components that integrate seamlessly with the existing design system and architecture. Each prompt follows the BMad Master framework with:

- **High-Level Goal**: Clear objective description
- **Detailed Instructions**: Step-by-step implementation guide
- **Code Examples**: Complete Flutter/Dart code samples
- **Strict Scope**: Clear boundaries for what to create/modify
- **Critical Constraints**: Performance, accessibility, and integration requirements

## Available Prompts

### 1. Master Context Prompt

**File**: `master-context-prompt.md`
**Purpose**: Establishes the overall project context, tech stack, and design principles
**Use First**: Always start with this prompt to set the foundation

### 2. Component-Specific Prompts

#### AppNotificationBanner

**File**: `notification-banner-prompt.md`
**Purpose**: In-app notification banner with slide-down animations and accessibility
**Key Features**:

- Real-time notifications from Rust core
- Swipe-to-dismiss and auto-dismiss (5 seconds)
- Accessibility with FocusableBorder and screen reader support
- Integration with NotificationBloc

#### AppMentionInput

**File**: `mention-input-prompt.md`
**Purpose**: Intelligent @username autocomplete input component
**Key Features**:

- Real-time user search with debouncing
- Keyboard navigation (arrow keys, Enter, Escape)
- User avatars and online status indicators
- Integration with room member data from Rust core

#### AppVoiceRecorder

**File**: `voice-recorder-prompt.md`
**Purpose**: Voice message recorder with gesture controls
**Key Features**:

- Long-press to start, swipe-left to cancel
- Visual feedback with progress indicators
- Permission handling for microphone access
- Audio processing integration with Rust core

#### VideoCallScreen

**File**: `video-call-screen-prompt.md`
**Purpose**: Full-screen video call interface with PiP
**Key Features**:

- Picture-in-picture local video overlay
- Call controls (mute, video, camera switch, hang up)
- E2EE verification with emoji comparison
- Connection quality indicators

#### MessageSearchScreen

**File**: `message-search-prompt.md`
**Purpose**: Comprehensive message search with filtering
**Key Features**:

- Real-time search with highlighting
- Advanced filters (date range, sender, case sensitivity)
- Keyboard navigation and result counter
- Jump-to-message integration with timeline

### 3. Enhanced System Prompts (v1.1)

#### VoIP Call Interfaces Enhancement

**File**: `voip-call-interfaces-prompt.md`
**Purpose**: Complete VoIP call interface system with native integration and E2EE verification
**Key Features**:

- Native incoming/outgoing call screens with system integration
- Call control components (mute, video, speaker, hangup) with haptic feedback
- E2EE verification overlay with emoji comparison for security
- Picture-in-picture video overlay with draggable positioning
- Comprehensive accessibility with screen reader and keyboard support
- Full BLoC integration for call state management

#### Pinned Messages Management System

**File**: `pinned-messages-management-prompt.md`
**Purpose**: Dynamic pinned messages navigation and management interface
**Key Features**:

- Dynamic pinned messages bar that updates during chat scrolling
- Full management screen with pin/unpin controls and navigation
- Permission-based access respecting room power levels
- Real-time synchronization across devices
- Smooth animations and accessibility compliance
- Integration with existing timeline and message components

#### Notification Preferences Management

**File**: `notification-preferences-prompt.md`
**Purpose**: Comprehensive notification control system with granular privacy settings
**Key Features**:

- Granular notification controls per chat type (direct vs group)
- Live preview component showing notification appearance
- Privacy controls for read receipts and typing indicators
- Custom sound support per chat with system integration
- Advanced settings including DND and notification schedules
- Full accessibility with keyboard navigation and screen reader support

## How to Use These Prompts

### Step 1: Start with Master Context

```markdown
Copy the entire content of `master-context-prompt.md` and paste it into Lovable.ai
```

This establishes the project foundation and design system integration.

### Step 2: Generate Components Sequentially

1. **Choose a component** based on your current development priority
2. **Copy the complete prompt** from the corresponding file
3. **Paste into Lovable.ai** and let it generate the component
4. **Review and integrate** the generated code following the scope guidelines

### Step 3: Integration Guidelines

Each prompt specifies:

- **Files to Create**: New components and supporting files
- **Files to Modify**: Existing files that need updates
- **Files to Leave Untouched**: Protected existing code
- **Critical Constraints**: Must-follow requirements

## Key Integration Points

### Design System

All prompts reference the existing design system:

- `AppColors` - Color constants (already implemented)
- `AppTextStyles` - Typography (already implemented)
- `AppFocusableBorder` - Accessibility wrapper
- `AppTheme` - Light/dark themes

### State Management

Components use BLoC pattern:

- Extend existing BLoC structure
- Integrate with TimelineBloc, NotificationBloc, etc.
- Follow established event/state patterns

### Rust Core Integration

Components connect to Rust backend via FFI:

- Use existing `RustApi.instance` methods
- Handle async operations properly
- Implement error handling for FFI calls

### Navigation

Use auto_route for navigation:

- Add routes to `lib/app/router/router.dart`
- Implement AuthGuard protection where needed
- Support deep linking for search results

## Development Workflow

### Phase 1: Foundation (Week 1-2)

1. Generate AppNotificationBanner
2. Generate AppMentionInput
3. Integrate both into existing timeline

### Phase 2: Communication Features (Week 3-4)

1. Generate AppVoiceRecorder
2. Generate VideoCallScreen
3. Add call buttons to message input

### Phase 3: Search & Polish (Week 5-6)

1. Generate MessageSearchScreen
2. Add search button to app bar
3. Polish accessibility and performance

## Quality Assurance

### Testing Requirements

Each component includes:

- **Unit Tests**: Core logic testing
- **Widget Tests**: UI interaction testing
- **Integration Tests**: BLoC and FFI integration
- **Accessibility Tests**: Screen reader and keyboard navigation
- **Performance Tests**: 60 FPS animation and scrolling

### Accessibility Standards

All components must meet:

- **WCAG AA**: Contrast ratios and touch targets
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Comprehensive labeling
- **Focus Management**: Proper focus flow

### Performance Requirements

- **60 FPS**: All animations and scrolling
- **Efficient Rendering**: Proper state management
- **Memory Management**: Clean up resources
- **Battery Optimization**: Efficient background processing

## Architecture Compliance

### File Structure

```
lib/
├── widgets/           # Reusable UI components
├── features/          # Feature-specific code
│   ├── notifications/ # Notification feature
│   ├── calls/         # VoIP call feature
│   ├── search/        # Message search feature
│   └── timeline/      # Message timeline (existing)
├── services/          # Background services
└── app/               # App-level code (existing)
```

### State Management Pattern

```dart
// Follow this pattern for all new features
class FeatureBloc extends Bloc<FeatureEvent, FeatureState> {
  final RustApi _rustApi;

  FeatureBloc(this._rustApi) : super(FeatureInitial()) {
    on<FeatureEvent>(_handleEvent);
  }
}
```

### Error Handling

```dart
// Consistent error handling pattern
try {
  final result = await RustApi.instance.someMethod();
  // Handle success
} catch (e) {
  // Handle error with user feedback
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text('Operation failed: $e')),
  );
}
```

## Troubleshooting

### Common Issues

1. **Design System Conflicts**: Ensure you're using existing AppColors/AppTextStyles
2. **BLoC Integration**: Follow existing BLoC patterns in the codebase
3. **FFI Errors**: Check that RustApi methods exist and are properly exposed
4. **Navigation Issues**: Ensure routes are added to router configuration

### Getting Help

1. Check existing code for patterns and conventions
2. Review the UI specification for detailed requirements
3. Test components individually before integration
4. Use the prompts' testing requirements as validation checklist

## Next Steps

After generating components with these prompts:

1. **Review Generated Code**: Ensure it follows Flutter best practices
2. **Integration Testing**: Test with existing codebase
3. **Accessibility Audit**: Verify WCAG AA compliance
4. **Performance Testing**: Ensure 60 FPS and efficient memory usage
5. **User Testing**: Validate with real usage scenarios

## Version History

- **v1.0**: Initial prompts for core v1.1 features
- **Based on**: UI Specification v1.1 and existing design system
- **Framework**: Flutter with BLoC and FFI integration
- **Target**: Lovable.ai code generation tool

---

**Note**: These prompts are designed for iterative development. Generate one component at a time, integrate it fully, then move to the next. This ensures quality and maintainability throughout the development process.
