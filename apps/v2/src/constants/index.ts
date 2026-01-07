/**
 * Constants barrel export
 * Re-exports all constants from domain-specific files
 */

//#region General Constants

export {
  // User statuses
  USER_STATUSES,
  type IUserStatusKey,
  type IUserStatusValue,
  // Item status
  ITEM_STATUS,
  type IItemStatusKey,
  type IItemStatusValue,
  // Preferences
  PREFERENCES,
  // Keyboard (Desktop)
  KEY_CODES,
  type IKeyCodeKey,
  // Validation
  VALIDATION_LIMITS,
  VALIDATION_ERRORS,
  type IValidationErrorKey,
  type IValidationErrorValue,
  // Modals
  MODAL_IDENTIFIERS,
  type IModalIdentifierKey,
  type IModalIdentifierValue,
  // Display
  TEAMMATE_NAME_DISPLAY,
  type ITeammateNameDisplayKey,
  type ITeammateNameDisplayValue,
  // Upload
  UPLOAD_STATUSES,
  type IUploadStatusKey,
  type IUploadStatusValue,
  // RHS
  RHS_STATES,
  type IRHSStateKey,
  type IRHSStateValue,
  // Timing
  TIMING,
  // Reserved names
  RESERVED_TEAM_NAMES,
  RESERVED_USERNAMES,
  // Limits
  LIMITS,
  // Error pages
  ERROR_PAGE_TYPES,
  type IErrorPageType,
  // Search types
  DATA_SEARCH_TYPES,
  type IDataSearchType,
  // Page load context
  PAGE_LOAD_CONTEXT,
  type IPageLoadContext,
  // Pagination
  PAGINATION_DEFAULTS,
  // Locale
  DEFAULT_LOCALE,
  // URL schemes
  DEFAULT_AUTOLINKED_URL_SCHEMES,
} from "./general";

//#endregion

//#region Channel Constants

export {
  CHANNEL_TYPES,
  type IChannelType,
  DEFAULT_CHANNELS,
  NOTIFICATION_LEVELS,
  type INotificationLevel,
  DESKTOP_SOUND,
  type IDesktopSound,
  IGNORE_CHANNEL_MENTIONS,
  type IIgnoreChannelMentions,
  CHANNEL_AUTO_FOLLOW_THREADS,
  type IChannelAutoFollowThreads,
  GROUP_UNREAD_CHANNELS,
  type IGroupUnreadChannels,
  SIDEBAR_CHANNEL_GROUPS,
  type ISidebarChannelGroup,
  DRAGGING_STATES,
  type IDraggingState,
  DRAGGING_STATE_TYPES,
  type IDraggingStateType,
  CHANNEL_LIMITS,
  CATEGORY_TYPES,
  type ICategoryType,
  MARK_UNREAD,
  type IMarkUnread,
  SPECIAL_MENTIONS,
  type ISpecialMention,
  MENTION_PATTERNS,
  NOTIFY_ALL_MEMBERS_THRESHOLD,
} from "./channel";

//#endregion

//#region Post Constants

export {
  POST_TYPES,
  type IPostType,
  POST_REQUEST_TYPES,
  type IPostRequestType,
  POST_LIST_ROW_IDS,
  POST_STATUS,
  type IPostStatus,
  MAX_POST_VISIBILITY,
  POST_CHUNK_SIZE,
  POST_FOCUS_CONTEXT_RADIUS,
  MAX_POST_LEN,
  SYSTEM_MESSAGE_PREFIX,
  AUTO_RESPONDER,
  BURN_ON_READ,
  USER_ACTIVITY_POST_TYPES,
  MESSAGE_TYPES,
  type IMessageType,
  IGNORE_POST_TYPES,
  POST_SOCKET_EVENTS,
  type IPostSocketEvent,
  POST_LOCATIONS,
  type IPostLocation,
  ADVANCED_TEXT_EDITOR,
  type IAdvancedTextEditorType,
  ADVANCED_TEXT_EDITOR_TEXTBOX_IDS,
  POST_STORAGE_PREFIXES,
  POST_SCROLL_TYPES,
  type IPostScrollType,
} from "./post";

//#endregion

//#region File Constants

export {
  FILE_TYPES,
  type IFileType,
  FILE_SIZES,
  type IFileSizeUnit,
  TEXT_EXTENSIONS,
  IMAGE_EXTENSIONS,
  AUDIO_EXTENSIONS,
  VIDEO_EXTENSIONS,
  PRESENTATION_EXTENSIONS,
  SPREADSHEET_EXTENSIONS,
  WORD_EXTENSIONS,
  PDF_EXTENSIONS,
  PATCH_EXTENSIONS,
  SVG_EXTENSIONS,
  CODE_EXTENSIONS,
  MIME_TYPE_PATTERNS,
  FILE_UPLOAD_LIMITS,
  FILE_DIMENSIONS,
  ACCEPTED_FILE_TYPES,
  LICENSE_EXTENSION,
  IMAGE_TYPE_GIF,
} from "./file";

//#endregion

//#region Permission Constants

export {
  PERMISSIONS,
  type IPermission,
  PERMISSION_SCOPE,
  type IPermissionScope,
  CHANNEL_MODERATED_PERMISSIONS,
  type IChannelModeratedPermission,
  MODERATED_PERMISSIONS,
  TEAM_ROLES,
  type ITeamRole,
  CHANNEL_ROLES,
  type IChannelRole,
  SYSTEM_ROLES,
  type ISystemRole,
  PLAYBOOK_ROLES,
  type IPlaybookRole,
  ROLE_GROUPS,
  type IRoleGroup,
} from "./permissions";

//#endregion

//#region WebSocket Constants

export {
  WEBSOCKET_EVENTS,
  type IWebsocketEvent,
  POST_WEBSOCKET_EVENTS,
  CHANNEL_WEBSOCKET_EVENTS,
  TEAM_WEBSOCKET_EVENTS,
  USER_WEBSOCKET_EVENTS,
  THREAD_WEBSOCKET_EVENTS,
} from "./websocket";

//#endregion

//#region Team Constants

export {
  TEAM_TYPES,
  type ITeamType,
  SCOPE_TYPES,
  type IScopeType,
  TEAM_SORT_OPTIONS,
  type ITeamSortOption,
  TEAM_LIMITS,
} from "./team";

//#endregion
