// apps/v2/src/queries/reactions/useReactionsForPostQuery.ts

/**
 * Query hook for fetching reactions for a post
 *
 * @module queries/reactions/useReactionsForPostQuery
 */

//#region Imports

import { useQuery } from "@tanstack/react-query";

import { getReactionsForPost } from "@/api";
import { queryKeys } from "../keys";

//#endregion

//#region Types

export type IUseReactionsForPostQueryOptions = {
  /** Post ID to fetch reactions for */
  postId: string;
  /** Whether the query is enabled */
  enabled?: boolean;
};

//#endregion

//#region Hook

/**
 * Query hook for fetching all reactions for a post
 *
 * @param options - Query options including postId
 * @returns Query result with reactions array
 *
 * @example
 * ```typescript
 * const { data: reactions, isLoading } = useReactionsForPostQuery({
 *   postId: "post123"
 * });
 * ```
 */
export function useReactionsForPostQuery({
  postId,
  enabled = true,
}: IUseReactionsForPostQueryOptions) {
  return useQuery({
    queryKey: queryKeys.reactions.forPost(postId),
    queryFn: () => getReactionsForPost(postId),
    enabled: enabled && !!postId,
    staleTime: 30_000, // 30 seconds - reactions can change frequently
  });
}

//#endregion
