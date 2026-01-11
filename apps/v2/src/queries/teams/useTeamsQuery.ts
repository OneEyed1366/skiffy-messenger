// apps/v2/src/queries/teams/useTeamsQuery.ts

/**
 * Query hook for fetching teams list for the current user
 *
 * @module queries/teams/useTeamsQuery
 */

//#region Imports

import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";

import { getTeams } from "@/api/teams";
import type { ITeam } from "@/types";

import { queryKeys } from "../keys";

//#endregion

//#region Types

/**
 * Options for useTeamsQuery hook
 * TData generic allows for select transformations
 */
export type IUseTeamsQueryOptions<TData = ITeam[]> = Omit<
  UseQueryOptions<ITeam[], Error, TData>,
  "queryKey" | "queryFn"
>;

//#endregion

//#region Hook

/**
 * Hook to fetch teams for the current user
 *
 * @param options - Additional query options
 * @returns Query result with teams data
 *
 * @example
 * ```tsx
 * const { data: teams, isLoading } = useTeamsQuery();
 * ```
 */
export function useTeamsQuery<TData = ITeam[]>(
  options?: IUseTeamsQueryOptions<TData>,
) {
  return useQuery({
    queryKey: queryKeys.teams.list(),
    queryFn: () => getTeams(),
    ...options,
  });
}

//#endregion
