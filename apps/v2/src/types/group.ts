// apps/v2/src/types/group.ts

/**
 * Group-related type definitions
 * Migrated from: vendor/desktop/webapp/platform/types/src/groups.ts
 */

import type { IUserProfile } from "./user";
import type { IRelationOneToOne } from "./utility";

//#region Enums

export enum ESyncableType {
  Team = "team",
  Channel = "channel",
}

export enum EGroupSource {
  Ldap = "ldap",
  Custom = "custom",
}

export enum EPluginGroupSourcePrefix {
  Plugin = "plugin_",
}

//#endregion

//#region Core Group Types

export type IGroup = {
  id: string;
  name: string;
  display_name: string;
  description: string;
  source: string;
  remote_id: string | null;
  create_at: number;
  update_at: number;
  delete_at: number;
  has_syncables: boolean;
  member_count: number;
  scheme_admin: boolean;
  allow_reference: boolean;
  channel_member_count?: number;
  channel_member_timezones_count?: number;
  member_ids?: string[];
};

export type IGroupPatch = {
  allow_reference: boolean;
  name?: string;
};

export type ICustomGroupPatch = {
  name: string;
  display_name: string;
};

export type IGroupCreateWithUserIds = {
  name: string;
  allow_reference: boolean;
  display_name: string;
  source: string;
  user_ids: string[];
  description?: string;
};

//#endregion

//#region Syncables

export type ISyncablePatch = {
  scheme_admin: boolean;
  auto_add: boolean;
};

export type IGroupTeam = {
  team_id: string;
  team_display_name: string;
  team_type?: string;
  group_id?: string;
  auto_add?: boolean;
  scheme_admin?: boolean;
  create_at?: number;
  delete_at?: number;
  update_at?: number;
};

export type IGroupChannel = {
  channel_id: string;
  channel_display_name: string;
  channel_type?: string;
  team_id: string;
  team_display_name: string;
  team_type?: string;
  group_id?: string;
  auto_add?: boolean;
  scheme_admin?: boolean;
  create_at?: number;
  delete_at?: number;
  update_at?: number;
};

export type IGroupSyncable = {
  group_id: string;
  auto_add: boolean;
  scheme_admin: boolean;
  create_at: number;
  delete_at: number;
  update_at: number;
  type: "Team" | "Channel";
};

export type IGroupSyncablesState = {
  teams: IGroupTeam[];
  channels: IGroupChannel[];
};

//#endregion

//#region State & Stats

export type IGroupsState = {
  syncables: Record<string, IGroupSyncablesState>;
  stats: IRelationOneToOne<IGroup, IGroupStats>;
  groups: Record<string, IGroup>;
  myGroups: string[];
};

export type IGroupStats = {
  group_id: string;
  total_member_count: number;
};

//#endregion

//#region Search & Params

export type IGroupSearchOpts = {
  q: string;
  is_linked?: boolean;
  is_configured?: boolean;
};

export type IGetGroupsParams = {
  filter_allow_reference?: boolean;
  page?: number;
  per_page?: number;
  include_member_count?: boolean;
  include_archived?: boolean;
  filter_archived?: boolean;
  include_member_ids?: boolean;
};

export type IGetGroupsForUserParams = IGetGroupsParams & {
  filter_has_member: string;
};

export type IGroupSearchParams = IGetGroupsParams & {
  q: string;
  filter_has_member?: string;
  include_timezones?: string;
  include_channel_member_count?: string;
};

//#endregion

//#region Mixed & Unlinked Groups

export type IMixedUnlinkedGroup = {
  mattermost_group_id?: string;
  name: string;
  primary_key: string;
  has_syncables?: boolean;
};

export type IMixedUnlinkedGroupRedux = IMixedUnlinkedGroup & {
  failed?: boolean;
};

//#endregion

//#region Membership

export type IGroupMember = {
  group_id: string;
  user_id: string;
  create_at: number;
  deleted_at: number;
};

export type IGroupMembership = {
  user_id: string;
  roles: string;
};

export type IUserWithGroup = IUserProfile & {
  groups: IGroup[];
  scheme_guest: boolean;
  scheme_user: boolean;
  scheme_admin: boolean;
};

//#endregion

//#region Collections

export type IGroupsWithCount = {
  groups: IGroup[];
  total_group_count: number;
  channelID?: string;
  teamID?: string;
};

export type IUsersWithGroupsAndCount = {
  users: IUserWithGroup[];
  total_count: number;
};

//#endregion

//#region Permissions

export type IGroupPermissions = {
  can_delete: boolean;
  can_manage_members: boolean;
  can_restore: boolean;
};

//#endregion
