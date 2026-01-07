# State Management Architecture

## Overview

The application uses a three-layer state management approach optimized for a real-time messaging platform with cross-platform support (Mobile, Desktop via Tauri, Web via RN-Web).

| Layer                | Technology     | Responsibility                                     |
| -------------------- | -------------- | -------------------------------------------------- |
| **Server State**     | TanStack Query | REST API data (posts, channels, users, teams)      |
| **Client State**     | Zustand        | UI-only ephemeral state (modals, sidebars, typing) |
| **Real-time Events** | RxJS           | WebSocket stream transformations                   |

## Data Flow Diagram

```
                            ┌─────────────────────────────────────────────┐
                            │                 Components                   │
                            └─────────────────────────────────────────────┘
                                    ▲                         ▲
                                    │ useQuery()              │ useStore()
                                    │                         │
┌─────────────┐             ┌───────┴───────┐         ┌───────┴───────┐
│   REST API  │────────────▶│ TanStack Query│         │    Zustand    │
└─────────────┘   fetch     │    (cache)    │         │   (stores)    │
                            └───────────────┘         └───────────────┘
                                    ▲                         ▲
                                    │ setQueryData()          │ getState().set()
                                    │                         │
                            ┌───────┴─────────────────────────┴───────┐
                            │              RxJS Streams                │
                            │   (posts$, typing$, presence$, etc.)     │
                            └─────────────────────────────────────────┘
                                              ▲
                                              │ WebSocket events
                                              │
                            ┌─────────────────┴─────────────────┐
                            │         WebSocketService          │
                            └───────────────────────────────────┘
```

## Technology Stack Decisions

### Why Three Libraries?

| Alternative             | Why Not                                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **TanStack Query only** | No built-in support for ephemeral client state; would require hacks for typing indicators, modal states                         |
| **Zustand only**        | Would need 3000+ lines of manual caching for 105+ API endpoints; lose `useInfiniteQuery`, stale-while-revalidate, focus refetch |
| **Redux Toolkit**       | Heavier bundle, more boilerplate than TQ + Zustand combined                                                                     |
| **RTK Query**           | WebSocket streaming requires 1 WS connection per cache entry; we have ONE shared WS with 60+ event types                        |

### Bundle Impact

| Library        | Size (gzipped)        |
| -------------- | --------------------- |
| TanStack Query | ~12kb                 |
| Zustand        | ~1kb                  |
| RxJS           | ~7kb (tree-shakeable) |
| **Total**      | **~20kb**             |

This is acceptable given the features gained: automatic caching, pagination, real-time sync, DevTools.

---

## TanStack Query (Server State)

### When to Use

- Data fetched from REST API endpoints
- Data that should be cached and shared across components
- Paginated/infinite lists (posts, threads, members)
- Data that benefits from stale-while-revalidate pattern
- Data that should refetch on window focus/reconnect

### When NOT to Use

- Ephemeral UI state (modal open, sidebar collapsed)
- High-frequency updates that bypass REST (typing indicators)
- Client-only data (drafts before sending, form state)

### Query Keys Factory

Location: `src/queries/keys.ts`

```typescript
export const queryKeys = {
  // Posts
  posts: {
    all: ["posts"] as const,
    list: (channelId: string, params?: IGetPostsParams) =>
      [...queryKeys.posts.all, "list", channelId, params] as const,
    detail: (postId: string) =>
      [...queryKeys.posts.all, "detail", postId] as const,
    thread: (rootId: string) =>
      [...queryKeys.posts.all, "thread", rootId] as const,
    search: (query: string, params?: ISearchParams) =>
      [...queryKeys.posts.all, "search", query, params] as const,
  },

  // Channels
  channels: {
    all: ["channels"] as const,
    list: (teamId: string) =>
      [...queryKeys.channels.all, "list", teamId] as const,
    detail: (channelId: string) =>
      [...queryKeys.channels.all, "detail", channelId] as const,
    members: (channelId: string, params?: IPaginationParams) =>
      [...queryKeys.channels.all, "members", channelId, params] as const,
    stats: (channelId: string) =>
      [...queryKeys.channels.all, "stats", channelId] as const,
  },

  // Users
  users: {
    all: ["users"] as const,
    detail: (userId: string) =>
      [...queryKeys.users.all, "detail", userId] as const,
    list: (params?: IGetUsersParams) =>
      [...queryKeys.users.all, "list", params] as const,
    me: () => [...queryKeys.users.all, "me"] as const,
    status: (userId: string) =>
      [...queryKeys.users.all, "status", userId] as const,
    statuses: (userIds: string[]) =>
      [...queryKeys.users.all, "statuses", userIds.sort().join(",")] as const,
  },

  // Teams
  teams: {
    all: ["teams"] as const,
    list: () => [...queryKeys.teams.all, "list"] as const,
    detail: (teamId: string) =>
      [...queryKeys.teams.all, "detail", teamId] as const,
    members: (teamId: string, params?: IPaginationParams) =>
      [...queryKeys.teams.all, "members", teamId, params] as const,
  },

  // Threads
  threads: {
    all: ["threads"] as const,
    list: (teamId: string, params?: IGetThreadsParams) =>
      [...queryKeys.threads.all, "list", teamId, params] as const,
    detail: (threadId: string) =>
      [...queryKeys.threads.all, "detail", threadId] as const,
    unread: (teamId: string) =>
      [...queryKeys.threads.all, "unread", teamId] as const,
  },

  // Config
  config: {
    all: ["config"] as const,
    client: () => [...queryKeys.config.all, "client"] as const,
    server: () => [...queryKeys.config.all, "server"] as const,
  },

  // Preferences
  preferences: {
    all: ["preferences"] as const,
    category: (category: string) =>
      [...queryKeys.preferences.all, category] as const,
  },
} as const;
```

