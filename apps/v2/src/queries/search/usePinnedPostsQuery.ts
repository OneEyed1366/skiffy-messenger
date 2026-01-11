// apps/v2/src/queries/search/usePinnedPostsQuery.ts

/**
 * Query hook for fetching pinned posts in a channel
 *
 * @module queries/search/usePinnedPostsQuery
 */

//#region Imports

import { useQuery } from "@tanstack/react-query";

import { getPinnedPosts } from "@/api";
import { queryKeys } from "../keys";

//#endregion

//#region Types

export type IUsePinnedPostsQueryOptions = {
  /** Channel ID */
  channelId: string;
  /** Whether the query is enabled */
  enabled?: boolean;
};

//#endregion

//#region Hook

/**
 * Query hook for fetching pinned posts in a channel
 *
 * @param options - Query options including channelId
 * @returns Query result with pinned posts
 *
 * @example
 * ```typescript
 * const { data, isLoading } = usePinnedPostsQuery({
 *   channelId: "channel123"
 * });
 * ```
 */
export function usePinnedPostsQuery({
  channelId,
  enabled = true,
}: IUsePinnedPostsQueryOptions) {
  return useQuery({
    queryKey: queryKeys.search.pinned(channelId),
    queryFn: () => getPinnedPosts(channelId),
    enabled: enabled && !!channelId,
    staleTime: 60_000, // 1 minute
  });
}

//#endregion
