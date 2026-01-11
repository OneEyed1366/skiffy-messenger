// apps/v2/src/mutations/channels/useUpdateChannelMutation.ts

/**
 * Update Channel Mutation Hook
 * Updates an existing channel and invalidates the channel detail cache
 *
 * @module mutations/channels/useUpdateChannelMutation
 */

//#region Imports

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/api";
import { getChannelUrl } from "@/api/urls";
import { queryKeys } from "@/queries/keys";
import type { IChannel } from "@/types";

//#endregion

//#region Types

/**
 * Input data for updating a channel
 */
export type IUpdateChannelInput = {
  channel_id: string;
  display_name?: string;
  name?: string;
  purpose?: string;
  header?: string;
};

/**
 * Options for useUpdateChannelMutation
 */
export type IUpdateChannelMutationOptions = {
  onSuccess?: (channel: IChannel) => void;
  onError?: (error: Error) => void;
};

//#endregion

//#region API Function

/**
 * Update an existing channel via API
 * @param input - Channel update data
 * @returns Updated channel
 */
async function updateChannel(input: IUpdateChannelInput): Promise<IChannel> {
  const { channel_id, ...data } = input;
  const url = getChannelUrl(channel_id);
  return apiClient.put<IChannel>(url, data);
}

//#endregion

//#region Hook

/**
 * Hook for updating an existing channel
 *
 * @example
 * ```typescript
 * const { mutate, isPending } = useUpdateChannelMutation();
 *
 * mutate({
 *   channel_id: 'channel123',
 *   display_name: 'Updated Name',
 *   purpose: 'New purpose',
 * });
 * ```
 */
export function useUpdateChannelMutation(
  options?: IUpdateChannelMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateChannel,
    onSuccess: (channel) => {
      // Invalidate the channel detail to refetch with updated data
      queryClient.invalidateQueries({
        queryKey: queryKeys.channels.detail(channel.id),
      });
      options?.onSuccess?.(channel);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

//#endregion
