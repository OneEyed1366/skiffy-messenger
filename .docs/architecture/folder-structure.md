# Folder Structure

## Overview

This document defines the folder organization for the `apps/v2/src/` directory, focusing on state management, API layer, and related infrastructure.

## Complete Source Tree

```
apps/v2/src/
├── api/                              # Raw API layer
│   ├── client.ts                     # API client singleton
│   ├── client.types.ts               # Client-specific types
│   ├── urls.ts                       # URL generation utilities
│   ├── posts.ts                      # Posts API methods
│   ├── posts.types.ts                # Post API types
│   ├── channels.ts                   # Channels API methods
│   ├── channels.types.ts             # Channel API types
│   ├── users.ts                      # Users API methods
│   ├── users.types.ts                # User API types
│   ├── teams.ts                      # Teams API methods
│   ├── teams.types.ts                # Team API types
│   ├── threads.ts                    # Threads API methods
│   ├── threads.types.ts              # Thread API types
│   ├── config.ts                     # Config API methods
│   ├── preferences.ts                # Preferences API methods
│   ├── files.ts                      # Files API methods
│   ├── emoji.ts                      # Emoji API methods
│   ├── reactions.ts                  # Reactions API methods
│   └── index.ts                      # Re-exports
│
├── services/                         # Application services
│   └── websocket/                    # WebSocket infrastructure
│       ├── service.ts                # WebSocketService class
│       ├── events.ts                 # RxJS event streams
│       ├── subscriptions.ts          # WS → cache/store sync
│       ├── operators/                # Custom RxJS operators
│       │   ├── debounceAfterN.ts     # Debounce after N items
│       │   └── index.ts
│       ├── types.ts                  # WebSocket types
│       └── index.ts                  # Re-exports
│
├── stores/                           # Zustand stores (client state)
│   ├── setup.ts                      # Store creation utilities
│   ├── connection/
│   │   ├── useConnectionStore.ts
│   │   └── index.ts
│   ├── typing/
│   │   ├── useTypingStore.ts
│   │   └── index.ts
│   ├── presence/
│   │   ├── usePresenceStore.ts
│   │   └── index.ts
│   ├── drafts/
│   │   ├── useDraftsStore.ts
│   │   └── index.ts
│   ├── ui/
│   │   ├── useModalsStore.ts
│   │   ├── useRhsStore.ts
│   │   ├── useLhsStore.ts
│   │   ├── useChannelViewStore.ts
│   │   ├── useThreadsViewStore.ts
│   │   ├── useSearchStore.ts
│   │   ├── useBrowserStore.ts
│   │   ├── useSettingsStore.ts
│   │   ├── useChannelSidebarStore.ts
│   │   ├── useEmojiStore.ts
│   │   └── index.ts
│   └── index.ts                      # Re-exports all stores
│
├── queries/                          # TanStack Query (server state)
│   ├── client.ts                     # QueryClient configuration
│   ├── keys.ts                       # Query key factories
│   ├── posts/
│   │   ├── usePostQuery.ts
│   │   ├── usePostsQuery.ts
│   │   ├── useInfinitePostsQuery.ts
│   │   ├── useThreadPostsQuery.ts
│   │   ├── usePinnedPostsQuery.ts
│   │   ├── useFlaggedPostsQuery.ts
│   │   ├── useSearchPostsQuery.ts
│   │   └── index.ts
│   ├── channels/
│   │   ├── useChannelQuery.ts
│   │   ├── useChannelsQuery.ts
│   │   ├── useChannelMembersQuery.ts
│   │   ├── useChannelStatsQuery.ts
│   │   ├── useUnreadChannelsQuery.ts
│   │   └── index.ts
│   ├── users/
│   │   ├── useUserQuery.ts
│   │   ├── useUsersQuery.ts
│   │   ├── useCurrentUserQuery.ts
│   │   ├── useUserStatusQuery.ts
│   │   ├── useUserStatusesQuery.ts
│   │   ├── useAutocompleteUsersQuery.ts
│   │   └── index.ts
│   ├── teams/
│   │   ├── useTeamQuery.ts
│   │   ├── useTeamsQuery.ts
│   │   ├── useTeamMembersQuery.ts
│   │   ├── useTeamStatsQuery.ts
│   │   └── index.ts
│   ├── threads/
│   │   ├── useThreadQuery.ts
│   │   ├── useThreadsQuery.ts
│   │   ├── useUnreadThreadsQuery.ts
│   │   └── index.ts
│   ├── config/
│   │   ├── useClientConfigQuery.ts
│   │   ├── useServerConfigQuery.ts
│   │   └── index.ts
│   ├── preferences/
│   │   ├── usePreferencesQuery.ts
│   │   ├── usePreferenceQuery.ts
│   │   └── index.ts
│   ├── emoji/
│   │   ├── useCustomEmojisQuery.ts
│   │   └── index.ts
│   └── index.ts                      # Re-exports all queries
│
├── mutations/                        # TanStack Mutations
│   ├── posts/
│   │   ├── useCreatePostMutation.ts
│   │   ├── useUpdatePostMutation.ts
│   │   ├── useDeletePostMutation.ts
│   │   ├── usePinPostMutation.ts
│   │   ├── useUnpinPostMutation.ts
│   │   ├── useReactToPostMutation.ts
│   │   ├── useRemoveReactionMutation.ts
│   │   └── index.ts
│   ├── channels/
│   │   ├── useCreateChannelMutation.ts
│   │   ├── useUpdateChannelMutation.ts
│   │   ├── useDeleteChannelMutation.ts
│   │   ├── useJoinChannelMutation.ts
│   │   ├── useLeaveChannelMutation.ts
│   │   ├── useAddChannelMemberMutation.ts
│   │   ├── useRemoveChannelMemberMutation.ts
│   │   ├── useMarkChannelReadMutation.ts
│   │   └── index.ts
│   ├── users/
│   │   ├── useUpdateUserMutation.ts
│   │   ├── useUpdateStatusMutation.ts
│   │   ├── useUpdateProfileImageMutation.ts
│   │   └── index.ts
│   ├── teams/
│   │   ├── useJoinTeamMutation.ts
│   │   ├── useLeaveTeamMutation.ts
│   │   ├── useAddTeamMemberMutation.ts
│   │   └── index.ts
│   ├── threads/
│   │   ├── useMarkThreadReadMutation.ts
│   │   ├── useFollowThreadMutation.ts
│   │   ├── useUnfollowThreadMutation.ts
│   │   └── index.ts
│   ├── preferences/
│   │   ├── useSavePreferenceMutation.ts
│   │   ├── useDeletePreferenceMutation.ts
│   │   └── index.ts
│   └── index.ts                      # Re-exports all mutations
│
├── types/                            # Shared types
│   ├── posts.ts                      # IPost, IPostsResponse, etc.
│   ├── channels.ts                   # IChannel, IChannelMember, etc.
│   ├── users.ts                      # IUser, IUserProfile, IUserStatus, etc.
│   ├── teams.ts                      # ITeam, ITeamMember, etc.
│   ├── threads.ts                    # IThread, IThreadResponse, etc.
│   ├── preferences.ts                # IPreference, IPreferenceCategory, etc.
│   ├── websocket.ts                  # IWebSocketMessage, event types
│   ├── config.ts                     # IClientConfig, IServerConfig
│   ├── common.ts                     # Shared utility types
│   └── index.ts                      # Re-exports all types
│
├── providers/                        # React providers
│   ├── StateProvider.tsx             # QueryClient + WS subscriptions
│   ├── ThemeProvider.tsx             # Unistyles theme
│   ├── I18nProvider.tsx              # i18next
│   └── index.ts
│
├── hooks/                            # Custom React hooks
│   ├── useDebounce.ts
│   ├── useWindowFocus.ts
│   ├── useOnlineStatus.ts
│   └── index.ts
│
├── components/                       # UI components
│   └── ...                           # (per existing AGENTS.md structure)
│
├── app/                              # Expo Router pages
│   └── ...                           # (default exports only)
│
├── locales/                          # i18n translations
│   └── ...
│
├── theme.ts                          # Unistyles theme config
├── i18next.ts                        # i18n configuration
└── index.ts                          # App entry point
```

