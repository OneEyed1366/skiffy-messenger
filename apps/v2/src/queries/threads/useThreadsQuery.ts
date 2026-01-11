// apps/v2/src/queries/threads/useThreadsQuery.ts

/**
 * TanStack Query hook for fetching user threads list
 *
 * @module queries/threads/useThreadsQuery
 */

//#region Imports

import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";

import type { IUserThreadList } from "@/types";
import type { IGetThreadsParams } from "@/api/threads";
import { getThreads } from "@/api/threads";
import { queryKeys } from "@/queries/keys";

//#endregion

//#region Types

export type IUseThreadsQueryOptions = Omit<
  UseQueryOptions<IUserThreadList, Error>,
  "queryKey" | "queryFn"
>;

//#endregion

//#region Hook

/**
 * Hook to fetch threads for a user
 *
 * @param userId - The user ID to fetch threads for
 * @param teamId - Optional team ID to filter threads
 * @param params - Optional pagination and filter parameters
 * @param options - Additional query options
 * @returns Query result with threads data
 *
 * @example
 * ```typescript
 * const { data, isLoading, error } = useThreadsQuery("user-123", "team-456");
 *
 * // With pagination
 * const { data } = useThreadsQuery("user-123", "team-456", { page: 0, per_page: 25 });
 *
 * // Fetch unread only
 * const { data } = useThreadsQuery("user-123", "team-456", { unread: true });
 * ```
 */
export function useThreadsQuery(
  userId: string,
  teamId?: string,
  params?: IGetThreadsParams,
  options?: IUseThreadsQueryOptions,
) {
  return useQuery({
    queryKey: queryKeys.threads.list(userId, teamId, params),
    queryFn: () => getThreads(userId, teamId, params),
    enabled: Boolean(userId) && (options?.enabled ?? true),
    ...options,
  });
}

//#endregion
