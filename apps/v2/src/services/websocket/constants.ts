// apps/v2/src/services/websocket/constants.ts

//#region Timeouts

/**
 * WebSocket timing constants matching vendor implementation.
 * @see vendor/desktop/webapp/platform/client/src/websocket.ts
 */
export const WS_TIMEOUTS = {
  /** Typing indicator timeout in ms (vendor: TimeBetweenUserTypingUpdatesMilliseconds) */
  TYPING_TIMEOUT_MS: 5000,

  /** Initial/constant reconnection delay in ms (vendor: minWebSocketRetryTime) */
  RECONNECT_DELAY: 3000,

  /** Max reconnection delay in ms (vendor: maxWebSocketRetryTime = 5 min) */
  RECONNECT_DELAY_MAX: 300000,

  /** Jitter range in ms to prevent thundering herd */
  RECONNECT_JITTER: 2000,

  /** Max reconnection attempts before n² backoff (vendor: maxWebSocketFails) */
  RECONNECT_ATTEMPTS: 7,

  /** First N posts emitted immediately (vendor: debouncePostEvent) */
  DEBOUNCE_POST_N: 5,

  /** Post batch flush delay in ms after silence */
  DEBOUNCE_POST_WAIT: 100,

  /** Max post queue size before overflow protection */
  DEBOUNCE_POST_MAX_QUEUE: 200,

  /** Reaction throttle time in ms */
  REACTIONS_THROTTLE: 500,
} as const;

//#endregion Timeouts

//#region Event Categories

/**
 * WebSocket event names grouped by category.
 * 90+ events from vendor WebSocket API.
 */
export const WS_EVENTS = {
  POST: [
    "posted",
    "post_edited",
    "post_deleted",
    "post_unread",
    "ephemeral_message",
    "post_acknowledgement_added",
    "post_acknowledgement_removed",
  ],

  CHANNEL: [
    "channel_created",
    "channel_deleted",
    "channel_updated",
    "channel_converted",
    "channel_member_updated",
    "channel_scheme_updated",
    "channel_restored",
    "direct_added",
    "group_added",
    "channel_viewed",
    "multiple_channels_viewed",
  ],

  TEAM: [
    "added_to_team",
    "leave_team",
    "update_team",
    "delete_team",
    "update_team_scheme",
    "received_new_user",
    "user_added_to_team",
    "user_removed_from_team",
  ],

  USER: [
    "user_added",
    "user_removed",
    "user_updated",
    "user_role_updated",
    "status_change",
    "user_activation_status_change",
  ],

  TYPING: ["typing"],

  REACTION: ["reaction_added", "reaction_removed", "emoji_added"],

  THREAD: ["thread_updated", "thread_follow_changed", "thread_read_changed"],

  PREFERENCE: [
    "preference_changed",
    "preferences_changed",
    "preferences_deleted",
  ],

  SIDEBAR: [
    "sidebar_category_created",
    "sidebar_category_updated",
    "sidebar_category_deleted",
    "sidebar_category_order_updated",
  ],

  DRAFT: ["draft_created", "draft_updated", "draft_deleted"],

  GROUP: [
    "received_group",
    "received_group_associated_to_team",
    "received_group_not_associated_to_team",
    "received_group_associated_to_channel",
    "received_group_not_associated_to_channel",
    "group_member_add",
    "group_member_deleted",
    "group_linked_to_team",
  ],

  ROLE: ["role_added", "role_removed", "role_updated", "memberrole_updated"],

  SYSTEM: [
    "hello",
    "config_changed",
    "license_changed",
    "plugin_enabled",
    "plugin_disabled",
    "plugin_statuses_changed",
    "first_admin_visit_marketplace_status_received",
    "persistent_notification_triggered",
  ],

  DIALOG: ["open_dialog"],

  APPS: ["apps_framework_refresh_bindings"],

  BOOKMARK: ["channel_bookmark_created", "channel_bookmark_deleted"],

  BURN_ON_READ: [
    "burn_on_read_message_deleted",
    "burn_on_read_message_created",
    "burn_on_read_message_updated",
  ],

  CLOUD: [
    "cloud_payment_status_updated",
    "cloud_subscription_changed",
    "installation_updated",
  ],

  SCHEDULED_POST: [
    "scheduled_post_created",
    "scheduled_post_updated",
    "scheduled_post_deleted",
  ],
} as const;

//#endregion Event Categories
