# L7: State Management

## Overview

State management using a three-layer architecture:

| Layer                | Technology     | Responsibility                                     |
| -------------------- | -------------- | -------------------------------------------------- |
| **Server State**     | TanStack Query | REST API data (posts, channels, users, teams)      |
| **Client State**     | Zustand        | UI-only ephemeral state (modals, sidebars, typing) |
| **Real-time Events** | RxJS           | WebSocket stream transformations                   |

**Architecture Documentation:** See [State Management Architecture](../../../architecture/state-management.md) for detailed patterns and examples.

## Target Location

```
apps/v2/src/
├── api/              # Raw API layer
├── queries/          # TanStack Query hooks
├── mutations/        # TanStack Mutations
├── stores/           # Zustand stores
└── services/websocket/  # RxJS streams (see L8)
```

## Dependencies

- L0: Types
- L1: Constants
- L8: WebSocket/RxJS (for real-time sync)

---

## Tasks Overview

### Infrastructure Tasks

| ID    | Name                | Status  | Est. | Description                                      |
| ----- | ------------------- | ------- | ---- | ------------------------------------------------ |
| T7.01 | API Client Setup    | pending | 2h   | Create `api/client.ts`, `api/urls.ts`            |
| T7.02 | QueryClient Setup   | pending | 2h   | Configure QueryClient, providers                 |
| T7.03 | Query Keys Factory  | pending | 2h   | Create `queries/keys.ts`                         |
| T7.04 | Store Setup Utility | pending | 1h   | Create `stores/setup.ts` with persist middleware |

### TanStack Query Tasks (Server State)

| ID    | Name               | Status  | Parallel | Est. | Description                                                 |
| ----- | ------------------ | ------- | -------- | ---- | ----------------------------------------------------------- |
| T7.10 | Posts Queries      | pending | ✓        | 4h   | usePostQuery, usePostsQuery, useInfinitePostsQuery          |
| T7.11 | Posts Mutations    | pending | ✓        | 4h   | useCreatePost, useUpdatePost, useDeletePost, useReactToPost |
| T7.12 | Channels Queries   | pending | ✓        | 3h   | useChannelQuery, useChannelsQuery, useChannelMembersQuery   |
| T7.13 | Channels Mutations | pending | ✓        | 3h   | useCreateChannel, useJoinChannel, useLeaveChannel           |
| T7.14 | Users Queries      | pending | ✓        | 3h   | useUserQuery, useUsersQuery, useCurrentUserQuery            |
| T7.15 | Users Mutations    | pending | ✓        | 2h   | useUpdateUser, useUpdateStatus                              |
| T7.16 | Teams Queries      | pending | ✓        | 2h   | useTeamQuery, useTeamsQuery                                 |
| T7.17 | Teams Mutations    | pending | ✓        | 2h   | useJoinTeam, useLeaveTeam                                   |
| T7.18 | Threads Queries    | pending | ✓        | 3h   | useThreadQuery, useThreadsQuery                             |
| T7.19 | Threads Mutations  | pending | ✓        | 2h   | useMarkThreadRead, useFollowThread                          |
| T7.20 | Config Queries     | pending | ✓        | 2h   | useClientConfigQuery, useServerConfigQuery                  |
| T7.21 | Preferences        | pending | ✓        | 2h   | usePreferencesQuery, useSavePreferenceMutation              |

### Zustand Store Tasks (Client State)

