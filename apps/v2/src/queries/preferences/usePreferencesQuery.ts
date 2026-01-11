// apps/v2/src/queries/preferences/usePreferencesQuery.ts

/**
 * TanStack Query hook for fetching all user preferences
 *
 * @module queries/preferences/usePreferencesQuery
 */

//#region Imports

import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";

import type { IPreference } from "@/types";
import { getPreferences } from "@/api/preferences";
import { queryKeys } from "@/queries/keys";

//#endregion

//#region Types

export type IUsePreferencesQueryOptions = Omit<
  UseQueryOptions<IPreference[], Error>,
  "queryKey" | "queryFn"
>;

//#endregion

//#region Hook

/**
 * Hook to fetch all preferences for a user
 *
 * @param userId - The user ID to fetch preferences for
 * @param options - Additional query options
 * @returns Query result with preferences data
 *
 * @example
 * ```typescript
 * const { data, isLoading, error } = usePreferencesQuery("user-123");
 *
 * // Access preferences
 * data?.forEach(pref => console.log(pref.category, pref.name, pref.value));
 * ```
 */
export function usePreferencesQuery(
  userId: string,
  options?: IUsePreferencesQueryOptions,
) {
  return useQuery({
    queryKey: queryKeys.preferences.all,
    queryFn: () => getPreferences(userId),
    enabled: Boolean(userId) && (options?.enabled ?? true),
    ...options,
  });
}

//#endregion
