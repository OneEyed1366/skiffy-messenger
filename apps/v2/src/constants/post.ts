/**
 * Post-related constants
 * Migrated from: vendor/desktop/webapp/channels/src/utils/constants.tsx
 */

import { type IPostType as IL0PostType } from "@/types";

//#region Post Types

/**
 * System and custom post types used to identify special posts
 */
export const POST_TYPES = {
  // Channel membership
  JOIN_LEAVE: "system_join_leave",
  JOIN_CHANNEL: "system_join_channel",
  LEAVE_CHANNEL: "system_leave_channel",
  ADD_TO_CHANNEL: "system_add_to_channel",
  REMOVE_FROM_CHANNEL: "system_remove_from_channel",
  ADD_REMOVE: "system_add_remove",

  // Team membership
  JOIN_TEAM: "system_join_team",
  LEAVE_TEAM: "system_leave_team",
  ADD_TO_TEAM: "system_add_to_team",
  REMOVE_FROM_TEAM: "system_remove_from_team",

  // Channel changes
  HEADER_CHANGE: "system_header_change",
  DISPLAYNAME_CHANGE: "system_displayname_change",
  CONVERT_CHANNEL: "system_convert_channel",
  PURPOSE_CHANGE: "system_purpose_change",
  CHANNEL_DELETED: "system_channel_deleted",
  CHANNEL_UNARCHIVED: "system_channel_restored",

  // System messages
  SYSTEM_GENERIC: "system_generic",
  FAKE_PARENT_DELETED: "system_fake_parent_deleted",
  EPHEMERAL: "system_ephemeral",
  EPHEMERAL_ADD_TO_CHANNEL: "system_ephemeral_add_to_channel",

  // Guest user events
  GUEST_JOIN_CHANNEL: "system_guest_join_channel",
  ADD_GUEST_TO_CHANNEL: "system_add_guest_to_chan",
  JOIN_LEAVE_CHANNEL: "system_join_leave_channel",

  // User actions
  REMOVE_LINK_PREVIEW: "remove_link_preview",
  ME: "me",
  REMINDER: "reminder",

  // Combined activity
  COMBINED_USER_ACTIVITY: "system_combined_user_activity",

  // Bot events
  ADD_BOT_TEAMS_CHANNELS: "add_bot_teams_channels",

  // GM conversion
  GM_CONVERTED_TO_CHANNEL: "system_gm_to_channel",

  // Custom integrations
  WRANGLER: "system_wrangler",
  CUSTOM_CALLS: "custom_calls",
  CUSTOM_CALLS_RECORDING: "custom_calls_recording",
  CUSTOM_DATA_SPILLAGE_REPORT: "custom_spillage_report",

  // Special
  BURN_ON_READ: "burn_on_read",
} as const satisfies Record<string, IL0PostType>;

// Re-export from L0 (single source of truth)
export type { IPostType } from "@/types";

//#endregion

//#region Post Request Types

/**
 * Direction for fetching posts relative to a specific post ID
 */
export const POST_REQUEST_TYPES = {
  BEFORE_ID: "BEFORE_ID",
  AFTER_ID: "AFTER_ID",
} as const;

export type IPostRequestType =
  (typeof POST_REQUEST_TYPES)[keyof typeof POST_REQUEST_TYPES];

//#endregion

//#region Post List Row Identifiers

/**
 * Special row identifiers used in virtualized post lists
 */
export const POST_LIST_ROW_IDS = {
  DATE_LINE: "date-",
  START_OF_NEW_MESSAGES: "START_OF_NEW_MESSAGES",
  CHANNEL_INTRO_MESSAGE: "CHANNEL_INTRO_MESSAGE",
  OLDER_MESSAGES_LOADER: "OLDER_MESSAGES_LOADER",
  NEWER_MESSAGES_LOADER: "NEWER_MESSAGES_LOADER",
  LOAD_OLDER_MESSAGES_TRIGGER: "LOAD_OLDER_MESSAGES_TRIGGER",
  LOAD_NEWER_MESSAGES_TRIGGER: "LOAD_NEWER_MESSAGES_TRIGGER",
} as const;

//#endregion

//#region Post Status

/**
 * Post loading/sync states
 */
export const POST_STATUS = {
  LOADING: "loading",
  FAILED: "failed",
  DELETED: "deleted",
  UPDATED: "updated",
} as const;

export type IPostStatus = (typeof POST_STATUS)[keyof typeof POST_STATUS];

//#endregion

//#region Post Visibility

/**
 * Maximum number of posts that can be visible in a channel
 */
export const MAX_POST_VISIBILITY = 1000000;

/**
 * Number of posts to load per chunk
 */
export const POST_CHUNK_SIZE = 60;

/**
 * Number of posts around a focused post to load
 */
export const POST_FOCUS_CONTEXT_RADIUS = 10;

/**
 * Maximum post length in characters
 */
export const MAX_POST_LEN = 4000;

//#endregion

//#region System Message Prefix

/**
 * Prefix for system message post types
 */
export const SYSTEM_MESSAGE_PREFIX = "system_";

/**
 * Auto responder post type
 */
export const AUTO_RESPONDER = "system_auto_responder";

//#endregion

//#region Burn On Read Duration Constants

/**
 * Burn on read duration constants (in seconds)
 */
