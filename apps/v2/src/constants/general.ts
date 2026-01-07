/**
 * General constants for UI and client logic
 * Migrated from: vendor/desktop/webapp/channels/src/utils/constants.tsx
 *
 * NOTE: Domain-specific constants are in their own files:
 * - Channel constants → channel.ts
 * - Post constants → post.ts
 * - File constants → file.ts
 * - Permission constants → permissions.ts
 * - WebSocket constants → websocket.ts
 * - Team constants → team.ts
 */

import { type IUserStatusValue as IL0UserStatusValue } from "@/types";

//#region User Statuses

export const USER_STATUSES = {
  OUT_OF_OFFICE: "ooo",
  OFFLINE: "offline",
  AWAY: "away",
  ONLINE: "online",
  DND: "dnd",
} as const satisfies Record<string, IL0UserStatusValue>;

export type IUserStatusKey = keyof typeof USER_STATUSES;
// Re-export from L0 (single source of truth)
export type { IUserStatusValue } from "@/types";

//#endregion

//#region Item Status

export const ITEM_STATUS = {
  NONE: "none",
  SUCCESS: "success",
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
} as const;

export type IItemStatusKey = keyof typeof ITEM_STATUS;
export type IItemStatusValue = (typeof ITEM_STATUS)[IItemStatusKey];

//#endregion

//#region Preferences

export const PREFERENCES = {
  // Categories
  CATEGORY_CHANNEL_OPEN_TIME: "channel_open_time",
  CATEGORY_DIRECT_CHANNEL_SHOW: "direct_channel_show",
  CATEGORY_GROUP_CHANNEL_SHOW: "group_channel_show",
  CATEGORY_DISPLAY_SETTINGS: "display_settings",
  CATEGORY_SIDEBAR_SETTINGS: "sidebar_settings",
  CATEGORY_ADVANCED_SETTINGS: "advanced_settings",
  CATEGORY_THEME: "theme",
  CATEGORY_NOTIFICATIONS: "notifications",
  CATEGORY_EMOJI: "emoji",

  // Display settings
  CHANNEL_DISPLAY_MODE: "channel_display_mode",
  CHANNEL_DISPLAY_MODE_CENTERED: "centered",
  CHANNEL_DISPLAY_MODE_FULL_SCREEN: "full",
  CHANNEL_DISPLAY_MODE_DEFAULT: "full",

  MESSAGE_DISPLAY: "message_display",
  MESSAGE_DISPLAY_CLEAN: "clean",
  MESSAGE_DISPLAY_COMPACT: "compact",
  MESSAGE_DISPLAY_DEFAULT: "clean",

  // Usernames
  COLORIZE_USERNAMES: "colorize_usernames",
  COLORIZE_USERNAMES_DEFAULT: "true",

  // Threads
  COLLAPSED_REPLY_THREADS: "collapsed_reply_threads",
  COLLAPSED_REPLY_THREADS_OFF: "off",
  COLLAPSED_REPLY_THREADS_ON: "on",
  CLICK_TO_REPLY: "click_to_reply",
  CLICK_TO_REPLY_DEFAULT: "true",

  // Emoji
  EMOJI_SKINTONE: "emoji_skintone",
  RECENT_EMOJIS: "recent_emojis",
  ONE_CLICK_REACTIONS_ENABLED: "one_click_reactions_enabled",
  ONE_CLICK_REACTIONS_ENABLED_DEFAULT: "true",
  RENDER_EMOTICONS_AS_EMOJI: "render_emoticons_as_emoji",
  RENDER_EMOTICONS_AS_EMOJI_DEFAULT: "true",

  // Link previews
  LINK_PREVIEW_DISPLAY: "link_previews",
  LINK_PREVIEW_DISPLAY_DEFAULT: "true",
  COLLAPSE_DISPLAY: "collapse_previews",
  COLLAPSE_DISPLAY_DEFAULT: "false",

  // Status
  AVAILABILITY_STATUS_ON_POSTS: "availability_status_on_posts",
  AVAILABILITY_STATUS_ON_POSTS_DEFAULT: "true",

  // Time
  USE_MILITARY_TIME: "use_military_time",
  USE_MILITARY_TIME_DEFAULT: "false",

  // Unread
  UNREAD_SCROLL_POSITION: "unread_scroll_position",
  UNREAD_SCROLL_POSITION_START_FROM_LEFT: "start_from_left_off",
  UNREAD_SCROLL_POSITION_START_FROM_NEWEST: "start_from_newest",

  // Email intervals
  EMAIL_INTERVAL: "email_interval",
  INTERVAL_IMMEDIATE: 30,
  INTERVAL_FIFTEEN_MINUTES: 15 * 60,
  INTERVAL_HOUR: 60 * 60,
  INTERVAL_NEVER: 0,

  // Tutorial
  TUTORIAL_STEP: "tutorial_step",
  ONBOARDING: "onboarding",

  // Name format
  NAME_NAME_FORMAT: "name_format",

  // Advanced
  ADVANCED_TEXT_EDITOR: "advanced_text_editor",
} as const;

