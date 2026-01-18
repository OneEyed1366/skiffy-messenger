// apps/v2/src/services/websocket/streams/burnOnRead$.ts

import { filter, map, share } from "rxjs";
import { websocketService, IWebSocketEvent } from "../socket";

//#region Types

const BURN_ON_READ_EVENTS = [
  "post_revealed",
  "post_burned",
  "burn_on_read_all_revealed",
] as const;

type IBurnOnReadEventType = (typeof BURN_ON_READ_EVENTS)[number];

type IBurnOnReadEventData = {
  post_id?: string;
  user_id?: string;
  channel_id?: string;
};

export type IBurnOnReadEventPayload = {
  type: IBurnOnReadEventType;
  postId: string;
  userId: string;
  channelId: string;
};

//#endregion Types

//#region Stream

export const burnOnRead$ = websocketService.events$.pipe(
  filter((msg): msg is IWebSocketEvent<IBurnOnReadEventData> =>
    BURN_ON_READ_EVENTS.includes(msg.event as IBurnOnReadEventType),
  ),
  map(
    (msg): IBurnOnReadEventPayload => ({
      type: msg.event as IBurnOnReadEventType,
      postId: msg.data.post_id || "",
      userId: msg.data.user_id || msg.broadcast?.user_id || "",
      channelId: msg.data.channel_id || msg.broadcast?.channel_id || "",
    }),
  ),
  share(),
);

//#endregion Stream
