# L8: WebSocket RxJS Service

## Overview

RxJS-based WebSocket service providing typed event streams with built-in
operators for debouncing, batching, and reconnection. Zustand stores subscribe
to these streams for real-time state updates.

## Target Location

`apps/v2/src/services/websocket/`

## Dependencies

- L7: State (useConnectionStore for connection state - T7.30)
- L0: Types (event type definitions)

## Tasks

| ID     | Name                    | Status | Est. | Description                               |
| ------ | ----------------------- | ------ | ---- | ----------------------------------------- |
| T8.01  | WebSocket Service       | done   | 4h   | Core socket$, connection management       |
| T8.02  | Event Streams           | done   | 6h   | Typed streams (18 streams implemented)    |
| T8.03  | debounceAfterN Operator | done   | 1.5h | Custom operator for vendor-matching batch |
| T8.04  | Subscriptions Layer     | done   | 3h   | Integration with TQ cache + Zustand       |

## Progress

- Total: 4
- Done: 4
- In Progress: 0
- Pending: 0

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        WebSocket Server                          │
└──────────────────────────────┬──────────────────────────────────┘
                               │ 82 event types (19 categories)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RxJS WebSocket Layer                          │
│  ┌─────────────┐                                                │
│  │ webSocket() │──► socket$ (auto-reconnect, n² backoff)        │
│  └─────────────┘                                                │
│         │                                                        │
│         ├──► posts$      ─► debounceAfterN(5, 100, 200)         │
│         ├──► typing$     ─► groupBy + switchMap + timer         │
│         ├──► channels$   ─► filter + map                        │
│         ├──► users$      ─► distinctUntilChanged                │
│         ├──► teams$      ─► filter + map                        │
│         ├──► reactions$  ─► throttleTime(500)                   │
│         ├──► threads$    ─► filter + map                        │
│         ├──► preferences$ ─► filter + map                       │
│         ├──► system$     ─► connection events                   │
│         ├──► sidebar$, drafts$, dialogs$, apps$, ...            │
│         └──► (19 streams total)                                 │
│                                                                  │
│  Bundle: ~8-12kb gzipped (tree-shaken)                          │
└──────────────────────────────┬──────────────────────────────────┘
                               │ .subscribe()
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│        Server State              │       Client State           │
│  ┌───────────────────────────┐   │   ┌───────────────────────┐  │
│  │    TanStack Query Cache   │   │   │    Zustand Stores     │  │
│  │  posts, channels, users   │   │   │  typing, presence,    │  │
│  │  teams, threads, prefs    │   │   │  connection, drafts   │  │
│  └───────────────────────────┘   │   └───────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```
apps/v2/src/services/websocket/
├── index.ts                 # Re-exports
├── socket.ts                # T8.01 - Core WebSocket connection
├── subscriptions.ts         # T8.04 - TQ cache + Zustand integration
├── streams/                 # T8.02 - Event stream definitions (19 files)
│   ├── index.ts
│   ├── posts$.ts            # Uses debounceAfterN(5, 100, 200)
│   ├── typing$.ts           # Uses switchMap + merge + timer
│   ├── channels$.ts
│   ├── users$.ts            # Uses distinctUntilChanged
│   ├── teams$.ts
│   ├── reactions$.ts        # Uses throttleTime(500)
│   ├── threads$.ts
│   ├── preferences$.ts
│   ├── system$.ts
│   ├── sidebar$.ts
│   ├── drafts$.ts
│   ├── dialogs$.ts
│   ├── apps$.ts
│   ├── bookmarks$.ts
│   ├── burnOnRead$.ts
│   ├── cloud$.ts
│   ├── groups$.ts
│   ├── roles$.ts
│   └── scheduledPosts$.ts
├── operators/               # T8.03 - Custom RxJS operators
│   ├── index.ts
│   └── debounceAfterN.ts    # Vendor-matching post batching
├── types.ts                 # WebSocket event types
└── constants.ts             # Event names, timeouts (WS_EVENTS, WS_TIMEOUTS)
```

## Event Categories (82 Events from Vendor)