---

## Naming Conventions

### Files

| Item Type              | Pattern                          | Example                    |
| ---------------------- | -------------------------------- | -------------------------- |
| Query hook             | `use{Entity}Query.ts`            | `usePostsQuery.ts`         |
| Infinite query         | `useInfinite{Entity}Query.ts`    | `useInfinitePostsQuery.ts` |
| Mutation hook          | `use{Action}{Entity}Mutation.ts` | `useCreatePostMutation.ts` |
| Zustand store          | `use{Domain}Store.ts`            | `useTypingStore.ts`        |
| API module             | `{entity}.ts`                    | `posts.ts`                 |
| API types (co-located) | `{entity}.types.ts`              | `posts.types.ts`           |
| Shared types           | `{entity}.ts`                    | `types/posts.ts`           |
| RxJS stream            | Exported as `{entity}$`          | `posts$`, `typing$`        |
| Custom operator        | `{operatorName}.ts`              | `debounceAfterN.ts`        |

### Exports

| Item Type            | Export Style                 | Example                                  |
| -------------------- | ---------------------------- | ---------------------------------------- |
| Query/mutation hooks | Named export                 | `export function usePostsQuery()`        |
| Zustand stores       | Named export                 | `export const useTypingStore = create()` |
| API objects          | Named export                 | `export const postsApi = { ... }`        |
| Types                | Named export with `I` prefix | `export type IPost = { ... }`            |
| Constants            | Named export, UPPER_CASE     | `export const TYPING_TIMEOUT_MS = 5000`  |

