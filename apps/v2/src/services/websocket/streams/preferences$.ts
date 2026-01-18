// apps/v2/src/services/websocket/streams/preferences$.ts

import { filter, map, share } from "rxjs";
import { websocketService, IWebSocketEvent } from "../socket";
import type { IPreference } from "@/types";

//#region Types

const PREFERENCE_EVENTS = [
  "preference_changed",
  "preferences_changed",
  "preferences_deleted",
] as const;

type IPreferenceEventType = (typeof PREFERENCE_EVENTS)[number];

type IPreferenceEventData = {
  preference?: string;
  preferences?: string;
};

export type IPreferenceEventPayload = {
  type: IPreferenceEventType;
  preferences: IPreference[];
};

//#endregion Types

//#region Stream

export const preferences$ = websocketService.events$.pipe(
  filter((msg): msg is IWebSocketEvent<IPreferenceEventData> =>
    PREFERENCE_EVENTS.includes(msg.event as IPreferenceEventType),
  ),
  map((msg): IPreferenceEventPayload => {
    let preferences: IPreference[] = [];

    try {
      if (msg.data.preference) {
        preferences = [JSON.parse(msg.data.preference) as IPreference];
      }
      if (msg.data.preferences) {
        preferences = JSON.parse(msg.data.preferences) as IPreference[];
      }
    } catch {
      console.warn("[preferences$] Failed to parse preference data");
    }

    return {
      type: msg.event as IPreferenceEventType,
      preferences,
    };
  }),
  share(), // Share single pipeline across subscribers
);

//#endregion Stream
