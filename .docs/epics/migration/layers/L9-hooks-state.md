# L9: State Hooks

## Overview

React hooks that provide access to application state. Following the three-layer
state management architecture (see `.docs/architecture/state-management.md`):

| State Type       | Technology     | L9 Hook Pattern                         |
| ---------------- | -------------- | --------------------------------------- |
| **Server State** | TanStack Query | `use{Entity}Query()` - wraps `useQuery` |
| **Client State** | Zustand        | `use{State}()` - wraps store selector   |

## Target Location

`apps/v2/src/hooks/`

## Dependencies

- L5: Pure Hooks
- L7: State (TanStack Query + Zustand)
- L8: WebSocket RxJS Service (for real-time hooks)

## Tasks

### TanStack Query Hooks (Server State)

Data fetched from REST API with automatic caching, refetch, loading/error states.

| ID                                                 | Name                 | Status  | Parallel | Est. | Depends On |
| -------------------------------------------------- | -------------------- | ------- | -------- | ---- | ---------- |
| [T9.04](../tasks/T9.04-hook-user.md)               | useUserQuery         | pending | ✓        | 2h   | T7.03      |
| [T9.05](../tasks/T9.05-hook-channel.md)            | useChannelQuery      | pending | ✓        | 2h   | T7.03      |
| [T9.06](../tasks/T9.06-hook-team.md)               | useTeamQuery         | pending | ✓        | 2h   | T7.03      |
| [T9.07](../tasks/T9.07-hook-post.md)               | usePostQuery         | pending | ✓        | 2h   | T7.03      |
| [T9.08](../tasks/T9.08-hook-channel-bookmarks.md)  | useChannelBookmarks  | pending | ✓        | 2h   | T7.03      |
| [T9.12](../tasks/T9.12-hook-unread-counts.md)      | useUnreadCounts      | pending | ✓        | 2h   | T7.03      |
| [T9.13](../tasks/T9.13-hook-channel-categories.md) | useChannelCategories | pending | ✓        | 2h   | T7.03      |
| [T9.18](../tasks/T9.18-hook-search.md)             | useSearchQuery       | pending | ✓        | 2h   | T7.03      |
| [T9.20](../tasks/T9.20-hook-scheduled-posts.md)    | useScheduledPosts    | pending | ✓        | 2h   | T7.03      |

### Zustand Hooks (Client State)

Ephemeral UI state not from REST API.

| ID                                              | Name               | Status  | Parallel | Est. | Depends On |
| ----------------------------------------------- | ------------------ | ------- | -------- | ---- | ---------- |
| [T9.01](../tasks/T9.01-hook-current-user.md)    | useCurrentUser     | pending | ✓        | 1h   | T7.04      |
| [T9.02](../tasks/T9.02-hook-current-team.md)    | useCurrentTeam     | pending | ✓        | 1h   | T7.04      |
| [T9.03](../tasks/T9.03-hook-current-channel.md) | useCurrentChannel  | pending | ✓        | 1h   | T7.04      |
| [T9.09](../tasks/T9.09-hook-preference.md)      | usePreference      | pending | ✓        | 1h   | T7.04      |
| [T9.10](../tasks/T9.10-hook-is-logged-in.md)    | useIsLoggedIn      | pending | ✓        | 0.5h | T7.04      |
| [T9.11](../tasks/T9.11-hook-is-system-admin.md) | useIsSystemAdmin   | pending | ✓        | 0.5h | T7.04      |
| [T9.14](../tasks/T9.14-hook-typing-users.md)    | useTypingUsers     | pending | ✓        | 1h   | T7.31      |
| [T9.15](../tasks/T9.15-hook-thread-routing.md)  | useThreadRouting   | pending | ✓        | 2h   | T7.35      |
| [T9.16](../tasks/T9.16-hook-websocket.md)       | useWebSocketStatus | pending | ✓        | 1h   | T7.30      |
| [T9.17](../tasks/T9.17-hook-notifications.md)   | useNotifications   | pending | ✓        | 3h   | T7.04      |
| [T9.19](../tasks/T9.19-hook-drafts.md)          | useDrafts          | pending | ✓        | 2h   | T7.33      |

