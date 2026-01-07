// apps/v2/src/types/channel.ts

/**
 * Channel-related type definitions
 * Migrated from: vendor/desktop/webapp/platform/types/src/channels.ts
 */

//#region Channel Types

export type IChannelType = "O" | "P" | "D" | "G" | "archive";

export type IChannel = {
  id: string;
  create_at: number;
  update_at: number;
  delete_at: number;
  team_id: string;
  type: IChannelType;
  display_name: string;
  name: string;
  header: string;
  purpose: string;
  last_post_at: number;
  last_root_post_at: number;
  creator_id: string;
  scheme_id: string;
  teammate_id?: string;
  status?: string;
  group_constrained: boolean;
  shared?: boolean;
  props?: Record<string, unknown>;
  policy_id?: string | null;
  banner_info?: IChannelBanner;
};

export type IServerChannel = IChannel & {
  total_msg_count: number;
  total_msg_count_root: number;
};

export type IChannelWithTeamData = IChannel & {
  team_display_name: string;
  team_name: string;
  team_update_at: number;
};

//#endregion

//#region Channel Banner

export type IChannelBanner = {
  enabled?: boolean;
  text?: string;
  background_color?: string;
};

//#endregion

//#region Channel Membership

export type IChannelNotifyProps = {
  desktop_threads: "default" | "all" | "mention" | "none";
  desktop: "default" | "all" | "mention" | "none";
  desktop_sound: "default" | "on" | "off";
  desktop_notification_sound?: string;
  email: "default" | "all" | "mention" | "none";
  mark_unread: "all" | "mention";
  push: "default" | "all" | "mention" | "none";
  push_threads: "default" | "all" | "mention" | "none";
  ignore_channel_mentions: "default" | "off" | "on";
  channel_auto_follow_threads: "off" | "on";
};

export type IChannelMembership = {
  channel_id: string;
  user_id: string;
  roles: string;
  last_viewed_at: number;
  msg_count: number;
  msg_count_root: number;
  mention_count: number;
  mention_count_root: number;
  urgent_mention_count: number;
  notify_props: Partial<IChannelNotifyProps>;
  last_update_at: number;
  scheme_user: boolean;
  scheme_admin: boolean;
  post_root_id?: string;
};

//#endregion

//#region Channel Unread

export type IChannelUnread = {
  channel_id: string;
  user_id: string;
  team_id: string;
  msg_count: number;
  msg_count_root: number;
  mention_count: number;
  urgent_mention_count: number;
  mention_count_root: number;
  last_viewed_at: number;
  deltaMsgs: number;
};

//#endregion

//#region Channel Stats

export type IChannelStats = {
  channel_id: string;
  member_count: number;
  guest_count: number;
  pinnedpost_count: number;
  files_count: number;
};

export type IChannelMessageCount = {
  total: number;
  root: number;
};

//#endregion

//#region Channel Moderation

export type IChannelModeration = {
  name: string;
  roles: {
    guests?: { value: boolean; enabled: boolean };
    members: { value: boolean; enabled: boolean };
    admins: { value: boolean; enabled: boolean };
  };
};

export type IChannelModerationPatch = {
  name: string;
  roles: {
    guests?: boolean;
    members?: boolean;
  };
};

//#endregion

//#region Channel Member Count

export type IChannelMemberCountByGroup = {
  group_id: string;
  channel_member_count: number;
  channel_member_timezones_count: number;
};

//#endregion

//#region Channel Search

export type IChannelSearchOpts = {
  nonAdminSearch?: boolean;
  exclude_default_channels?: boolean;
  not_associated_to_group?: string;
  team_ids?: string[];
  group_constrained?: boolean;
  exclude_group_constrained?: boolean;
  public?: boolean;
  private?: boolean;
  include_deleted?: boolean;
  include_search_by_id?: boolean;
  exclude_remote?: boolean;
  deleted?: boolean;
  page?: number;
  per_page?: number;
};

//#endregion

//#region Channel View Response

export type IChannelViewResponse = {
  status: string;
  last_viewed_at_times: Record<string, number>;
};

//#endregion
