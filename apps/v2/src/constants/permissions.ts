/**
 * Permission constants for role-based access control
 * Migrated from: vendor/desktop/webapp/channels/src/packages/mattermost-redux/src/constants/permissions.ts
 */

//#region Permissions

export const PERMISSIONS = {
  // User & Team Management
  INVITE_USER: "invite_user",
  INVITE_GUEST: "invite_guest",
  ADD_USER_TO_TEAM: "add_user_to_team",
  REMOVE_USER_FROM_TEAM: "remove_user_from_team",
  PROMOTE_GUEST: "promote_guest",
  DEMOTE_TO_GUEST: "demote_to_guest",

  // Team Operations
  CREATE_TEAM: "create_team",
  MANAGE_TEAM: "manage_team",
  IMPORT_TEAM: "import_team",
  VIEW_TEAM: "view_team",
  LIST_PUBLIC_TEAMS: "list_public_teams",
  JOIN_PUBLIC_TEAMS: "join_public_teams",
  LIST_PRIVATE_TEAMS: "list_private_teams",
  JOIN_PRIVATE_TEAMS: "join_private_teams",
  LIST_TEAM_CHANNELS: "list_team_channels",
  LIST_USERS_WITHOUT_TEAM: "list_users_without_team",
  READ_OTHER_USERS_TEAMS: "read_other_users_teams",

  // Channel Creation
  CREATE_PUBLIC_CHANNEL: "create_public_channel",
  CREATE_PRIVATE_CHANNEL: "create_private_channel",
  CREATE_DIRECT_CHANNEL: "create_direct_channel",
  CREATE_GROUP_CHANNEL: "create_group_channel",

  // Channel Management
  MANAGE_PUBLIC_CHANNEL_PROPERTIES: "manage_public_channel_properties",
  MANAGE_PRIVATE_CHANNEL_PROPERTIES: "manage_private_channel_properties",
  MANAGE_PUBLIC_CHANNEL_MEMBERS: "manage_public_channel_members",
  MANAGE_PRIVATE_CHANNEL_MEMBERS: "manage_private_channel_members",
  DELETE_PUBLIC_CHANNEL: "delete_public_channel",
  DELETE_PRIVATE_CHANNEL: "delete_private_channel",
  CONVERT_PUBLIC_CHANNEL_TO_PRIVATE: "convert_public_channel_to_private",
  CONVERT_PRIVATE_CHANNEL_TO_PUBLIC: "convert_private_channel_to_public",
  MANAGE_PUBLIC_CHANNEL_BANNER: "manage_public_channel_banner",
  MANAGE_PRIVATE_CHANNEL_BANNER: "manage_private_channel_banner",
  MANAGE_CHANNEL_ACCESS_RULES: "manage_channel_access_rules",

  // Channel Access
  JOIN_PUBLIC_CHANNELS: "join_public_channels",
  READ_CHANNEL: "read_channel",
  READ_CHANNEL_CONTENT: "read_channel_content",
  READ_PUBLIC_CHANNEL: "read_public_channel",
  READ_PUBLIC_CHANNEL_GROUPS: "read_public_channel_groups",
  READ_PRIVATE_CHANNEL_GROUPS: "read_private_channel_groups",

  // Channel Bookmarks
  ADD_BOOKMARK_PUBLIC_CHANNEL: "add_bookmark_public_channel",
  EDIT_BOOKMARK_PUBLIC_CHANNEL: "edit_bookmark_public_channel",
  DELETE_BOOKMARK_PUBLIC_CHANNEL: "delete_bookmark_public_channel",
  ORDER_BOOKMARK_PUBLIC_CHANNEL: "order_bookmark_public_channel",
  ADD_BOOKMARK_PRIVATE_CHANNEL: "add_bookmark_private_channel",
  EDIT_BOOKMARK_PRIVATE_CHANNEL: "edit_bookmark_private_channel",
  DELETE_BOOKMARK_PRIVATE_CHANNEL: "delete_bookmark_private_channel",
  ORDER_BOOKMARK_PRIVATE_CHANNEL: "order_bookmark_private_channel",

  // Posts
  CREATE_POST: "create_post",
  CREATE_POST_PUBLIC: "create_post_public",
  EDIT_POST: "edit_post",
  EDIT_OTHERS_POSTS: "edit_others_posts",
  DELETE_POST: "delete_post",
  DELETE_OTHERS_POSTS: "delete_others_posts",

  // Reactions
  ADD_REACTION: "add_reaction",
  REMOVE_REACTION: "remove_reaction",
  REMOVE_OTHERS_REACTIONS: "remove_others_reactions",

  // Mentions
  USE_CHANNEL_MENTIONS: "use_channel_mentions",
  USE_GROUP_MENTIONS: "use_group_mentions",

  // File & Link
  UPLOAD_FILE: "upload_file",
  GET_PUBLIC_LINK: "get_public_link",

  // Roles
  ASSIGN_SYSTEM_ADMIN_ROLE: "assign_system_admin_role",
  MANAGE_ROLES: "manage_roles",
  MANAGE_TEAM_ROLES: "manage_team_roles",
  MANAGE_CHANNEL_ROLES: "manage_channel_roles",

  // System
  MANAGE_SYSTEM: "manage_system",
  EDIT_OTHER_USERS: "edit_other_users",
  PERMANENT_DELETE_USER: "permanent_delete_user",
  VIEW_MEMBERS: "view_members",
  EDIT_BRAND: "edit_brand",

  // Slash Commands
  USE_SLASH_COMMANDS: "use_slash_commands",
  MANAGE_SLASH_COMMANDS: "manage_slash_commands",
  MANAGE_OWN_SLASH_COMMANDS: "manage_own_slash_commands",
  MANAGE_OTHERS_SLASH_COMMANDS: "manage_others_slash_commands",

  // Webhooks
  MANAGE_WEBHOOKS: "manage_webhooks",
  MANAGE_OTHERS_WEBHOOKS: "manage_others_webhooks",
  MANAGE_INCOMING_WEBHOOKS: "manage_incoming_webhooks",
  MANAGE_OWN_INCOMING_WEBHOOKS: "manage_own_incoming_webhooks",
  MANAGE_OTHERS_INCOMING_WEBHOOKS: "manage_others_incoming_webhooks",
  BYPASS_INCOMING_WEBHOOK_CHANNEL_LOCK: "bypass_incoming_webhook_channel_lock",
  MANAGE_OUTGOING_WEBHOOKS: "manage_outgoing_webhooks",
  MANAGE_OWN_OUTGOING_WEBHOOKS: "manage_own_outgoing_webhooks",
  MANAGE_OTHERS_OUTGOING_WEBHOOKS: "manage_others_outgoing_webhooks",

  // OAuth & Bots
  MANAGE_OAUTH: "manage_oauth",
  MANAGE_OUTGOING_OAUTH_CONNECTIONS: "manage_outgoing_oauth_connections",
  MANAGE_BOTS: "manage_bots",
  MANAGE_OTHERS_BOTS: "manage_others_bots",

  // Access Token
  CREATE_USER_ACCESS_TOKEN: "create_user_access_token",
  READ_USER_ACCESS_TOKEN: "read_user_access_token",
  REVOKE_USER_ACCESS_TOKEN: "revoke_user_access_token",

  // Jobs & Admin
  MANAGE_JOBS: "manage_jobs",
  READ_JOBS: "read_jobs",
  DOWNLOAD_COMPLIANCE_EXPORT_RESULT: "download_compliance_export_result",

  // LDAP
  CREATE_LDAP_SYNC_JOB: "create_ldap_sync_job",
  READ_LDAP_SYNC_JOB: "read_ldap_sync_job",
  TEST_LDAP: "test_ldap",
  ADD_LDAP_PUBLIC_CERT: "add_ldap_public_cert",
  ADD_LDAP_PRIVATE_CERT: "add_ldap_private_cert",
  REMOVE_LDAP_PUBLIC_CERT: "remove_ldap_public_cert",
  REMOVE_LDAP_PRIVATE_CERT: "remove_ldap_private_cert",

  // SAML
  GET_SAML_METADATA_FROM_IDP: "get_saml_metadata_from_idp",
  ADD_SAML_PUBLIC_CERT: "add_saml_public_cert",
  ADD_SAML_PRIVATE_CERT: "add_saml_private_cert",
  ADD_SAML_IDP_CERT: "add_saml_idp_cert",
  REMOVE_SAML_PUBLIC_CERT: "remove_saml_public_cert",
  REMOVE_SAML_PRIVATE_CERT: "remove_saml_private_cert",
  REMOVE_SAML_IDP_CERT: "remove_saml_idp_cert",
  GET_SAML_CERT_STATUS: "get_saml_cert_status",

  // System Operations
  INVALIDATE_EMAIL_INVITE: "invalidate_email_invite",
  TEST_SITE_URL: "test_site_url",
  TEST_ELASTICSEARCH: "test_elasticsearch",
  TEST_S3: "test_s3",
  TEST_EMAIL: "test_email",
  RELOAD_CONFIG: "reload_config",
  INVALIDATE_CACHES: "invalidate_caches",
  PURGE_ELASTICSEARCH_INDEXES: "purge_elasticsearch_indexes",
  RECYCLE_DATABASE_CONNECTIONS: "recycle_database_connections",
  CREATE_ELASTICSEARCH_POST_INDEXING_JOB:
    "create_elasticsearch_post_indexing_job",
  CREATE_ELASTICSEARCH_POST_AGGREGATION_JOB:
    "create_elasticsearch_post_aggregation_job",
  READ_ELASTICSEARCH_POST_INDEXING_JOB: "read_elasticsearch_post_indexing_job",
  READ_ELASTICSEARCH_POST_AGGREGATION_JOB:
    "read_elasticsearch_post_aggregation_job",

  // Emoji
  MANAGE_EMOJIS: "manage_emojis",
  MANAGE_OTHERS_EMOJIS: "manage_others_emojis",
  CREATE_EMOJIS: "create_emojis",
  DELETE_EMOJIS: "delete_emojis",
  DELETE_OTHERS_EMOJIS: "delete_others_emojis",

  // Custom Groups
  CREATE_CUSTOM_GROUP: "create_custom_group",
  EDIT_CUSTOM_GROUP: "edit_custom_group",
  DELETE_CUSTOM_GROUP: "delete_custom_group",
  RESTORE_CUSTOM_GROUP: "restore_custom_group",
  MANAGE_CUSTOM_GROUP_MEMBERS: "manage_custom_group_members",

  // Shared Channels
  MANAGE_SHARED_CHANNELS: "manage_shared_channels",
  MANAGE_SECURE_CONNECTIONS: "manage_secure_connections",

  // Public Playbooks
  PLAYBOOK_PUBLIC_CREATE: "playbook_public_create",
  PLAYBOOK_PUBLIC_MANAGE_PROPERTIES: "playbook_public_manage_properties",
  PLAYBOOK_PUBLIC_MANAGE_MEMBERS: "playbook_public_manage_members",
  PLAYBOOK_PUBLIC_VIEW: "playbook_public_view",
  PLAYBOOK_PUBLIC_MAKE_PRIVATE: "playbook_public_make_private",

  // Private Playbooks
  PLAYBOOK_PRIVATE_CREATE: "playbook_private_create",
  PLAYBOOK_PRIVATE_MANAGE_PROPERTIES: "playbook_private_manage_properties",
  PLAYBOOK_PRIVATE_MANAGE_MEMBERS: "playbook_private_manage_members",
  PLAYBOOK_PRIVATE_VIEW: "playbook_private_view",
  PLAYBOOK_PRIVATE_MAKE_PUBLIC: "playbook_private_make_public",

  // Runs
  RUN_CREATE: "run_create",
  RUN_MANAGE_PROPERTIES: "run_manage_properties",
  RUN_MANAGE_MEMBERS: "run_manage_members",
  RUN_VIEW: "run_view",
} as const;

