// apps/v2/src/queries/channels/useChannelQuery.ts

/**
 * Query hook for fetching a single channel
 *
 * @module queries/channels/useChannelQuery
 */

//#region Imports

import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";

import { getChannel } from "@/api/channels";
import type { IChannel } from "@/types";

import { queryKeys } from "../keys";

//#endregion

//#region Types

/**
 * Options for useChannelQuery hook
 * TData generic allows for select transformations
 */
export type IUseChannelQueryOptions<TData = IChannel> = Omit<
  UseQueryOptions<IChannel, Error, TData>,
  "queryKey" | "queryFn"
>;

//#endregion

//#region Hook

/**
 * Hook to fetch a single channel by ID
 *
 * @param channelId - The channel ID to fetch
 * @param options - Additional query options
 * @returns Query result with channel data
 *
 * @example
 * ```tsx
 * const { data: channel, isLoading } = useChannelQuery("channel-123");
 * ```
 */
export function useChannelQuery<TData = IChannel>(
  channelId: string,
  options?: IUseChannelQueryOptions<TData>,
) {
  return useQuery({
    queryKey: queryKeys.channels.detail(channelId),
    queryFn: () => getChannel(channelId),
    enabled: Boolean(channelId),
    ...options,
  });
}

//#endregion