## Progress

- Total: 20 (9 TanStack Query + 11 Zustand)
- Done: 0
- In Progress: 0
- Pending: 20

## File Structure

```
apps/v2/src/hooks/
├── useCurrentUser.ts       # T9.01
├── useCurrentTeam.ts       # T9.02
├── useCurrentChannel.ts    # T9.03
├── useUser.ts              # T9.04
├── useChannel.ts           # T9.05
├── useTeam.ts              # T9.06
├── usePost.ts              # T9.07
├── useChannelBookmarks.ts  # T9.08
├── usePreference.ts        # T9.09
├── useIsLoggedIn.ts        # T9.10
├── useIsSystemAdmin.ts     # T9.11
├── useUnreadCounts.ts      # T9.12
├── useChannelCategories.ts # T9.13
├── useTypingUsers.ts       # T9.14
├── useThreadRouting.ts     # T9.15
├── useWebSocket.ts         # T9.16
├── useNotifications.ts     # T9.17
├── useSearch.ts            # T9.18
├── useDrafts.ts            # T9.19
├── useScheduledPosts.ts    # T9.20
└── index.ts                # Re-exports all
```

## Hook Patterns

### Pattern 1: TanStack Query Hook (Server State)

Use for data from REST API. **Never use useEffect for data fetching.**

```typescript
// useUserQuery.ts
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/api/users";
import { queryKeys } from "@/queries/keys";
import type { IUser } from "@/types";

type IOptions = {
  enabled?: boolean;
};

export function useUserQuery(userId: string | undefined, options?: IOptions) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId!),
    queryFn: () => usersApi.getUser(userId!),
    enabled: !!userId && (options?.enabled ?? true),
    staleTime: 1000 * 60, // 1 minute
  });
}

// Usage:
// const { data: user, isLoading, error } = useUserQuery(userId);
```

### Pattern 2: TanStack Query with Select (Derived Server State)

```typescript
// useUnreadCountsQuery.ts
import { useQuery } from "@tanstack/react-query";
import { channelsApi } from "@/api/channels";
import { queryKeys } from "@/queries/keys";

type IUnreadCounts = {
  totalMentions: number;
  totalMessages: number;
  byChannel: Record<string, { mentions: number; messages: number }>;
};

export function useUnreadCountsQuery(teamId: string) {
  return useQuery({
    queryKey: queryKeys.channels.unreadCounts(teamId),
    queryFn: () => channelsApi.getUnreadCounts(teamId),
    select: (data): IUnreadCounts => {
      const byChannel: Record<string, { mentions: number; messages: number }> =
        {};
      let totalMentions = 0;
      let totalMessages = 0;

      data.forEach((unread) => {
        byChannel[unread.channel_id] = {
          mentions: unread.mention_count,
          messages: unread.msg_count,
        };
        totalMentions += unread.mention_count;
        totalMessages += unread.msg_count;
      });

      return { totalMentions, totalMessages, byChannel };
    },
  });
}
```

### Pattern 3: Zustand Selector Hook (Client State)

Use for ephemeral UI state not from API.

```typescript
// useCurrentUser.ts
import { useAuthStore } from "@/stores/auth";
import type { IUser } from "@/types";

type IUseCurrentUserReturn = {
  user: IUser | null;
  isLoggedIn: boolean;
};

export function useCurrentUser(): IUseCurrentUserReturn {
  const user = useAuthStore((state) => state.currentUser);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return { user, isLoggedIn };
}
```

### Pattern 4: Zustand Hook with Shallow Comparison

```typescript
// useTypingUsers.ts
import { useTypingStore } from "@/stores/typing";
import { shallow } from "zustand/shallow";

export function useTypingUsers(channelId: string | null) {
  return useTypingStore((state) => {
    if (!channelId) return [];
    return state.typing[channelId] ?? [];
  }, shallow);
}
```