export type IPermission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

//#endregion

//#region Permission Scope Mapping

/**
 * Maps permissions to their scope (system, team, channel, etc.)
 */
export const PERMISSION_SCOPE = {
  [PERMISSIONS.INVITE_USER]: "team_scope",
  [PERMISSIONS.INVITE_GUEST]: "team_scope",
  [PERMISSIONS.ADD_USER_TO_TEAM]: "team_scope",
  [PERMISSIONS.MANAGE_SLASH_COMMANDS]: "team_scope",
  [PERMISSIONS.MANAGE_OWN_SLASH_COMMANDS]: "team_scope",
  [PERMISSIONS.MANAGE_OTHERS_SLASH_COMMANDS]: "team_scope",
  [PERMISSIONS.CREATE_PUBLIC_CHANNEL]: "team_scope",
  [PERMISSIONS.CREATE_PRIVATE_CHANNEL]: "team_scope",
  [PERMISSIONS.MANAGE_PUBLIC_CHANNEL_MEMBERS]: "channel_scope",
  [PERMISSIONS.MANAGE_PRIVATE_CHANNEL_MEMBERS]: "channel_scope",
  [PERMISSIONS.ASSIGN_SYSTEM_ADMIN_ROLE]: "system_scope",
  [PERMISSIONS.MANAGE_ROLES]: "system_scope",
  [PERMISSIONS.MANAGE_TEAM_ROLES]: "team_scope",
  [PERMISSIONS.MANAGE_CHANNEL_ROLES]: "channel_scope",
  [PERMISSIONS.MANAGE_SYSTEM]: "system_scope",
  [PERMISSIONS.CREATE_DIRECT_CHANNEL]: "system_scope",
  [PERMISSIONS.CREATE_GROUP_CHANNEL]: "system_scope",
  [PERMISSIONS.MANAGE_PUBLIC_CHANNEL_PROPERTIES]: "channel_scope",
  [PERMISSIONS.MANAGE_PRIVATE_CHANNEL_PROPERTIES]: "channel_scope",
  [PERMISSIONS.LIST_PUBLIC_TEAMS]: "system_scope",
  [PERMISSIONS.JOIN_PUBLIC_TEAMS]: "system_scope",
  [PERMISSIONS.LIST_PRIVATE_TEAMS]: "system_scope",
  [PERMISSIONS.JOIN_PRIVATE_TEAMS]: "system_scope",
  [PERMISSIONS.LIST_TEAM_CHANNELS]: "team_scope",
  [PERMISSIONS.JOIN_PUBLIC_CHANNELS]: "team_scope",
  [PERMISSIONS.DELETE_PUBLIC_CHANNEL]: "channel_scope",
  [PERMISSIONS.DELETE_PRIVATE_CHANNEL]: "channel_scope",
  [PERMISSIONS.EDIT_OTHER_USERS]: "system_scope",
  [PERMISSIONS.READ_CHANNEL]: "channel_scope",
  [PERMISSIONS.READ_CHANNEL_CONTENT]: "channel_scope",
  [PERMISSIONS.READ_PUBLIC_CHANNEL]: "team_scope",
  [PERMISSIONS.ADD_REACTION]: "channel_scope",
  [PERMISSIONS.REMOVE_REACTION]: "channel_scope",
  [PERMISSIONS.REMOVE_OTHERS_REACTIONS]: "channel_scope",
  [PERMISSIONS.PERMANENT_DELETE_USER]: "system_scope",
  [PERMISSIONS.UPLOAD_FILE]: "channel_scope",
  [PERMISSIONS.GET_PUBLIC_LINK]: "system_scope",
  [PERMISSIONS.MANAGE_INCOMING_WEBHOOKS]: "team_scope",
  [PERMISSIONS.MANAGE_OWN_INCOMING_WEBHOOKS]: "team_scope",
  [PERMISSIONS.BYPASS_INCOMING_WEBHOOK_CHANNEL_LOCK]: "team_scope",
  [PERMISSIONS.MANAGE_OTHERS_INCOMING_WEBHOOKS]: "team_scope",
  [PERMISSIONS.MANAGE_OUTGOING_WEBHOOKS]: "team_scope",
  [PERMISSIONS.MANAGE_OWN_OUTGOING_WEBHOOKS]: "team_scope",
  [PERMISSIONS.MANAGE_OTHERS_OUTGOING_WEBHOOKS]: "team_scope",
  [PERMISSIONS.MANAGE_OAUTH]: "system_scope",
  [PERMISSIONS.CREATE_POST]: "channel_scope",
  [PERMISSIONS.CREATE_POST_PUBLIC]: "channel_scope",
  [PERMISSIONS.EDIT_POST]: "channel_scope",
  [PERMISSIONS.EDIT_OTHERS_POSTS]: "channel_scope",
  [PERMISSIONS.DELETE_POST]: "channel_scope",
  [PERMISSIONS.DELETE_OTHERS_POSTS]: "channel_scope",
  [PERMISSIONS.REMOVE_USER_FROM_TEAM]: "team_scope",
  [PERMISSIONS.CREATE_TEAM]: "system_scope",
  [PERMISSIONS.MANAGE_TEAM]: "team_scope",
  [PERMISSIONS.IMPORT_TEAM]: "team_scope",
  [PERMISSIONS.VIEW_TEAM]: "team_scope",
  [PERMISSIONS.LIST_USERS_WITHOUT_TEAM]: "system_scope",
  [PERMISSIONS.CREATE_USER_ACCESS_TOKEN]: "system_scope",
  [PERMISSIONS.READ_USER_ACCESS_TOKEN]: "system_scope",
  [PERMISSIONS.REVOKE_USER_ACCESS_TOKEN]: "system_scope",
  [PERMISSIONS.MANAGE_JOBS]: "system_scope",
  [PERMISSIONS.CREATE_EMOJIS]: "team_scope",
  [PERMISSIONS.DELETE_EMOJIS]: "team_scope",
  [PERMISSIONS.DELETE_OTHERS_EMOJIS]: "team_scope",
  [PERMISSIONS.USE_CHANNEL_MENTIONS]: "channel_scope",
  [PERMISSIONS.USE_GROUP_MENTIONS]: "channel_scope",
  [PERMISSIONS.READ_PUBLIC_CHANNEL_GROUPS]: "channel_scope",
  [PERMISSIONS.READ_PRIVATE_CHANNEL_GROUPS]: "channel_scope",
  [PERMISSIONS.CONVERT_PUBLIC_CHANNEL_TO_PRIVATE]: "channel_scope",
  [PERMISSIONS.CONVERT_PRIVATE_CHANNEL_TO_PUBLIC]: "channel_scope",
  [PERMISSIONS.MANAGE_SHARED_CHANNELS]: "system_scope",
  [PERMISSIONS.MANAGE_SECURE_CONNECTIONS]: "system_scope",
  [PERMISSIONS.PLAYBOOK_PUBLIC_CREATE]: "team_scope",
  [PERMISSIONS.PLAYBOOK_PUBLIC_MANAGE_PROPERTIES]: "playbook_scope",
  [PERMISSIONS.PLAYBOOK_PUBLIC_MANAGE_MEMBERS]: "playbook_scope",
  [PERMISSIONS.PLAYBOOK_PUBLIC_VIEW]: "playbook_scope",
  [PERMISSIONS.PLAYBOOK_PUBLIC_MAKE_PRIVATE]: "playbook_scope",
  [PERMISSIONS.PLAYBOOK_PRIVATE_CREATE]: "team_scope",
  [PERMISSIONS.PLAYBOOK_PRIVATE_MANAGE_PROPERTIES]: "playbook_scope",
  [PERMISSIONS.PLAYBOOK_PRIVATE_MANAGE_MEMBERS]: "playbook_scope",
  [PERMISSIONS.PLAYBOOK_PRIVATE_VIEW]: "playbook_scope",
  [PERMISSIONS.PLAYBOOK_PRIVATE_MAKE_PUBLIC]: "playbook_scope",
  [PERMISSIONS.RUN_CREATE]: "playbook_scope",
  [PERMISSIONS.RUN_MANAGE_MEMBERS]: "run_scope",
  [PERMISSIONS.RUN_MANAGE_PROPERTIES]: "run_scope",
  [PERMISSIONS.RUN_VIEW]: "run_scope",
  [PERMISSIONS.CREATE_CUSTOM_GROUP]: "system_scope",
  [PERMISSIONS.EDIT_CUSTOM_GROUP]: "system_scope",
  [PERMISSIONS.DELETE_CUSTOM_GROUP]: "system_scope",
  [PERMISSIONS.RESTORE_CUSTOM_GROUP]: "system_scope",
  [PERMISSIONS.MANAGE_CUSTOM_GROUP_MEMBERS]: "system_scope",
  [PERMISSIONS.USE_SLASH_COMMANDS]: "channel_scope",
  [PERMISSIONS.ADD_BOOKMARK_PUBLIC_CHANNEL]: "channel_scope",
  [PERMISSIONS.EDIT_BOOKMARK_PUBLIC_CHANNEL]: "channel_scope",
  [PERMISSIONS.DELETE_BOOKMARK_PUBLIC_CHANNEL]: "channel_scope",
  [PERMISSIONS.ORDER_BOOKMARK_PUBLIC_CHANNEL]: "channel_scope",
  [PERMISSIONS.ADD_BOOKMARK_PRIVATE_CHANNEL]: "channel_scope",
  [PERMISSIONS.EDIT_BOOKMARK_PRIVATE_CHANNEL]: "channel_scope",
  [PERMISSIONS.DELETE_BOOKMARK_PRIVATE_CHANNEL]: "channel_scope",
  [PERMISSIONS.ORDER_BOOKMARK_PRIVATE_CHANNEL]: "channel_scope",
  [PERMISSIONS.MANAGE_PUBLIC_CHANNEL_BANNER]: "channel_scope",
  [PERMISSIONS.MANAGE_PRIVATE_CHANNEL_BANNER]: "channel_scope",
  [PERMISSIONS.MANAGE_CHANNEL_ACCESS_RULES]: "channel_scope",
} as const;

