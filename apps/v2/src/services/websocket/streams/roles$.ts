// apps/v2/src/services/websocket/streams/roles$.ts

import { filter, map, share } from "rxjs";
import { websocketService, IWebSocketEvent } from "../socket";

//#region Types

const ROLE_EVENTS = [
  "role_added",
  "role_removed",
  "role_updated",
  "memberrole_updated",
] as const;

type IRoleEventType = (typeof ROLE_EVENTS)[number];

type IRoleEventData = {
  role?: string;
  member?: string;
};

export type IRoleEventPayload = {
  type: IRoleEventType;
  role: IRole | null;
  member: IMemberRole | null;
};

type IRole = {
  id: string;
  name: string;
  display_name: string;
  description: string;
  permissions: string[];
  scheme_managed: boolean;
  built_in: boolean;
  create_at: number;
  update_at: number;
  delete_at: number;
};

type IMemberRole = {
  user_id: string;
  roles: string;
  scheme_admin: boolean;
  scheme_user: boolean;
  explicit_roles: string;
};

//#endregion Types

//#region Stream

export const roles$ = websocketService.events$.pipe(
  filter((msg): msg is IWebSocketEvent<IRoleEventData> =>
    ROLE_EVENTS.includes(msg.event as IRoleEventType),
  ),
  map((msg): IRoleEventPayload => {
    let role: IRole | null = null;
    let member: IMemberRole | null = null;

    try {
      if (msg.data.role) {
        role = JSON.parse(msg.data.role) as IRole;
      }
      if (msg.data.member) {
        member = JSON.parse(msg.data.member) as IMemberRole;
      }
    } catch {
      console.warn("[roles$] Failed to parse role data");
    }

    return {
      type: msg.event as IRoleEventType,
      role,
      member,
    };
  }),
  share(),
);

//#endregion Stream
