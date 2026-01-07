/**
 * Team-related constants
 * Migrated from: vendor/desktop/webapp/channels/src/packages/mattermost-redux/src/constants/teams.ts
 *                vendor/desktop/webapp/channels/src/packages/mattermost-redux/src/constants/schemes.ts
 */

import { type ITeamType as IL0TeamType } from "@/types";

//#region Team Types

/**
 * Team type identifiers
 * - OPEN: Anyone can join without an invite
 * - INVITE: Users need an invite to join
 */
export const TEAM_TYPES = {
  /** Open team - anyone can join */
  OPEN: "O",
  /** Invite-only team - requires invitation */
  INVITE: "I",
} as const satisfies Record<string, IL0TeamType>;

// Re-export from L0 (single source of truth)
export type { ITeamType } from "@/types";

//#endregion

//#region Scheme Scope Types

/**
 * Scope types for permission schemes
 * Used to determine at which level permissions are applied
 */
export const SCOPE_TYPES = {
  /** Team-level scope */
  TEAM: "team",
  /** Channel-level scope */
  CHANNEL: "channel",
} as const;

export type IScopeType = (typeof SCOPE_TYPES)[keyof typeof SCOPE_TYPES];

//#endregion

//#region Team Sort Options

/**
 * Options for sorting team members
 */
export const TEAM_SORT_OPTIONS = {
  /** Sort by username */
  USERNAME: "Username",
} as const;

export type ITeamSortOption =
  (typeof TEAM_SORT_OPTIONS)[keyof typeof TEAM_SORT_OPTIONS];

//#endregion

//#region Team Limits

/**
 * Team-related limits and constraints
 */
export const TEAM_LIMITS = {
  /** Minimum team name length */
  MIN_TEAMNAME_LENGTH: 2,
  /** Maximum team name length */
  MAX_TEAMNAME_LENGTH: 64,
  /** Maximum team description length */
  MAX_TEAMDESCRIPTION_LENGTH: 50,
  /** Default maximum users per team */
  DEFAULT_MAX_USERS_PER_TEAM: 50,
} as const;

//#endregion
