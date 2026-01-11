// apps/v2/src/queries/posts/usePostQuery.ts

/**
 * TanStack Query hook for fetching a single post
 *
 * @module queries/posts/usePostQuery
 */

//#region Imports

import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";

import type { IPost } from "@/types";
import { getPost } from "@/api/posts";
import { queryKeys } from "@/queries/keys";

//#endregion

//#region Types

export type IUsePostQueryOptions = Omit<
  UseQueryOptions<IPost, Error>,
  "queryKey" | "queryFn"
>;

//#endregion

//#region Hook

/**
 * Hook to fetch a single post by ID
 *
 * @param postId - The post ID to fetch
 * @param options - Additional query options
 * @returns Query result with post data
 *
 * @example
 * ```typescript
 * const { data, isLoading, error } = usePostQuery("post-123");
 *
 * // With options
 * const { data } = usePostQuery("post-123", { staleTime: 5000 });
 * ```
 */
export function usePostQuery(postId: string, options?: IUsePostQueryOptions) {
  return useQuery({
    queryKey: queryKeys.posts.detail(postId),
    queryFn: () => getPost(postId),
    enabled: Boolean(postId) && (options?.enabled ?? true),
    ...options,
  });
}

//#endregion
