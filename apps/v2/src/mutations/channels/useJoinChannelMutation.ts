// apps/v2/src/mutations/channels/useJoinChannelMutation.ts

/**
 * Join Channel Mutation Hook
 * Adds the current user to a channel and invalidates the channel members cache
 *
 * @module mutations/channels/useJoinChannelMutation
 */

//#region Imports

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/api";
import { getChannelMembersUrl } from "@/api/urls";
import { queryKeys } from "@/queries/keys";
import type { IChannelMembership } from "@/types";

//#endregion

//#region Types

/**
 * Input data for joining a channel
 */
export type IJoinChannelInput = {
  channel_id: string;
  user_id: string;
};

/**
 * Options for useJoinChannelMutation
 */
export type IJoinChannelMutationOptions = {
  onSuccess?: (membership: IChannelMembership) => void;
  onError?: (error: Error) => void;
};

//#endregion

//#region API Function

/**
 * Join a channel via API
 * @param input - Channel join data
 * @returns Channel membership
 */
async function joinChannel(
  input: IJoinChannelInput,
): Promise<IChannelMembership> {
  const url = getChannelMembersUrl(input.channel_id);
  return apiClient.post<IChannelMembership>(url, { user_id: input.user_id });
}

//#endregion

//#region Hook

/**
 * Hook for joining a channel
 *
 * @example
 * ```typescript
 * const { mutate, isPending } = useJoinChannelMutation();
 *
 * mutate({
 *   channel_id: 'channel123',
 *   user_id: 'user123',
 * });
 * ```
 */
export function useJoinChannelMutation(options?: IJoinChannelMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: joinChannel,
    onSuccess: (membership, variables) => {
      // Invalidate the channel members list to refetch with new member
      queryClient.invalidateQueries({
        queryKey: queryKeys.channels.members(variables.channel_id),
      });
      options?.onSuccess?.(membership);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

//#endregion
