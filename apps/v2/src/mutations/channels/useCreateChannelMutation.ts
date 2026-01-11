// apps/v2/src/mutations/channels/useCreateChannelMutation.ts

/**
 * Create Channel Mutation Hook
 * Creates a new channel and invalidates the team's channel list
 *
 * @module mutations/channels/useCreateChannelMutation
 */

//#region Imports

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/api";
import { getTeamChannelsUrl } from "@/api/urls";
import { queryKeys } from "@/queries/keys";
import type { IChannel, IChannelType } from "@/types";

//#endregion

//#region Types

/**
 * Input data for creating a channel
 */
export type ICreateChannelInput = {
  team_id: string;
  name: string;
  display_name: string;
  type: IChannelType;
  purpose?: string;
  header?: string;
};

/**
 * Options for useCreateChannelMutation
 */
export type ICreateChannelMutationOptions = {
  onSuccess?: (channel: IChannel) => void;
  onError?: (error: Error) => void;
};

//#endregion

//#region API Function

/**
 * Create a new channel via API
 * @param input - Channel creation data
 * @returns Created channel
 */
async function createChannel(input: ICreateChannelInput): Promise<IChannel> {
  const url = getTeamChannelsUrl(input.team_id);
  return apiClient.post<IChannel>(url, input);
}

//#endregion

//#region Hook

/**
 * Hook for creating a new channel
 *
 * @example
 * ```typescript
 * const { mutate, isPending } = useCreateChannelMutation();
 *
 * mutate({
 *   team_id: 'team123',
 *   name: 'general',
 *   display_name: 'General',
 *   type: 'O',
 * });
 * ```
 */
export function useCreateChannelMutation(
  options?: ICreateChannelMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createChannel,
    onSuccess: (channel) => {
      // Invalidate the team's channel list to refetch with new channel
      queryClient.invalidateQueries({
        queryKey: queryKeys.channels.list(channel.team_id),
      });
      options?.onSuccess?.(channel);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

//#endregion
