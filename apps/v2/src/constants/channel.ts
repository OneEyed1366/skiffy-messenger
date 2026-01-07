/**
 * Channel-related constants
 * Migrated from: vendor/desktop/webapp/channels/src/utils/constants.tsx
 */

import {
  type IChannelType as IL0ChannelType,
  type IChannelCategoryType,
  CATEGORY_TYPES,
} from "@/types";

//#region Channel Types

/**
 * Channel type identifiers used in the API and data models
 */
export const CHANNEL_TYPES = {
  /** Direct message channel (1:1) */
  DM: "D",
  /** Group message channel (2+ users) */
  GM: "G",
  /** Public channel - visible to all team members */
  OPEN: "O",
  /** Private channel - invite only */
  PRIVATE: "P",
  /** Archived channel marker */
  ARCHIVED: "archive",
} as const satisfies Record<string, IL0ChannelType>;

// Re-export from L0 (single source of truth)
export type { IChannelType } from "@/types";

//#endregion

//#region Default Channels

/**
 * Default channel constants for new teams
 */
export const DEFAULT_CHANNELS = {
  /** Town Square - default channel for all teams */
  DEFAULT_CHANNEL: "town-square",
  DEFAULT_CHANNEL_UI_NAME: "Town Square",
  /** Off-Topic - secondary default channel */
  OFFTOPIC_CHANNEL: "off-topic",
  OFFTOPIC_CHANNEL_UI_NAME: "Off-Topic",
} as const;

//#endregion

//#region Notification Levels

/**
 * Channel notification levels for desktop/mobile/email
 */
export const NOTIFICATION_LEVELS = {
  /** Use global/account default setting */
  DEFAULT: "default",
  /** Notify for all messages */
  ALL: "all",
  /** Notify only for mentions */
  MENTION: "mention",
  /** Never notify */
  NONE: "none",
} as const;

export type INotificationLevel =
  (typeof NOTIFICATION_LEVELS)[keyof typeof NOTIFICATION_LEVELS];

/**
 * Desktop notification sound settings
 */
export const DESKTOP_SOUND = {
  /** Use default sound */
  DEFAULT: "default",
  /** Sound enabled */
  ON: "on",
  /** Sound disabled */
  OFF: "off",
} as const;

export type IDesktopSound = (typeof DESKTOP_SOUND)[keyof typeof DESKTOP_SOUND];

/**
 * Ignore channel mentions setting (@channel, @all, @here)
 */
export const IGNORE_CHANNEL_MENTIONS = {
  /** Ignore channel-wide mentions */
  ON: "on",
  /** Do not ignore channel-wide mentions */
  OFF: "off",
  /** Use default setting */
  DEFAULT: "default",
} as const;

export type IIgnoreChannelMentions =
  (typeof IGNORE_CHANNEL_MENTIONS)[keyof typeof IGNORE_CHANNEL_MENTIONS];

/**
 * Auto-follow threads in channel setting
 */
export const CHANNEL_AUTO_FOLLOW_THREADS = {
  /** Automatically follow threads */
  ON: "on",
  /** Do not automatically follow threads */
  OFF: "off",
} as const;

export type IChannelAutoFollowThreads =
  (typeof CHANNEL_AUTO_FOLLOW_THREADS)[keyof typeof CHANNEL_AUTO_FOLLOW_THREADS];

//#endregion

//#region Sidebar Grouping

/**
 * Unread channel grouping options
 */
export const GROUP_UNREAD_CHANNELS = {
  /** Disable unread grouping */
  DISABLED: "disabled",
  /** Group unreads by default (on) */
  DEFAULT_ON: "default_on",
  /** Group unreads disabled by default */
  DEFAULT_OFF: "default_off",
} as const;

export type IGroupUnreadChannels =
  (typeof GROUP_UNREAD_CHANNELS)[keyof typeof GROUP_UNREAD_CHANNELS];

/**
 * Special sidebar channel groups
 */
export const SIDEBAR_CHANNEL_GROUPS = {
  /** Unread channels group */
  UNREADS: "unreads",
  /** Favorite channels group */
  FAVORITE: "favorite",
} as const;

