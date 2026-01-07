// apps/v2/src/types/team.ts

/**
 * Team-related type definitions
 * Migrated from: vendor/desktop/webapp/platform/types/src/teams.ts
 */

//#region Team Types

export type ITeamType = "O" | "I";

export type ITeam = {
  id: string;
  create_at: number;
  update_at: number;
  delete_at: number;
  display_name: string;
  name: string;
  description: string;
  email: string;
  type: ITeamType;
  company_name: string;
  allowed_domains: string;
  invite_id: string;
  allow_open_invite: boolean;
  scheme_id: string;
  group_constrained: boolean;
  policy_id?: string | null;
  last_team_icon_update?: number;
};

//#endregion

//#region Team Membership

export type ITeamUnread = {
  team_id: string;
  mention_count: number;
  mention_count_root: number;
  msg_count: number;
  msg_count_root: number;
  thread_count?: number;
  thread_mention_count?: number;
  thread_urgent_mention_count?: number;
};

export type ITeamMembership = ITeamUnread & {
  user_id: string;
  roles: string;
  delete_at: number;
  scheme_admin: boolean;
  scheme_guest: boolean;
  scheme_user: boolean;
};

//#endregion

//#region Team Stats

export type ITeamStats = {
  team_id: string;
  total_member_count: number;
  active_member_count: number;
};

//#endregion

//#region Team with Count

export type ITeamsWithCount = {
  teams: ITeam[];
  total_count: number;
};

//#endregion

//#region Team Member Errors

export type ITeamMemberWithError = {
  member: ITeamMembership;
  user_id: string;
  error: {
    id: string;
    message: string;
    status_code?: number;
  };
};

export type ITeamInviteWithError = {
  email: string;
  error: {
    id: string;
    message: string;
  };
};

//#endregion

//#region Team Search

export type ITeamSearchOpts = {
  page?: number;
  per_page?: number;
  allow_open_invite?: boolean;
  group_constrained?: boolean;
};

//#endregion
