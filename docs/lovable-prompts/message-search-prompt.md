# Lovable Prompt: MessageSearchScreen Component

## High-Level Goal

Create a comprehensive message search interface for SkiffyMessenger with real-time search, result highlighting, navigation controls, and seamless integration with the existing design system and Rust core search functionality.

## Detailed, Step-by-Step Instructions

### 1. Screen Structure

1. Create `lib/features/search/screens/message_search_screen.dart`
2. Implement search bar with real-time filtering
3. Add result list with pagination and navigation
4. Include search filters and sorting options
5. Integrate with room context and message history

### 2. Visual Design Implementation

1. Use AppBar with integrated search field
2. Display results in ListView with message previews
3. Highlight search terms in result text
4. Show navigation controls (previous/next result)
5. Include loading states and empty states

### 3. Search Functionality

1. Real-time search as user types (debounced)
2. Search across message content, sender names, and timestamps
3. Support for advanced search operators
4. Filter by date range, sender, or message type
5. Highlight and scroll to selected result in timeline

### 4. Navigation & Interaction

1. Keyboard shortcuts for navigation (↑/↓ arrows, Enter)
2. Click to jump to message in timeline
3. Previous/Next result buttons with counter
4. Search history and recent searches
5. Clear search and reset filters

### 5. Accessibility Features

1. Screen reader support for search results
2. Keyboard navigation through results
3. Proper focus management and announcements
4. High contrast support for search highlighting
5. Alternative text for all interactive elements

## Code Examples, Data Structures & Constraints

### Screen Interface

```dart
class MessageSearchScreen extends StatefulWidget {
  final String roomId;
  final String? initialQuery;

  const MessageSearchScreen({
    Key? key,
    required this.roomId,
    this.initialQuery,
  }) : super(key: key);
}
```

### State Management

```dart
enum SearchState {
  idle,
  searching,
  results,
  error,
}

class _MessageSearchScreenState extends State<MessageSearchScreen> {
  SearchState _searchState = SearchState.idle;
  String _searchQuery = '';
  List<SearchResult> _searchResults = [];
  int _selectedResultIndex = -1;
  int _currentPage = 0;
  final int _resultsPerPage = 20;

  // Search filters
  DateTimeRange? _dateRange;
  String? _senderFilter;
  bool _caseSensitive = false;

  // Controllers
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  Timer? _debounceTimer;

  @override
  void initState() {
    super.initState();
    if (widget.initialQuery != null) {
      _searchController.text = widget.initialQuery!;
      _performSearch(widget.initialQuery!);
    }
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    _debounceTimer?.cancel();
    super.dispose();
  }

  void _onSearchChanged() {
    final query = _searchController.text.trim();
    if (query != _searchQuery) {
      _searchQuery = query;
      _debounceSearch(query);
    }
  }

  void _debounceSearch(String query) {
    _debounceTimer?.cancel();
    if (query.isEmpty) {
      setState(() => _searchState = SearchState.idle);
      return;
    }

    _debounceTimer = Timer(const Duration(milliseconds: 300), () {
      _performSearch(query);
    });
  }

  Future<void> _performSearch(String query) async {
    if (query.isEmpty) return;

    setState(() {
      _searchState = SearchState.searching;
      _selectedResultIndex = -1;
    });

    try {
      final results = await RustApi.instance.searchMessages(
        roomId: widget.roomId,
        query: query,
        dateRange: _dateRange,
        senderFilter: _senderFilter,
        caseSensitive: _caseSensitive,
        limit: _resultsPerPage,
        offset: _currentPage * _resultsPerPage,
      );

      setState(() {
        _searchResults = results;
        _searchState = SearchState.results;
        if (results.isNotEmpty && _selectedResultIndex == -1) {
          _selectedResultIndex = 0;
        }
      });
    } catch (e) {
      setState(() => _searchState = SearchState.error);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Search failed: $e')),
      );
    }
  }

  void _navigateToResult(int index) {
    if (index < 0 || index >= _searchResults.length) return;

    setState(() => _selectedResultIndex = index);
    final result = _searchResults[index];

    // Scroll result into view
    _scrollController.animateTo(
      index * 80.0, // Approximate item height
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOut,
    );

    // Announce to screen reader
    SemanticsService.announce(
      'Result ${index + 1} of ${_searchResults.length}: ${result.preview}',
      TextDirection.ltr,
    );
  }

  void _jumpToMessage(String messageId) {
    // Navigate back to timeline and scroll to message
    Navigator.of(context).pop(messageId);
  }

  void _showFilters() {
    showModalBottomSheet(
      context: context,
      builder: (context) => _buildSearchFilters(),
    );
  }

  void _clearSearch() {
    _searchController.clear();
    setState(() {
      _searchState = SearchState.idle;
      _searchResults = [];
      _selectedResultIndex = -1;
      _dateRange = null;
      _senderFilter = null;
    });
  }
}
```