//#endregion

//#region Keyboard Keys (Desktop)

/**
 * KeyCodes for keyboard event handling (Desktop/Tauri)
 * Format: [KeyboardEvent.key, KeyboardEvent.keyCode]
 */
export const KEY_CODES = {
  BACKSPACE: ["Backspace", 8],
  TAB: ["Tab", 9],
  ENTER: ["Enter", 13],
  SHIFT: ["Shift", 16],
  CTRL: ["Control", 17],
  ALT: ["Alt", 18],
  CAPS_LOCK: ["CapsLock", 20],
  ESCAPE: ["Escape", 27],
  SPACE: [" ", 32],
  PAGE_UP: ["PageUp", 33],
  PAGE_DOWN: ["PageDown", 34],
  END: ["End", 35],
  HOME: ["Home", 36],
  LEFT: ["ArrowLeft", 37],
  UP: ["ArrowUp", 38],
  RIGHT: ["ArrowRight", 39],
  DOWN: ["ArrowDown", 40],
  INSERT: ["Insert", 45],
  DELETE: ["Delete", 46],

  // Numbers
  ZERO: ["0", 48],
  ONE: ["1", 49],
  TWO: ["2", 50],
  THREE: ["3", 51],
  FOUR: ["4", 52],
  FIVE: ["5", 53],
  SIX: ["6", 54],
  SEVEN: ["7", 55],
  EIGHT: ["8", 56],
  NINE: ["9", 57],

  // Letters
  A: ["a", 65],
  B: ["b", 66],
  C: ["c", 67],
  D: ["d", 68],
  E: ["e", 69],
  F: ["f", 70],
  G: ["g", 71],
  H: ["h", 72],
  I: ["i", 73],
  J: ["j", 74],
  K: ["k", 75],
  L: ["l", 76],
  M: ["m", 77],
  N: ["n", 78],
  O: ["o", 79],
  P: ["p", 80],
  Q: ["q", 81],
  R: ["r", 82],
  S: ["s", 83],
  T: ["t", 84],
  U: ["u", 85],
  V: ["v", 86],
  W: ["w", 87],
  X: ["x", 88],
  Y: ["y", 89],
  Z: ["z", 90],

  // Modifier keys
  CMD: ["Meta", 91],
  MENU: ["ContextMenu", 93],

  // Function keys
  F1: ["F1", 112],
  F2: ["F2", 113],
  F3: ["F3", 114],
  F4: ["F4", 115],
  F5: ["F5", 116],
  F6: ["F6", 117],
  F7: ["F7", 118],
  F8: ["F8", 119],
  F9: ["F9", 120],
  F10: ["F10", 121],
  F11: ["F11", 122],
  F12: ["F12", 123],

  // Punctuation
  SEMICOLON: [";", 186],
  EQUAL: ["=", 187],
  COMMA: [",", 188],
  DASH: ["-", 189],
  PERIOD: [".", 190],
  FORWARD_SLASH: ["/", 191],
  OPEN_BRACKET: ["[", 219],
  BACK_SLASH: ["\\", 220],
  CLOSE_BRACKET: ["]", 221],
} as const satisfies Record<string, readonly [string, number]>;