### QueryClient Configuration

Location: `src/queries/client.ts`

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data considered fresh for 1 minute
      staleTime: 1000 * 60,
      // Cache kept for 5 minutes after unmount
      gcTime: 1000 * 60 * 5,
      // Retry failed requests 3 times with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus (important for real-time app)
      refetchOnWindowFocus: true,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});
```

### Query Hook Template

Location: `src/queries/posts/usePostsQuery.ts`

```typescript
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { postsApi } from "@/api/posts";
import { queryKeys } from "@/queries/keys";
import type { IPost, IGetPostsParams } from "@/types/posts";

type IPostsQueryData = IPost[];
type IPostsQueryError = Error;

type IOptions = Omit<
  UseQueryOptions<IPostsQueryData, IPostsQueryError>,
  "queryKey" | "queryFn"
>;

export function usePostsQuery(
  channelId: string,
  params?: IGetPostsParams,
  options?: IOptions,
) {
  return useQuery({
    queryKey: queryKeys.posts.list(channelId, params),
    queryFn: () => postsApi.getPosts(channelId, params),
    enabled: !!channelId,
    staleTime: 1000 * 60, // 1 minute
    ...options,
  });
}
```

### Infinite Query Template

Location: `src/queries/posts/useInfinitePostsQuery.ts`

```typescript
import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from "@tanstack/react-query";
import { postsApi } from "@/api/posts";
import { queryKeys } from "@/queries/keys";
import type { IPost, IGetPostsParams, IPostsResponse } from "@/types/posts";

type IOptions = Omit<
  UseInfiniteQueryOptions<IPostsResponse, Error>,
  | "queryKey"
  | "queryFn"
  | "getNextPageParam"
  | "getPreviousPageParam"
  | "initialPageParam"
>;

export function useInfinitePostsQuery(channelId: string, options?: IOptions) {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.list(channelId, { infinite: true }),
    queryFn: ({ pageParam }) =>
      postsApi.getPosts(channelId, {
        before: pageParam,
        per_page: 30,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.next_post_id : undefined,
    getPreviousPageParam: (firstPage) =>
      firstPage.has_previous ? firstPage.prev_post_id : undefined,
    enabled: !!channelId,
    staleTime: 1000 * 60,
    ...options,
  });
}
```

### Mutation Hook Template

Location: `src/mutations/posts/useCreatePostMutation.ts`

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi } from "@/api/posts";
import { queryKeys } from "@/queries/keys";
import type { IPost, ICreatePostPayload } from "@/types/posts";

type IContext = {
  previousPosts: IPost[] | undefined;
};

export function useCreatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ICreatePostPayload) => postsApi.createPost(payload),

    // Optimistic update
    onMutate: async (newPost) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.posts.list(newPost.channel_id),
      });

      // Snapshot previous value
      const previousPosts = queryClient.getQueryData<IPost[]>(
        queryKeys.posts.list(newPost.channel_id),
      );

      // Optimistically update cache
      queryClient.setQueryData<IPost[]>(
        queryKeys.posts.list(newPost.channel_id),
        (old) => {
          const optimisticPost: IPost = {
            id: `temp-${Date.now()}`,
            ...newPost,
            create_at: Date.now(),
            update_at: Date.now(),
            pending: true,
          } as IPost;
          return old ? [optimisticPost, ...old] : [optimisticPost];
        },
      );

      return { previousPosts };
    },

    // On error, rollback
    onError: (_err, newPost, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(
          queryKeys.posts.list(newPost.channel_id),
          context.previousPosts,
        );
      }
    },

    // On success, replace optimistic post with real one
    onSuccess: (createdPost, variables) => {
      queryClient.setQueryData<IPost[]>(
        queryKeys.posts.list(variables.channel_id),
        (old) => {
          if (!old) return [createdPost];
          return old.map((post) =>
            post.id.startsWith("temp-") ? createdPost : post,
          );
        },
      );
    },

    // Always refetch after error or success
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.list(variables.channel_id),
      });
    },
  });
}
```

---

## Zustand (Client State)

### When to Use

- UI-only state not from server (modal open, sidebar width)
- Ephemeral state (typing indicators, presence)
- High-frequency updates from WebSocket
- State that doesn't need persistence (except drafts)
- State updated from RxJS subscriptions outside React tree

### When NOT to Use

