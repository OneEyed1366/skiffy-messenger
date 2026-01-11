// apps/v2/src/mutations/channels/useDeleteChannelMutation.ts

/**
 * Delete Channel Mutation Hook
 * Deletes/archives a channel and invalidates the team's channel list
 *
 * @module mutations/channels/useDeleteChannelMutation
 */

//#region Imports

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/api";
import { getChannelUrl } from "@/api/urls";
import { queryKeys } from "@/queries/keys";

//#endregion

//#region Types

/**
 * Input data for deleting a channel
 */
export type IDeleteChannelInput = {
  channel_id: string;
  team_id: string;
};

/**
 * Response from delete channel API
 */
export type IDeleteChannelResponse = {
  status: string;
};

/**
 * Options for useDeleteChannelMutation
 */
export type IDeleteChannelMutationOptions = {
  onSuccess?: (response: IDeleteChannelResponse) => void;
  onError?: (error: Error) => void;
};

//#endregion

//#region API Function

/**
 * Delete/archive a channel via API
 * @param input - Channel deletion data
 * @returns Delete status response
 */
async function deleteChannel(
  input: IDeleteChannelInput,
): Promise<IDeleteChannelResponse> {
  const url = getChannelUrl(input.channel_id);
  return apiClient.delete<IDeleteChannelResponse>(url);
}

//#endregion

//#region Hook

/**
 * Hook for deleting/archiving a channel
 *
 * @example
 * ```typescript
 * const { mutate, isPending } = useDeleteChannelMutation();
 *
 * mutate({
 *   channel_id: 'channel123',
 *   team_id: 'team123',
 * });
 * ```
 */
export function useDeleteChannelMutation(
  options?: IDeleteChannelMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteChannel,
    onSuccess: (response, variables) => {
      // Invalidate the team's channel list to refetch without deleted channel
      queryClient.invalidateQueries({
        queryKey: queryKeys.channels.list(variables.team_id),
      });
      // Also invalidate the channel detail cache
      queryClient.invalidateQueries({
        queryKey: queryKeys.channels.detail(variables.channel_id),
      });
      options?.onSuccess?.(response);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

//#endregion