### Pattern 5: Zustand Hook with Actions

```typescript
// useDrafts.ts
import { useDraftsStore } from "@/stores/drafts";

export function useChannelDraft(channelId: string) {
  const draft = useDraftsStore((state) => state.channelDrafts[channelId]);
  const setDraft = useDraftsStore((state) => state.setChannelDraft);
  const clearDraft = useDraftsStore((state) => state.clearChannelDraft);

  return {
    draft,
    setDraft: (message: string, files?: string[]) =>
      setDraft(channelId, message, files),
    clearDraft: () => clearDraft(channelId),
  };
}
```

### Pattern 6: Connection Status Hook (WebSocket)

```typescript
// useWebSocketStatus.ts
import { useConnectionStore } from "@/stores/connection";

export function useWebSocketStatus() {
  const status = useConnectionStore((state) => state.status);
  const errorCount = useConnectionStore((state) => state.errorCount);

  return {
    isConnected: status === "connected",
    isReconnecting: status === "reconnecting",
    status,
    errorCount,
  };
}
```

## WebSocket Integration

WebSocket events are handled by the RxJS service (L8), not by individual hooks.
Components access WebSocket state through Zustand stores that are updated by RxJS
stream subscriptions. See `L8-websocket-rxjs.md` for the full architecture.

### Connection Status Hook (T9.16)

```typescript
// useWebSocketStatus.ts
import { useConnectionStore } from "@/stores/connection";

export function useWebSocketStatus() {
  const status = useConnectionStore((state) => state.status);
  const errorCount = useConnectionStore((state) => state.errorCount);
  const lastConnectedAt = useConnectionStore((state) => state.lastConnectedAt);

  return {
    isConnected: status === "connected",
    isReconnecting: status === "reconnecting",
    isDisconnected: status === "disconnected",
    status,
    errorCount,
    lastConnectedAt,
  };
}
```

### Typing Users Hook (T9.14)

```typescript
// useTypingUsers.ts - Zustand store updated by typing$ RxJS stream
import { useTypingStore } from "@/stores/typing";
import { shallow } from "zustand/shallow";

export function useTypingUsers(channelId: string | null) {
  return useTypingStore((state) => {
    if (!channelId) return [];
    return state.typing[channelId] ?? [];
  }, shallow);
}

export function useTypingIndicator(channelId: string | null): string | null {
  const typingUsers = useTypingUsers(channelId);

  if (typingUsers.length === 0) return null;
  if (typingUsers.length === 1) {
    return `${typingUsers[0].username} is typing...`;
  }
  if (typingUsers.length === 2) {
    return `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`;
  }
  return `${typingUsers.length} people are typing...`;
}
```

## Notes

### Architecture Decision: TanStack Query vs Zustand

| Data Source           | Use            | Why                                                          |
| --------------------- | -------------- | ------------------------------------------------------------ |
| REST API              | TanStack Query | Auto-caching, refetch, deduplication, stale-while-revalidate |
| WebSocket (ephemeral) | Zustand        | High-frequency updates, no caching needed                    |
| Local UI state        | Zustand        | Modals, sidebars, typing indicators                          |

### Key Rules

1. **Never use `useEffect` for data fetching** — use TanStack Query
2. **Use `shallow` from zustand** for object/array selectors to prevent over-rendering
3. **Export custom hooks**, not raw stores — `useIsConnected()` not `useConnectionStore(s => s.status === 'connected')`
4. **TQ hooks return `{ data, isLoading, error }`** — standardized interface
5. **Zustand hooks return domain-specific shape** — `{ user, isLoggedIn }` etc.

### Testing

```typescript
// TanStack Query hook testing
import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUserQuery } from "./useUserQuery";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

// Zustand hook testing
import { useTypingStore } from "@/stores/typing";

beforeEach(() => {
  useTypingStore.getState().reset();
});
```