### Search Filters Implementation

```dart
Widget _buildSearchFilters() {
  return Container(
    padding: const EdgeInsets.all(16),
    child: Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Search Filters',
          style: AppTextStyles.headline,
        ),
        const SizedBox(height: 16),

        // Date range filter
        ListTile(
          title: Text('Date Range'),
          subtitle: _dateRange != null
              ? Text('${_dateRange!.start.toString().split(' ')[0]} - ${_dateRange!.end.toString().split(' ')[0]}')
              : Text('All dates'),
          trailing: Icon(Icons.calendar_today),
          onTap: () async {
            final picked = await showDateRangePicker(
              context: context,
              firstDate: DateTime(2020),
              lastDate: DateTime.now(),
            );
            if (picked != null) {
              setState(() => _dateRange = picked);
            }
          },
        ),

        // Sender filter
        ListTile(
          title: Text('Sender'),
          subtitle: Text(_senderFilter ?? 'All senders'),
          trailing: Icon(Icons.person),
          onTap: () => _showSenderFilter(),
        ),

        // Case sensitivity
        SwitchListTile(
          title: Text('Case Sensitive'),
          value: _caseSensitive,
          onChanged: (value) => setState(() => _caseSensitive = value),
        ),

        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () {
                  setState(() {
                    _dateRange = null;
                    _senderFilter = null;
                    _caseSensitive = false;
                  });
                },
                child: Text('Reset'),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pop();
                  if (_searchQuery.isNotEmpty) {
                    _performSearch(_searchQuery);
                  }
                },
                child: Text('Apply'),
              ),
            ),
          ],
        ),
      ],
    ),
  );
}

Future<void> _showSenderFilter() async {
  final members = await RustApi.instance.getRoomMembers(widget.roomId);

  if (!mounted) return;

  final selectedSender = await showDialog<String>(
    context: context,
    builder: (context) => SimpleDialog(
      title: Text('Select Sender'),
      children: [
        SimpleDialogOption(
          onPressed: () => Navigator.of(context).pop(null),
          child: Text('All senders'),
        ),
        ...members.map((member) => SimpleDialogOption(
          onPressed: () => Navigator.of(context).pop(member.userId),
          child: Text(member.displayName),
        )),
      ],
    ),
  );

  if (selectedSender != null) {
    setState(() => _senderFilter = selectedSender);
  }
}
```

### Visual Implementation

