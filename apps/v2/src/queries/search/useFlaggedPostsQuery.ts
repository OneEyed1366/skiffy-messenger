// apps/v2/src/queries/search/useFlaggedPostsQuery.ts

/**
 * Query hook for fetching user's flagged (saved) posts
 *
 * @module queries/search/useFlaggedPostsQuery
 */

//#region Imports

import { useQuery } from "@tanstack/react-query";

import type { IGetFlaggedPostsParams } from "@/api";
import { getFlaggedPosts } from "@/api";
import { queryKeys } from "../keys";

//#endregion

//#region Types

export type IUseFlaggedPostsQueryOptions = {
  /** User ID */
  userId: string;
  /** Optional filter parameters */
  params?: IGetFlaggedPostsParams;
  /** Whether the query is enabled */
  enabled?: boolean;
};

//#endregion

//#region Hook

/**
 * Query hook for fetching a user's flagged/saved posts
 *
 * @param options - Query options including userId and optional params
 * @returns Query result with flagged posts
 *
 * @example
 * ```typescript
 * const { data, isLoading } = useFlaggedPostsQuery({
 *   userId: "user123",
 *   params: { channel_id: "channel456" }
 * });
 * ```
 */
export function useFlaggedPostsQuery({
  userId,
  params,
  enabled = true,
}: IUseFlaggedPostsQueryOptions) {
  return useQuery({
    queryKey: queryKeys.search.flagged(userId, params),
    queryFn: () => getFlaggedPosts(userId, params),
    enabled: enabled && !!userId,
    staleTime: 60_000, // 1 minute
  });
}

//#endregion