export type IKeyCodeKey = keyof typeof KEY_CODES;

//#endregion

//#region Validation Limits

export const VALIDATION_LIMITS = {
  // Team
  MIN_TEAMNAME_LENGTH: 2,
  MAX_TEAMNAME_LENGTH: 64,
  MAX_TEAMDESCRIPTION_LENGTH: 50,

  // Channel
  MIN_CHANNELNAME_LENGTH: 1,
  MAX_CHANNELNAME_LENGTH: 64,
  MAX_CHANNELPURPOSE_LENGTH: 250,

  // User
  MAX_FIRSTNAME_LENGTH: 64,
  MAX_LASTNAME_LENGTH: 64,
  MAX_EMAIL_LENGTH: 128,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 22,
  MAX_NICKNAME_LENGTH: 64,
  MIN_PASSWORD_LENGTH: 5,
  MAX_PASSWORD_LENGTH: 72,
  MAX_POSITION_LENGTH: 128,

  // Posts
  MAX_POST_LEN: 4000,
  DEFAULT_CHARACTER_LIMIT: 4000,

  // Files
  MAX_UPLOAD_FILES: 10,
  MAX_FILENAME_LENGTH: 35,

  // Other
  MAX_SITENAME_LENGTH: 30,
  MAX_CUSTOM_BRAND_TEXT_LENGTH: 500,
} as const;

//#endregion

//#region Validation Errors

export const VALIDATION_ERRORS = {
  USERNAME_REQUIRED: "USERNAME_REQUIRED",
  INVALID_LENGTH: "INVALID_LENGTH",
  INVALID_CHARACTERS: "INVALID_CHARACTERS",
  INVALID_FIRST_CHARACTER: "INVALID_FIRST_CHARACTER",
  RESERVED_NAME: "RESERVED_NAME",
  INVALID_LAST_CHARACTER: "INVALID_LAST_CHARACTER",
} as const;

export type IValidationErrorKey = keyof typeof VALIDATION_ERRORS;
export type IValidationErrorValue =
  (typeof VALIDATION_ERRORS)[IValidationErrorKey];

//#endregion

//#region Modal Identifiers

export const MODAL_IDENTIFIERS = {
  // Channel modals
  CHANNEL_INFO: "channel_info",
  CHANNEL_NOTIFICATIONS: "channel_notifications",
  CHANNEL_INVITE: "channel_invite",
  CHANNEL_MEMBERS: "channel_members",
  CHANNEL_SETTINGS: "channel_settings",
  DELETE_CHANNEL: "delete_channel",
  RENAME_CHANNEL: "rename_channel",
  LEAVE_PRIVATE_CHANNEL_MODAL: "leave_private_channel_modal",
  NEW_CHANNEL_MODAL: "new_channel_modal",
  MORE_CHANNELS: "more_channels",
  EDIT_CHANNEL_HEADER: "edit_channel_header",
  EDIT_CHANNEL_PURPOSE: "edit_channel_purpose",
  CONVERT_CHANNEL: "convert_channel",
  JOIN_CHANNEL_PROMPT: "join_channel_prompt",
  JOIN_PUBLIC_CHANNEL_MODAL: "join_public_channel_modal",

  // Team modals
  TEAM_SETTINGS: "team_settings",
  TEAM_MEMBERS: "team_members",
  LEAVE_TEAM: "leave_team",

  // User modals
  USER_SETTINGS: "user_settings",
  CUSTOM_STATUS: "custom_status",
  RESET_STATUS: "reset_status",
  CREATE_DM_CHANNEL: "create_dm_channel",

  // Post modals
  DELETE_POST: "delete_post",
  FORWARD_POST_MODAL: "forward_post_modal",
  POST_DELETED_MODAL: "post_deleted_modal",
  DELETE_DRAFT: "delete_draft_modal",
  SEND_DRAFT: "send_draft_modal",

  // File modals
  FILE_PREVIEW_MODAL: "file_preview_modal",
  GET_PUBLIC_LINK_MODAL: "get_public_link_modal",

  // General modals
  ABOUT: "about",
  CONFIRM: "confirm",
  QUICK_SWITCH: "quick_switch",
  KEYBOARD_SHORTCUTS_MODAL: "keyboard_shortcuts_modal",
  NOTIFICATIONS: "notifications",
  INVITATION: "invitation",
  EMAIL_INVITE: "email_invite",
  REMOVED_FROM_CHANNEL: "removed_from_channel",
  NO_INTERNET_CONNECTION: "no_internet_connection",
  INFO_TOAST: "info_toast",
  INTERACTIVE_DIALOG: "interactive_dialog",

  // Category modals
  EDIT_CATEGORY: "edit_category",
  DELETE_CATEGORY: "delete_category",

  // Group modals
  USER_GROUPS: "user_groups",
  USER_GROUPS_CREATE: "user_groups_create",
  VIEW_USER_GROUP: "view_user_group",
  ADD_USERS_TO_GROUP: "add_users_to_group",
  EDIT_GROUP_MODAL: "edit_group_modal",
  GROUP_MEMBERS: "group_members",

  // Thread modals
  MARK_ALL_THREADS_AS_READ: "mark_all_threads_as_read_modal",
  MOVE_THREAD_MODAL: "move_thread_modal",

  // Time picker modals
  DND_CUSTOM_TIME_PICKER: "dnd_custom_time_picker",
  POST_REMINDER_CUSTOM_TIME_PICKER: "post_reminder_custom_time_picker",
  SCHEDULED_POST_CUSTOM_TIME_MODAL: "scheduled_post_custom_time",
} as const;

