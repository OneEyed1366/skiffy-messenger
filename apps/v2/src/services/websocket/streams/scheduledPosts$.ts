// apps/v2/src/services/websocket/streams/scheduledPosts$.ts

import { filter, map, share } from "rxjs";
import { websocketService, IWebSocketEvent } from "../socket";

//#region Types

const SCHEDULED_POST_EVENTS = [
  "scheduled_post_created",
  "scheduled_post_updated",
  "scheduled_post_deleted",
] as const;

type IScheduledPostEventType = (typeof SCHEDULED_POST_EVENTS)[number];

type IScheduledPostEventData = {
  scheduledPost?: string;
};

export type IScheduledPostEventPayload = {
  type: IScheduledPostEventType;
  scheduledPost: IScheduledPost | null;
};

type IScheduledPost = {
  id: string;
  user_id: string;
  channel_id: string;
  root_id?: string;
  message: string;
  props?: Record<string, unknown>;
  scheduled_at: number;
  create_at: number;
  update_at: number;
};

//#endregion Types

//#region Stream

export const scheduledPosts$ = websocketService.events$.pipe(
  filter((msg): msg is IWebSocketEvent<IScheduledPostEventData> =>
    SCHEDULED_POST_EVENTS.includes(msg.event as IScheduledPostEventType),
  ),
  map((msg): IScheduledPostEventPayload => {
    let scheduledPost: IScheduledPost | null = null;
    try {
      if (msg.data.scheduledPost) {
        scheduledPost = JSON.parse(msg.data.scheduledPost) as IScheduledPost;
      }
    } catch {
      console.warn("[scheduledPosts$] Failed to parse scheduled post data");
    }
    return {
      type: msg.event as IScheduledPostEventType,
      scheduledPost,
    };
  }),
  share(),
);

//#endregion Stream