- Data from REST API (use TanStack Query)
- Data that should be cached across sessions (use TQ with persistence)
- Complex server state with pagination

### Zustand Stores

Based on vendor Mattermost's ~85 UI state fields, grouped into focused stores:

| Store                    | Purpose                                | Persisted | Vendor Equivalent         |
| ------------------------ | -------------------------------------- | --------- | ------------------------- |
| `useConnectionStore`     | WS connection status, error count      | No        | `views.system`            |
| `useTypingStore`         | Who's typing per channel               | No        | (ephemeral)               |
| `usePresenceStore`       | User online/away status                | No        | `entities.users.statuses` |
| `useDraftsStore`         | Unsent message drafts                  | **Yes**   | `storage.draft_*`         |
| `useModalsStore`         | Modal stack, open states               | No        | `views.modals`            |
| `useRhsStore`            | Right sidebar state (~20 fields)       | No        | `views.rhs`               |
| `useLhsStore`            | Left sidebar state                     | No        | `views.lhs`               |
| `useChannelViewStore`    | Channel view state (focus, visibility) | No        | `views.channel`           |
| `useThreadsViewStore`    | Threads panel state                    | No        | `views.threads`           |
| `useSearchStore`         | Search terms, filters                  | No        | `views.search`            |
| `useBrowserStore`        | Window focus, dimensions               | No        | `views.browser`           |
| `useSettingsStore`       | Settings panel state                   | No        | `views.settings`          |
| `useChannelSidebarStore` | Sidebar filters, drag state            | No        | `views.channelSidebar`    |
| `useEmojiStore`          | Emoji picker state                     | No        | `views.emoji`             |

### Store Setup Utility

Location: `src/stores/setup.ts`

```typescript
import { create, StateCreator } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Cross-platform storage adapter
const storage =
  Platform.OS === "web"
    ? createJSONStorage(() => localStorage)
    : createJSONStorage(() => AsyncStorage);

type IStoreOptions = {
  persist?: boolean;
  name: string;
};

export function createStore<T>(
  initializer: StateCreator<T, [], []>,
  options: IStoreOptions,
) {
  const { name, persist: shouldPersist } = options;

  if (shouldPersist) {
    return create<T>()(
      devtools(
        persist(initializer, {
          name,
          storage,
        }),
        { name },
      ),
    );
  }

  return create<T>()(devtools(initializer, { name }));
}
```

### Connection Store

Location: `src/stores/connection/useConnectionStore.ts`

```typescript
import { createStore } from "@/stores/setup";

type IConnectionStatus =
  | "connected"
  | "connecting"
  | "disconnected"
  | "reconnecting";

type IConnectionState = {
  status: IConnectionStatus;
  errorCount: number;
  lastConnectedAt: number | null;
  lastDisconnectedAt: number | null;
};

type IConnectionActions = {
  setStatus: (status: IConnectionStatus) => void;
  incrementErrorCount: () => void;
  resetErrorCount: () => void;
  reset: () => void;
};

type IConnectionStore = IConnectionState & IConnectionActions;

const initialState: IConnectionState = {
  status: "disconnected",
  errorCount: 0,
  lastConnectedAt: null,
  lastDisconnectedAt: null,
};

export const useConnectionStore = createStore<IConnectionStore>(
  (set) => ({
    ...initialState,

    setStatus: (status) => {
      set((state) => ({
        status,
        lastConnectedAt:
          status === "connected" ? Date.now() : state.lastConnectedAt,
        lastDisconnectedAt:
          status === "disconnected" ? Date.now() : state.lastDisconnectedAt,
      }));
    },

    incrementErrorCount: () => {
      set((state) => ({ errorCount: state.errorCount + 1 }));
    },

    resetErrorCount: () => {
      set({ errorCount: 0 });
    },

    reset: () => {
      set(initialState);
    },
  }),
  { name: "connection" },
);

// Selectors
export const useIsConnected = () =>
  useConnectionStore((state) => state.status === "connected");

export const useIsReconnecting = () =>
  useConnectionStore((state) => state.status === "reconnecting");
```

### Typing Store

Location: `src/stores/typing/useTypingStore.ts`