export type ISidebarChannelGroup =
  (typeof SIDEBAR_CHANNEL_GROUPS)[keyof typeof SIDEBAR_CHANNEL_GROUPS];

/**
 * Dragging states for sidebar
 */
export const DRAGGING_STATES = {
  CAPTURE: "capture",
  BEFORE: "before",
  DURING: "during",
} as const;

export type IDraggingState =
  (typeof DRAGGING_STATES)[keyof typeof DRAGGING_STATES];

/**
 * Dragging state types for sidebar
 */
export const DRAGGING_STATE_TYPES = {
  CATEGORY: "category",
  CHANNEL: "channel",
  DM: "DM",
  MIXED_CHANNELS: "mixed_channels",
} as const;

export type IDraggingStateType =
  (typeof DRAGGING_STATE_TYPES)[keyof typeof DRAGGING_STATE_TYPES];

//#endregion

//#region Channel Limits

/**
 * Channel-related limits and constraints
 */
export const CHANNEL_LIMITS = {
  /** Minimum channel name length */
  MIN_CHANNELNAME_LENGTH: 1,
  /** Maximum channel name length */
  MAX_CHANNELNAME_LENGTH: 64,
  /** Default shortened URL length for display */
  DEFAULT_CHANNELURL_SHORTEN_LENGTH: 52,
  /** Maximum channel purpose/description length */
  MAX_CHANNELPURPOSE_LENGTH: 250,
  /** Maximum channels per team */
  DEFAULT_MAX_CHANNELS_PER_TEAM: 2000,
  /** Maximum notifications per channel */
  DEFAULT_MAX_NOTIFICATIONS_PER_CHANNEL: 1000,
  /** Channel ID string length */
  CHANNEL_ID_LENGTH: 26,
  /** Maximum users in group message */
  MAX_USERS_IN_GM: 8,
  /** Minimum users in group message */
  MIN_USERS_IN_GM: 3,
  /** Maximum DMs to show in sidebar */
  MAX_DMS: 20,
  /** Maximum channels to show in popover */
  MAX_CHANNEL_POPOVER_COUNT: 100,
  /** Available DM/GM show counts for settings */
  DM_AND_GM_SHOW_COUNTS: [10, 15, 20, 40],
  /** Highest DM show count option */
  HIGHEST_DM_SHOW_COUNT: 10000,
} as const;

//#endregion

//#region Category Types

// Re-export from L0 (single source of truth)
export { CATEGORY_TYPES };
export type { IChannelCategoryType as ICategoryType };

//#endregion

//#region Mark Unread

/**
 * Channel mark as unread behavior options
 */
export const MARK_UNREAD = {
  /** Mark as unread for all messages */
  ALL: "all",
  /** Mark as unread only for mentions */
  MENTION: "mention",
} as const;

export type IMarkUnread = (typeof MARK_UNREAD)[keyof typeof MARK_UNREAD];

//#endregion

//#region Special Mentions

/**
 * Special channel-wide mention keywords
 */
export const SPECIAL_MENTIONS = ["all", "channel", "here"] as const;

export type ISpecialMention = (typeof SPECIAL_MENTIONS)[number];

/**
 * Regex patterns for mention detection
 */
export const MENTION_PATTERNS = {
  /** Matches @all, @channel, @here */
  SPECIAL_MENTIONS: /(?:\B|\b_+)@(channel|all|here)(?!(\.|-|_)*[^\W_])/gi,
  /** Matches @all only */
  ALL_MENTION: /(?:\B|\b_+)@(all)(?!(\.|-|_)*[^\W_])/gi,
  /** Matches @channel only */
  CHANNEL_MENTION: /(?:\B|\b_+)@(channel)(?!(\.|-|_)*[^\W_])/gi,
  /** Matches @here only */
  HERE_MENTION: /(?:\B|\b_+)@(here)(?!(\.|-|_)*[^\W_])/gi,
  /** Matches @all or @channel */
  ALL_MEMBERS_MENTIONS: /(?:\B|\b_+)@(channel|all)(?!(\.|-|_)*[^\W_])/gi,
} as const;

/**
 * Threshold for warning before notifying all members
 */
export const NOTIFY_ALL_MEMBERS_THRESHOLD = 5;

//#endregion
