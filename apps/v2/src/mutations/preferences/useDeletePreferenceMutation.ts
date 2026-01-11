// apps/v2/src/mutations/preferences/useDeletePreferenceMutation.ts

/**
 * Mutation hook for deleting preferences
 *
 * @module mutations/preferences/useDeletePreferenceMutation
 */

//#region Imports

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { IPreference } from "@/types";
import { deletePreference } from "@/api/preferences";
import { queryKeys } from "@/queries/keys";

//#endregion

//#region Types

/**
 * Input for deleting a preference
 */
export type IDeletePreferenceMutationInput = {
  userId: string;
  category: string;
  name: string;
};

/**
 * Context for optimistic update rollback
 */
type IDeletePreferenceContext = {
  previousPreferences: IPreference[] | undefined;
  deletedPreference: IPreference | undefined;
};

/**
 * Options for useDeletePreferenceMutation hook
 */
export type IUseDeletePreferenceMutationOptions = {
  onSuccess?: (input: IDeletePreferenceMutationInput) => void;
  onError?: (
    error: Error,
    variables: IDeletePreferenceMutationInput,
    context: IDeletePreferenceContext | undefined,
  ) => void;
  onSettled?: () => void;
};

//#endregion

//#region Hook

/**
 * Hook for deleting a preference with optimistic updates and cache invalidation
 *
 * @example
 * ```typescript
 * const { mutate: remove, isPending } = useDeletePreferenceMutation({
 *   onSuccess: (input) => console.log('Deleted:', input.name),
 * });
 *
 * remove({
 *   userId: 'user-123',
 *   category: 'theme',
 *   name: 'dark_mode',
 * });
 * ```
 */
export function useDeletePreferenceMutation(
  options?: IUseDeletePreferenceMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: IDeletePreferenceMutationInput) => {
      return deletePreference(input.userId, input.category, input.name);
    },
    onMutate: async (input) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.preferences.all,
      });

      // Snapshot the previous value
      const previousPreferences = queryClient.getQueryData<IPreference[]>(
        queryKeys.preferences.all,
      );

      // Find the preference being deleted
      const key = `${input.category}--${input.name}`;
      const deletedPreference = previousPreferences?.find(
        (p) => `${p.category}--${p.name}` === key,
      );

      // Optimistically remove from cache
      if (previousPreferences) {
        const updatedPreferences = previousPreferences.filter(
          (p) => `${p.category}--${p.name}` !== key,
        );

        queryClient.setQueryData<IPreference[]>(
          queryKeys.preferences.all,
          updatedPreferences,
        );
      }

      return { previousPreferences, deletedPreference };
    },
    onSuccess: (_data, variables) => {
      // Invalidate preferences queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.preferences.all,
      });

      options?.onSuccess?.(variables);
    },
    onError: (error: Error, variables, context) => {
      // Roll back on error
      if (context?.previousPreferences) {
        queryClient.setQueryData(
          queryKeys.preferences.all,
          context.previousPreferences,
        );
      }

      options?.onError?.(error, variables, context);
    },
    onSettled: () => {
      options?.onSettled?.();
    },
  });
}

//#endregion
