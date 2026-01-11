// apps/v2/src/queries/users/useUserQuery.ts

/**
 * Query hook for fetching a single user
 *
 * @module queries/users/useUserQuery
 */

//#region Imports

import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";

import { getUser } from "@/api/users";
import type { IUserProfile } from "@/types";

import { queryKeys } from "../keys";

//#endregion

//#region Types

/**
 * Options for useUserQuery hook
 * TData generic allows for select transformations
 */
export type IUseUserQueryOptions<TData = IUserProfile> = Omit<
  UseQueryOptions<IUserProfile, Error, TData>,
  "queryKey" | "queryFn"
>;

//#endregion

//#region Hook

/**
 * Hook to fetch a single user by ID
 *
 * @param userId - The user ID to fetch
 * @param options - Additional query options
 * @returns Query result with user data
 *
 * @example
 * ```tsx
 * const { data: user, isLoading } = useUserQuery("user-123");
 * ```
 */
export function useUserQuery<TData = IUserProfile>(
  userId: string,
  options?: IUseUserQueryOptions<TData>,
) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => getUser(userId),
    enabled: Boolean(userId),
    ...options,
  });
}

//#endregion
