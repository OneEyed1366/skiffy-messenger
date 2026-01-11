// apps/v2/src/mutations/threads/useFollowThreadMutation.ts

/**
 * Mutation hook for following/unfollowing a thread
 *
 * @module mutations/threads/useFollowThreadMutation
 */

//#region Imports

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/api";
import { getThreadUrl } from "@/api/urls";
import { queryKeys } from "@/queries/keys";
import type { IUserThread } from "@/types";

//#endregion

//#region Types

/**
 * Input for following/unfollowing a thread
 */
export type IFollowThreadInput = {
  user_id: string;
  thread_id: string;
  following: boolean;
};

/**
 * Response from follow/unfollow thread
 */
export type IFollowThreadResponse = IUserThread;

/**
 * Options for useFollowThreadMutation hook
 */
export type IUseFollowThreadMutationOptions = {
  onSuccess?: (thread: IFollowThreadResponse) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
};

//#endregion

//#region API Function

/**
 * Follow or unfollow a thread via API
 * @param input - Thread follow input
 * @returns Updated thread
 */
export async function followThread(
  input: IFollowThreadInput,
): Promise<IFollowThreadResponse> {
  const url = `${getThreadUrl(input.user_id, input.thread_id)}/following`;
  return apiClient.put<IFollowThreadResponse>(url, {
    state: input.following,
  });
}

//#endregion

//#region Hook

/**
 * Hook for following/unfollowing a thread with automatic cache invalidation
 *
 * @example
 * ```typescript
 * const { mutate: follow, isPending } = useFollowThreadMutation({
 *   onSuccess: (thread) => console.log('Updated follow:', thread.is_following),
 * });
 *
 * // Follow a thread
 * follow({
 *   user_id: 'user-123',
 *   thread_id: 'thread-456',
 *   following: true,
 * });
 *
 * // Unfollow a thread
 * follow({
 *   user_id: 'user-123',
 *   thread_id: 'thread-456',
 *   following: false,
 * });
 * ```
 */
export function useFollowThreadMutation(
  options?: IUseFollowThreadMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: followThread,
    onSuccess: (thread, variables) => {
      // Invalidate the thread detail query
      queryClient.invalidateQueries({
        queryKey: queryKeys.threads.detail(variables.user_id, variables.thread_id),
      });

      options?.onSuccess?.(thread);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
    onSettled: () => {
      options?.onSettled?.();
    },
  });
}

//#endregion
