// apps/v2/src/services/websocket/streams/posts$.ts

import { filter, mergeMap, of, share } from "rxjs";
import { websocketService, IWebSocketEvent } from "../socket";
import { debounceAfterN } from "../operators";
import type { IPost } from "@/types";

//#region Types

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

type IPostEventData = {
  post?: string; // JSON stringified
  channel_id?: string;
  team_id?: string;
};

export type IPostEventPayload = {
  type: IPostEventType;
  post: IPost | null;
  channelId: string;
  teamId: string;
};

//#endregion Types

//#region Helpers

function isPostEvent(
  msg: IWebSocketEvent,
): msg is IWebSocketEvent<IPostEventData> {
  return POST_EVENTS.includes(msg.event as IPostEventType);
}

function transformPost(
  msg: IWebSocketEvent<IPostEventData>,
): IPostEventPayload {
  let post: IPost | null = null;

  try {
    if (msg.data.post) {
      post = JSON.parse(msg.data.post) as IPost;
    }
  } catch {
    console.warn("[posts$] Failed to parse post:", msg.data.post);
  }

  return {
    type: msg.event as IPostEventType,
    post,
    channelId:
      msg.data.channel_id ||
      msg.broadcast?.channel_id ||
      post?.channel_id ||
      "",
    teamId: msg.data.team_id || msg.broadcast?.team_id || "",
  };
}

//#endregion Helpers

//#region Stream

/**
 * Post events with vendor-matching debounce behavior.
 *
 * Uses debounceAfterN operator (T8.03) which matches vendor debouncePostEvent:
 * - First 5 events: emitted IMMEDIATELY (no latency)
 * - Events 6+: batched and flushed after 100ms of silence
 * - Max queue: 200 events before overflow protection
 *
 * This prevents adding latency to single posts while still batching rapid bursts.
 *
 * @see vendor/desktop/webapp/channels/src/actions/websocket_actions.jsx:730-767
 */
export const posts$ = websocketService.events$.pipe(
  filter(isPostEvent),
  debounceAfterN(5, 100, 200), // First 5 immediate, then batch
  mergeMap((batch) => of(...batch.map(transformPost))),
  share(), // Share single pipeline across subscribers
);

//#endregion Stream