export type IPermissionScope =
  (typeof PERMISSION_SCOPE)[keyof typeof PERMISSION_SCOPE];

//#endregion

//#region Channel Moderated Permissions

/**
 * Permissions that can be moderated at the channel level
 */
export const CHANNEL_MODERATED_PERMISSIONS = {
  CREATE_POST: "create_post",
  CREATE_REACTIONS: "create_reactions",
  MANAGE_MEMBERS: "manage_members",
  USE_CHANNEL_MENTIONS: "use_channel_mentions",
  MANAGE_BOOKMARKS: "manage_bookmarks",
} as const;

export type IChannelModeratedPermission =
  (typeof CHANNEL_MODERATED_PERMISSIONS)[keyof typeof CHANNEL_MODERATED_PERMISSIONS];

/**
 * Array of permissions that can be turned off for members and guests
 * on a per channel basis
 */
export const MODERATED_PERMISSIONS = [
  PERMISSIONS.CREATE_POST,
  PERMISSIONS.UPLOAD_FILE,
  PERMISSIONS.ADD_REACTION,
  PERMISSIONS.REMOVE_REACTION,
  PERMISSIONS.MANAGE_PUBLIC_CHANNEL_MEMBERS,
  PERMISSIONS.MANAGE_PRIVATE_CHANNEL_MEMBERS,
  PERMISSIONS.USE_CHANNEL_MENTIONS,
  PERMISSIONS.ADD_BOOKMARK_PUBLIC_CHANNEL,
  PERMISSIONS.EDIT_BOOKMARK_PUBLIC_CHANNEL,
  PERMISSIONS.DELETE_BOOKMARK_PUBLIC_CHANNEL,
  PERMISSIONS.ORDER_BOOKMARK_PUBLIC_CHANNEL,
  PERMISSIONS.ADD_BOOKMARK_PRIVATE_CHANNEL,
  PERMISSIONS.EDIT_BOOKMARK_PRIVATE_CHANNEL,
  PERMISSIONS.DELETE_BOOKMARK_PRIVATE_CHANNEL,
  PERMISSIONS.ORDER_BOOKMARK_PRIVATE_CHANNEL,
] as const satisfies readonly IPermission[];

