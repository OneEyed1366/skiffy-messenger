// apps/v2/src/services/websocket/socket.ts

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
  takeUntil,
} from "rxjs";
import { useConnectionStore } from "@/stores/connection";

//#region Types

export type IWebSocketConfig = {
  /** WebSocket server URL (with protocol, e.g., wss://...) */
  url: string;
  /** Authentication token */
  token: string;
  /** Max reconnection attempts before constant delay phase ends (default: 7) */
  reconnectAttempts?: number;
  /** Initial/constant reconnection delay in ms (default: 3000) */
  reconnectDelay?: number;
  /** Max reconnection delay in ms (default: 300000 = 5 min) */
  reconnectDelayMax?: number;
  /** Jitter range in ms to prevent thundering herd (default: 2000) */
  reconnectJitter?: number;
};

export type IWebSocketEvent<T = unknown> = {
  /** Event type name */
  event: string;
  /** Event payload */
  data: T;
  /** Sequence number for ordering */
  seq: number;
  /** Broadcast metadata */
  broadcast?: {
    channel_id?: string;
    team_id?: string;
    user_id?: string;
    omit_users?: Record<string, boolean>;
  };
};

//#endregion Types

//#region Constants

const DEFAULT_CONFIG = {
  reconnectAttempts: 7, // maxWebSocketFails - constant delay phase
  reconnectDelay: 3000, // minWebSocketRetryTime
  reconnectDelayMax: 300000, // maxWebSocketRetryTime (5 min)
  reconnectJitter: 2000, // reconnectJitterRange
} as const;

//#endregion Constants

//#region WebSocket Service

class WebSocketService {
  private socket$: WebSocketSubject<IWebSocketEvent> | null = null;
  private destroy$ = new Subject<void>();
  private config: Required<IWebSocketConfig> = {
    url: "",
    token: "",
    ...DEFAULT_CONFIG,
  };

  /** Main event stream - shared across all subscribers */
  public events$: Observable<IWebSocketEvent> = EMPTY;

  //#region Public Methods

  /**
   * Connect to WebSocket server.
   * @param config Connection configuration
   * @returns Observable of WebSocket events
   */
  connect(config: IWebSocketConfig): Observable<IWebSocketEvent> {
    this.config = { ...DEFAULT_CONFIG, ...config };
    const store = useConnectionStore.getState();

    // Reset destroy subject for new connection
    this.destroy$ = new Subject<void>();

    store.setStatus("connecting");

    this.socket$ = webSocket<IWebSocketEvent>({
      url: `${this.config.url}?token=${this.config.token}`,
      openObserver: {
        next: () => {
          store.setConnected();
          console.log("[WS] Connected");
        },
      },
      closeObserver: {
        next: (event) => {
          store.setDisconnected(event.reason || undefined);
          console.log("[WS] Disconnected:", event.code, event.reason);
        },
      },
      deserializer: (e) => JSON.parse(e.data) as IWebSocketEvent,
      serializer: (value) => JSON.stringify(value),
    });

    this.events$ = this.socket$.pipe(
      tap((msg) => {
        // Track sequence for missed event detection
        if (msg.seq) {
          store.setLastEventId(String(msg.seq));
        }

        // Handle connection ID from 'hello' event
        if (msg.event === "hello" && msg.data) {
          const data = msg.data as { connection_id?: string };
          if (data.connection_id) {
            store.setConnectionId(data.connection_id);
          }
        }
      }),
      retry({
        delay: (_error, retryCount) => {
          store.setReconnecting();

          // Vendor n^2 backoff formula:
          // - Constant delay (3000ms) for first `reconnectAttempts` (7) failures
          // - After that: delay * n^2, capped at reconnectDelayMax (5 min)
          // See: vendor/desktop/webapp/platform/client/src/websocket.ts:244-249
          let retryTime = this.config.reconnectDelay;

          if (retryCount > this.config.reconnectAttempts) {
            // After max constant fails: n^2 backoff
            retryTime = retryTime * retryCount * retryCount;
            if (retryTime > this.config.reconnectDelayMax) {
              retryTime = this.config.reconnectDelayMax;
            }
          }

          // Jitter to avoid thundering herd
          const jitter = Math.random() * this.config.reconnectJitter;
          const totalDelay = retryTime + jitter;

          console.log(
            `[WS] Retry ${retryCount} in ${Math.round(totalDelay)}ms`,
          );
          return timer(totalDelay);
        },
      }),
      catchError((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Connection failed";
        store.setDisconnected(message);
        console.error("[WS] Connection failed:", error);
        return EMPTY;
      }),
      takeUntil(this.destroy$),
      share(), // Share single connection across all subscribers
    );

    // Start the connection by subscribing
    this.events$.subscribe();

    return this.events$;
  }

  /**
   * Disconnect from WebSocket server.
   */
  disconnect(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.socket$?.complete();
    this.socket$ = null;
    useConnectionStore.getState().setDisconnected();
    console.log("[WS] Disconnected by client");
  }

  /**
   * Send a message through the WebSocket.
   * @param event Event type name
   * @param data Event payload
   */
  send<T>(event: string, data: T): void {
    if (!this.socket$ || !this.isConnected()) {
      console.warn("[WS] Cannot send - not connected");
      return;
    }
    this.socket$.next({ event, data, seq: 0 } as IWebSocketEvent<T>);
  }

  /**
   * Check if currently connected.
   */
  isConnected(): boolean {
    return useConnectionStore.getState().status === "connected";
  }

  /**
   * Reconnect to WebSocket server (manual trigger).
   */
  reconnect(): void {
    if (this.config.url && this.config.token) {
      this.disconnect();
      this.connect(this.config);
    }
  }

  //#endregion Public Methods
}

/** Singleton WebSocket service instance */
export const websocketService = new WebSocketService();

//#endregion WebSocket Service
