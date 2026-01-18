// apps/v2/src/services/websocket/streams/groups$.ts

import { filter, map, share } from "rxjs";
import { websocketService, IWebSocketEvent } from "../socket";

//#region Types

const GROUP_EVENTS = [
  "received_group",
  "group_member_add",
  "group_member_deleted",
  "received_group_associated_to_team",
  "received_group_not_associated_to_team",
  "received_group_associated_to_channel",
  "received_group_not_associated_to_channel",
] as const;

type IGroupEventType = (typeof GROUP_EVENTS)[number];

type IGroupEventData = {
  group?: string;
  group_member?: string;
  group_id?: string;
  team_id?: string;
  channel_id?: string;
};

export type IGroupEventPayload = {
  type: IGroupEventType;
  group: IGroup | null;
  groupMember: IGroupMember | null;
  groupId: string;
  teamId: string;
  channelId: string;
};

type IGroup = {
  id: string;
  name: string;
  display_name: string;
  description: string;
  source: "ldap" | "custom";
  remote_id: string;
  create_at: number;
  update_at: number;
  delete_at: number;
  has_syncables: boolean;
  member_count: number;
  allow_reference: boolean;
};

type IGroupMember = {
  group_id: string;
  user_id: string;
  create_at: number;
  delete_at: number;
};

//#endregion Types

//#region Stream

export const groups$ = websocketService.events$.pipe(
  filter((msg): msg is IWebSocketEvent<IGroupEventData> =>
    GROUP_EVENTS.includes(msg.event as IGroupEventType),
  ),
  map((msg): IGroupEventPayload => {
    let group: IGroup | null = null;
    let groupMember: IGroupMember | null = null;

    try {
      if (msg.data.group) {
        group = JSON.parse(msg.data.group) as IGroup;
      }
      if (msg.data.group_member) {
        groupMember = JSON.parse(msg.data.group_member) as IGroupMember;
      }
    } catch {
      console.warn("[groups$] Failed to parse group data");
    }

    return {
      type: msg.event as IGroupEventType,
      group,
      groupMember,
      groupId: msg.data.group_id || group?.id || groupMember?.group_id || "",
      teamId: msg.data.team_id || msg.broadcast?.team_id || "",
      channelId: msg.data.channel_id || msg.broadcast?.channel_id || "",
    };
  }),
  share(),
);

//#endregion Stream
