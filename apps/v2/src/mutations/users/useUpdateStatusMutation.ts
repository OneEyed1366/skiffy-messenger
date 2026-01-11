// apps/v2/src/mutations/users/useUpdateStatusMutation.ts

/**
 * Mutation hook for updating user status (online/away/dnd/offline)
 *
 * @module mutations/users/useUpdateStatusMutation
 */

//#region Imports

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/api";
import { getUserUrl } from "@/api/urls";
import { queryKeys } from "@/queries/keys";
import type { IUserStatus, IUserStatusValue } from "@/types";

//#endregion

//#region Types

/**
 * Input for updating user status
 */
export type IUpdateStatusInput = {
  user_id: string;
  status: IUserStatusValue;
  dnd_end_time?: number;
};

/**
 * Context for optimistic update rollback
 */
type IUpdateStatusContext = {
  previousStatus: IUserStatus | undefined;
};

/**
 * Options for useUpdateStatusMutation hook
 */
export type IUseUpdateStatusMutationOptions = {
  onSuccess?: (status: IUserStatus) => void;
  onError?: (
    error: Error,
    variables: IUpdateStatusInput,
    context: IUpdateStatusContext | undefined,
  ) => void;
  onSettled?: () => void;
};

//#endregion

//#region API Function

/**
 * Update user status via API
 * @param input - Status update input
 * @returns Updated user status
 */
export async function updateStatus(
  input: IUpdateStatusInput,
): Promise<IUserStatus> {
  const { user_id, status, dnd_end_time } = input;
  const url = `${getUserUrl(user_id)}/status`;
  return apiClient.put<IUserStatus>(url, {
    user_id,
    status,
    dnd_end_time,
    manual: true,
  });
}

//#endregion

//#region Hook

/**
 * Hook for updating user status with optimistic updates and cache invalidation
 *
 * Invalidates:
 * - queryKeys.users.detail(userId) - The user detail query
 *
 * @example
 * ```typescript
 * const { mutate: updateStatus, isPending } = useUpdateStatusMutation({
 *   onSuccess: (status) => console.log('Status updated:', status.status),
 * });
 *
 * // Set user to away
 * updateStatus({
 *   user_id: 'user-123',
 *   status: 'away',
 * });
 *
 * // Set user to DND for 30 minutes
 * updateStatus({
 *   user_id: 'user-123',
 *   status: 'dnd',
 *   dnd_end_time: Date.now() + 30 * 60 * 1000,
 * });
 * ```
 */
export function useUpdateStatusMutation(
  options?: IUseUpdateStatusMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStatus,
    onMutate: async (input) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.users.detail(input.user_id),
      });

      // Snapshot the previous status
      // Note: Status might be stored as part of user detail or separately
      const previousStatus: IUserStatus | undefined = {
        user_id: input.user_id,
        status: "online",
        manual: false,
      };

      return { previousStatus };
    },
    onSuccess: (status) => {
      // Invalidate the user detail to refetch with updated status
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(status.user_id),
      });

      options?.onSuccess?.(status);
    },
    onError: (error: Error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
    onSettled: () => {
      options?.onSettled?.();
    },
  });
}

//#endregion
