// apps/v2/src/api/search.ts

/**
 * Search API Functions for L7 State Management
 * Provides search functionality for posts, files, and saved/pinned items
 *
 * @module api/search
 */

//#region Imports

import type { IPostList, IPostSearchResults } from "@/types";

import { apiClient } from "./client";
import {
  getFlaggedPostsUrl,
  getPinnedPostsUrl,
  getSearchPostsUrl,
} from "./urls";

//#endregion

//#region Types

/**
 * Parameters for searching posts
 */
export type ISearchParams = {
  /** Search terms (supports Mattermost search syntax) */
  terms: string;
  /** Use OR instead of AND for multiple terms */
  is_or_search?: boolean;
  /** Timezone offset in seconds for date filtering */
  time_zone_offset?: number;
  /** Include posts from deleted channels */
  include_deleted_channels?: boolean;
  /** Page number for pagination (0-based) */
  page?: number;
  /** Number of results per page */
  per_page?: number;
};

/**
 * Parameters for fetching flagged posts
 */
export type IGetFlaggedPostsParams = {
  /** Filter by channel ID */
  channel_id?: string;
  /** Filter by team ID */
  team_id?: string;
  /** Page number for pagination (0-based) */
  page?: number;
  /** Number of results per page */
  per_page?: number;
};

//#endregion

//#region Search API Functions

/**
 * Search posts within a team or globally
 *
 * Supports Mattermost search syntax:
 * - `from:username` - posts from specific user
 * - `in:channel` - posts in specific channel
 * - `before:date` / `after:date` - date filtering
 * - `"exact phrase"` - exact phrase matching
 *
 * @param teamId - Team ID to search within, or null for global search
 * @param params - Search parameters
 * @returns Search results with matching posts and highlighted matches
 *
 * @example
 * ```typescript
 * // Search within a team
 * const results = await searchPosts("team123", { terms: "bug fix" });
 *
 * // Global search with OR logic
 * const results = await searchPosts(null, {
 *   terms: "error warning",
 *   is_or_search: true,
 *   per_page: 20
 * });
 * ```
 */
export async function searchPosts(
  teamId: string | null,
  params: ISearchParams,
): Promise<IPostSearchResults> {
  const url = getSearchPostsUrl(teamId ?? undefined);
  return apiClient.post<IPostSearchResults>(url, params);
}

/**
 * Get flagged (saved) posts for a user
 *
 * @param userId - The user ID
 * @param params - Optional filter and pagination parameters
 * @returns List of flagged posts
 *
 * @example
 * ```typescript
 * // Get all flagged posts
 * const flagged = await getFlaggedPosts("user123");
 *
 * // Get flagged posts in a specific channel
 * const flagged = await getFlaggedPosts("user123", {
 *   channel_id: "channel456",
 *   page: 0,
 *   per_page: 50
 * });
 * ```
 */
export async function getFlaggedPosts(
  userId: string,
  params?: IGetFlaggedPostsParams,
): Promise<IPostList> {
  const url = new URL(getFlaggedPostsUrl(userId));

  if (params?.channel_id) {
    url.searchParams.set("channel_id", params.channel_id);
  }
  if (params?.team_id) {
    url.searchParams.set("team_id", params.team_id);
  }
  if (params?.page !== undefined) {
    url.searchParams.set("page", String(params.page));
  }
  if (params?.per_page !== undefined) {
    url.searchParams.set("per_page", String(params.per_page));
  }

  return apiClient.get<IPostList>(url.toString());
}

/**
 * Get pinned posts for a channel
 *
 * @param channelId - The channel ID
 * @returns List of pinned posts in the channel
 *
 * @example
 * ```typescript
 * const pinned = await getPinnedPosts("channel123");
 * console.log(`Found ${pinned.order.length} pinned posts`);
 * ```
 */
export async function getPinnedPosts(channelId: string): Promise<IPostList> {
  const url = getPinnedPostsUrl(channelId);
  return apiClient.get<IPostList>(url);
}

//#endregion
