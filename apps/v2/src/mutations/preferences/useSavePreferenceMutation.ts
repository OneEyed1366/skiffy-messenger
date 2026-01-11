// apps/v2/src/mutations/preferences/useSavePreferenceMutation.ts

/**
 * Mutation hook for saving preferences
 *
 * @module mutations/preferences/useSavePreferenceMutation
 */

//#region Imports

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { IPreference } from "@/types";
import { savePreference, savePreferences } from "@/api/preferences";
import type { ISavePreferenceInput } from "@/api/preferences";
import { queryKeys } from "@/queries/keys";

//#endregion

//#region Types

/**
 * Input for saving a single preference
 */
export type ISavePreferenceMutationInput = {
  userId: string;
  preference: ISavePreferenceInput;
};

/**
 * Input for saving multiple preferences
 */
export type ISavePreferencesMutationInput = {
  userId: string;
  preferences: ISavePreferenceInput[];
};

/**
 * Context for optimistic update rollback
 */
type ISavePreferenceContext = {
  previousPreferences: IPreference[] | undefined;
};

/**
 * Options for useSavePreferenceMutation hook
 */
export type IUseSavePreferenceMutationOptions = {
  onSuccess?: (preference: IPreference) => void;
  onError?: (
    error: Error,
    variables: ISavePreferenceMutationInput,
    context: ISavePreferenceContext | undefined,
  ) => void;
  onSettled?: () => void;
};

/**
 * Options for useSavePreferencesMutation hook
 */
export type IUseSavePreferencesMutationOptions = {
  onSuccess?: () => void;
  onError?: (
    error: Error,
    variables: ISavePreferencesMutationInput,
    context: ISavePreferenceContext | undefined,
  ) => void;
  onSettled?: () => void;
};

//#endregion

//#region Hook - Single Preference

/**
 * Hook for saving a single preference with cache invalidation
 *
 * @example
 * ```typescript
 * const { mutate: save, isPending } = useSavePreferenceMutation({
 *   onSuccess: (pref) => console.log('Saved:', pref.name),
 * });
 *
 * save({
 *   userId: 'user-123',
 *   preference: {
 *     category: 'theme',
 *     name: 'dark_mode',
 *     value: 'true',
 *   },
 * });
 * ```
 */
export function useSavePreferenceMutation(
  options?: IUseSavePreferenceMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ISavePreferenceMutationInput) => {
      return savePreference(input.userId, input.preference);
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

      // Optimistically update the cache
      if (previousPreferences) {
        const newPreference: IPreference = {
          user_id: input.userId,
          category: input.preference.category,
          name: input.preference.name,
          value: input.preference.value,
        };

        const key = `${input.preference.category}--${input.preference.name}`;
        const existingIndex = previousPreferences.findIndex(
          (p) => `${p.category}--${p.name}` === key,
        );

        const updatedPreferences =
          existingIndex >= 0
            ? [
                ...previousPreferences.slice(0, existingIndex),
                newPreference,
                ...previousPreferences.slice(existingIndex + 1),
              ]
            : [...previousPreferences, newPreference];

        queryClient.setQueryData<IPreference[]>(
          queryKeys.preferences.all,
          updatedPreferences,
        );
      }

      return { previousPreferences };
    },
    onSuccess: (preference, _variables) => {
      // Invalidate preferences queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.preferences.all,
      });

      options?.onSuccess?.(preference);
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

//#region Hook - Multiple Preferences

/**
 * Hook for saving multiple preferences with cache invalidation
 *
 * @example
 * ```typescript
 * const { mutate: saveAll, isPending } = useSavePreferencesMutation({
 *   onSuccess: () => console.log('All preferences saved'),
 * });
 *
 * saveAll({
 *   userId: 'user-123',
 *   preferences: [
 *     { category: 'theme', name: 'dark_mode', value: 'true' },
 *     { category: 'theme', name: 'accent_color', value: 'blue' },
 *   ],
 * });
 * ```
 */
export function useSavePreferencesMutation(
  options?: IUseSavePreferencesMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ISavePreferencesMutationInput) => {
      return savePreferences(input.userId, input.preferences);
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

      // Optimistically update the cache
      if (previousPreferences) {
        const newPreferences: IPreference[] = input.preferences.map((pref) => ({
          user_id: input.userId,
          category: pref.category,
          name: pref.name,
          value: pref.value,
        }));

        // Create a map of new preferences for efficient lookup
        const newPreferencesMap = new Map(
          newPreferences.map((p) => [`${p.category}--${p.name}`, p]),
        );

        // Update existing and filter out duplicates
        const updatedPreferences = previousPreferences.map((p) => {
          const key = `${p.category}--${p.name}`;
          const updated = newPreferencesMap.get(key);
          if (updated) {
            newPreferencesMap.delete(key);
            return updated;
          }
          return p;
        });

        // Add any remaining new preferences
        const finalPreferences = [
          ...updatedPreferences,
          ...newPreferencesMap.values(),
        ];

        queryClient.setQueryData<IPreference[]>(
          queryKeys.preferences.all,
          finalPreferences,
        );
      }

      return { previousPreferences };
    },
    onSuccess: () => {
      // Invalidate preferences queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.preferences.all,
      });

      options?.onSuccess?.();
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