//#endregion

//#region Role Constants

/**
 * Role identifiers for teams
 */
export const TEAM_ROLES = {
  /** Guest role in team */
  TEAM_GUEST_ROLE: "team_guest",
  /** Regular user role in team */
  TEAM_USER_ROLE: "team_user",
  /** Admin role in team */
  TEAM_ADMIN_ROLE: "team_admin",
} as const;

export type ITeamRole = (typeof TEAM_ROLES)[keyof typeof TEAM_ROLES];

/**
 * Role identifiers for channels
 */
export const CHANNEL_ROLES = {
  /** Guest role in channel */
  CHANNEL_GUEST_ROLE: "channel_guest",
  /** Regular user role in channel */
  CHANNEL_USER_ROLE: "channel_user",
  /** Admin role in channel */
  CHANNEL_ADMIN_ROLE: "channel_admin",
} as const;

export type IChannelRole = (typeof CHANNEL_ROLES)[keyof typeof CHANNEL_ROLES];

/**
 * Role identifiers for system-level
 */
export const SYSTEM_ROLES = {
  /** Guest role at system level */
  SYSTEM_GUEST_ROLE: "system_guest",
  /** Regular user role at system level */
  SYSTEM_USER_ROLE: "system_user",
  /** Admin role at system level */
  SYSTEM_ADMIN_ROLE: "system_admin",
} as const;

export type ISystemRole = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];

/**
 * Role identifiers for playbooks
 */
export const PLAYBOOK_ROLES = {
  /** Admin role for playbook */
  PLAYBOOK_ADMIN_ROLE: "playbook_admin",
  /** Member role for playbook */
  PLAYBOOK_MEMBER_ROLE: "playbook_member",
  /** Admin role for run */
  RUN_ADMIN_ROLE: "run_admin",
  /** Member role for run */
  RUN_MEMBER_ROLE: "run_member",
} as const;

export type IPlaybookRole =
  (typeof PLAYBOOK_ROLES)[keyof typeof PLAYBOOK_ROLES];

//#endregion

//#region Role Groups

/**
 * Role group identifiers for permission filtering
 */
export const ROLE_GROUPS = {
  /** All members (non-guest users) */
  MEMBERS: "members",
  /** Guest users */
  GUESTS: "guests",
  /** Admin users */
  ADMINS: "admins",
} as const;

export type IRoleGroup = (typeof ROLE_GROUPS)[keyof typeof ROLE_GROUPS];

//#endregion
