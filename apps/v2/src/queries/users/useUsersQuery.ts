// apps/v2/src/queries/users/useUsersQuery.ts

/**
 * Query hook for fetching users list
 *
 * @module queries/users/useUsersQuery
 */

//#region Imports

import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";

import { getUsers } from "@/api/users";
import type { IGetUsersParams } from "@/api/users";
import type { IUserProfile } from "@/types";

import { queryKeys } from "../keys";

//#endregion

//#region Types

/**
 * Options for useUsersQuery hook
 * TData generic allows for select transformations
 */
export type IUseUsersQueryOptions<TData = IUserProfile[]> = Omit<
  UseQueryOptions<IUserProfile[], Error, TData>,
  "queryKey" | "queryFn"
>;

//#endregion

//#region Hook

/**
 * Hook to fetch users list with optional filtering
 *
 * @param params - Optional filter parameters
 * @param options - Additional query options
 * @returns Query result with users data
 *
 * @example
 * ```tsx
 * const { data: users, isLoading } = useUsersQuery({ in_team: "team-123" });
 * ```
 */
export function useUsersQuery<TData = IUserProfile[]>(
  params?: IGetUsersParams,
  options?: IUseUsersQueryOptions<TData>,
) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => getUsers(params),
    ...options,
  });
}

//#endregion
