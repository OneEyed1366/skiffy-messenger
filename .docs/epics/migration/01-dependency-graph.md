# Dependency Graph

## Layer Dependencies

```
┌─────────────────────────────────────────────────────────────────┐
│                        L11: Feature Components                   │
│  (Sidebar, Messaging, User, Channel, Search)                    │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      L10: Layout Components                      │
│  (Modal, Menu, Header, TabBar, BottomSheet)                     │
└─────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
┌────────────────────────────┐    ┌────────────────────────────────┐
│     L9: State Hooks        │    │    L6: Base Components         │
│ (useUser, useChannel, ...) │    │ (Button, Input, Avatar, ...)   │
└────────────────────────────┘    └────────────────────────────────┘
          │                                      │
          ▼                                      │
┌─────────────────────────────────────────────────────────────────┐
│                    L8: WebSocket RxJS Service                    │
│  (socket$, posts$, typing$, channels$ — event streams)          │
└─────────────────────────────────────────────────────────────────┘
          │                                      │
          ▼                                      │
┌────────────────────────────┐                   │
│    L7: Zustand Stores      │                   │
│ (auth, teams, channels...) │                   │
└────────────────────────────┘                   │
          │                                      │
          └──────────────┬───────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                        L5: Pure Hooks                            │
│  (useFocusTrap, useClickOutside, useDebounce, ...)              │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    L4: Formatting Utils                          │
│  (date, timezone, url, text, emoji, file formatters)            │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                     L3: Platform Utils                           │
│  (Platform detection, keyboard, device capabilities)            │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                       L2: Pure Utils                             │
│  (generateId, latinise, toTitleCase, fileSizeToString, ...)     │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                        L1: Constants                             │
│  (Preferences, KeyCodes, ChannelTypes, PostTypes, ...)          │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                          L0: Types                               │
│  (IUser, IChannel, IPost, ITeam, IFile, IEmoji, ...)            │
└─────────────────────────────────────────────────────────────────┘
```

## Critical Path

The following tasks are on the critical path (blocking most work):

1. **T0.01** → **T0.02** → **T0.03** (Core types: User, Channel, Post)
2. **T1.01** (General constants)
3. **T7.01** (Zustand store setup)
4. **T6.01**, **T6.02** (Text, Button - used everywhere)
5. **T9.01** (Modal - used by many features)

## Parallelization Matrix

| Layer  | Parallel Within           | Parallel With    |
| ------ | ------------------------- | ---------------- |
| L0     | All tasks                 | -                |
| L1     | All tasks                 | L0 (after T0.15) |
| L2     | All tasks                 | L1               |
| L3     | All tasks                 | L2               |
| L4     | All tasks                 | L3               |
| L5     | All tasks                 | L4               |
| L6     | All tasks                 | L5               |
| L7     | T7.02-T7.11 (after T7.01) | L5, L6           |
| L8     | T7.10 (after T7.09)       | L7               |
| L9     | Most tasks                | L8 (partial)     |
| L10    | All tasks                 | L9 (partial)     |
| L11a-e | Within subgroups          | L10              |

## Layer Details

### L0: Types (15 tasks)

Foundation layer - no dependencies. All tasks can run in parallel.

| Task  | Name             | Blocks                     |
| ----- | ---------------- | -------------------------- |
| T0.01 | User types       | T7.02, T7.06, T8.01, T8.04 |
| T0.02 | Channel types    | T7.04, T8.03, T8.05        |
| T0.03 | Post types       | T7.05, T8.07               |
| T0.04 | Team types       | T7.03, T8.02, T8.06        |
| T0.05 | File types       | T4.08, T10b.10             |
| T0.06 | Emoji types      | T4.07, T10b.14             |
| T0.07 | Draft types      | T8.19                      |
| T0.08 | Thread types     | T8.15, T10e.06             |
| T0.09 | Category types   | T8.13, T10a.05             |
| T0.10 | Bookmark types   | T8.08, T10d.07             |
| T0.11 | Group types      | T10c.01                    |
| T0.12 | Preference types | T7.07, T8.09               |
| T0.13 | Session types    | T7.02                      |
| T0.14 | Search types     | T8.18, T10e.03             |
| T0.15 | Utility types    | All layers                 |

### L1: Constants (5 tasks)

Depends on: L0

| Task  | Name                 | Blocks         |
| ----- | -------------------- | -------------- |
| T1.01 | General constants    | Most tasks     |
| T1.02 | Channel constants    | T7.04, T10a.\* |
| T1.03 | Post constants       | T7.05, T10b.\* |
| T1.04 | File constants       | T4.08, T10b.10 |
| T1.05 | Permission constants | T8.11, T10d.\* |

### L2-L4: Utilities

Sequential layers building on each other.

### L5: Pure Hooks (10 tasks)

Hooks without state management dependencies.

### L6: Base Components (15 tasks)

UI primitives used throughout the app.

| Task  | Name    | Used By       |
| ----- | ------- | ------------- |
| T6.01 | Text    | Everything    |
| T6.02 | Button  | Everything    |
| T6.05 | Avatar  | User displays |
| T6.07 | Input   | Forms, search |
| T6.12 | Tooltip | Help text     |

### L7: Zustand Stores (11 tasks)

State management setup. T7.01 must complete first.

```
T7.01 (Store setup)
    ├── T7.02 (useAuthStore)
    ├── T7.03 (useTeamsStore)
    ├── T7.04 (useChannelsStore)
    ├── T7.05 (usePostsStore)
    ├── T7.06 (useUsersStore)
    ├── T7.07 (usePreferencesStore)
    ├── T7.08 (useWebSocketStore)
    ├── T7.09 (useUIStore)
    ├── T7.10 (useTypingStore)
    └── T7.11 (useThreadsStore)
```

### L8: WebSocket RxJS Service (2 tasks)

RxJS-based WebSocket event processing. Depends on L7 stores.

```
T8.01 (WebSocket Service) ─► Core socket$, connection, reconnect
    └── T8.02 (Event Streams) ─► posts$, typing$, channels$, users$, reactions$
```

| Task  | Name              | Blocks              |
| ----- | ----------------- | ------------------- |
| T8.01 | WebSocket Service | T8.02, all L9 hooks |
| T8.02 | Event Streams     | Real-time features  |

### L9: State Hooks (20 tasks)

Hooks that consume Zustand stores.

### L10: Layout Components (15 tasks)

Structural components: Modal, Menu, Header, etc.

### L11: Feature Components (63 tasks)

Organized into subgroups:

- **L11a**: Sidebar (15 tasks)
- **L11b**: Messaging (20 tasks)
- **L11c**: User & Profile (10 tasks)
- **L11d**: Channel Management (10 tasks)
- **L11e**: Search & Navigation (8 tasks)

## Recommended Team Distribution

For a team of 3 developers:

| Developer | Focus Areas                          |
| --------- | ------------------------------------ |
| Dev 1     | L0, L7, L8, L9 (Types, State & RxJS) |
| Dev 2     | L2-L5, L6 (Utils & Base Components)  |
| Dev 3     | L10, L11a-b (Layout & Core Features) |

After foundation complete, all can work on L11.
