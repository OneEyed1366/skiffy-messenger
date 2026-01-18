// apps/v2/src/services/websocket/streams/channels$.ts

import { filter, map, share } from "rxjs";
import { websocketService, IWebSocketEvent } from "../socket";
import type { IChannel, IChannelMembership } from "@/types";

//#region Types

const CHANNEL_EVENTS = [
  "channel_created",
  "channel_deleted",
  "channel_updated",
  "channel_converted",
  "channel_member_updated",
  "channel_scheme_updated",
  "channel_restored",
  "direct_added",
  "group_added",
  "channel_viewed",
  "multiple_channels_viewed",
] as const;

type IChannelEventType = (typeof CHANNEL_EVENTS)[number];

type IChannelEventData = {
  channel?: string;
  channel_id?: string;
  channel_member?: string;
};

export type IChannelEventPayload = {
  type: IChannelEventType;
  channel: IChannel | null;
  channelId: string;
  channelMember: IChannelMembership | null;
};

//#endregion Types

//#region Stream

export const channels$ = websocketService.events$.pipe(
  filter((msg): msg is IWebSocketEvent<IChannelEventData> =>
    CHANNEL_EVENTS.includes(msg.event as IChannelEventType),
  ),
  map((msg): IChannelEventPayload => {
    let channel: IChannel | null = null;
    let channelMember: IChannelMembership | null = null;

    try {
      if (msg.data.channel) {
        channel = JSON.parse(msg.data.channel) as IChannel;
      }
      if (msg.data.channel_member) {
        channelMember = JSON.parse(
          msg.data.channel_member,
        ) as IChannelMembership;
      }
    } catch {
      console.warn("[channels$] Failed to parse channel data");
    }

    return {
      type: msg.event as IChannelEventType,
      channel,
      channelId:
        msg.data.channel_id || msg.broadcast?.channel_id || channel?.id || "",
      channelMember,
    };
  }),
  share(), // Share single pipeline across subscribers
);

//#endregion Stream