export type IModalIdentifierKey = keyof typeof MODAL_IDENTIFIERS;
export type IModalIdentifierValue =
  (typeof MODAL_IDENTIFIERS)[IModalIdentifierKey];

//#endregion

//#region Teammate Name Display

export const TEAMMATE_NAME_DISPLAY = {
  SHOW_USERNAME: "username",
  SHOW_NICKNAME_FULLNAME: "nickname_full_name",
  SHOW_FULLNAME: "full_name",
} as const;

export type ITeammateNameDisplayKey = keyof typeof TEAMMATE_NAME_DISPLAY;
export type ITeammateNameDisplayValue =
  (typeof TEAMMATE_NAME_DISPLAY)[ITeammateNameDisplayKey];

//#endregion

//#region Upload Statuses

export const UPLOAD_STATUSES = {
  LOADING: "loading",
  COMPLETE: "complete",
  DEFAULT: "",
} as const;

export type IUploadStatusKey = keyof typeof UPLOAD_STATUSES;
export type IUploadStatusValue = (typeof UPLOAD_STATUSES)[IUploadStatusKey];

//#endregion

//#region RHS States

export const RHS_STATES = {
  MENTION: "mention",
  SEARCH: "search",
  FLAG: "flag",
  PIN: "pin",
  PLUGIN: "plugin",
  CHANNEL_FILES: "channel-files",
  CHANNEL_INFO: "channel-info",
  CHANNEL_MEMBERS: "channel-members",
  EDIT_HISTORY: "edit-history",
} as const;

export type IRHSStateKey = keyof typeof RHS_STATES;
export type IRHSStateValue = (typeof RHS_STATES)[IRHSStateKey];

//#endregion

//#region Timing Constants

export const TIMING = {
  SCROLL_DELAY: 2000,
  POST_COLLAPSE_TIMEOUT: 1000 * 60 * 5, // 5 minutes
  SAVE_DRAFT_TIMEOUT: 500,
  STATUS_INTERVAL: 60000,
  AUTOCOMPLETE_TIMEOUT: 100,
  ANIMATION_TIMEOUT: 1000,
  SEARCH_TIMEOUT_MILLISECONDS: 100,
  PERMALINK_FADEOUT: 5000,
} as const;

//#endregion

//#region Reserved Names

export const RESERVED_TEAM_NAMES = [
  "signup",
  "login",
  "admin",
  "channel",
  "post",
  "api",
  "oauth",
  "error",
  "help",
  "plugins",
  "playbooks",
  "boards",
] as const;