| ID    | Name                   | Status  | Parallel | Est. | Description                      |
| ----- | ---------------------- | ------- | -------- | ---- | -------------------------------- |
| T7.30 | useConnectionStore     | pending | ✓        | 1h   | WS connection status             |
| T7.31 | useTypingStore         | pending | ✓        | 2h   | Typing indicators per channel    |
| T7.32 | usePresenceStore       | pending | ✓        | 2h   | User online/away status          |
| T7.33 | useDraftsStore         | pending | ✓        | 2h   | Message drafts (persisted)       |
| T7.34 | useModalsStore         | pending | ✓        | 2h   | Modal stack, open states         |
| T7.35 | useRhsStore            | pending | ✓        | 3h   | Right sidebar state (~20 fields) |
| T7.36 | useLhsStore            | pending | ✓        | 2h   | Left sidebar state               |
| T7.37 | useChannelViewStore    | pending | ✓        | 2h   | Channel view state               |
| T7.38 | useThreadsViewStore    | pending | ✓        | 2h   | Threads panel state              |
| T7.39 | useSearchStore         | pending | ✓        | 2h   | Search terms, filters            |
| T7.40 | useBrowserStore        | pending | ✓        | 1h   | Window focus, dimensions         |
| T7.41 | useSettingsStore       | pending | ✓        | 1h   | Settings panel state             |
| T7.42 | useChannelSidebarStore | pending | ✓        | 2h   | Sidebar filters, drag state      |
| T7.43 | useEmojiStore          | pending | ✓        | 1h   | Emoji picker state               |

### Integration Tasks

| ID    | Name                    | Status  | Est. | Description                    |
| ----- | ----------------------- | ------- | ---- | ------------------------------ |
| T7.50 | WebSocket Subscriptions | pending | 4h   | WS → TanStack Query cache sync |
| T7.51 | State Provider          | pending | 2h   | QueryClientProvider + WS init  |
| T7.52 | Reset All Stores        | pending | 1h   | Logout cleanup utility         |

---

## Progress

- **Total Tasks**: 31
- **Done**: 0
- **In Progress**: 0
- **Pending**: 31

### Estimated Hours

| Category       | Hours   |
| -------------- | ------- |
| Infrastructure | 7h      |
| TanStack Query | 32h     |
| Zustand Stores | 23h     |
| Integration    | 7h      |
| **Total**      | **69h** |

---

## File Structure

```
apps/v2/src/
├── api/
│   ├── client.ts                 # T7.01
│   ├── urls.ts                   # T7.01
│   ├── posts.ts                  # T7.10, T7.11
│   ├── channels.ts               # T7.12, T7.13
│   ├── users.ts                  # T7.14, T7.15
│   ├── teams.ts                  # T7.16, T7.17
│   ├── threads.ts                # T7.18, T7.19
│   ├── config.ts                 # T7.20
│   ├── preferences.ts            # T7.21
│   └── index.ts
│
├── queries/
│   ├── client.ts                 # T7.02
│   ├── keys.ts                   # T7.03
│   ├── posts/
│   │   ├── usePostQuery.ts       # T7.10
│   │   ├── usePostsQuery.ts      # T7.10
│   │   ├── useInfinitePostsQuery.ts  # T7.10
│   │   └── index.ts
│   ├── channels/
│   │   ├── useChannelQuery.ts    # T7.12
│   │   ├── useChannelsQuery.ts   # T7.12
│   │   └── index.ts
│   ├── users/                    # T7.14
│   ├── teams/                    # T7.16
│   ├── threads/                  # T7.18
│   ├── config/                   # T7.20
│   ├── preferences/              # T7.21
│   └── index.ts
│
├── mutations/
│   ├── posts/
│   │   ├── useCreatePostMutation.ts   # T7.11
│   │   ├── useUpdatePostMutation.ts   # T7.11
│   │   ├── useDeletePostMutation.ts   # T7.11
│   │   └── index.ts
│   ├── channels/                 # T7.13
│   ├── users/                    # T7.15
│   ├── teams/                    # T7.17
│   ├── threads/                  # T7.19
│   ├── preferences/              # T7.21
│   └── index.ts
│
├── stores/
│   ├── setup.ts                  # T7.04
│   ├── connection/
│   │   └── useConnectionStore.ts # T7.30
│   ├── typing/
│   │   └── useTypingStore.ts     # T7.31
│   ├── presence/
│   │   └── usePresenceStore.ts   # T7.32
│   ├── drafts/
│   │   └── useDraftsStore.ts     # T7.33
│   ├── ui/
│   │   ├── useModalsStore.ts     # T7.34
│   │   ├── useRhsStore.ts        # T7.35
│   │   ├── useLhsStore.ts        # T7.36
│   │   ├── useChannelViewStore.ts    # T7.37
│   │   ├── useThreadsViewStore.ts    # T7.38
│   │   ├── useSearchStore.ts     # T7.39
│   │   ├── useBrowserStore.ts    # T7.40
│   │   ├── useSettingsStore.ts   # T7.41
│   │   ├── useChannelSidebarStore.ts # T7.42
│   │   └── useEmojiStore.ts      # T7.43
│   └── index.ts
│
├── providers/
│   └── StateProvider.tsx         # T7.51
│
└── types/
    ├── posts.ts
    ├── channels.ts
    ├── users.ts
    ├── teams.ts
    ├── threads.ts
    └── index.ts
```

