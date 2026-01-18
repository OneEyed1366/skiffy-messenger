// apps/v2/src/services/websocket/streams/bookmarks$.ts

import { filter, map, share } from "rxjs";
import { websocketService, IWebSocketEvent } from "../socket";

//#region Types

const BOOKMARK_EVENTS = [
  "channel_bookmark_created",
  "channel_bookmark_updated",
  "channel_bookmark_deleted",
  "channel_bookmark_sorted",
] as const;

type IBookmarkEventType = (typeof BOOKMARK_EVENTS)[number];

type IBookmarkEventData = {
  bookmark?: string;
  bookmarks?: string;
  channel_id?: string;
};

export type IBookmarkEventPayload = {
  type: IBookmarkEventType;
  bookmark: IChannelBookmark | null;
  bookmarks: IChannelBookmark[];
  channelId: string;
};

type IChannelBookmark = {
  id: string;
  channel_id: string;
  owner_id: string;
  display_name: string;
  file_id?: string;
  link_url?: string;
  image_url?: string;
  emoji?: string;
  type: "link" | "file";
  sort_order: number;
  create_at: number;
  update_at: number;
  delete_at: number;
};

//#endregion Types

//#region Stream

export const bookmarks$ = websocketService.events$.pipe(
  filter((msg): msg is IWebSocketEvent<IBookmarkEventData> =>
    BOOKMARK_EVENTS.includes(msg.event as IBookmarkEventType),
  ),
  map((msg): IBookmarkEventPayload => {
    let bookmark: IChannelBookmark | null = null;
    let bookmarks: IChannelBookmark[] = [];

    try {
      if (msg.data.bookmark) {
        bookmark = JSON.parse(msg.data.bookmark) as IChannelBookmark;
      }
      if (msg.data.bookmarks) {
        const parsed = JSON.parse(msg.data.bookmarks) as unknown;
        if (Array.isArray(parsed)) {
          bookmarks = parsed as IChannelBookmark[];
        } else if (typeof parsed === "object" && parsed !== null) {
          const obj = parsed as {
            updated?: IChannelBookmark;
            deleted?: IChannelBookmark;
          };
          if (obj.updated) bookmark = obj.updated;
          if (obj.deleted) bookmarks = [obj.deleted];
        }
      }
    } catch {
      console.warn("[bookmarks$] Failed to parse bookmark data");
    }

    return {
      type: msg.event as IBookmarkEventType,
      bookmark,
      bookmarks,
      channelId:
        msg.data.channel_id ||
        msg.broadcast?.channel_id ||
        bookmark?.channel_id ||
        "",
    };
  }),
  share(),
);

//#endregion Stream