---

## Import Paths

All imports use the `@/` path alias configured in `tsconfig.json`.

### API Layer

```typescript
// API client and utilities
import { apiClient, ApiError } from "@/api/client";
import { getProfilePictureUrl, getFileUrl } from "@/api/urls";

// API methods
import { postsApi } from "@/api/posts";
import { channelsApi } from "@/api/channels";
import { usersApi } from "@/api/users";
```

### Queries and Mutations

```typescript
// Individual hooks
import { usePostsQuery } from "@/queries/posts/usePostsQuery";
import { useCreatePostMutation } from "@/mutations/posts/useCreatePostMutation";

// From barrel exports
import { usePostsQuery, usePostQuery } from "@/queries/posts";
import {
  useCreatePostMutation,
  useDeletePostMutation,
} from "@/mutations/posts";

// Query keys
import { queryKeys } from "@/queries/keys";

// QueryClient
import { queryClient } from "@/queries/client";
```

### Stores

```typescript
// Individual stores
import { useTypingStore } from "@/stores/typing/useTypingStore";
import { useModalsStore } from "@/stores/ui/useModalsStore";

// From barrel exports
import { useTypingStore } from "@/stores/typing";
import { useModalsStore, useRhsStore } from "@/stores/ui";

// All stores
import { useTypingStore, useConnectionStore, useModalsStore } from "@/stores";
```

### Services

```typescript
// WebSocket service
import { websocketService } from "@/services/websocket/service";

// Event streams
import { posts$, typing$, presence$ } from "@/services/websocket/events";

// Subscriptions initializer
import { initWebSocketSubscriptions } from "@/services/websocket/subscriptions";

// From barrel export
import { websocketService, posts$, typing$ } from "@/services/websocket";
```

### Types

```typescript
// Shared types
import type { IPost, IChannel, IUser } from "@/types";
import type { IWebSocketMessage, IPostEvent } from "@/types/websocket";

// API-specific types (when needed separately)
import type { IGetPostsParams } from "@/api/posts.types";
```

---

## Barrel Export Pattern

Each folder has an `index.ts` that re-exports public API.

### Example: `queries/posts/index.ts`

```typescript
export { usePostQuery } from "./usePostQuery";
export { usePostsQuery } from "./usePostsQuery";
export { useInfinitePostsQuery } from "./useInfinitePostsQuery";
export { useThreadPostsQuery } from "./useThreadPostsQuery";
export { usePinnedPostsQuery } from "./usePinnedPostsQuery";
export { useFlaggedPostsQuery } from "./useFlaggedPostsQuery";
export { useSearchPostsQuery } from "./useSearchPostsQuery";
```

### Example: `stores/index.ts`