---

## Key Patterns

### API Client (T7.01)

```typescript
// api/client.ts
class ApiClient {
  private baseUrl = "";
  private token = "";

  setUrl(url: string) {
    this.baseUrl = url;
  }
  setToken(token: string) {
    this.token = token;
  }

  getBaseRoute() {
    return `${this.baseUrl}/api/v4`;
  }
  getUsersRoute() {
    return `${this.getBaseRoute()}/users`;
  }

  getHeaders(): HeadersInit {
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };
  }

  async fetch<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: { ...this.getHeaders(), ...options?.headers },
    });
    if (!response.ok)
      throw new ApiError(response.status, await response.json());
    return response.json();
  }
}

export const apiClient = new ApiClient();
```

### Query Keys Factory (T7.03)

```typescript
// queries/keys.ts
export const queryKeys = {
  posts: {
    all: ["posts"] as const,
    list: (channelId: string, params?: IGetPostsParams) =>
      [...queryKeys.posts.all, "list", channelId, params] as const,
    detail: (postId: string) =>
      [...queryKeys.posts.all, "detail", postId] as const,
  },
  channels: {
    all: ["channels"] as const,
    list: (teamId: string) =>
      [...queryKeys.channels.all, "list", teamId] as const,
    detail: (channelId: string) =>
      [...queryKeys.channels.all, "detail", channelId] as const,
  },
  // ... users, teams, threads, config, preferences
} as const;
```

### Query Hook Pattern (T7.10+)

```typescript
// queries/posts/usePostsQuery.ts
import { useQuery } from "@tanstack/react-query";
import { postsApi } from "@/api/posts";
import { queryKeys } from "@/queries/keys";

export function usePostsQuery(channelId: string, params?: IGetPostsParams) {
  return useQuery({
    queryKey: queryKeys.posts.list(channelId, params),
    queryFn: () => postsApi.getPosts(channelId, params),
    enabled: !!channelId,
    staleTime: 1000 * 60,
  });
}
```

### Mutation Hook Pattern (T7.11+)

```typescript
// mutations/posts/useCreatePostMutation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi } from "@/api/posts";
import { queryKeys } from "@/queries/keys";

export function useCreatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ICreatePostPayload) => postsApi.createPost(payload),
    onSuccess: (created) => {
      queryClient.setQueryData<IPost[]>(
        queryKeys.posts.list(created.channel_id),
        (old) => (old ? [created, ...old] : [created]),
      );
    },
  });
}
```

### Store Setup (T7.04)

```typescript
// stores/setup.ts
import { create, StateCreator } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const storage =
  Platform.OS === "web"
    ? createJSONStorage(() => localStorage)
    : createJSONStorage(() => AsyncStorage);

export function createStore<T>(
  initializer: StateCreator<T, [], []>,
  options: { name: string; persist?: boolean },
) {
  if (options.persist) {
    return create<T>()(
      devtools(persist(initializer, { name: options.name, storage }), {
        name: options.name,
      }),
    );
  }
  return create<T>()(devtools(initializer, { name: options.name }));
}
```

