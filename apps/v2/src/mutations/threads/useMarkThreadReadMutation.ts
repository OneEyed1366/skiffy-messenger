// apps/v2/src/mutations/threads/useMarkThreadReadMutation.ts

/**
 * Mutation hook for marking a thread as read
 *
 * @module mutations/threads/useMarkThreadReadMutation
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
 * Input for marking a thread as read
 */
export type IMarkThreadReadInput = {
  user_id: string;
  thread_id: string;
  timestamp?: number;
};

/**
 * Response from marking thread as read
 */
export type IMarkThreadReadResponse = IUserThread;

/**
 * Options for useMarkThreadReadMutation hook
 */
export type IUseMarkThreadReadMutationOptions = {
  onSuccess?: (thread: IMarkThreadReadResponse) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
};

//#endregion

//#region API Function

/**
 * Mark a thread as read via API
 * @param input - Thread read input
 * @returns Updated thread
 */
export async function markThreadRead(
  input: IMarkThreadReadInput,
): Promise<IMarkThreadReadResponse> {
  const url = `${getThreadUrl(input.user_id, input.thread_id)}/read`;
  return apiClient.put<IMarkThreadReadResponse>(url, {
    timestamp: input.timestamp ?? Date.now(),
  });
}

//#endregion

//#region Hook

/**
 * Hook for marking a thread as read with automatic cache invalidation
 *
 * @example
 * ```typescript
 * const { mutate: markRead, isPending } = useMarkThreadReadMutation({
 *   onSuccess: (thread) => console.log('Marked read:', thread.id),
 * });
 *
 * markRead({
 *   user_id: 'user-123',
 *   thread_id: 'thread-456',
 * });
 * ```
 */
export function useMarkThreadReadMutation(
  options?: IUseMarkThreadReadMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markThreadRead,
    onSuccess: (thread, variables) => {
      // Invalidate the thread detail query
      queryClient.invalidateQueries({
        queryKey: queryKeys.threads.detail(
          variables.user_id,
          variables.thread_id,
        ),
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