| Category       | Count | Events                                                                            |
| -------------- | ----- | --------------------------------------------------------------------------------- |
| Posts          | 7     | `posted`, `post_edited`, `post_deleted`, `post_unread`, `ephemeral_message`, etc. |
| Channels       | 11    | `channel_created`, `channel_deleted`, `channel_updated`, `direct_added`, etc.     |
| Teams          | 8     | `added_to_team`, `leave_team`, `update_team`, `delete_team`, etc.                 |
| Users          | 6     | `user_added`, `user_removed`, `user_updated`, `status_change`, etc.               |
| Typing         | 1     | `typing`                                                                          |
| Reactions      | 3     | `reaction_added`, `reaction_removed`, `emoji_added`                               |
| Threads        | 3     | `thread_updated`, `thread_follow_changed`, `thread_read_changed`                  |
| Preferences    | 3     | `preference_changed`, `preferences_changed`, `preferences_deleted`                |
| Sidebar        | 4     | `sidebar_category_created`, `sidebar_category_updated`, etc.                      |
| Drafts         | 3     | `draft_created`, `draft_updated`, `draft_deleted`                                 |
| Groups         | 8     | `received_group`, `group_member_add`, `group_member_deleted`, etc.                |
| Roles          | 4     | `role_added`, `role_removed`, `role_updated`, `memberrole_updated`                |
| System         | 8     | `hello`, `config_changed`, `license_changed`, `plugin_enabled`, etc.              |
| Dialog         | 1     | `open_dialog`                                                                     |
| Apps           | 1     | `apps_framework_refresh_bindings`                                                 |
| Bookmarks      | 2     | `channel_bookmark_created`, `channel_bookmark_deleted`                            |
| Burn on Read   | 3     | `burn_on_read_message_created`, `burn_on_read_message_deleted`, etc.              |
| Cloud          | 3     | `cloud_payment_status_updated`, `cloud_subscription_changed`, etc.                |
| Scheduled Post | 3     | `scheduled_post_created`, `scheduled_post_updated`, `scheduled_post_deleted`      |

## RxJS Operators Used

| Operator               | Purpose       | Use Case                                            |
| ---------------------- | ------------- | --------------------------------------------------- |
| `filter`               | Event routing | Route events by type                                |
| `map`                  | Transform     | Extract/reshape payloads                            |
| `debounceAfterN`       | Custom batch  | First N immediate, then buffer (posts$) - see T8.03 |
| `switchMap`            | Cancel        | Cancel pending timer on new event (typing$)         |
| `merge`                | Combine       | Emit both immediate and delayed values (typing$)    |
| `timer`                | Delay         | Schedule delayed emission (typing stop)             |
| `throttleTime`         | Leading edge  | Rate-limit reactions                                |
| `groupBy`              | Partition     | Per-channel/user streams                            |
| `mergeMap`             | Flatten       | Process grouped streams                             |
| `distinctUntilChanged` | Dedupe        | Skip duplicate user updates                         |
| `retry`                | Reconnect     | n² backoff after maxFails (vendor formula)          |
| `share`                | Multicast     | Single socket, many subscribers; single pipeline    |
| `takeUntil`            | Cleanup       | Unsubscribe on destroy                              |
| `of`                   | Emit          | Emit single value immediately                       |

### Deprecated Operators (removed after review)

| Operator       | Reason Removed                                           |
| -------------- | -------------------------------------------------------- |
| `bufferTime`   | Replaced by `debounceAfterN` for vendor-matching batch   |
| `debounceTime` | Broken for typing$ - prevented `isTyping: true` emission |

## Core Implementation

### socket.ts (T8.01)

