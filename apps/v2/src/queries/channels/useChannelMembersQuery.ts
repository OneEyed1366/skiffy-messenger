// apps/v2/src/queries/channels/useChannelMembersQuery.ts

/**
 * Query hook for fetching channel members
 *
 * @module queries/channels/useChannelMembersQuery
 */

//#region Imports

import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";

import { getChannelMembers } from "@/api/channels";
import type { IChannelMembership } from "@/types";

import { queryKeys } from "../keys";

//#endregion

//#region Types

/**
 * Options for useChannelMembersQuery hook
 * TData generic allows for select transformations
 */
export type IUseChannelMembersQueryOptions<TData = IChannelMembership[]> = Omit<
  UseQueryOptions<IChannelMembership[], Error, TData>,
  "queryKey" | "queryFn"
>;

//#endregion

//#region Hook

/**
 * Hook to fetch members of a channel
 *
 * @param channelId - The channel ID to fetch members for
 * @param options - Additional query options
 * @returns Query result with channel members data
 *
 * @example
 * ```tsx
 * const { data: members, isLoading } = useChannelMembersQuery("channel-123");
 * ```
 */
export function useChannelMembersQuery<TData = IChannelMembership[]>(
  channelId: string,
  options?: IUseChannelMembersQueryOptions<TData>,
) {
  return useQuery({
    queryKey: queryKeys.channels.members(channelId),
    queryFn: () => getChannelMembers(channelId),
    enabled: Boolean(channelId),
    ...options,
  });
}

//#endregion