```typescript
import { createStore } from "@/stores/setup";

type ITypingUser = {
  userId: string;
  username: string;
  timestamp: number;
};

type ITypingState = {
  /** channelId -> list of typing users */
  typing: Record<string, ITypingUser[]>;
};

type ITypingActions = {
  setTyping: (channelId: string, user: ITypingUser, isTyping: boolean) => void;
  clearChannel: (channelId: string) => void;
  clearExpired: () => void;
  reset: () => void;
};

type ITypingStore = ITypingState & ITypingActions;

const TYPING_TIMEOUT_MS = 5000;

const initialState: ITypingState = {
  typing: {},
};

export const useTypingStore = createStore<ITypingStore>(
  (set, get) => ({
    ...initialState,

    setTyping: (channelId, user, isTyping) => {
      set((state) => {
        const channelTyping = state.typing[channelId] || [];

        if (isTyping) {
          // Add or update user
          const existing = channelTyping.find((t) => t.userId === user.userId);
          if (existing) {
            return {
              typing: {
                ...state.typing,
                [channelId]: channelTyping.map((t) =>
                  t.userId === user.userId
                    ? { ...t, timestamp: Date.now() }
                    : t,
                ),
              },
            };
          }
          return {
            typing: {
              ...state.typing,
              [channelId]: [
                ...channelTyping,
                { ...user, timestamp: Date.now() },
              ],
            },
          };
        }

        // Remove user
        return {
          typing: {
            ...state.typing,
            [channelId]: channelTyping.filter((t) => t.userId !== user.userId),
          },
        };
      });
    },

    clearChannel: (channelId) => {
      set((state) => {
        const { [channelId]: _, ...rest } = state.typing;
        return { typing: rest };
      });
    },

    clearExpired: () => {
      const now = Date.now();
      set((state) => ({
        typing: Object.fromEntries(
          Object.entries(state.typing)
            .map(([channelId, users]) => [
              channelId,
              users.filter((u) => now - u.timestamp < TYPING_TIMEOUT_MS),
            ])
            .filter(([_, users]) => (users as ITypingUser[]).length > 0),
        ),
      }));
    },

    reset: () => {
      set(initialState);
    },
  }),
  { name: "typing" },
);

// Selectors
export function useTypingUsers(channelId: string) {
  return useTypingStore((state) => state.typing[channelId] || []);
}

export function useIsAnyoneTyping(channelId: string) {
  return useTypingStore((state) => (state.typing[channelId]?.length || 0) > 0);
}
```

### Drafts Store (Persisted)

Location: `src/stores/drafts/useDraftsStore.ts`

```typescript
import { createStore } from "@/stores/setup";

type IDraft = {
  message: string;
  files?: string[]; // File IDs pending upload
  updatedAt: number;
};

type IDraftsState = {
  /** channelId -> draft */
  channelDrafts: Record<string, IDraft>;
  /** rootPostId -> draft (for replies) */
  threadDrafts: Record<string, IDraft>;
};

type IDraftsActions = {
  setChannelDraft: (
    channelId: string,
    message: string,
    files?: string[],
  ) => void;
  setThreadDraft: (rootId: string, message: string, files?: string[]) => void;
  clearChannelDraft: (channelId: string) => void;
  clearThreadDraft: (rootId: string) => void;
  reset: () => void;
};

type IDraftsStore = IDraftsState & IDraftsActions;

const initialState: IDraftsState = {
  channelDrafts: {},
  threadDrafts: {},
};

export const useDraftsStore = createStore<IDraftsStore>(
  (set) => ({
    ...initialState,

    setChannelDraft: (channelId, message, files) => {
      set((state) => ({
        channelDrafts: {
          ...state.channelDrafts,
          [channelId]: { message, files, updatedAt: Date.now() },
        },
      }));
    },

    setThreadDraft: (rootId, message, files) => {
      set((state) => ({
        threadDrafts: {
          ...state.threadDrafts,
          [rootId]: { message, files, updatedAt: Date.now() },
        },
      }));
    },

    clearChannelDraft: (channelId) => {
      set((state) => {
        const { [channelId]: _, ...rest } = state.channelDrafts;
        return { channelDrafts: rest };
      });
    },

    clearThreadDraft: (rootId) => {
      set((state) => {
        const { [rootId]: _, ...rest } = state.threadDrafts;
        return { threadDrafts: rest };
      });
    },

    reset: () => {
      set(initialState);
    },
  }),
  { name: "drafts", persist: true }, // Persisted to localStorage/AsyncStorage
);

// Selectors
export function useChannelDraft(channelId: string) {
  return useDraftsStore((state) => state.channelDrafts[channelId]);
}

export function useThreadDraft(rootId: string) {
  return useDraftsStore((state) => state.threadDrafts[rootId]);
}
```

### RHS Store (Right Hand Sidebar)

Location: `src/stores/ui/useRhsStore.ts`