```dart
@override
Widget build(BuildContext context) {
  return Scaffold(
    appBar: AppBar(
      title: TextField(
        controller: _searchController,
        decoration: InputDecoration(
          hintText: 'Search messages...',
          border: InputBorder.none,
          hintStyle: AppTextStyles.body.copyWith(
            color: AppColors.onSurfaceVariant,
          ),
        ),
        style: AppTextStyles.body,
        autofocus: true,
        onSubmitted: _performSearch,
      ),
      actions: [
        // Filter button
        IconButton(
          icon: Icon(Icons.filter_list),
          onPressed: _showFilters,
          tooltip: 'Search filters',
        ),

        // Clear button
        if (_searchController.text.isNotEmpty)
          IconButton(
            icon: Icon(Icons.clear),
            onPressed: _clearSearch,
            tooltip: 'Clear search',
          ),

        // Results counter and navigation
        if (_searchState == SearchState.results && _searchResults.isNotEmpty)
          Row(
            children: [
              Text(
                '${_selectedResultIndex + 1} of ${_searchResults.length}',
                style: AppTextStyles.caption,
              ),
              IconButton(
                icon: Icon(Icons.keyboard_arrow_up),
                onPressed: _selectedResultIndex > 0
                    ? () => _navigateToResult(_selectedResultIndex - 1)
                    : null,
                tooltip: 'Previous result',
              ),
              IconButton(
                icon: Icon(Icons.keyboard_arrow_down),
                onPressed: _selectedResultIndex < _searchResults.length - 1
                    ? () => _navigateToResult(_selectedResultIndex + 1)
                    : null,
                tooltip: 'Next result',
              ),
            ],
          ),
      ],
    ),
    body: _buildBody(),
  );
}

Widget _buildBody() {
  switch (_searchState) {
    case SearchState.idle:
      return _buildIdleState();
    case SearchState.searching:
      return _buildSearchingState();
    case SearchState.results:
      return _searchResults.isEmpty
          ? _buildNoResultsState()
          : _buildResultsList();
    case SearchState.error:
      return _buildErrorState();
    default:
      return const SizedBox.shrink();
  }
}

Widget _buildIdleState() {
  return Center(
    child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(
          Icons.search,
          size: 64,
          color: AppColors.onSurfaceVariant,
        ),
        const SizedBox(height: 16),
        Text(
          'Search Messages',
          style: AppTextStyles.headline,
        ),
        const SizedBox(height: 8),
        Text(
          'Enter keywords to search through message history',
          style: AppTextStyles.body.copyWith(
            color: AppColors.onSurfaceVariant,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    ),
  );
}

Widget _buildSearchingState() {
  return Center(
    child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        CircularProgressIndicator(),
        const SizedBox(height: 16),
        Text(
          'Searching...',
          style: AppTextStyles.body,
        ),
      ],
    ),
  );
}

Widget _buildNoResultsState() {
  return Center(
    child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(
          Icons.search_off,
          size: 64,
          color: AppColors.onSurfaceVariant,
        ),
        const SizedBox(height: 16),
        Text(
          'No results found',
          style: AppTextStyles.headline,
        ),
        const SizedBox(height: 8),
        Text(
          'Try different keywords or adjust filters',
          style: AppTextStyles.body.copyWith(
            color: AppColors.onSurfaceVariant,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    ),
  );
}

Widget _buildErrorState() {
  return Center(
    child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(
          Icons.error_outline,
          size: 64,
          color: AppColors.error,
        ),
        const SizedBox(height: 16),
        Text(
          'Search failed',
          style: AppTextStyles.headline,
        ),
        const SizedBox(height: 16),
        ElevatedButton(
          onPressed: () => _performSearch(_searchQuery),
          child: Text('Try again'),
        ),
      ],
    ),
  );
}

Widget _buildResultsList() {
  return ListView.builder(
    controller: _scrollController,
    itemCount: _searchResults.length,
    itemBuilder: (context, index) {
      final result = _searchResults[index];
      final isSelected = index == _selectedResultIndex;

      return AppFocusableBorder(
        child: Container(
          color: isSelected
              ? AppColors.primaryContainer
              : Colors.transparent,
          child: ListTile(
            leading: CircleAvatar(
              radius: 20,
              backgroundImage: result.senderAvatar != null
                  ? NetworkImage(result.senderAvatar!)
                  : null,
              child: result.senderAvatar == null
                  ? Text(result.senderName[0].toUpperCase())
                  : null,
            ),
            title: Text(
              result.senderName,
              style: AppTextStyles.body.copyWith(
                fontWeight: FontWeight.w500,
              ),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Highlighted message preview
                RichText(
                  text: _highlightSearchTerms(result.messagePreview, _searchQuery),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  _formatTimestamp(result.timestamp),
                  style: AppTextStyles.caption.copyWith(
                    color: AppColors.onSurfaceVariant,
                  ),
                ),
              ],
            ),
            onTap: () => _jumpToMessage(result.messageId),
          ),
        ),
      );
    },
  );
}

TextSpan _highlightSearchTerms(String text, String query) {
  if (query.isEmpty) {
    return TextSpan(text: text, style: AppTextStyles.body);
  }

  final spans = <TextSpan>[];
  final lowerText = text.toLowerCase();
  final lowerQuery = query.toLowerCase();
  var start = 0;

  while (true) {
    final index = lowerText.indexOf(lowerQuery, start);
    if (index == -1) break;

    // Add text before match
    if (index > start) {
      spans.add(TextSpan(
        text: text.substring(start, index),
        style: AppTextStyles.body,
      ));
    }

    // Add highlighted match
    spans.add(TextSpan(
      text: text.substring(index, index + query.length),
      style: AppTextStyles.body.copyWith(
        backgroundColor: AppColors.primaryContainer,
        fontWeight: FontWeight.w500,
      ),
    ));

    start = index + query.length;
  }

  // Add remaining text
  if (start < text.length) {
    spans.add(TextSpan(
      text: text.substring(start),
      style: AppTextStyles.body,
    ));
  }

  return TextSpan(children: spans);
}

String _formatTimestamp(DateTime timestamp) {
  final now = DateTime.now();
  final difference = now.difference(timestamp);

  if (difference.inDays == 0) {
    return 'Today ${timestamp.hour}:${timestamp.minute.toString().padLeft(2, '0')}';
  } else if (difference.inDays == 1) {
    return 'Yesterday ${timestamp.hour}:${timestamp.minute.toString().padLeft(2, '0')}';
  } else if (difference.inDays < 7) {
    final weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return '${weekdays[timestamp.weekday - 1]} ${timestamp.hour}:${timestamp.minute.toString().padLeft(2, '0')}';
  } else {
    return '${timestamp.day}/${timestamp.month}/${timestamp.year} ${timestamp.hour}:${timestamp.minute.toString().padLeft(2, '0')}';
  }
}
```

