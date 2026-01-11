// apps/v2/src/queries/teams/useTeamQuery.ts

/**
 * Query hook for fetching a single team
 *
 * @module queries/teams/useTeamQuery
 */

//#region Imports

import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";

import { getTeam } from "@/api/teams";
import type { ITeam } from "@/types";

import { queryKeys } from "../keys";

//#endregion

//#region Types

/**
 * Options for useTeamQuery hook
 * TData generic allows for select transformations
 */
export type IUseTeamQueryOptions<TData = ITeam> = Omit<
  UseQueryOptions<ITeam, Error, TData>,
  "queryKey" | "queryFn"
>;

//#endregion

//#region Hook

/**
 * Hook to fetch a single team by ID
 *
 * @param teamId - The team ID to fetch
 * @param options - Additional query options
 * @returns Query result with team data
 *
 * @example
 * ```tsx
 * const { data: team, isLoading } = useTeamQuery("team-123");
 * ```
 */
export function useTeamQuery<TData = ITeam>(
  teamId: string,
  options?: IUseTeamQueryOptions<TData>,
) {
  return useQuery({
    queryKey: queryKeys.teams.detail(teamId),
    queryFn: () => getTeam(teamId),
    enabled: Boolean(teamId),
    ...options,
  });
}

//#endregion
