// apps/v2/src/api/threads.ts

/**
 * Threads API Functions for L7 State Management
 *
 * @module api/threads
 */

//#region Imports

import type { IUserThread, IUserThreadList } from "@/types";

import { apiClient } from "./client";
import { getThreadsUrl, getThreadUrl } from "./urls";

//#endregion

//#region Types

/**
 * Parameters for fetching threads
 */
export type IGetThreadsParams = {
  page?: number;
  per_page?: number;
  extended?: boolean;
  deleted?: boolean;
  unread?: boolean;
  since?: number;
  threadsOnly?: boolean;
};

/**
 * Response for marking a thread as read
 */
export type IMarkThreadReadResponse = {
  status: string;
};

/**
 * Response for follow/unfollow thread
 */
export type IFollowThreadResponse = {
  status: string;
};

//#endregion

//#region Thread API Functions

/**
 * Fetch threads for a user
 * @param userId - The user ID to fetch threads for
 * @param teamId - Optional team ID to filter threads
 * @param params - Optional pagination and filter parameters
 * @returns Thread list with totals and threads data
 */
export async function getThreads(
  userId: string,
  teamId?: string,
  params?: IGetThreadsParams,
): Promise<IUserThreadList> {
  const url = new URL(getThreadsUrl(userId));

  if (teamId) {
    url.searchParams.set("teamId", teamId);
  }

  if (params?.page !== undefined) {
    url.searchParams.set("page", String(params.page));
  }
  if (params?.per_page !== undefined) {
    url.searchParams.set("per_page", String(params.per_page));
  }
  if (params?.extended !== undefined) {
    url.searchParams.set("extended", String(params.extended));
  }
  if (params?.deleted !== undefined) {
    url.searchParams.set("deleted", String(params.deleted));
  }
  if (params?.unread !== undefined) {
    url.searchParams.set("unread", String(params.unread));
  }
  if (params?.since !== undefined) {
    url.searchParams.set("since", String(params.since));
  }
  if (params?.threadsOnly !== undefined) {
    url.searchParams.set("threadsOnly", String(params.threadsOnly));
  }

  return apiClient.get<IUserThreadList>(url.toString());
}

/**
 * Fetch a single thread by ID
 * @param userId - The user ID
 * @param threadId - The thread ID to fetch
 * @returns The thread data
 */
export async function getThread(
  userId: string,
  threadId: string,
): Promise<IUserThread> {
  return apiClient.get<IUserThread>(getThreadUrl(userId, threadId));
}

/**
 * Mark a thread as read at a specific timestamp
 * @param userId - The user ID
 * @param threadId - The thread ID to mark as read
 * @param timestamp - The timestamp to mark read up to
 * @returns Status response
 */
export async function markThreadRead(
  userId: string,
  threadId: string,
  timestamp: number,
): Promise<IMarkThreadReadResponse> {
  const url = `${getThreadUrl(userId, threadId)}/read/${timestamp}`;
  return apiClient.put<IMarkThreadReadResponse>(url);
}

/**
 * Follow or unfollow a thread
 * @param userId - The user ID
 * @param threadId - The thread ID to follow/unfollow
 * @param following - Whether to follow (true) or unfollow (false)
 * @returns Status response
 */
export async function followThread(
  userId: string,
  threadId: string,
  following: boolean,
): Promise<IFollowThreadResponse> {
  const url = `${getThreadUrl(userId, threadId)}/following`;

  if (following) {
    return apiClient.put<IFollowThreadResponse>(url);
  }

  return apiClient.delete<IFollowThreadResponse>(url);
}

//#endregion