```typescript
// Connection
export {
  useConnectionStore,
  useIsConnected,
  useIsReconnecting,
} from "./connection";

// Typing
export { useTypingStore, useTypingUsers, useIsAnyoneTyping } from "./typing";

// Presence
export { usePresenceStore, useUserStatus } from "./presence";

// Drafts
export { useDraftsStore, useChannelDraft, useThreadDraft } from "./drafts";

// UI stores
export {
  useModalsStore,
  useModalState,
  useIsModalOpen,
  useTopModal,
} from "./ui/useModalsStore";

export {
  useRhsStore,
  useIsRhsOpen,
  useRhsView,
  useSelectedThreadId,
} from "./ui/useRhsStore";

export { useLhsStore } from "./ui/useLhsStore";
export { useChannelViewStore } from "./ui/useChannelViewStore";
export { useThreadsViewStore } from "./ui/useThreadsViewStore";
export { useSearchStore } from "./ui/useSearchStore";
export { useBrowserStore } from "./ui/useBrowserStore";
export { useSettingsStore } from "./ui/useSettingsStore";
export { useChannelSidebarStore } from "./ui/useChannelSidebarStore";
export { useEmojiStore } from "./ui/useEmojiStore";
```

---

## File Templates

### Query Hook Template

`queries/{entity}/use{Entity}Query.ts`

```typescript
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { entityApi } from "@/api/entity";
import { queryKeys } from "@/queries/keys";
import type { IEntity, IGetEntityParams } from "@/types/entity";

type IData = IEntity;
type IError = Error;
type IOptions = Omit<UseQueryOptions<IData, IError>, "queryKey" | "queryFn">;

export function useEntityQuery(entityId: string, options?: IOptions) {
  return useQuery({
    queryKey: queryKeys.entity.detail(entityId),
    queryFn: () => entityApi.getEntity(entityId),
    enabled: !!entityId,
    staleTime: 1000 * 60, // 1 minute
    ...options,
  });
}
```

### Mutation Hook Template

`mutations/{entity}/use{Action}{Entity}Mutation.ts`

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { entityApi } from "@/api/entity";
import { queryKeys } from "@/queries/keys";
import type { IEntity, ICreateEntityPayload } from "@/types/entity";

export function useCreateEntityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ICreateEntityPayload) =>
      entityApi.createEntity(payload),

    onSuccess: (created) => {
      // Update cache
      queryClient.setQueryData(queryKeys.entity.detail(created.id), created);
      // Invalidate list
      queryClient.invalidateQueries({
        queryKey: queryKeys.entity.list(),
      });
    },
  });
}
```

### Zustand Store Template

`stores/{domain}/use{Domain}Store.ts`

```typescript
import { createStore } from "@/stores/setup";

// #region Types
type IDomainState = {
  items: Record<string, unknown>;
  loading: boolean;
};

type IDomainActions = {
  setItem: (id: string, item: unknown) => void;
  removeItem: (id: string) => void;
  reset: () => void;
};

type IDomainStore = IDomainState & IDomainActions;
// #endregion Types

// #region Initial State
const initialState: IDomainState = {
  items: {},
  loading: false,
};
// #endregion Initial State

// #region Store
export const useDomainStore = createStore<IDomainStore>(
  (set) => ({
    ...initialState,

    setItem: (id, item) => {
      set((state) => ({
        items: { ...state.items, [id]: item },
      }));
    },

    removeItem: (id) => {
      set((state) => {
        const { [id]: _, ...rest } = state.items;
        return { items: rest };
      });
    },

    reset: () => {
      set(initialState);
    },
  }),
  { name: "domain" },
);
// #endregion Store

// #region Selectors
export function useItem(id: string) {
  return useDomainStore((state) => state.items[id]);
}
// #endregion Selectors
```

### API Module Template

`api/{entity}.ts`

```typescript
import { apiClient } from "./client";
import type {
  IEntity,
  ICreateEntityPayload,
  IUpdateEntityPayload,
  IGetEntitiesParams,
  IEntitiesResponse,
} from "@/types/entity";