```typescript
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import {
  Subject,
  Observable,
  timer,
  EMPTY,
  catchError,
  retry,
  share,
  tap,
  switchMap,
  takeUntil,
  scan,
  delay,
} from "rxjs";
import { useWebSocketStore } from "@/stores/websocket";

//#region Types

type IWebSocketConfig = {
  url: string;
  token: string;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  reconnectDelayMax?: number;
};

type IWebSocketEvent<T = unknown> = {
  event: string;
  data: T;
  seq: number;
  broadcast?: {
    channel_id?: string;
    team_id?: string;
    user_id?: string;
  };
};

//#endregion Types

//#region Constants

const DEFAULT_CONFIG: Partial<IWebSocketConfig> = {
  reconnectAttempts: 7,
  reconnectDelay: 1000,
  reconnectDelayMax: 30000,
};

//#endregion Constants

//#region WebSocket Service

class WebSocketService {
  private socket$: WebSocketSubject<IWebSocketEvent> | null = null;
  private destroy$ = new Subject<void>();
  private config: IWebSocketConfig | null = null;

  /** Main event stream - shared across all subscribers */
  public events$: Observable<IWebSocketEvent> = EMPTY;

  connect(config: IWebSocketConfig): Observable<IWebSocketEvent> {
    this.config = { ...DEFAULT_CONFIG, ...config };
    const store = useWebSocketStore.getState();

    store.setConnectionState("connecting");

    this.socket$ = webSocket<IWebSocketEvent>({
      url: `${this.config.url}?token=${this.config.token}`,
      openObserver: {
        next: () => {
          store.resetReconnect();
          console.log("[WS] Connected");
        },
      },
      closeObserver: {
        next: (event) => {
          store.setConnectionState("disconnected");
          console.log("[WS] Disconnected", event.code);
        },
      },
    });

    this.events$ = this.socket$.pipe(
      tap((msg) => {
        // Track sequence for missed event detection
        store.setLastEventId(String(msg.seq));
      }),
      retry({
        count: this.config.reconnectAttempts,
        delay: (error, retryCount) => {
          store.setConnectionState("reconnecting");
          store.incrementReconnectAttempts();

          // Exponential backoff with jitter
          const baseDelay = Math.min(
            this.config!.reconnectDelay! * Math.pow(2, retryCount),
            this.config!.reconnectDelayMax!,
          );
          const jitter = Math.random() * 2000;

          console.log(`[WS] Retry ${retryCount} in ${baseDelay + jitter}ms`);
          return timer(baseDelay + jitter);
        },
      }),
      catchError((error) => {
        store.setConnectionState("disconnected");
        console.error("[WS] Fatal error", error);
        return EMPTY;
      }),
      takeUntil(this.destroy$),
      share(), // Share single connection across all subscribers
    );

    return this.events$;
  }

  send<T>(event: string, data: T): void {
    this.socket$?.next({ event, data, seq: 0 } as IWebSocketEvent<T>);
  }

  disconnect(): void {
    this.destroy$.next();
    this.socket$?.complete();
    this.socket$ = null;
    useWebSocketStore.getState().setConnectionState("disconnected");
  }
}

export const websocketService = new WebSocketService();

//#endregion WebSocket Service
```

## Event Stream Examples

### posts$.ts

```typescript
import { filter, mergeMap, of, share } from "rxjs";
import { websocketService, IWebSocketEvent } from "../socket";
import { debounceAfterN } from "../operators";
import type { IPost } from "@/types";

const POST_EVENTS = [
  "posted",
  "post_edited",
  "post_deleted",
  "post_unread",
  "ephemeral_message",
  "post_acknowledgement_added",
  "post_acknowledgement_removed",
] as const;

type IPostEventType = (typeof POST_EVENTS)[number];

/**
 * Post events with vendor-matching debounce behavior.
 *
 * Uses debounceAfterN operator (T8.03):
 * - First 5 events: emitted IMMEDIATELY (no latency)
 * - Events 6+: batched and flushed after 100ms of silence
 * - Max queue: 200 events before overflow protection
 */
export const posts$ = websocketService.events$.pipe(
  filter((msg) => POST_EVENTS.includes(msg.event as IPostEventType)),
  debounceAfterN(5, 100, 200), // First 5 immediate, then batch
  mergeMap((batch) =>
    of(
      ...batch.map((msg) => ({
        type: msg.event as IPostEventType,
        post: JSON.parse(msg.data.post) as IPost,
        channelId: msg.data.channel_id || msg.broadcast?.channel_id || "",
      })),
    ),
  ),
  share(),
);
```

### typing$.ts

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
import { websocketService } from "../socket";

type ITypingEvent = {
  event: "typing";
  data: { user_id: string; username: string };
  broadcast: { channel_id: string };
};

type ITypingState = {
  channelId: string;
  userId: string;
  username: string;
  isTyping: boolean;
};

const TYPING_TIMEOUT_MS = 5000;

/**
 * Typing events with auto-expiry.
 * Groups by channel+user, emits TRUE immediately, FALSE after 5s silence.
 *
 * Pattern from state-management.md - uses switchMap + merge + timer
 * to emit both immediate start and delayed stop events.
 */
export const typing$ = websocketService.events$.pipe(
  filter((msg): msg is ITypingEvent => msg.event === "typing"),
  // Group by channel+user to handle per-user typing state
  groupBy((msg) => `${msg.broadcast.channel_id}:${msg.data.user_id}`),
  mergeMap((group$) =>
    group$.pipe(
      switchMap((msg) =>
        merge(
          // Emit TRUE immediately
          of({
            channelId: msg.broadcast.channel_id,
            userId: msg.data.user_id,
            username: msg.data.username,
            isTyping: true,
          } as ITypingState),
          // Emit FALSE after timeout
          timer(TYPING_TIMEOUT_MS).pipe(
            map(
              () =>
                ({
                  channelId: msg.broadcast.channel_id,
                  userId: msg.data.user_id,
                  username: msg.data.username,
                  isTyping: false,
                }) as ITypingState,
            ),
          ),
        ),
      ),
    ),
  ),
  share(),
);
```

### channels$.ts

```typescript
import { filter, map } from "rxjs";
import { websocketService } from "../socket";
import type { IChannel } from "@/types";

