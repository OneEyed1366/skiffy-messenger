// apps/v2/src/types/user.ts

/**
 * User-related type definitions
 * Migrated from: vendor/desktop/webapp/platform/types/src/users.ts
 */

//#region Notification Settings

export type IDesktopNotificationSound =
  | "default"
  | "Bing"
  | "Crackle"
  | "Down"
  | "Hello"
  | "Ripple"
  | "Upstairs";

export type ICallsNotificationSound =
  | "Dynamic"
  | "Calm"
  | "Urgent"
  | "Cheerful";

export type INotifyLevel = "default" | "all" | "mention" | "none";

export type IUserNotifyProps = {
  desktop: INotifyLevel;
  desktop_sound: "default" | "true" | "false";
  email: "true" | "false";
  mark_unread: "all" | "mention";
  push: INotifyLevel;
  push_status: "ooo" | "offline" | "away" | "dnd" | "online";
  comments: "never" | "root" | "any";
  first_name: "true" | "false";
  channel: "true" | "false";
  mention_keys: string;
  highlight_keys: string;
  desktop_notification_sound?: IDesktopNotificationSound;
  calls_desktop_sound?: "true" | "false";
  calls_notification_sound?: ICallsNotificationSound;
  desktop_threads?: INotifyLevel;
  email_threads?: INotifyLevel;
  push_threads?: INotifyLevel;
  auto_responder_active?: "true" | "false";
  auto_responder_message?: string;
  calls_mobile_sound?: "true" | "false" | "";
  calls_mobile_notification_sound?: ICallsNotificationSound | "";
};

//#endregion

//#region Timezone

export type IUserTimezone = {
  useAutomaticTimezone: boolean | string;
  automaticTimezone: string;
  manualTimezone: string;
};

//#endregion

//#region User Profile

export type IUserProfile = {
  id: string;
  create_at: number;
  update_at: number;
  delete_at: number;
  username: string;
  auth_data?: string;
  auth_service: string;
  email: string;
  nickname: string;
  first_name: string;
  last_name: string;
  position: string;
  roles: string;
  props: Record<string, string>;
  notify_props: IUserNotifyProps;
  last_password_update: number;
  last_picture_update: number;
  locale: string;
  timezone?: IUserTimezone;
  mfa_active: boolean;
  last_activity_at: number;
  is_bot: boolean;
  bot_description: string;
  terms_of_service_id: string;
  terms_of_service_create_at: number;
  remote_id?: string;
  status?: string;
};

export type IUserProfileWithLastViewAt = IUserProfile & {
  last_viewed_at: number;
};

//#endregion

//#region User Status

export type IUserStatusValue = "online" | "away" | "offline" | "dnd" | "ooo";

export type IUserStatus = {
  user_id: string;
  status: IUserStatusValue;
  manual?: boolean;
  last_activity_at?: number;
  active_channel?: string;
  dnd_end_time?: number;
};

//#endregion

//#region Custom Status

export type ICustomStatusDuration =
  | ""
  | "thirty_minutes"
  | "one_hour"
  | "four_hours"
  | "today"
  | "this_week"
  | "date_and_time"
  | "custom_date_time";

export type IUserCustomStatus = {
  emoji: string;
  text: string;
  duration: ICustomStatusDuration;
  expires_at?: string;
};

//#endregion

//#region Access Token

export type IUserAccessToken = {
  id: string;
  token?: string;
  user_id: string;
  description: string;
  is_active: boolean;
};

//#endregion

//#region Statistics

export type IUsersStats = {
  total_users_count: number;
};

export type IFilteredUsersStatsOpts = {
  in_team?: string;
  in_channel?: string;
  include_deleted?: boolean;
  include_bots?: boolean;
  include_remote_users?: boolean;
  roles?: string[];
  channel_roles?: string[];
  team_roles?: string[];
};

//#endregion
