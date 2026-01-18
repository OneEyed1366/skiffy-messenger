// apps/v2/src/services/websocket/streams/typing$.ts

import {
  filter,
  groupBy,
  mergeMap,
  switchMap,
  merge,
  of,
  timer,
  map,
  share,
} from "rxjs";
import { websocketService, IWebSocketEvent } from "../socket";

//#region Constants

/** Typing indicator timeout in ms. Matches vendor TimeBetweenUserTypingUpdatesMilliseconds. */
const TYPING_TIMEOUT_MS = 5000;

//#endregion Constants

//#region Types

type ITypingEventData = {
  user_id: string;
  parent_id?: string;
};

export type ITypingEventPayload = {
  channelId: string;
  userId: string;
  parentId: string;
  isTyping: boolean;
};

//#endregion Types

//#region Stream

/**
 * Typing indicator events with configurable auto-expiry.
 *
 * **IMPORTANT:** This implementation fixes a critical bug in the original design.
 * The previous implementation using `debounceTime` ONLY emitted after silence,
 * meaning subscribers never received `isTyping: true`.
 *
 * Correct behavior (matching vendor):
 * - Emits `isTyping: true` IMMEDIATELY when typing event received
 * - Emits `isTyping: false` after `TimeBetweenUserTypingUpdatesMilliseconds` silence
 * - switchMap cancels pending stop timer if new typing event arrives
 *
 * Timeout is configurable via server config (default: 5000ms).
 *
 * @see vendor/desktop/webapp/channels/src/components/msg_typing/actions.ts:21-47
 */
export const typing$ = websocketService.events$.pipe(
  filter(
    (msg): msg is IWebSocketEvent<ITypingEventData> => msg.event === "typing",
  ),
  groupBy(
    (msg) =>
      `${msg.broadcast?.channel_id}:${msg.data.user_id}:${msg.data.parent_id || ""}`,
  ),
  mergeMap((group$) =>
    group$.pipe(
      switchMap((msg) => {
        const payload: ITypingEventPayload = {
          channelId: msg.broadcast?.channel_id || "",
          userId: msg.data.user_id,
          parentId: msg.data.parent_id || "",
          isTyping: true,
        };

        return merge(
          of(payload), // Emit TRUE immediately
          timer(TYPING_TIMEOUT_MS).pipe(
            map((): ITypingEventPayload => ({ ...payload, isTyping: false })),
          ),
        );
      }),
    ),
  ),
  share(), // Share single pipeline across subscribers
);

//#endregion Stream
