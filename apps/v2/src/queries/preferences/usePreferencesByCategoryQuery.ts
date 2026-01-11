// apps/v2/src/queries/preferences/usePreferencesByCategoryQuery.ts

/**
 * TanStack Query hook for fetching preferences by category
 *
 * @module queries/preferences/usePreferencesByCategoryQuery
 */

//#region Imports

import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";

import type { IPreference } from "@/types";
import { getPreferencesByCategory } from "@/api/preferences";
import { queryKeys } from "@/queries/keys";

//#endregion

//#region Types

export type IUsePreferencesByCategoryQueryOptions = Omit<
  UseQueryOptions<IPreference[], Error>,
  "queryKey" | "queryFn"
>;

//#endregion

//#region Hook

/**
 * Hook to fetch preferences by category for a user
 *
 * @param userId - The user ID to fetch preferences for
 * @param category - The preference category to filter by
 * @param options - Additional query options
 * @returns Query result with preferences data
 *
 * @example
 * ```typescript
 * const { data, isLoading, error } = usePreferencesByCategoryQuery(
 *   "user-123",
 *   "theme"
 * );
 *
 * // Access theme preferences
 * const darkMode = data?.find(p => p.name === "dark_mode");
 * ```
 */
export function usePreferencesByCategoryQuery(
  userId: string,
  category: string,
  options?: IUsePreferencesByCategoryQueryOptions,
) {
  return useQuery({
    queryKey: queryKeys.preferences.byCategory(category),
    queryFn: () => getPreferencesByCategory(userId, category),
    enabled: Boolean(userId) && Boolean(category) && (options?.enabled ?? true),
    ...options,
  });
}

//#endregion
