// apps/v2/src/services/websocket/streams/users$.ts

import { filter, map, distinctUntilChanged, share } from "rxjs";
import { websocketService, IWebSocketEvent } from "../socket";
import type { IUserProfile, IUserStatusValue } from "@/types";

//#region Types

const USER_EVENTS = [
  "user_added",
  "user_removed",
  "user_updated",
  "user_role_updated",
  "status_change",
  "user_activation_status_change",
] as const;

type IUserEventType = (typeof USER_EVENTS)[number];

type IUserEventData = {
  user?: string;
  user_id?: string;
  status?: string;
};

export type IUserEventPayload = {
  type: IUserEventType;
  user: IUserProfile | null;
  userId: string;
  status: IUserStatusValue | null;
};

//#endregion Types

//#region Stream

export const users$ = websocketService.events$.pipe(
  filter((msg): msg is IWebSocketEvent<IUserEventData> =>
    USER_EVENTS.includes(msg.event as IUserEventType),
  ),
  map((msg): IUserEventPayload => {
    let user: IUserProfile | null = null;
    let status: IUserStatusValue | null = null;

    try {
      if (msg.data.user) {
        user = JSON.parse(msg.data.user) as IUserProfile;
      }
      if (msg.data.status) {
        status = msg.data.status as IUserStatusValue;
      }
    } catch {
      console.warn("[users$] Failed to parse user data");
    }

    return {
      type: msg.event as IUserEventType,
      user,
      userId: msg.data.user_id || msg.broadcast?.user_id || user?.id || "",
      status,
    };
  }),
  // Dedupe identical consecutive updates for same user
  distinctUntilChanged(
    (prev, curr) =>
      prev.userId === curr.userId &&
      prev.type === curr.type &&
      prev.status === curr.status &&
      JSON.stringify(prev.user) === JSON.stringify(curr.user),
  ),
  share(), // Share single pipeline across subscribers
);

//#endregion Stream
