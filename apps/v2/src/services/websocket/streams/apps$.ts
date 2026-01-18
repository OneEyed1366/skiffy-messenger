// apps/v2/src/services/websocket/streams/apps$.ts

import { filter, map, share } from "rxjs";
import { websocketService, IWebSocketEvent } from "../socket";

//#region Types

const APPS_EVENTS = [
  "custom_com.mattermost.apps_refresh_bindings",
  "custom_com.mattermost.apps_plugin_enabled",
  "custom_com.mattermost.apps_plugin_disabled",
] as const;

type IAppsEventType = (typeof APPS_EVENTS)[number];

type IAppsEventData = Record<string, unknown>;

export type IAppsEventPayload = {
  type: IAppsEventType;
  data: Record<string, unknown>;
};

//#endregion Types

//#region Stream

export const apps$ = websocketService.events$.pipe(
  filter((msg): msg is IWebSocketEvent<IAppsEventData> =>
    APPS_EVENTS.includes(msg.event as IAppsEventType),
  ),
  map(
    (msg): IAppsEventPayload => ({
      type: msg.event as IAppsEventType,
      data: msg.data,
    }),
  ),
  share(),
);

//#endregion Stream
