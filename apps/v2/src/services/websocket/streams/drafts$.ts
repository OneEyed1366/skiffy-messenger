// apps/v2/src/services/websocket/streams/drafts$.ts

import { filter, map, share } from "rxjs";
import { websocketService, IWebSocketEvent } from "../socket";

//#region Types

const DRAFT_EVENTS = [
  "draft_created",
  "draft_updated",
  "draft_deleted",
] as const;

type IDraftEventType = (typeof DRAFT_EVENTS)[number];

type IDraftEventData = {
  draft?: string;
  user_id?: string;
  channel_id?: string;
};

export type IDraftEventPayload = {
  type: IDraftEventType;
  draft: IDraft | null;
  userId: string;
  channelId: string;
};

type IDraft = {
  id: string;
  user_id: string;
  channel_id: string;
  root_id?: string;
  message: string;
  create_at: number;
  update_at: number;
  props?: Record<string, unknown>;
};

//#endregion Types

//#region Stream

export const drafts$ = websocketService.events$.pipe(
  filter((msg): msg is IWebSocketEvent<IDraftEventData> =>
    DRAFT_EVENTS.includes(msg.event as IDraftEventType),
  ),
  map((msg): IDraftEventPayload => {
    let draft: IDraft | null = null;
    try {
      if (msg.data.draft) {
        draft = JSON.parse(msg.data.draft) as IDraft;
      }
    } catch {
      console.warn("[drafts$] Failed to parse draft data");
    }
    return {
      type: msg.event as IDraftEventType,
      draft,
      userId:
        msg.data.user_id || msg.broadcast?.user_id || draft?.user_id || "",
      channelId:
        msg.data.channel_id ||
        msg.broadcast?.channel_id ||
        draft?.channel_id ||
        "",
    };
  }),
  share(),
);

//#endregion Stream
