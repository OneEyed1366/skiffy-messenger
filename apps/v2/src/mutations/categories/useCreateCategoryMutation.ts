// apps/v2/src/mutations/categories/useCreateCategoryMutation.ts

/**
 * Mutation hook for creating channel categories
 *
 * @module mutations/categories/useCreateCategoryMutation
 */

//#region Imports

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ICreateCategoryInput, IChannelCategory } from "@/api";
import { createChannelCategory } from "@/api";
import { queryKeys } from "@/queries/keys";

//#endregion

//#region Types

export type ICreateCategoryMutationVariables = {
  userId: string;
  teamId: string;
  category: ICreateCategoryInput;
};

export type IUseCreateCategoryMutationOptions = {
  onSuccess?: (data: IChannelCategory) => void;
  onError?: (error: Error) => void;
};

//#endregion

//#region Hook

/**
 * Mutation hook for creating a new channel category
 *
 * @param options - Optional callbacks
 * @returns Mutation object
 */
export function useCreateCategoryMutation(
  options?: IUseCreateCategoryMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      teamId,
      category,
    }: ICreateCategoryMutationVariables) =>
      createChannelCategory(userId, teamId, category),
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