```typescript
import { createStore } from "@/stores/setup";

type IRhsView =
  | "thread"
  | "search"
  | "pinned"
  | "flagged"
  | "mentions"
  | "channel_info"
  | "channel_members"
  | "edit_history"
  | null;

type IRhsState = {
  isOpen: boolean;
  view: IRhsView;
  selectedPostId: string | null;
  selectedChannelId: string | null;
  searchTerms: string;
  searchType: "messages" | "files" | "";
  isExpanded: boolean;
  previousStates: Array<{ view: IRhsView; postId: string | null }>;
};

type IRhsActions = {
  openThread: (postId: string) => void;
  openSearch: (terms?: string, type?: "messages" | "files") => void;
  openPinned: (channelId: string) => void;
  openFlagged: () => void;
  openMentions: () => void;
  openChannelInfo: (channelId: string) => void;
  openChannelMembers: (channelId: string) => void;
  close: () => void;
  goBack: () => void;
  setExpanded: (expanded: boolean) => void;
  setSearchTerms: (terms: string) => void;
  reset: () => void;
};

type IRhsStore = IRhsState & IRhsActions;

const initialState: IRhsState = {
  isOpen: false,
  view: null,
  selectedPostId: null,
  selectedChannelId: null,
  searchTerms: "",
  searchType: "",
  isExpanded: false,
  previousStates: [],
};

export const useRhsStore = createStore<IRhsStore>(
  (set, get) => ({
    ...initialState,

    openThread: (postId) => {
      const current = get();
      set({
        isOpen: true,
        view: "thread",
        selectedPostId: postId,
        previousStates: current.view
          ? [
              ...current.previousStates,
              { view: current.view, postId: current.selectedPostId },
            ]
          : current.previousStates,
      });
    },

    openSearch: (terms = "", type = "messages") => {
      set({
        isOpen: true,
        view: "search",
        searchTerms: terms,
        searchType: type,
        selectedPostId: null,
      });
    },

    openPinned: (channelId) => {
      set({
        isOpen: true,
        view: "pinned",
        selectedChannelId: channelId,
        selectedPostId: null,
      });
    },

    openFlagged: () => {
      set({
        isOpen: true,
        view: "flagged",
        selectedPostId: null,
      });
    },

    openMentions: () => {
      set({
        isOpen: true,
        view: "mentions",
        selectedPostId: null,
      });
    },

    openChannelInfo: (channelId) => {
      set({
        isOpen: true,
        view: "channel_info",
        selectedChannelId: channelId,
      });
    },

    openChannelMembers: (channelId) => {
      set({
        isOpen: true,
        view: "channel_members",
        selectedChannelId: channelId,
      });
    },

    close: () => {
      set({ isOpen: false, view: null, previousStates: [] });
    },

    goBack: () => {
      const { previousStates } = get();
      if (previousStates.length === 0) {
        set({ isOpen: false, view: null });
        return;
      }
      const previous = previousStates[previousStates.length - 1];
      set({
        view: previous.view,
        selectedPostId: previous.postId,
        previousStates: previousStates.slice(0, -1),
      });
    },

    setExpanded: (expanded) => {
      set({ isExpanded: expanded });
    },

    setSearchTerms: (terms) => {
      set({ searchTerms: terms });
    },

    reset: () => {
      set(initialState);
    },
  }),
  { name: "rhs" },
);

// Selectors
export const useIsRhsOpen = () => useRhsStore((state) => state.isOpen);
export const useRhsView = () => useRhsStore((state) => state.view);
export const useSelectedThreadId = () =>
  useRhsStore((state) =>
    state.view === "thread" ? state.selectedPostId : null,
  );
```

### Modals Store

Location: `src/stores/ui/useModalsStore.ts`

```typescript
import { createStore } from "@/stores/setup";

type IModalId =
  | "channel_create"
  | "channel_invite"
  | "channel_settings"
  | "user_settings"
  | "file_preview"
  | "confirm"
  | "quick_switch"
  | string; // Allow custom modal IDs

type IModalState = {
  isOpen: boolean;
  props?: Record<string, unknown>;
};

type IModalsState = {
  modals: Record<IModalId, IModalState>;
  /** Stack of open modals for proper z-index and ESC handling */
  openStack: IModalId[];
};

type IModalsActions = {
  openModal: (id: IModalId, props?: Record<string, unknown>) => void;
  closeModal: (id: IModalId) => void;
  closeTopModal: () => void;
  closeAllModals: () => void;
  updateModalProps: (id: IModalId, props: Record<string, unknown>) => void;
  reset: () => void;
};

type IModalsStore = IModalsState & IModalsActions;

const initialState: IModalsState = {
  modals: {},
  openStack: [],
};

export const useModalsStore = createStore<IModalsStore>(
  (set, get) => ({
    ...initialState,

    openModal: (id, props) => {
      set((state) => ({
        modals: {
          ...state.modals,
          [id]: { isOpen: true, props },
        },
        openStack: state.openStack.includes(id)
          ? state.openStack
          : [...state.openStack, id],
      }));
    },

    closeModal: (id) => {
      set((state) => ({
        modals: {
          ...state.modals,
          [id]: { isOpen: false, props: undefined },
        },
        openStack: state.openStack.filter((modalId) => modalId !== id),
      }));
    },

    closeTopModal: () => {
      const { openStack } = get();
      if (openStack.length > 0) {
        const topModal = openStack[openStack.length - 1];
        get().closeModal(topModal);
      }
    },

    closeAllModals: () => {
      set({ modals: {}, openStack: [] });
    },

    updateModalProps: (id, props) => {
      set((state) => ({
        modals: {
          ...state.modals,
          [id]: {
            ...state.modals[id],
            props: { ...state.modals[id]?.props, ...props },
          },
        },
      }));
    },

    reset: () => {
      set(initialState);
    },
  }),
  { name: "modals" },
);

// Selectors
export function useModalState(id: IModalId) {
  return useModalsStore((state) => state.modals[id] || { isOpen: false });
}

export function useIsModalOpen(id: IModalId) {
  return useModalsStore((state) => state.modals[id]?.isOpen || false);
}

export function useTopModal() {
  return useModalsStore((state) =>
    state.openStack.length > 0
      ? state.openStack[state.openStack.length - 1]
      : null,
  );
}
```

