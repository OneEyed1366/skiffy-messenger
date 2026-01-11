// apps/v2/src/mutations/categories/useDeleteCategoryMutation.ts

/**
 * Mutation hook for deleting channel categories
 *
 * @module mutations/categories/useDeleteCategoryMutation
 */

//#region Imports

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteChannelCategory } from "@/api";
import { queryKeys } from "@/queries/keys";

//#endregion

//#region Types

export type IDeleteCategoryMutationVariables = {
  userId: string;
  teamId: string;
  categoryId: string;
};

export type IUseDeleteCategoryMutationOptions = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

//#endregion

//#region Hook

/**
 * Mutation hook for deleting a channel category
 *
 * @param options - Optional callbacks
 * @returns Mutation object
 */
export function useDeleteCategoryMutation(
  options?: IUseDeleteCategoryMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      teamId,
      categoryId,
    }: IDeleteCategoryMutationVariables) =>
      deleteChannelCategory(userId, teamId, categoryId),
    onSuccess: (_data, { userId, teamId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.forTeam(userId, teamId),
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

//#endregion
