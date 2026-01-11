// apps/v2/src/queries/search/useSearchPostsQuery.ts

/**
 * Query hook for searching posts
 *
 * @module queries/search/useSearchPostsQuery
 */

//#region Imports

import { useQuery } from "@tanstack/react-query";

import type { ISearchParams } from "@/api";
import { searchPosts } from "@/api";
import { queryKeys } from "../keys";

//#endregion

//#region Types

export type IUseSearchPostsQueryOptions = {
  /** Team ID to search within, or null for global search */
  teamId: string | null;
  /** Search parameters */
  params: ISearchParams;
  /** Whether the query is enabled */
  enabled?: boolean;
};

//#endregion

//#region Hook

/**
 * Query hook for searching posts
 *
 * @param options - Search options including teamId and params
 * @returns Query result with search results
 *
 * @example
 * ```typescript
 * const { data, isLoading } = useSearchPostsQuery({
 *   teamId: "team123",
 *   params: { terms: "bug fix" }
 * });
 * ```
 */
export function useSearchPostsQuery({
  teamId,
  params,
  enabled = true,
}: IUseSearchPostsQueryOptions) {
  return useQuery({
    queryKey: queryKeys.search.posts(teamId, params.terms, params),
    queryFn: () => searchPosts(teamId, params),
    enabled: enabled && params.terms.trim().length > 0,
    staleTime: 30_000, // 30 seconds - search results can change frequently
  });
}

//#endregion
