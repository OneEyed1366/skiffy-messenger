// apps/v2/src/services/websocket/streams/system$.ts

import { filter, map, share } from "rxjs";
import { websocketService, IWebSocketEvent } from "../socket";

//#region Types

const SYSTEM_EVENTS = [
  "hello",
  "config_changed",
  "license_changed",
  "plugin_enabled",
  "plugin_disabled",
  "plugin_statuses_changed",
  "first_admin_visit_marketplace_status_received",
  "persistent_notification_triggered",
] as const;

type ISystemEventType = (typeof SYSTEM_EVENTS)[number];

type ISystemEventData = {
  connection_id?: string;
  server_version?: string;
  [key: string]: unknown;
};

export type ISystemEventPayload = {
  type: ISystemEventType;
  connectionId: string;
  serverVersion: string;
  data: Record<string, unknown>;
};

//#endregion Types

//#region Stream

export const system$ = websocketService.events$.pipe(
  filter((msg): msg is IWebSocketEvent<ISystemEventData> =>
    SYSTEM_EVENTS.includes(msg.event as ISystemEventType),
  ),
  map(
    (msg): ISystemEventPayload => ({
      type: msg.event as ISystemEventType,
      connectionId: msg.data.connection_id || "",
      serverVersion: msg.data.server_version || "",
      data: msg.data,
    }),
  ),
  share(), // Share single pipeline across subscribers
);

//#endregion Stream
