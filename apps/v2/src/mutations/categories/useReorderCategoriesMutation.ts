// apps/v2/src/mutations/categories/useReorderCategoriesMutation.ts

/**
 * Mutation hook for reordering channel categories
 *
 * @module mutations/categories/useReorderCategoriesMutation
 */

//#region Imports

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateCategoryOrder } from "@/api";
import { queryKeys } from "@/queries/keys";

//#endregion

//#region Types

export type IReorderCategoriesMutationVariables = {
  userId: string;
  teamId: string;
  order: string[];
};

export type IUseReorderCategoriesMutationOptions = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

//#endregion

//#region Hook

/**
 * Mutation hook for reordering channel categories
 *
 * @param options - Optional callbacks
 * @returns Mutation object
 */
export function useReorderCategoriesMutation(
  options?: IUseReorderCategoriesMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      teamId,
      order,
    }: IReorderCategoriesMutationVariables) =>
      updateCategoryOrder(userId, teamId, order),
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
