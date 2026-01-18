// apps/v2/src/services/websocket/streams/teams$.ts

import { filter, map, share } from "rxjs";
import { websocketService, IWebSocketEvent } from "../socket";
import type { ITeam } from "@/types";

//#region Types

const TEAM_EVENTS = [
  "added_to_team",
  "leave_team",
  "update_team",
  "delete_team",
  "update_team_scheme",
  "new_user",
  "join_team",
] as const;

type ITeamEventType = (typeof TEAM_EVENTS)[number];

type ITeamEventData = {
  team?: string;
  team_id?: string;
  user_id?: string;
};

export type ITeamEventPayload = {
  type: ITeamEventType;
  team: ITeam | null;
  teamId: string;
  userId: string;
};

//#endregion Types

//#region Stream

export const teams$ = websocketService.events$.pipe(
  filter((msg): msg is IWebSocketEvent<ITeamEventData> =>
    TEAM_EVENTS.includes(msg.event as ITeamEventType),
  ),
  map((msg): ITeamEventPayload => {
    let team: ITeam | null = null;

    try {
      if (msg.data.team) {
        team = JSON.parse(msg.data.team) as ITeam;
      }
    } catch {
      console.warn("[teams$] Failed to parse team data");
    }

    return {
      type: msg.event as ITeamEventType,
      team,
      teamId: msg.data.team_id || msg.broadcast?.team_id || team?.id || "",
      userId: msg.data.user_id || msg.broadcast?.user_id || "",
    };
  }),
  share(), // Share single pipeline across subscribers
);

//#endregion Stream
