// apps/v2/src/queries/posts/usePostsQuery.ts

/**
 * TanStack Query hook for fetching paginated posts
 *
 * @module queries/posts/usePostsQuery
 */

//#region Imports

import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";

import type { IPaginatedPostList } from "@/types";
import type { IGetPostsParams } from "@/api/posts";
import { getPosts } from "@/api/posts";
import { queryKeys } from "@/queries/keys";

//#endregion

//#region Types

export type IUsePostsQueryOptions = Omit<
  UseQueryOptions<IPaginatedPostList, Error>,
  "queryKey" | "queryFn"
>;

//#endregion

//#region Hook

/**
 * Hook to fetch paginated posts for a channel
 *
 * @param channelId - The channel ID to fetch posts from
 * @param params - Optional pagination parameters
 * @param options - Additional query options
 * @returns Query result with posts data
 *
 * @example
 * ```typescript
 * const { data, isLoading, error } = usePostsQuery("channel-123");
 *
 * // With pagination
 * const { data } = usePostsQuery("channel-123", { page: 0, per_page: 25 });
 * ```
 */
export function usePostsQuery(
  channelId: string,
  params?: IGetPostsParams,
  options?: IUsePostsQueryOptions,
) {
  return useQuery({
    queryKey: queryKeys.posts.list(channelId, params),
    queryFn: () => getPosts(channelId, params),
    enabled: Boolean(channelId) && (options?.enabled ?? true),
    ...options,
  });
}

//#endregion