---

## RxJS (WebSocket Events)

### When to Use

- WebSocket event stream transformations
- Debouncing, grouping, merging high-frequency events
- Complex async flows that don't fit React's model
- State updates from outside React component tree

### Event Streams

Location: `src/services/websocket/events.ts`

| Stream         | Source Events                           | Transformation                    | Target                     |
| -------------- | --------------------------------------- | --------------------------------- | -------------------------- |
| `posts$`       | `posted`, `post_edited`, `post_deleted` | `debounceAfterN(5, 100, 200)`     | TanStack Query cache       |
| `typing$`      | `typing`                                | `groupBy` + `switchMap` + `timer` | Zustand `useTypingStore`   |
| `presence$`    | `status_change`                         | `groupBy(userId)`                 | Zustand `usePresenceStore` |
| `reactions$`   | `reaction_added`, `reaction_removed`    | Direct map                        | TanStack Query cache       |
| `channels$`    | `channel_*` events                      | Direct map                        | TanStack Query cache       |
| `users$`       | `user_updated`                          | Direct map                        | TanStack Query cache       |
| `threads$`     | `thread_*` events                       | Direct map                        | TanStack Query cache       |
| `preferences$` | `preference_changed`                    | Direct map                        | TanStack Query cache       |

### Posts Stream (Debounced)

```typescript
import { filter, groupBy, mergeMap, share } from "rxjs/operators";
import { websocketService } from "./service";
import { debounceAfterN } from "./operators/debounceAfterN";
import type { IWebSocketMessage, IPostEvent } from "@/types/websocket";

const POST_EVENTS = ["posted", "post_edited", "post_deleted"] as const;

function isPostEvent(msg: IWebSocketMessage): msg is IPostEvent {
  return POST_EVENTS.includes(msg.event as (typeof POST_EVENTS)[number]);
}

export const posts$ = websocketService.events$.pipe(
  filter(isPostEvent),
  // Group by channel to batch per-channel updates
  groupBy((event) => event.data.channel_id),
  mergeMap((group$) =>
    group$.pipe(
      // First 5 posts emit immediately, then batch for 100ms, max wait 200ms
      debounceAfterN(5, 100, 200),
    ),
  ),
  share(), // Share subscription across all consumers
);
```

### Typing Stream (Auto-Expire)

```typescript
import {
  filter,
  groupBy,
  mergeMap,
  switchMap,
  map,
  share,
} from "rxjs/operators";
import { merge, of, timer } from "rxjs";
import { websocketService } from "./service";
import type { IWebSocketMessage, ITypingEvent } from "@/types/websocket";

const TYPING_TIMEOUT_MS = 5000;

function isTypingEvent(msg: IWebSocketMessage): msg is ITypingEvent {
  return msg.event === "typing";
}

export const typing$ = websocketService.events$.pipe(
  filter(isTypingEvent),
  // Group by channel+user to handle per-user typing state
  groupBy((event) => `${event.data.channel_id}:${event.data.user_id}`),
  mergeMap((group$) =>
    group$.pipe(
      switchMap((event) =>
        merge(
          // Emit TRUE immediately
          of({
            channelId: event.data.channel_id,
            userId: event.data.user_id,
            username: event.data.username,
            isTyping: true,
          }),
          // Emit FALSE after timeout
          timer(TYPING_TIMEOUT_MS).pipe(
            map(() => ({
              channelId: event.data.channel_id,
              userId: event.data.user_id,
              username: event.data.username,
              isTyping: false,
            })),
          ),
        ),
      ),
    ),
  ),
  share(),
);
```

### WebSocket to Cache Sync

Location: `src/services/websocket/subscriptions.ts`