const CHANNEL_EVENTS = [
  "channel_created",
  "channel_deleted",
  "channel_updated",
  "channel_converted",
  "channel_member_updated",
  "direct_added",
  "group_added",
] as const;

type IChannelEventType = (typeof CHANNEL_EVENTS)[number];

type IChannelEvent = {
  event: IChannelEventType;
  data: { channel?: string; channel_id?: string };
  broadcast: { channel_id?: string };
};

export const channels$ = websocketService.events$.pipe(
  filter((msg): msg is IChannelEvent =>
    CHANNEL_EVENTS.includes(msg.event as IChannelEventType),
  ),
  map((msg) => ({
    type: msg.event,
    channel: msg.data.channel
      ? (JSON.parse(msg.data.channel) as IChannel)
      : null,
    channelId: msg.data.channel_id || msg.broadcast?.channel_id || null,
  })),
);
```

## Store Integration Pattern

RxJS streams update **TanStack Query cache** for server state (posts, channels, users)
and **Zustand stores** for client state (typing, presence). See `state-management.md`.

### Server State → TanStack Query Cache

```typescript
// apps/v2/src/services/websocket/subscriptions.ts

import { QueryClient } from "@tanstack/react-query";
import { posts$ } from "./streams";
import { queryKeys } from "@/queries/keys";
import type { IPost } from "@/types";

export function initPostsSubscription(queryClient: QueryClient) {
  return posts$.subscribe((events) => {
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
          break;

        case "post_deleted":
          queryClient.setQueryData<IPost[]>(
            queryKeys.posts.list(channelId),
            (old) => old?.filter((post) => post.id !== event.data.post.id),
          );
          break;
      }
    });
  });
}
```

### Client State → Zustand Store

```typescript
// apps/v2/src/services/websocket/subscriptions.ts

import { typing$ } from "./streams";
import { useTypingStore } from "@/stores/typing";

export function initTypingSubscription() {
  return typing$.subscribe((event) => {
    useTypingStore.getState().setTyping(
      event.channelId,
      {
        userId: event.userId,
        username: event.username,
        timestamp: Date.now(),
      },
      event.isTyping,
    );
  });
}
```

## App Initialization

WebSocket subscriptions are initialized in the `StateProvider` (T7.51), which
wraps the app and provides both TanStack Query and WebSocket integration.

```typescript
// apps/v2/src/providers/StateProvider.tsx

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useRef } from "react";
import { queryClient } from "@/queries/client";
import { websocketService } from "@/services/websocket";
import { initWebSocketSubscriptions } from "@/services/websocket/subscriptions";
import { Platform } from "react-native";

type IProps = {
  children: React.ReactNode;
};

export function StateProvider({ children }: IProps) {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Initialize WebSocket subscriptions that update TQ cache and Zustand stores
    cleanupRef.current = initWebSocketSubscriptions(queryClient);

    return () => {
      cleanupRef.current?.();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {Platform.OS === "web" && __DEV__ && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
```

```typescript
// apps/v2/src/services/websocket/subscriptions.ts

import { QueryClient } from "@tanstack/react-query";
import {
  initPostsSubscription,
  initChannelsSubscription,
  initTypingSubscription,
  initPresenceSubscription,
} from "./subscriptions";

export function initWebSocketSubscriptions(queryClient: QueryClient) {
  const subscriptions = [
    // Server state → TanStack Query cache
    initPostsSubscription(queryClient),
    initChannelsSubscription(queryClient),
    // Client state → Zustand stores
    initTypingSubscription(),
    initPresenceSubscription(),
  ];

  return () => {
    subscriptions.forEach((sub) => sub.unsubscribe());
  };
}
```

## Testing Strategy

### Unit Tests

- Mock `websocketService.events$` with `Subject`
- Test each stream's filtering and transformation
- Test debounce/buffer timing with `fakeAsync`

### Integration Tests

- Test store updates from stream events
- Test connection state transitions
- Test reconnection behavior

## Notes

- RxJS v7.8+ required for optimal tree-shaking
- Import operators individually: `import { filter, map } from 'rxjs'`
- Estimated bundle impact: ~8-12kb gzipped (depending on operators used)
- All streams are lazy — no processing until subscribed
- Connection state managed by useConnectionStore (T7.30)
- Event sequence tracking via `lastEventId` for missed event detection
- Server state (posts, channels, users) → TanStack Query cache
- Client state (typing, presence) → Zustand stores
