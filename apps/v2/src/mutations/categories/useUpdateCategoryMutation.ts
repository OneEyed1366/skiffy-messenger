// apps/v2/src/mutations/categories/useUpdateCategoryMutation.ts

/**
 * Mutation hook for updating channel categories
 *
 * @module mutations/categories/useUpdateCategoryMutation
 */

//#region Imports

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { IUpdateCategoryInput, IChannelCategory } from "@/api";
import { updateChannelCategory } from "@/api";
import { queryKeys } from "@/queries/keys";

//#endregion

//#region Types

export type IUpdateCategoryMutationVariables = {
  userId: string;
  teamId: string;
  categoryId: string;
  data: IUpdateCategoryInput;
};

export type IUseUpdateCategoryMutationOptions = {
  onSuccess?: (data: IChannelCategory) => void;
  onError?: (error: Error) => void;
};

//#endregion

//#region Hook

/**
 * Mutation hook for updating a channel category
 *
 * @param options - Optional callbacks
 * @returns Mutation object
 */
export function useUpdateCategoryMutation(
  options?: IUseUpdateCategoryMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      teamId,
      categoryId,
      data,
    }: IUpdateCategoryMutationVariables) =>
      updateChannelCategory(userId, teamId, categoryId, data),
    onSuccess: (data, { userId, teamId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.forTeam(userId, teamId),
      });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

//#endregion