## Strict Scope Definition

### Files to Create

- `lib/features/search/screens/message_search_screen.dart` - Main search screen
- `lib/features/search/bloc/search_bloc.dart` - Search state management
- `lib/features/search/bloc/search_event.dart` - Search events
- `lib/features/search/bloc/search_state.dart` - Search states

### Files to Modify

- `lib/app/router/router.dart` - Add search route
- `lib/features/timeline/widgets/message_list.dart` - Add jump to message functionality
- `lib/widgets/widgets.dart` - Export search components

### Files to Leave Untouched

- `lib/app/design_system/colors.dart` - Use existing colors
- `lib/app/design_system/theme.dart` - Use existing theme
- `android/` and `ios/` - Native search handling separate

### Critical Constraints

- **REAL-TIME SEARCH**: Debounced search with 300ms delay
- **PERFORMANCE**: Efficient search with pagination (20 results per page)
- **HIGHLIGHTING**: Visual highlighting of search terms in results
- **ACCESSIBILITY**: Full keyboard navigation and screen reader support
- **NAVIGATION**: Previous/Next controls with result counter
- **FILTERING**: Date range, sender, and case sensitivity filters
- **INTEGRATION**: Seamless jump-to-message in timeline

## Additional Context

### Search Capabilities

1. **Text Search**: Full-text search across message content
2. **Sender Search**: Filter by specific users
3. **Date Filtering**: Search within date ranges
4. **Case Sensitivity**: Optional case-sensitive matching
5. **Advanced Operators**: Support for AND/OR/NOT operators

### Result Presentation

- **Message Preview**: Truncated message content with highlighting
- **Sender Information**: Avatar and display name
- **Timestamp**: Relative time formatting (Today, Yesterday, etc.)
- **Context**: Room/channel information
- **Match Count**: Total results with current position

### Navigation Integration

- **Timeline Jump**: Scroll to exact message position
- **Highlight Message**: Temporary highlight of found message
- **Back Navigation**: Return to search with current state
- **Deep Linking**: Support for search result URLs

### Performance Optimizations

- **Local Search**: SQLite-based search for instant results
- **Pagination**: Load results in chunks to prevent UI blocking
- **Caching**: Cache recent searches and results
- **Background Indexing**: Maintain search index for fast queries

### Privacy Considerations

- **Search Scope**: Only search user's accessible messages
- **Result Filtering**: Respect room permissions and access levels
- **No Server Search**: All search performed locally
- **Search History**: Optional local storage with clear option

### Testing Requirements

- Unit tests for search logic and highlighting
- Widget tests for result navigation
- Integration tests with TimelineBloc
- Performance tests for large result sets
- Accessibility tests for keyboard navigation
- Filter functionality tests
