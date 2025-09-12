# Lovable Prompt: AppMentionInput Component

## High-Level Goal

Create an intelligent mention input component for SkiffyMessenger that provides @username autocomplete functionality with smooth animations, accessibility support, and seamless integration with the existing design system.

## Detailed, Step-by-Step Instructions

### 1. Component Structure

1. Create `lib/widgets/app_mention_input.dart`
2. Implement as a StatefulWidget with text editing capabilities
3. Include autocomplete overlay that appears when typing '@'
4. Add proper accessibility features with FocusableBorder
5. Integrate with room member data from Rust core

### 2. Visual Design Implementation

1. Use AppTextField as the base input component
2. Apply AppColors for text and background styling
3. Create overlay with user suggestions (max 5 visible)
4. Include user avatars (24x24dp) in suggestion list
5. Add visual indicators for online/offline status
6. Highlight matching text in suggestions

### 3. Interaction & Behavior

1. Detect '@' character and trigger autocomplete
2. Filter users based on text after '@'
3. Navigate suggestions with arrow keys
4. Select with Enter key or tap
5. Close overlay on Escape or clicking outside
6. Insert selected mention in format: @[username]

### 4. Animation & UX

1. Smooth fade-in for autocomplete overlay (200ms)
2. Slide-up animation for suggestions list
3. Highlight current selection with background color change
4. Debounced search to avoid excessive API calls
5. Loading state with skeleton while fetching users

### 5. Accessibility Features

1. Wrap input with AppFocusableBorder
2. Add Semantics for screen reader support
3. Announce suggestion count and current selection
4. Keyboard navigation support (arrow keys, Enter, Escape)
5. Proper focus management between input and overlay

## Code Examples, Data Structures & Constraints

### Component Interface

```dart
class AppMentionInput extends StatefulWidget {
  final TextEditingController controller;
  final String roomId;
  final List<RoomMember> members;
  final Function(String mention) onMentionSelected;
  final Function(String text) onTextChanged;
  final int maxSuggestions;

  const AppMentionInput({
    Key? key,
    required this.controller,
    required this.roomId,
    required this.members,
    required this.onMentionSelected,
    required this.onTextChanged,
    this.maxSuggestions = 5,
  }) : super(key: key);
}
```

### State Management

```dart
class _AppMentionInputState extends State<AppMentionInput> {
  bool _showSuggestions = false;
  List<RoomMember> _filteredMembers = [];
  int _selectedIndex = -1;
  String _currentQuery = '';

  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_onTextChanged);
  }

  void _onTextChanged() {
    final text = widget.controller.text;
    final cursorPosition = widget.controller.selection.baseOffset;

    // Find if we're in a mention context
    final mentionStart = _findMentionStart(text, cursorPosition);
    if (mentionStart != -1) {
      final query = text.substring(mentionStart + 1, cursorPosition);
      _updateSuggestions(query);
    } else {
      setState(() => _showSuggestions = false);
    }

    widget.onTextChanged(text);
  }

  int _findMentionStart(String text, int cursorPosition) {
    for (int i = cursorPosition - 1; i >= 0; i--) {
      if (text[i] == '@') {
        // Check if @ is preceded by whitespace or is at start
        if (i == 0 || text[i - 1].trim().isEmpty) {
          return i;
        }
      } else if (text[i].trim().isEmpty) {
        // Stop if we hit whitespace
        break;
      }
    }
    return -1;
  }

  void _updateSuggestions(String query) {
    setState(() {
      _currentQuery = query;
      _filteredMembers = widget.members
          .where((member) =>
              member.displayName.toLowerCase().contains(query.toLowerCase()) ||
              member.username.toLowerCase().contains(query.toLowerCase()))
          .take(widget.maxSuggestions)
          .toList();
      _showSuggestions = _filteredMembers.isNotEmpty;
      _selectedIndex = _filteredMembers.isNotEmpty ? 0 : -1;
    });
  }
}
```

### Autocomplete Overlay

```dart
Widget _buildSuggestionsOverlay() {
  if (!_showSuggestions) return const SizedBox.shrink();

  return Positioned(
    left: 0,
    right: 0,
    top: 60, // Below the text field
    child: Material(
      elevation: 4,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        constraints: const BoxConstraints(maxHeight: 200),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.outline),
        ),
        child: ListView.builder(
          shrinkWrap: true,
          itemCount: _filteredMembers.length,
          itemBuilder: (context, index) {
            final member = _filteredMembers[index];
            final isSelected = index == _selectedIndex;

            return InkWell(
              onTap: () => _selectMention(member),
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
                color: isSelected
                    ? AppColors.primaryContainer
                    : Colors.transparent,
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 16,
                      backgroundImage: member.avatarUrl != null
                          ? NetworkImage(member.avatarUrl!)
                          : null,
                      child: member.avatarUrl == null
                          ? Text(member.displayName[0].toUpperCase())
                          : null,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            member.displayName,
                            style: AppTextStyles.body.copyWith(
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          Text(
                            '@${member.username}',
                            style: AppTextStyles.caption.copyWith(
                              color: AppColors.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (member.isOnline)
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: AppColors.success,
                          shape: BoxShape.circle,
                        ),
                      ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    ),
  );
}
```

### Mention Selection Logic

