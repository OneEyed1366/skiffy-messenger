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

/**
 * Get the pin URL for a post
 * @param postId - The post ID
 * @returns Post pin endpoint path
 */
export function getPostPinUrl(postId: string): string {
  return `${getPostUrl(postId)}/pin`;
}

/**
 * Get the unpin URL for a post
 * @param postId - The post ID
 * @returns Post unpin endpoint path
 */
export function getPostUnpinUrl(postId: string): string {
  return `${getPostUrl(postId)}/unpin`;
}

/**
 * Get the reactions URL for a post
 * @param postId - The post ID
 * @returns Post reactions endpoint path
 */
export function getPostReactionsUrl(postId: string): string {
  return `${getPostUrl(postId)}/reactions`;
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

//#region Files URLs

/**
 * Get the files API route
 * @returns Files endpoint path
 */
export function getFilesUrl(): string {
  return `${apiClient.getBaseRoute()}/files`;
}

/**
 * Get a specific file's route
 * @param fileId - The file ID
 * @returns File endpoint path
 */
export function getFileUrl(fileId: string): string {
  return `${getFilesUrl()}/${fileId}`;
}

/**
 * Get files metadata for a specific post
 * @param postId - The post ID
 * @returns Post files info endpoint path
 */
export function getFilesForPostUrl(postId: string): string {
  return `${getPostUrl(postId)}/files/info`;
}

/**
 * Get the thumbnail URL for an image file
 * @param fileId - The file ID
 * @param timestamp - Optional cache-busting timestamp
 * @returns File thumbnail endpoint path
 */
export function getFileThumbnailUrl(
  fileId: string,
  timestamp?: number,
): string {
  let url = `${getFileUrl(fileId)}/thumbnail`;
  if (timestamp) {
    url += `?${timestamp}`;
  }
  return url;
}

/**
 * Get the preview URL for an image file
 * @param fileId - The file ID
 * @param timestamp - Optional cache-busting timestamp
 * @returns File preview endpoint path
 */
export function getFilePreviewUrl(fileId: string, timestamp?: number): string {
  let url = `${getFileUrl(fileId)}/preview`;
  if (timestamp) {
    url += `?${timestamp}`;
  }
  return url;
}

/**
 * Get the download URL for a file
 * @param fileId - The file ID
 * @returns File download endpoint path
 */
export function getFileDownloadUrl(fileId: string): string {
  return getFileUrl(fileId);
}

//#endregion

//#region Search URLs

/**
 * Get the search posts API route
 * @param teamId - Optional team ID for team-scoped search
 * @returns Search posts endpoint path
 */
export function getSearchPostsUrl(teamId?: string): string {
  if (teamId) {
    return `${getTeamUrl(teamId)}/posts/search`;
  }
  return `${getPostsUrl()}/search`;
}

/**
 * Get the flagged posts API route for a user
 * @param userId - The user ID
 * @returns Flagged posts endpoint path
 */
export function getFlaggedPostsUrl(userId: string): string {
  return `${getUserUrl(userId)}/posts/flagged`;
}

/**
 * Get the pinned posts API route for a channel
 * @param channelId - The channel ID
 * @returns Pinned posts endpoint path
 */
export function getPinnedPostsUrl(channelId: string): string {
  return `${getChannelUrl(channelId)}/pinned`;
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
