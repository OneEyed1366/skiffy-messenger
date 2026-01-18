// apps/v2/src/services/websocket/streams/reactions$.ts

import { filter, map, throttleTime, share } from "rxjs";
import { websocketService, IWebSocketEvent } from "../socket";
import type { IReaction } from "@/types";

//#region Types

const REACTION_EVENTS = [
  "reaction_added",
  "reaction_removed",
  "emoji_added",
] as const;

type IReactionEventType = (typeof REACTION_EVENTS)[number];

type IReactionEventData = {
  reaction?: string;
};

export type IReactionEventPayload = {
  type: IReactionEventType;
  reaction: IReaction | null;
  postId: string;
};

//#endregion Types

//#region Stream

/**
 * Reaction events with throttling to prevent UI spam.
 */
export const reactions$ = websocketService.events$.pipe(
  filter((msg): msg is IWebSocketEvent<IReactionEventData> =>
    REACTION_EVENTS.includes(msg.event as IReactionEventType),
  ),
  throttleTime(500, undefined, { leading: true, trailing: true }),
  map((msg): IReactionEventPayload => {
    let reaction: IReaction | null = null;

    try {
      if (msg.data.reaction) {
        reaction = JSON.parse(msg.data.reaction) as IReaction;
      }
    } catch {
      console.warn("[reactions$] Failed to parse reaction");
    }

    return {
      type: msg.event as IReactionEventType,
      reaction,
      postId: reaction?.post_id || "",
    };
  }),
  share(), // Share single pipeline across subscribers
);

//#endregion Stream
