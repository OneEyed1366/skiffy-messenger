// apps/v2/src/queries/channels/useChannelsQuery.ts

/**
 * Query hook for fetching channels list for a team
 *
 * @module queries/channels/useChannelsQuery
 */

//#region Imports

import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";

import { getChannels } from "@/api/channels";
import type { IChannel } from "@/types";

import { queryKeys } from "../keys";

//#endregion

//#region Types

/**
 * Options for useChannelsQuery hook
 * TData generic allows for select transformations
 */
export type IUseChannelsQueryOptions<TData = IChannel[]> = Omit<
  UseQueryOptions<IChannel[], Error, TData>,
  "queryKey" | "queryFn"
>;

//#endregion

//#region Hook

/**
 * Hook to fetch channels for a team
 *
 * @param teamId - The team ID to fetch channels for
 * @param options - Additional query options
 * @returns Query result with channels data
 *
 * @example
 * ```tsx
 * const { data: channels, isLoading } = useChannelsQuery("team-123");
 * ```
 */
export function useChannelsQuery<TData = IChannel[]>(
  teamId: string,
  options?: IUseChannelsQueryOptions<TData>,
) {
  return useQuery({
    queryKey: queryKeys.channels.list(teamId),
    queryFn: () => getChannels(teamId),
    enabled: Boolean(teamId),
    ...options,
  });
}

//#endregion
