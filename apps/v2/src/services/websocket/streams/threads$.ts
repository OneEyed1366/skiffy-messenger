// apps/v2/src/services/websocket/streams/threads$.ts

import { filter, map, share } from "rxjs";
import { websocketService, IWebSocketEvent } from "../socket";
import type { IUserThread } from "@/types";

//#region Types

const THREAD_EVENTS = [
  "thread_updated",
  "thread_follow_changed",
  "thread_read_changed",
] as const;

type IThreadEventType = (typeof THREAD_EVENTS)[number];

type IThreadEventData = {
  thread?: string;
  thread_membership?: string;
  previous?: unknown;
};

export type IThreadEventPayload = {
  type: IThreadEventType;
  thread: IUserThread | null;
  threadId: string;
  isFollowing: boolean | null;
};

//#endregion Types

//#region Stream

export const threads$ = websocketService.events$.pipe(
  filter((msg): msg is IWebSocketEvent<IThreadEventData> =>
    THREAD_EVENTS.includes(msg.event as IThreadEventType),
  ),
  map((msg): IThreadEventPayload => {
    let thread: IUserThread | null = null;
    let isFollowing: boolean | null = null;

    try {
      if (msg.data.thread) {
        thread = JSON.parse(msg.data.thread) as IUserThread;
      }
      if (msg.data.thread_membership) {
        const membership = JSON.parse(msg.data.thread_membership);
        isFollowing = membership.following ?? null;
      }
    } catch {
      console.warn("[threads$] Failed to parse thread data");
    }

    return {
      type: msg.event as IThreadEventType,
      thread,
      threadId: thread?.id || "",
      isFollowing,
    };
  }),
  share(), // Share single pipeline across subscribers
);

//#endregion Stream