```typescript
import { QueryClient } from "@tanstack/react-query";
import { posts$, typing$, reactions$, channels$, presence$ } from "./events";
import { queryKeys } from "@/queries/keys";
import { useTypingStore } from "@/stores/typing";
import { usePresenceStore } from "@/stores/presence";
import { useConnectionStore } from "@/stores/connection";
import type { IPost, IReaction, IChannel } from "@/types";

export function initWebSocketSubscriptions(queryClient: QueryClient) {
  const subscriptions: Array<{ unsubscribe: () => void }> = [];

  // Posts -> TanStack Query cache
  subscriptions.push(
    posts$.subscribe((events) => {
      events.forEach((event) => {
        const channelId = event.data.channel_id;

        switch (event.event) {
          case "posted":
            queryClient.setQueryData<IPost[]>(
              queryKeys.posts.list(channelId),
              (old) => (old ? [event.data.post, ...old] : [event.data.post]),
            );
            break;

          case "post_edited":
            queryClient.setQueryData<IPost[]>(
              queryKeys.posts.list(channelId),
              (old) =>
                old?.map((post) =>
                  post.id === event.data.post.id ? event.data.post : post,
                ),
            );
            // Also update single post query
            queryClient.setQueryData(
              queryKeys.posts.detail(event.data.post.id),
              event.data.post,
            );
            break;

          case "post_deleted":
            queryClient.setQueryData<IPost[]>(
              queryKeys.posts.list(channelId),
              (old) => old?.filter((post) => post.id !== event.data.post.id),
            );
            queryClient.removeQueries({
              queryKey: queryKeys.posts.detail(event.data.post.id),
            });
            break;
        }
      });
    }),
  );

  // Typing -> Zustand store
  subscriptions.push(
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

  // Presence -> Zustand store
  subscriptions.push(
    presence$.subscribe((event) => {
      usePresenceStore.getState().setUserStatus(event.userId, event.status);
    }),
  );

  // Reactions -> TanStack Query cache
  subscriptions.push(
    reactions$.subscribe((event) => {
      const postId = event.data.post_id;
      queryClient.setQueryData<IPost>(queryKeys.posts.detail(postId), (old) => {
        if (!old) return old;
        // Update reactions on the post
        // Implementation depends on your data structure
        return old;
      });
    }),
  );

  // Channels -> TanStack Query cache
  subscriptions.push(
    channels$.subscribe((event) => {
      switch (event.event) {
        case "channel_created":
        case "channel_updated":
          queryClient.setQueryData<IChannel>(
            queryKeys.channels.detail(event.data.channel.id),
            event.data.channel,
          );
          // Invalidate list to include new channel
          queryClient.invalidateQueries({
            queryKey: queryKeys.channels.list(event.data.channel.team_id),
          });
          break;

        case "channel_deleted":
          queryClient.removeQueries({
            queryKey: queryKeys.channels.detail(event.data.channel_id),
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.channels.all,
          });
          break;
      }
    }),
  );

  // Return cleanup function
  return () => {
    subscriptions.forEach((sub) => sub.unsubscribe());
  };
}
```

---

## API Layer

### Purpose

The API layer provides:

1. **URL generation utilities** - For image src, OAuth links (used in components)
2. **Fetch methods** - Called by TanStack Query hooks
3. **Configuration** - Auth headers, base URL

### API Client

Location: `src/api/client.ts`

```typescript
import { Platform } from "react-native";

class ApiClient {
  private baseUrl = "";
  private token = "";
  private userId = "";
  private locale = "en";

  // Configuration
  setUrl(url: string) {
    this.baseUrl = url.replace(/\/+$/, ""); // Remove trailing slashes
  }

  setToken(token: string) {
    this.token = token;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  setLocale(locale: string) {
    this.locale = locale;
  }

  // Getters
  getUrl() {
    return this.baseUrl;
  }

  getToken() {
    return this.token;
  }

  getUserId() {
    return this.userId;
  }

  // Route builders
  getBaseRoute() {
    return `${this.baseUrl}/api/v4`;
  }

  getUsersRoute() {
    return `${this.getBaseRoute()}/users`;
  }

  getChannelsRoute() {
    return `${this.getBaseRoute()}/channels`;
  }

  getPostsRoute() {
    return `${this.getBaseRoute()}/posts`;
  }

  getTeamsRoute() {
    return `${this.getBaseRoute()}/teams`;
  }

  getOAuthRoute() {
    return `${this.baseUrl}/oauth`;
  }

  // Headers
  getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Accept-Language": this.locale,
      "X-Requested-With": "XMLHttpRequest",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Base fetch with error handling
  async fetch<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(
        error.message || `HTTP ${response.status}`,
        response.status,
        error,
      );
    }

    // Handle empty responses
    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const apiClient = new ApiClient();
```

### URL Utilities

Location: `src/api/urls.ts`

```typescript
import { apiClient } from "./client";

export function getProfilePictureUrl(
  userId: string,
  lastUpdate?: number,
): string {
  const timestamp = lastUpdate || 0;
  return `${apiClient.getUsersRoute()}/${userId}/image?_=${timestamp}`;
}

export function getCustomEmojiImageUrl(emojiId: string): string {
  return `${apiClient.getBaseRoute()}/emoji/${emojiId}/image`;
}

export function getBrandImageUrl(timestamp?: string): string {
  return `${apiClient.getBaseRoute()}/brand/image?t=${timestamp || "0"}`;
}

export function getFileUrl(fileId: string): string {
  return `${apiClient.getBaseRoute()}/files/${fileId}`;
}

export function getFileThumbnailUrl(fileId: string): string {
  return `${apiClient.getBaseRoute()}/files/${fileId}/thumbnail`;
}

export function getFilePreviewUrl(fileId: string): string {
  return `${apiClient.getBaseRoute()}/files/${fileId}/preview`;
}

export function getAbsoluteUrl(path: string): string {
  if (path.startsWith("http")) {
    return path;
  }
  return `${apiClient.getUrl()}${path.startsWith("/") ? "" : "/"}${path}`;
}
```

### Posts API

Location: `src/api/posts.ts`

