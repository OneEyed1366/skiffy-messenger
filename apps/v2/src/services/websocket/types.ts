// apps/v2/src/services/websocket/types.ts

import { WS_EVENTS } from "./constants";

//#region Event Name Types

export type IPostEventType = (typeof WS_EVENTS.POST)[number];
export type IChannelEventType = (typeof WS_EVENTS.CHANNEL)[number];
export type ITeamEventType = (typeof WS_EVENTS.TEAM)[number];
export type IUserEventType = (typeof WS_EVENTS.USER)[number];
export type ITypingEventType = (typeof WS_EVENTS.TYPING)[number];
export type IReactionEventType = (typeof WS_EVENTS.REACTION)[number];
export type IThreadEventType = (typeof WS_EVENTS.THREAD)[number];
export type IPreferenceEventType = (typeof WS_EVENTS.PREFERENCE)[number];
export type ISidebarEventType = (typeof WS_EVENTS.SIDEBAR)[number];
export type IDraftEventType = (typeof WS_EVENTS.DRAFT)[number];
export type IGroupEventType = (typeof WS_EVENTS.GROUP)[number];
export type IRoleEventType = (typeof WS_EVENTS.ROLE)[number];
export type ISystemEventType = (typeof WS_EVENTS.SYSTEM)[number];
export type IDialogEventType = (typeof WS_EVENTS.DIALOG)[number];
export type IAppsEventType = (typeof WS_EVENTS.APPS)[number];
export type IBookmarkEventType = (typeof WS_EVENTS.BOOKMARK)[number];
export type IBurnOnReadEventType = (typeof WS_EVENTS.BURN_ON_READ)[number];
export type ICloudEventType = (typeof WS_EVENTS.CLOUD)[number];
export type IScheduledPostEventType = (typeof WS_EVENTS.SCHEDULED_POST)[number];

/** Union of all WebSocket event names */
export type IWebSocketEventName =
  | IPostEventType
  | IChannelEventType
  | ITeamEventType
  | IUserEventType
  | ITypingEventType
  | IReactionEventType
  | IThreadEventType
  | IPreferenceEventType
  | ISidebarEventType
  | IDraftEventType
  | IGroupEventType
  | IRoleEventType
  | ISystemEventType
  | IDialogEventType
  | IAppsEventType
  | IBookmarkEventType
  | IBurnOnReadEventType
  | ICloudEventType
  | IScheduledPostEventType;

//#endregion Event Name Types

//#region Broadcast Types

/** WebSocket broadcast metadata */
export type IWebSocketBroadcast = {
  /** Channel ID for channel-scoped events */
  channel_id?: string;
  /** Team ID for team-scoped events */
  team_id?: string;
  /** User ID for user-scoped events */
  user_id?: string;
  /** User IDs to exclude from broadcast */
  omit_users?: Record<string, boolean>;
  /** Connection ID (for some events) */
  connection_id?: string;
  /** Whether to omit connection users */
  omit_connection_id?: string;
};

//#endregion Broadcast Types

//#region Subscription Context

/** Context passed to subscription handlers */
export type ISubscriptionContext = {
  /** TanStack Query client instance */
  queryClient: unknown; // QueryClient (avoid import for types file)
  /** Current authenticated user ID */
  currentUserId: string | null;
  /** Current team ID from route/store */
  currentTeamId: string | null;
};

//#endregion Subscription Context
