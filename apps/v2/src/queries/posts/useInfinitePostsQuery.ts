// apps/v2/src/queries/posts/useInfinitePostsQuery.ts

/**
 * TanStack Query hook for infinite scroll posts
 *
 * @module queries/posts/useInfinitePostsQuery
 */

//#region Imports

import { useInfiniteQuery } from "@tanstack/react-query";

import type { IPaginatedPostList } from "@/types";
import { getPosts } from "@/api/posts";
import { queryKeys } from "@/queries/keys";

//#endregion

//#region Types

export type IUseInfinitePostsQueryOptions = {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
};

//#endregion

//#region Hook

/**
 * Hook to fetch posts with infinite scroll pagination
 *
 * @param channelId - The channel ID to fetch posts from
 * @param options - Additional query options
 * @returns Infinite query result with posts pages
 *
 * @example
 * ```typescript
 * const {
 *   data,
 *   isLoading,
 *   fetchNextPage,
 *   hasNextPage,
 *   isFetchingNextPage,
 * } = useInfinitePostsQuery("channel-123");
 *
 * // Access flattened posts
 * const allPosts = data?.pages.flatMap(page => page.order.map(id => page.posts[id]));
 * ```
 */
export function useInfinitePostsQuery(
  channelId: string,
  options?: IUseInfinitePostsQueryOptions,
) {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.infinite(channelId),
    queryFn: ({ pageParam }) =>
      getPosts(channelId, { before: pageParam, per_page: 25 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: IPaginatedPostList) => {
      // If there are no more posts, return undefined to signal end
      if (!lastPage.has_next) {
        return undefined;
      }
      // Use the last post ID as the cursor for the next page
      const lastPostId = lastPage.order[lastPage.order.length - 1];
      return lastPostId;
    },
    enabled: Boolean(channelId) && (options?.enabled ?? true),
    ...options,
  });
}

//#endregion