export const RESERVED_USERNAMES = [
  "valet",
  "all",
  "channel",
  "here",
  "matterbot",
  "system",
] as const;

//#endregion

//#region Limits

export const LIMITS = {
  MAX_DMS: 20,
  MAX_USERS_IN_GM: 8,
  MIN_USERS_IN_GM: 3,
  MAX_CHANNEL_POPOVER_COUNT: 100,
  DM_AND_GM_SHOW_COUNTS: [10, 15, 20, 40] as const,
  HIGHEST_DM_SHOW_COUNT: 10000,
  POST_CHUNK_SIZE: 60,
  PROFILE_CHUNK_SIZE: 100,
  POST_FOCUS_CONTEXT_RADIUS: 10,
  MAX_PREV_MSGS: 100,
} as const;

//#endregion

//#region Error Page Types

/**
 * Error page type identifiers for routing to specific error pages
 */
export const ERROR_PAGE_TYPES = {
  /** Local storage unavailable */
  LOCAL_STORAGE: "local_storage",
  /** OAuth access denied */
  OAUTH_ACCESS_DENIED: "oauth_access_denied",
  /** OAuth missing code parameter */
  OAUTH_MISSING_CODE: "oauth_missing_code",
  /** OAuth invalid parameter */
  OAUTH_INVALID_PARAM: "oauth_invalid_param",
  /** OAuth invalid redirect URL */
  OAUTH_INVALID_REDIRECT_URL: "oauth_invalid_redirect_url",
  /** Page not found (404) */
  PAGE_NOT_FOUND: "page_not_found",
  /** Permalink not found */
  PERMALINK_NOT_FOUND: "permalink_not_found",
  /** Team not found */
  TEAM_NOT_FOUND: "team_not_found",
  /** Channel not found */
  CHANNEL_NOT_FOUND: "channel_not_found",
  /** Post not found */
  POST_NOT_FOUND: "post_not_found",
  /** Cloud workspace archived */
  CLOUD_ARCHIVED: "cloud_archived",
  /** Magic link used while already logged in */
  MAGIC_LINK_ALREADY_LOGGED_IN: "magic_link_already_logged_in",
} as const;

export type IErrorPageType =
  (typeof ERROR_PAGE_TYPES)[keyof typeof ERROR_PAGE_TYPES];

//#endregion

//#region Data Search Types

/**
 * Search type identifiers for search functionality
 */
export const DATA_SEARCH_TYPES = {
  /** Search for files */
  FILES_SEARCH_TYPE: "files",
  /** Search for messages */
  MESSAGES_SEARCH_TYPE: "messages",
} as const;

export type IDataSearchType =
  (typeof DATA_SEARCH_TYPES)[keyof typeof DATA_SEARCH_TYPES];

//#endregion

//#region Page Load Context

/**
 * Context for page load events (initial load vs reconnection)
 */
export const PAGE_LOAD_CONTEXT = {
  /** Initial page load */
  PAGE_LOAD: "page_load",
  /** Reconnection after disconnect */
  RECONNECT: "reconnect",
} as const;

export type IPageLoadContext =
  (typeof PAGE_LOAD_CONTEXT)[keyof typeof PAGE_LOAD_CONTEXT];

//#endregion

//#region Pagination Defaults

/**
 * Default pagination and chunk sizes
 */
export const PAGINATION_DEFAULTS = {
  /** Default page size for lists */
  PAGE_SIZE_DEFAULT: 60,
  /** Default chunk size for loading user profiles */
  PROFILE_CHUNK_SIZE: 100,
  /** Default chunk size for loading channels */
  CHANNELS_CHUNK_SIZE: 50,
} as const;

//#endregion

//#region Locale Defaults

/**
 * Default locale for the application
 */
export const DEFAULT_LOCALE = "en";

//#endregion

//#region URL Schemes

/**
 * Default URL schemes that are auto-linked in messages
 */
export const DEFAULT_AUTOLINKED_URL_SCHEMES = [
  "http",
  "https",
  "ftp",
  "tel",
  "mailto",
  "git",
] as const;

//#endregion