```dart
void _selectMention(RoomMember member) {
  final text = widget.controller.text;
  final cursorPosition = widget.controller.selection.baseOffset;
  final mentionStart = _findMentionStart(text, cursorPosition);

  if (mentionStart != -1) {
    final beforeMention = text.substring(0, mentionStart);
    final afterCursor = text.substring(cursorPosition);
    final mention = '@${member.username} ';

    final newText = beforeMention + mention + afterCursor;
    final newCursorPosition = mentionStart + mention.length;

    widget.controller.value = TextEditingValue(
      text: newText,
      selection: TextSelection.collapsed(offset: newCursorPosition),
    );

    setState(() => _showSuggestions = false);
    widget.onMentionSelected('@${member.username}');
  }
}
```

### Keyboard Navigation

```dart
void _handleKeyEvent(RawKeyEvent event) {
  if (!_showSuggestions) return;

  if (event is RawKeyDownEvent) {
    if (event.logicalKey == LogicalKeyboardKey.arrowDown) {
      setState(() {
        _selectedIndex = (_selectedIndex + 1) % _filteredMembers.length;
      });
    } else if (event.logicalKey == LogicalKeyboardKey.arrowUp) {
      setState(() {
        _selectedIndex = _selectedIndex > 0
            ? _selectedIndex - 1
            : _filteredMembers.length - 1;
      });
    } else if (event.logicalKey == LogicalKeyboardKey.enter) {
      if (_selectedIndex >= 0 && _selectedIndex < _filteredMembers.length) {
        _selectMention(_filteredMembers[_selectedIndex]);
      }
    } else if (event.logicalKey == LogicalKeyboardKey.escape) {
      setState(() => _showSuggestions = false);
    }
  }
}
```

### Localization Integration

```dart
// Import localization
import 'package:skiffy/l10n/l10n.dart';

// Use l10n for user-facing strings
class _AppMentionInputState extends State<AppMentionInput> {
  // ... existing state variables ...

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return AppFocusableBorder(
      child: Semantics(
        label: l10n.mentionInputLabel,
        hint: l10n.mentionInputHint,
        child: Column(
          children: [
            AppTextField(
              controller: widget.controller,
              hintText: l10n.mentionInputPlaceholder,
              // ... other properties
            ),
            if (_showSuggestions)
              _buildSuggestionsOverlay(context),
          ],
        ),
      ),
    );
  }

  Widget _buildSuggestionsOverlay(BuildContext context) {
    final l10n = context.l10n;
    return Positioned(
      // ... existing overlay code ...
      child: Material(
        elevation: 4,
        child: Container(
          // ... existing container code ...
          child: ListView.builder(
            itemBuilder: (context, index) {
              final member = _filteredMembers[index];
              final isSelected = index == _selectedIndex;

              return ListTile(
                leading: CircleAvatar(
                  // ... existing avatar code ...
                  child: member.avatarUrl == null
                      ? Text(member.displayName[0].toUpperCase())
                      : null,
                ),
                title: Text(member.displayName),
                subtitle: Text(
                  l10n.mentionUsername(member.username),
                ),
                selected: isSelected,
                onTap: () => _selectMention(member),
              );
            },
          ),
        ),
      ),
    );
  }
}
```

## Strict Scope Definition

### Files to Create

- `lib/widgets/app_mention_input.dart` - Main component implementation

### Files to Modify

- `lib/widgets/widgets.dart` - Add export for AppMentionInput
- `lib/features/timeline/bloc/timeline_bloc.dart` - Add mention handling
- `lib/features/timeline/widgets/message_input.dart` - Integrate AppMentionInput

### Files to Leave Untouched

- `lib/app/design_system/colors.dart` - Use existing colors
- `lib/app/design_system/theme.dart` - Use existing theme
- `lib/api/frb_generated.dart` - Use existing FFI for member data

### Critical Constraints

- **MOBILE-FIRST**: Touch-friendly 44x44dp touch targets
- **PERFORMANCE**: Debounced search (300ms) to avoid excessive filtering
- **ACCESSIBILITY**: Full keyboard navigation and screen reader support
- **BLoC INTEGRATION**: Connect to existing timeline state management
- **FFI INTEGRATION**: Use existing member data from Rust core
- **MENTION FORMAT**: Standard @[username] format for consistency
- **MAX SUGGESTIONS**: Limit to 5 visible suggestions for performance

## Additional Context

### Mention Types to Support

1. **User Mentions**: @username for individual users
2. **Room Mentions**: @room for all room participants
3. **Role Mentions**: @admin, @moderator (future feature)
4. **Special Mentions**: @here for online users only

### Search & Filtering Logic

- **Case-insensitive** matching on display name and username
- **Prefix matching** prioritized over contains matching
- **Online status** sorting (online users first)
- **Recent interactions** weighting (future enhancement)
- **Maximum results** limit to prevent UI overflow

### Privacy & Security

- Only show members that current user can mention
- Respect room permissions for mentions
- Don't expose user information unnecessarily
- Support for private mentions in encrypted rooms

### Performance Optimizations

- **Lazy loading** of member avatars
- **Memoization** of filtered results
- **Virtual scrolling** for large member lists
- **Background updates** of member status

### Testing Requirements

- Unit tests for mention detection logic
- Widget tests for autocomplete behavior
- Integration tests with TimelineBloc
- Accessibility tests for keyboard navigation
- Performance tests for large member lists
