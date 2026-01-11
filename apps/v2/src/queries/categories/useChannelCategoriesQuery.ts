// apps/v2/src/queries/categories/useChannelCategoriesQuery.ts

/**
 * Query hook for fetching channel categories
 *
 * @module queries/categories/useChannelCategoriesQuery
 */

//#region Imports

import { useQuery } from "@tanstack/react-query";

import { getChannelCategories } from "@/api";
import { queryKeys } from "../keys";

//#endregion

//#region Types

export type IUseChannelCategoriesQueryOptions = {
  /** User ID */
  userId: string;
  /** Team ID */
  teamId: string;
  /** Whether the query is enabled */
  enabled?: boolean;
};

//#endregion

//#region Hook

/**
 * Query hook for fetching channel categories for a user in a team
 *
 * @param options - Query options including userId and teamId
 * @returns Query result with categories and order
 *
 * @example
 * ```typescript
 * const { data, isLoading } = useChannelCategoriesQuery({
 *   userId: "user123",
 *   teamId: "team456"
 * });
 * ```
 */
export function useChannelCategoriesQuery({
  userId,
  teamId,
  enabled = true,
}: IUseChannelCategoriesQueryOptions) {
  return useQuery({
    queryKey: queryKeys.categories.forTeam(userId, teamId),
    queryFn: () => getChannelCategories(userId, teamId),
    enabled: enabled && !!userId && !!teamId,
    staleTime: 5 * 60_000, // 5 minutes - categories change infrequently
  });
}

//#endregion
