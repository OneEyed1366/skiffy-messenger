// apps/v2/src/queries/users/useCurrentUserQuery.ts

/**
 * Query hook for fetching the current authenticated user
 *
 * @module queries/users/useCurrentUserQuery
 */

//#region Imports

import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";

import { getCurrentUser } from "@/api/users";
import type { IUserProfile } from "@/types";

import { queryKeys } from "../keys";

//#endregion

//#region Types

/**
 * Options for useCurrentUserQuery hook
 * TData generic allows for select transformations
 */
export type IUseCurrentUserQueryOptions<TData = IUserProfile> = Omit<
  UseQueryOptions<IUserProfile, Error, TData>,
  "queryKey" | "queryFn"
>;

//#endregion

//#region Hook

/**
 * Hook to fetch the current authenticated user
 *
 * @param options - Additional query options
 * @returns Query result with current user data
 *
 * @example
 * ```tsx
 * const { data: currentUser, isLoading } = useCurrentUserQuery();
 * ```
 */
export function useCurrentUserQuery<TData = IUserProfile>(
  options?: IUseCurrentUserQueryOptions<TData>,
) {
  return useQuery({
    queryKey: queryKeys.users.current(),
    queryFn: () => getCurrentUser(),
    ...options,
  });
}

//#endregion