export const entityApi = {
  async getEntity(entityId: string): Promise<IEntity> {
    return apiClient.fetch(`${apiClient.getBaseRoute()}/entities/${entityId}`);
  },

  async getEntities(params?: IGetEntitiesParams): Promise<IEntitiesResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.per_page) searchParams.set("per_page", String(params.per_page));

    const query = searchParams.toString();
    return apiClient.fetch(
      `${apiClient.getBaseRoute()}/entities${query ? `?${query}` : ""}`,
    );
  },

  async createEntity(payload: ICreateEntityPayload): Promise<IEntity> {
    return apiClient.fetch(`${apiClient.getBaseRoute()}/entities`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateEntity(
    entityId: string,
    payload: IUpdateEntityPayload,
  ): Promise<IEntity> {
    return apiClient.fetch(`${apiClient.getBaseRoute()}/entities/${entityId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async deleteEntity(entityId: string): Promise<void> {
    await apiClient.fetch(`${apiClient.getBaseRoute()}/entities/${entityId}`, {
      method: "DELETE",
    });
  },
};
```

---

## Types Organization

### Shared Types (`types/`)

Used across multiple modules. Canonical definitions.

```typescript
// types/posts.ts
export type IPost = {
  id: string;
  channel_id: string;
  user_id: string;
  message: string;
  create_at: number;
  update_at: number;
  delete_at: number;
  root_id: string;
  parent_id: string;
  // ... all post fields
};

export type IPostsResponse = {
  order: string[];
  posts: Record<string, IPost>;
  next_post_id: string;
  prev_post_id: string;
  has_next: boolean;
};
```

### API-Specific Types (`api/*.types.ts`)

Request/response types specific to API methods.

```typescript
// api/posts.types.ts
export type IGetPostsParams = {
  before?: string;
  after?: string;
  since?: number;
  per_page?: number;
};

export type ICreatePostPayload = {
  channel_id: string;
  message: string;
  root_id?: string;
  file_ids?: string[];
  props?: Record<string, unknown>;
};

export type IUpdatePostPayload = {
  message?: string;
  props?: Record<string, unknown>;
};

export type ISearchPostsParams = {
  terms: string;
  is_or_search?: boolean;
  time_zone_offset?: number;
  include_deleted_channels?: boolean;
  page?: number;
  per_page?: number;
};
```

### When to Use Which

| Scenario                           | Location                |
| ---------------------------------- | ----------------------- |
| Entity interface (IPost, IChannel) | `types/{entity}.ts`     |
| API request params                 | `api/{entity}.types.ts` |
| API-specific response shape        | `api/{entity}.types.ts` |
| WebSocket event payloads           | `types/websocket.ts`    |
| Store state types                  | Inside store file       |
| Component props                    | Inside component file   |

---

## Code Organization Patterns

### Regions in Large Files

Use VSCode regions for navigation in files >100 lines.

```typescript
// #region Imports
import { ... } from '...';
// #endregion Imports

// #region Types
type IState = { ... };
type IActions = { ... };
// #endregion Types

// #region Constants
const TIMEOUT_MS = 5000;
// #endregion Constants

// #region Store
export const useStore = create(...)
// #endregion Store

// #region Selectors
export function useSelector() { ... }
// #endregion Selectors
```

### Module Dependencies

```
                    ┌──────────────┐
                    │    types/    │
                    └──────────────┘
                           ▲
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────┴──────┐ ┌──────┴──────┐ ┌──────┴──────┐
    │    api/     │ │   stores/   │ │  services/  │
    └─────────────┘ └─────────────┘ └─────────────┘
           ▲               ▲               │
           │               │               │
    ┌──────┴──────┐        │               │
    │  queries/   │        │               │
    │  mutations/ │────────┴───────────────┘
    └─────────────┘
           ▲
           │
    ┌──────┴──────┐
    │ components/ │
    │   hooks/    │
    └─────────────┘
```

**Rules:**

1. `types/` has no dependencies (base layer)
2. `api/` depends only on `types/`
3. `stores/` depends on `types/`, may call `api/` in actions
4. `services/` depends on `types/`, `stores/`, `queries/` (for cache sync)
5. `queries/` and `mutations/` depend on `api/`, `types/`
6. `components/` and `hooks/` can depend on everything above

---

**Last Updated**: 2025-01-05
**Version**: 1.0
**Applies To**: Mattermost Platform Migration (apps/v2)
