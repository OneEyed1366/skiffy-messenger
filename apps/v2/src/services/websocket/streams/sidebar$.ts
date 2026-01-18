// apps/v2/src/services/websocket/streams/sidebar$.ts

import { filter, map, share } from "rxjs";
import { websocketService, IWebSocketEvent } from "../socket";

//#region Types

const SIDEBAR_EVENTS = [
  "sidebar_category_created",
  "sidebar_category_updated",
  "sidebar_category_deleted",
  "sidebar_category_order_updated",
] as const;

type ISidebarEventType = (typeof SIDEBAR_EVENTS)[number];

type ISidebarEventData = {
  category?: string;
  category_id?: string;
  order?: string[];
  team_id?: string;
};

export type ISidebarEventPayload = {
  type: ISidebarEventType;
  category: ISidebarCategory | null;
  categoryId: string;
  order: string[];
  teamId: string;
};

type ISidebarCategory = {
  id: string;
  user_id: string;
  team_id: string;
  display_name: string;
  sorting: "alpha" | "recent" | "manual";
  type: "favorites" | "channels" | "direct_messages" | "custom";
  muted: boolean;
  collapsed: boolean;
  channel_ids: string[];
};

//#endregion Types

//#region Stream

export const sidebar$ = websocketService.events$.pipe(
  filter((msg): msg is IWebSocketEvent<ISidebarEventData> =>
    SIDEBAR_EVENTS.includes(msg.event as ISidebarEventType),
  ),
  map((msg): ISidebarEventPayload => {
    let category: ISidebarCategory | null = null;
    try {
      if (msg.data.category) {
        category = JSON.parse(msg.data.category) as ISidebarCategory;
      }
    } catch {
      console.warn("[sidebar$] Failed to parse category data");
    }
    return {
      type: msg.event as ISidebarEventType,
      category,
      categoryId: msg.data.category_id || category?.id || "",
      order: msg.data.order || [],
      teamId:
        msg.data.team_id || msg.broadcast?.team_id || category?.team_id || "",
    };
  }),
  share(),
);

//#endregion Stream
