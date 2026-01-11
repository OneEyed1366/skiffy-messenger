// apps/v2/src/api/posts.ts

/**
 * Posts API Functions for L7 State Management
 *
 * @module api/posts
 */

//#region Imports

import type { IPost, IPaginatedPostList, IReaction } from "@/types";

import { apiClient } from "./client";
import {
  getChannelPostsUrl,
  getPostPinUrl,
  getPostReactionsUrl,
  getPostUnpinUrl,
  getPostUrl,
} from "./urls";

//#endregion

//#region Types

/**
 * Parameters for fetching posts
 */
export type IGetPostsParams = {
  page?: number;
  per_page?: number;
  since?: number;
  before?: string;
  after?: string;
};

/**
 * Data for creating a new post
 */
export type ICreatePostData = {
  message: string;
  root_id?: string;
  file_ids?: string[];
  props?: Record<string, unknown>;
};

/**
 * Data for updating an existing post
 */
export type IUpdatePostData = {
  id: string;
  message: string;
  props?: Record<string, unknown>;
};

//#endregion

//#region Post API Functions

/**
 * Fetch paginated posts for a channel
 * @param channelId - The channel ID to fetch posts from
 * @param params - Optional pagination parameters
 * @returns Paginated post list
 */
export async function getPosts(
  channelId: string,
  params?: IGetPostsParams,
): Promise<IPaginatedPostList> {
  const url = new URL(getChannelPostsUrl(channelId));

  if (params?.page !== undefined) {
    url.searchParams.set("page", String(params.page));
  }
  if (params?.per_page !== undefined) {
    url.searchParams.set("per_page", String(params.per_page));
  }
  if (params?.since !== undefined) {
    url.searchParams.set("since", String(params.since));
  }
  if (params?.before !== undefined) {
    url.searchParams.set("before", params.before);
  }
  if (params?.after !== undefined) {
    url.searchParams.set("after", params.after);
  }

  return apiClient.get<IPaginatedPostList>(url.toString());
}

/**
 * Fetch a single post by ID
 * @param postId - The post ID to fetch
 * @returns The post
 */
export async function getPost(postId: string): Promise<IPost> {
  return apiClient.get<IPost>(getPostUrl(postId));
}

/**
 * Create a new post in a channel
 * @param channelId - The channel ID to create the post in
 * @param data - The post data
 * @returns The created post
 */
export async function createPost(
  channelId: string,
  data: ICreatePostData,
): Promise<IPost> {
  const url = getChannelPostsUrl(channelId);
  return apiClient.post<IPost>(url, {
    channel_id: channelId,
    ...data,
  });
}

/**
 * Update an existing post
 * @param postId - The post ID to update
 * @param data - The updated post data
 * @returns The updated post
 */
export async function updatePost(
  postId: string,
  data: IUpdatePostData,
): Promise<IPost> {
  const url = getPostUrl(postId);
  return apiClient.put<IPost>(url, data);
}

/**
 * Delete a post
 * @param postId - The post ID to delete
 * @returns void on success
 */
export async function deletePost(postId: string): Promise<void> {
  const url = getPostUrl(postId);
  return apiClient.delete<void>(url);
}

/**
 * Pin a post to the channel
 * @param postId - The post ID to pin
 * @returns void on success
 */
export async function pinPost(postId: string): Promise<void> {
  const url = getPostPinUrl(postId);
  return apiClient.post<void>(url, {});
}

/**
 * Unpin a post from the channel
 * @param postId - The post ID to unpin
 * @returns void on success
 */
export async function unpinPost(postId: string): Promise<void> {
  const url = getPostUnpinUrl(postId);
  return apiClient.post<void>(url, {});
}

/**
 * Get all reactions for a post
 * @param postId - The post ID to get reactions for
 * @returns Array of reactions
 */
export async function getReactionsForPost(
  postId: string,
): Promise<IReaction[]> {
  const url = getPostReactionsUrl(postId);
  return apiClient.get<IReaction[]>(url);
}

//#endregion

//#region Reaction API Functions

/**
 * Add a reaction to a post
 * @param postId - The post ID to react to
 * @param emojiName - The emoji name (without colons)
 * @returns The created reaction
 */
export async function addReaction(
  postId: string,
  emojiName: string,
): Promise<IReaction> {
  const url = `${apiClient.getBaseRoute()}/reactions`;
  return apiClient.post<IReaction>(url, {
    post_id: postId,
    emoji_name: emojiName,
  });
}

/**
 * Remove a reaction from a post
 * @param postId - The post ID to remove the reaction from
 * @param emojiName - The emoji name to remove
 * @returns void on success
 */
export async function removeReaction(
  postId: string,
  emojiName: string,
): Promise<void> {
  // Get current user ID from somewhere (typically stored in app state)
  // For now, we'll construct the URL pattern the API expects
  const url = `${apiClient.getBaseRoute()}/posts/${postId}/reactions/${emojiName}`;
  return apiClient.delete<void>(url);
}

//#endregion