export const BURN_ON_READ = {
  /** 1 minute duration */
  DURATION_1_MINUTE: 60,
  /** 5 minutes duration */
  DURATION_5_MINUTES: 300,
  /** 10 minutes duration */
  DURATION_10_MINUTES: 600,
  /** 30 minutes duration */
  DURATION_30_MINUTES: 1800,
  /** 1 hour duration */
  DURATION_1_HOUR: 3600,
  /** 8 hours duration */
  DURATION_8_HOURS: 28800,
  /** Default duration (10 minutes) */
  DURATION_DEFAULT: 600,
  /** Max TTL 2 minutes */
  MAX_TTL_2_MINUTES: 120,
  /** Max TTL 5 minutes */
  MAX_TTL_5_MINUTES: 300,
  /** Max TTL 1 day */
  MAX_TTL_1_DAY: 86400,
  /** Max TTL 3 days */
  MAX_TTL_3_DAYS: 259200,
  /** Max TTL 7 days */
  MAX_TTL_7_DAYS: 604800,
  /** Max TTL 14 days */
  MAX_TTL_14_DAYS: 1209600,
  /** Max TTL 30 days */
  MAX_TTL_30_DAYS: 2592000,
  /** Default max TTL (7 days) */
  MAX_TTL_DEFAULT: 604800,
} as const;

//#endregion

//#region User Activity Post Types

/**
 * Post types related to user activity (joins, leaves, etc.)
 * Used for combining multiple activity posts into one
 */
export const USER_ACTIVITY_POST_TYPES = [
  POST_TYPES.ADD_TO_CHANNEL,
  POST_TYPES.JOIN_CHANNEL,
  POST_TYPES.LEAVE_CHANNEL,
  POST_TYPES.REMOVE_FROM_CHANNEL,
  POST_TYPES.ADD_TO_TEAM,
  POST_TYPES.JOIN_TEAM,
  POST_TYPES.LEAVE_TEAM,
  POST_TYPES.REMOVE_FROM_TEAM,
] as const;

//#endregion

//#region Message Types

/**
 * Message types for posts
 * Used to distinguish between root posts and comments
 */
export const MESSAGE_TYPES = {
  /** Root post in channel */
  POST: "post",
  /** Reply/comment to a post */
  COMMENT: "comment",
} as const;

export type IMessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];

//#endregion

//#region Post Types to Ignore

/**
 * Post types that should be ignored in certain contexts (e.g., unread counts)
 */
export const IGNORE_POST_TYPES = [
  POST_TYPES.JOIN_LEAVE,
  POST_TYPES.JOIN_TEAM,
  POST_TYPES.LEAVE_TEAM,
  POST_TYPES.JOIN_CHANNEL,
  POST_TYPES.LEAVE_CHANNEL,
  POST_TYPES.REMOVE_FROM_CHANNEL,
  POST_TYPES.ADD_REMOVE,
] as const;

//#endregion

//#region Post Socket Events

/**
 * WebSocket events related to posts
 */
export const POST_SOCKET_EVENTS = {
  POSTED: "posted",
  POST_EDITED: "post_edited",
  POST_DELETED: "post_deleted",
  POST_UPDATED: "post_updated",
  POST_UNREAD: "post_unread",
  BURN_ON_READ_POST_REVEALED: "post_revealed",
  BURN_ON_READ_POST_BURNED: "post_burned",
  BURN_ON_READ_ALL_REVEALED: "burn_on_read_all_revealed",
  POST_ACKNOWLEDGEMENT_ADDED: "post_acknowledgement_added",
  POST_ACKNOWLEDGEMENT_REMOVED: "post_acknowledgement_removed",
} as const;

export type IPostSocketEvent =
  (typeof POST_SOCKET_EVENTS)[keyof typeof POST_SOCKET_EVENTS];

//#endregion

//#region Post Locations

/**
 * Locations where posts can be rendered
 */
export const POST_LOCATIONS = {
  CENTER: "CENTER",
  RHS_ROOT: "RHS_ROOT",
  RHS_COMMENT: "RHS_COMMENT",
  SEARCH: "SEARCH",
  NO_WHERE: "NO_WHERE",
  MODAL: "MODAL",
} as const;

export type IPostLocation =
  (typeof POST_LOCATIONS)[keyof typeof POST_LOCATIONS];

//#endregion

//#region Advanced Text Editor

/**
 * Text editor context types
 */
export const ADVANCED_TEXT_EDITOR = {
  COMMENT: "comment",
  POST: "post",
  EDIT: "edit",
} as const;

export type IAdvancedTextEditorType =
  (typeof ADVANCED_TEXT_EDITOR)[keyof typeof ADVANCED_TEXT_EDITOR];

/**
 * Text editor textbox element IDs
 */
export const ADVANCED_TEXT_EDITOR_TEXTBOX_IDS = {
  IN_CENTER: "post_textbox",
  IN_RHS_COMMENT: "reply_textbox",
  IN_MODAL: "modal_textbox",
  IN_EDIT_MODE: "edit_textbox",
  DEFAULT: "textbox",
} as const;

//#endregion

//#region Storage Prefixes

/**
 * Storage key prefixes for post-related data
 */
export const POST_STORAGE_PREFIXES = {
  COMMENT_DRAFT: "comment_draft_",
  EDIT_DRAFT: "edit_draft_",
  DRAFT: "draft_",
  EMBED_VISIBLE: "isVisible_",
  INLINE_IMAGE_VISIBLE: "isInlineImageVisible_",
} as const;

//#endregion

//#region Scroll Types

/**
 * Post list scroll behavior types
 */
export const POST_SCROLL_TYPES = {
  FREE: 1,
  BOTTOM: 2,
  SIDEBAR_OPEN: 3,
  NEW_MESSAGE: 4,
  POST: 5,
} as const;

export type IPostScrollType =
  (typeof POST_SCROLL_TYPES)[keyof typeof POST_SCROLL_TYPES];

//#endregion