```typescript
import { apiClient } from "./client";
import type {
  IPost,
  ICreatePostPayload,
  IUpdatePostPayload,
  IGetPostsParams,
  IPostsResponse,
  ISearchPostsParams,
} from "@/types/posts";

export const postsApi = {
  async getPost(postId: string): Promise<IPost> {
    return apiClient.fetch(`${apiClient.getPostsRoute()}/${postId}`);
  },

  async getPosts(
    channelId: string,
    params?: IGetPostsParams,
  ): Promise<IPostsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.before) searchParams.set("before", params.before);
    if (params?.after) searchParams.set("after", params.after);
    if (params?.per_page) searchParams.set("per_page", String(params.per_page));

    const query = searchParams.toString();
    const url = `${apiClient.getChannelsRoute()}/${channelId}/posts${query ? `?${query}` : ""}`;
    return apiClient.fetch(url);
  },

  async getPostThread(postId: string): Promise<IPostsResponse> {
    return apiClient.fetch(`${apiClient.getPostsRoute()}/${postId}/thread`);
  },

  async createPost(payload: ICreatePostPayload): Promise<IPost> {
    return apiClient.fetch(apiClient.getPostsRoute(), {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updatePost(
    postId: string,
    payload: IUpdatePostPayload,
  ): Promise<IPost> {
    return apiClient.fetch(`${apiClient.getPostsRoute()}/${postId}/patch`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async deletePost(postId: string): Promise<void> {
    await apiClient.fetch(`${apiClient.getPostsRoute()}/${postId}`, {
      method: "DELETE",
    });
  },

  async pinPost(postId: string): Promise<void> {
    await apiClient.fetch(`${apiClient.getPostsRoute()}/${postId}/pin`, {
      method: "POST",
    });
  },

  async unpinPost(postId: string): Promise<void> {
    await apiClient.fetch(`${apiClient.getPostsRoute()}/${postId}/unpin`, {
      method: "POST",
    });
  },

  async searchPosts(
    teamId: string,
    params: ISearchPostsParams,
  ): Promise<IPostsResponse> {
    return apiClient.fetch(
      `${apiClient.getTeamsRoute()}/${teamId}/posts/search`,
      {
        method: "POST",
        body: JSON.stringify(params),
      },
    );
  },
};
```

---

## Provider Setup

Location: `src/providers/StateProvider.tsx`

```typescript
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, useRef } from 'react';
import { queryClient } from '@/queries/client';
import { websocketService } from '@/services/websocket';
import { initWebSocketSubscriptions } from '@/services/websocket/subscriptions';
import { Platform } from 'react-native';

type IProps = {
  children: React.ReactNode;
};

export function StateProvider({ children }: IProps) {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Initialize WebSocket subscriptions
    cleanupRef.current = initWebSocketSubscriptions(queryClient);

    return () => {
      cleanupRef.current?.();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {Platform.OS === 'web' && __DEV__ && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
```

---

## Testing Patterns

### Testing TanStack Query Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePostsQuery } from '@/queries/posts';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('usePostsQuery', () => {
  it('fetches posts for a channel', async () => {
    const { result } = renderHook(
      () => usePostsQuery('channel-id'),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(10);
  });
});
```

### Testing Zustand Stores

```typescript
import { act } from "@testing-library/react-native";
import { useTypingStore } from "@/stores/typing";

describe("useTypingStore", () => {
  beforeEach(() => {
    useTypingStore.getState().reset();
  });

  it("adds typing user", () => {
    act(() => {
      useTypingStore
        .getState()
        .setTyping(
          "channel-1",
          { userId: "user-1", username: "testuser", timestamp: Date.now() },
          true,
        );
    });

    const typing = useTypingStore.getState().typing["channel-1"];
    expect(typing).toHaveLength(1);
    expect(typing[0].userId).toBe("user-1");
  });

  it("removes typing user", () => {
    act(() => {
      useTypingStore
        .getState()
        .setTyping(
          "channel-1",
          { userId: "user-1", username: "testuser", timestamp: Date.now() },
          true,
        );
      useTypingStore
        .getState()
        .setTyping(
          "channel-1",
          { userId: "user-1", username: "testuser", timestamp: Date.now() },
          false,
        );
    });

    const typing = useTypingStore.getState().typing["channel-1"];
    expect(typing).toHaveLength(0);
  });
});
```

---

## Migration Checklist

When migrating a Redux store to this architecture:

1. **Identify data source:**
   - REST API data → TanStack Query
   - WebSocket-only data → Zustand (or TQ cache via WS sync)
   - UI-only state → Zustand

2. **Create appropriate files:**
   - Query: `src/queries/{entity}/use{Entity}Query.ts`
   - Mutation: `src/mutations/{entity}/use{Action}{Entity}Mutation.ts`
   - Store: `src/stores/{domain}/use{Domain}Store.ts`

3. **Add query keys** to `src/queries/keys.ts`

4. **Add WebSocket sync** in `src/services/websocket/subscriptions.ts`

5. **Update components** to use new hooks

6. **Add tests** for queries, mutations, and stores

---

**Last Updated**: 2025-01-05
**Version**: 1.0
**Applies To**: Mattermost Platform Migration (apps/v2)