### Zustand Store Pattern (T7.30+)

```typescript
// stores/typing/useTypingStore.ts
import { createStore } from "@/stores/setup";

type ITypingUser = { userId: string; username: string; timestamp: number };

type ITypingState = {
  typing: Record<string, ITypingUser[]>;
};

type ITypingActions = {
  setTyping: (channelId: string, user: ITypingUser, isTyping: boolean) => void;
  reset: () => void;
};

const initialState: ITypingState = { typing: {} };

export const useTypingStore = createStore<ITypingState & ITypingActions>(
  (set) => ({
    ...initialState,
    setTyping: (channelId, user, isTyping) => {
      set((state) => {
        const channelTyping = state.typing[channelId] || [];
        if (isTyping) {
          const exists = channelTyping.some((t) => t.userId === user.userId);
          if (exists) return state;
          return {
            typing: { ...state.typing, [channelId]: [...channelTyping, user] },
          };
        }
        return {
          typing: {
            ...state.typing,
            [channelId]: channelTyping.filter((t) => t.userId !== user.userId),
          },
        };
      });
    },
    reset: () => set(initialState),
  }),
  { name: "typing" },
);

// Selector hooks
export const useTypingUsers = (channelId: string) =>
  useTypingStore((state) => state.typing[channelId] || []);
```

### WebSocket → Cache Sync (T7.50)

```typescript
// services/websocket/subscriptions.ts
import { QueryClient } from "@tanstack/react-query";
import { posts$, typing$ } from "./events";
import { queryKeys } from "@/queries/keys";
import { useTypingStore } from "@/stores/typing";

export function initWebSocketSubscriptions(queryClient: QueryClient) {
  const subs: Array<{ unsubscribe: () => void }> = [];

  // Posts → TanStack Query cache
  subs.push(
    posts$.subscribe((events) => {
      events.forEach((event) => {
        if (event.event === "posted") {
          queryClient.setQueryData<IPost[]>(
            queryKeys.posts.list(event.data.channel_id),
            (old) => (old ? [event.data.post, ...old] : [event.data.post]),
          );
        }
      });
    }),
  );

  // Typing → Zustand store
  subs.push(
    typing$.subscribe((event) => {
      useTypingStore
        .getState()
        .setTyping(
          event.channelId,
          {
            userId: event.userId,
            username: event.username,
            timestamp: Date.now(),
          },
          event.isTyping,
        );
    }),
  );

  return () => subs.forEach((s) => s.unsubscribe());
}
```

---

## Decision Summary

### Why TanStack Query for Server State?

- **105+ API endpoints** would require 3000+ lines of manual caching with Zustand
- Built-in **pagination** (`useInfiniteQuery`) for posts, threads, members
- **Stale-while-revalidate** pattern for better UX
- **Focus/reconnect refetch** (important for messaging app)
- **DevTools** for debugging cache state

### Why Zustand for Client State?

- **RxJS integration**: Can update store from outside React tree via `getState()`
- **Ephemeral state**: Typing indicators, presence don't need REST caching
- **Persistence**: Easy `persist` middleware for drafts
- **Bundle size**: ~1kb vs Redux alternatives

### Why RxJS for WebSocket?

- **Stream transformations**: Debouncing, grouping, merging events
- **Complex flows**: Typing auto-expire with `switchMap` + `timer`
- **Single subscription** shared across consumers via `share()`

---

## Notes

- All queries use consistent staleTime (60s default)
- Mutations invalidate related queries on success
- Stores with persistence must work on Web (localStorage) and Mobile (AsyncStorage)
- WebSocket subscription cleanup is critical for memory management
- See [L8: WebSocket/RxJS](./L8-websocket-rxjs.md) for stream definitions

---

**Last Updated**: 2025-01-05
**Related Docs**:

- [State Management Architecture](../../../architecture/state-management.md)
- [Folder Structure](../../../architecture/folder-structure.md)
- [L8: WebSocket/RxJS](./L8-websocket-rxjs.md)
