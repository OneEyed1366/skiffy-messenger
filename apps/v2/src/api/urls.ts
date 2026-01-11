// apps/v2/src/api/urls.ts

/**
 * URL Builder Functions for API Endpoints
 *
 * All URL builders use apiClient.getBaseRoute() as the base path.
 * Pattern: get<Entity>Route(...params) or get<Entity>sRoute() for collections
 *
 * @module api/urls
 */

import { apiClient } from "./client";

//#region Users URLs

/**
 * Get the users API route
 * @returns Users endpoint path
 */
export function getUsersUrl(): string {
  return `${apiClient.getBaseRoute()}/users`;
}

/**
 * Get a specific user's route
 * @param userId - The user ID
 * @returns User endpoint path
 */
export function getUserUrl(userId: string): string {
  return `${getUsersUrl()}/${userId}`;
}

/**
 * Get the current user route
 * @returns Current user endpoint path
 */
export function getCurrentUserUrl(): string {
  return `${getUsersUrl()}/me`;
}

//#endregion

//#region Posts URLs

/**
 * Get the posts API route
 * @returns Posts endpoint path
 */
export function getPostsUrl(): string {
  return `${apiClient.getBaseRoute()}/posts`;
}

/**
 * Get a specific post's route
 * @param postId - The post ID
 * @returns Post endpoint path
 */
export function getPostUrl(postId: string): string {
  return `${getPostsUrl()}/${postId}`;
}

/**
 * Get posts for a specific channel
 * @param channelId - The channel ID
 * @returns Channel posts endpoint path
 */
export function getChannelPostsUrl(channelId: string): string {
  return `${getChannelUrl(channelId)}/posts`;
}

//#endregion

//#region Channels URLs

/**
 * Get the channels API route
 * @returns Channels endpoint path
 */
export function getChannelsUrl(): string {
  return `${apiClient.getBaseRoute()}/channels`;
}

/**
 * Get a specific channel's route
 * @param channelId - The channel ID
 * @returns Channel endpoint path
 */
export function getChannelUrl(channelId: string): string {
  return `${getChannelsUrl()}/${channelId}`;
}

/**
 * Get channel members route
 * @param channelId - The channel ID
 * @returns Channel members endpoint path
 */
export function getChannelMembersUrl(channelId: string): string {
  return `${getChannelUrl(channelId)}/members`;
}

//#endregion

//#region Teams URLs

/**
 * Get the teams API route
 * @returns Teams endpoint path
 */
export function getTeamsUrl(): string {
  return `${apiClient.getBaseRoute()}/teams`;
}

/**
 * Get a specific team's route
 * @param teamId - The team ID
 * @returns Team endpoint path
 */
export function getTeamUrl(teamId: string): string {
  return `${getTeamsUrl()}/${teamId}`;
}

/**
 * Get team channels route
 * @param teamId - The team ID
 * @returns Team channels endpoint path
 */
export function getTeamChannelsUrl(teamId: string): string {
  return `${getTeamUrl(teamId)}/channels`;
}

/**
 * Get team members route
 * @param teamId - The team ID
 * @returns Team members endpoint path
 */
export function getTeamMembersUrl(teamId: string): string {
  return `${getTeamUrl(teamId)}/members`;
}

//#endregion

//#region Threads URLs

/**
 * Get the threads API route for a user
 * @param userId - The user ID
 * @returns Threads endpoint path
 */
export function getThreadsUrl(userId: string): string {
  return `${getUserUrl(userId)}/threads`;
}

/**
 * Get a specific thread's route
 * @param userId - The user ID
 * @param threadId - The thread ID
 * @returns Thread endpoint path
 */
export function getThreadUrl(userId: string, threadId: string): string {
  return `${getThreadsUrl(userId)}/${threadId}`;
}

//#endregion

//#region Config URLs

/**
 * Get the config API route
 * @returns Config endpoint path
 */
export function getConfigUrl(): string {
  return `${apiClient.getBaseRoute()}/config`;
}

/**
 * Get the client config route
 * @returns Client config endpoint path
 */
export function getClientConfigUrl(): string {
  return `${getConfigUrl()}/client`;
}

/**
 * Get the server config route
 * @returns Server config endpoint path
 */
export function getServerConfigUrl(): string {
  return `${getConfigUrl()}`;
}

//#endregion

//#region Preferences URLs

/**
 * Get the preferences API route for a user
 * @param userId - The user ID
 * @returns Preferences endpoint path
 */
export function getPreferencesUrl(userId: string): string {
  return `${getUserUrl(userId)}/preferences`;
}

/**
 * Get preferences by category
 * @param userId - The user ID
 * @param category - The preference category
 * @returns Preferences by category endpoint path
 */
export function getPreferencesByCategoryUrl(
  userId: string,
  category: string,
): string {
  return `${getPreferencesUrl(userId)}/${category}`;
}

//#endregion
