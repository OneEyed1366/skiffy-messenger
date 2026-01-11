// apps/v2/src/api/teams.ts

/**
 * Teams API Functions
 * Provides HTTP operations for team management
 *
 * @module api/teams
 */

//#region Imports

import type { ITeam, ITeamMembership } from "@/types";

import { apiClient } from "./client";
import { getTeamUrl } from "./urls";

//#endregion

//#region Types

/**
 * Response type for join/leave operations
 */
export type ITeamMemberResponse = ITeamMembership;

//#endregion

//#region URL Helpers

/**
 * Get team members route
 * @param teamId - The team ID
 * @returns Team members endpoint path
 */
function getTeamMembersUrl(teamId: string): string {
  return `${getTeamUrl(teamId)}/members`;
}

/**
 * Get user teams route
 * @returns User teams endpoint path
 */
function getUserTeamsUrl(): string {
  return `${apiClient.getBaseRoute()}/users/me/teams`;
}

//#endregion

//#region API Functions

/**
 * Fetch all teams for the current user
 * @returns Array of teams with total count
 */
export async function getTeams(): Promise<ITeam[]> {
  return apiClient.get<ITeam[]>(getUserTeamsUrl());
}

/**
 * Fetch a single team by ID
 * @param teamId - The team ID
 * @returns Team data
 */
export async function getTeam(teamId: string): Promise<ITeam> {
  return apiClient.get<ITeam>(getTeamUrl(teamId));
}

/**
 * Join a team (add current user as member)
 * @param teamId - The team ID
 * @returns Team membership
 */
export async function joinTeam(teamId: string): Promise<ITeamMemberResponse> {
  return apiClient.post<ITeamMemberResponse>(getTeamMembersUrl(teamId));
}

/**
 * Leave a team (remove current user from members)
 * @param teamId - The team ID
 * @returns Void on success
 */
export async function leaveTeam(teamId: string): Promise<void> {
  return apiClient.delete<void>(`${getTeamMembersUrl(teamId)}/me`);
}

//#endregion
