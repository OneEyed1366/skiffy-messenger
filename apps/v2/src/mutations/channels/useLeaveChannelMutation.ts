// apps/v2/src/mutations/channels/useLeaveChannelMutation.ts

/**
 * Leave Channel Mutation Hook
 * Removes the current user from a channel and invalidates the channel members cache
 *
 * @module mutations/channels/useLeaveChannelMutation
 */

//#region Imports

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/api";
import { getChannelMembersUrl } from "@/api/urls";
import { queryKeys } from "@/queries/keys";

//#endregion

//#region Types

/**
 * Input data for leaving a channel
 */
export type ILeaveChannelInput = {
  channel_id: string;
  user_id: string;
};

/**
 * Response from leave channel API
 */
export type ILeaveChannelResponse = {
  status: string;
};

/**
 * Options for useLeaveChannelMutation
 */
export type ILeaveChannelMutationOptions = {
  onSuccess?: (response: ILeaveChannelResponse) => void;
  onError?: (error: Error) => void;
};

//#endregion

//#region API Function

/**
 * Leave a channel via API
 * @param input - Channel leave data
 * @returns Leave status response
 */
async function leaveChannel(
  input: ILeaveChannelInput,
): Promise<ILeaveChannelResponse> {
  const url = `${getChannelMembersUrl(input.channel_id)}/${input.user_id}`;
  return apiClient.delete<ILeaveChannelResponse>(url);
}

//#endregion

//#region Hook

/**
 * Hook for leaving a channel
 *
 * @example
 * ```typescript
 * const { mutate, isPending } = useLeaveChannelMutation();
 *
 * mutate({
 *   channel_id: 'channel123',
 *   user_id: 'user123',
 * });
 * ```
 */
export function useLeaveChannelMutation(
  options?: ILeaveChannelMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveChannel,
    onSuccess: (response, variables) => {
      // Invalidate the channel members list to refetch without the user
      queryClient.invalidateQueries({
        queryKey: queryKeys.channels.members(variables.channel_id),
      });
      options?.onSuccess?.(response);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

//#endregion
