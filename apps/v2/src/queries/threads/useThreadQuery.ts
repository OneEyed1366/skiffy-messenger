// apps/v2/src/queries/threads/useThreadQuery.ts

/**
 * TanStack Query hook for fetching a single thread
 *
 * @module queries/threads/useThreadQuery
 */

//#region Imports

import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";

import type { IUserThread } from "@/types";
import { getThread } from "@/api/threads";
import { queryKeys } from "@/queries/keys";

//#endregion

//#region Types

export type IUseThreadQueryOptions = Omit<
  UseQueryOptions<IUserThread, Error>,
  "queryKey" | "queryFn"
>;

//#endregion

//#region Hook

/**
 * Hook to fetch a single thread by ID
 *
 * @param userId - The user ID
 * @param threadId - The thread ID to fetch
 * @param options - Additional query options
 * @returns Query result with thread data
 *
 * @example
 * ```typescript
 * const { data, isLoading, error } = useThreadQuery("user-123", "thread-456");
 *
 * // With options
 * const { data } = useThreadQuery("user-123", "thread-456", { staleTime: 5000 });
 * ```
 */
export function useThreadQuery(
  userId: string,
  threadId: string,
  options?: IUseThreadQueryOptions,
) {
  return useQuery({
    queryKey: queryKeys.threads.detail(userId, threadId),
    queryFn: () => getThread(userId, threadId),
    enabled: Boolean(userId) && Boolean(threadId) && (options?.enabled ?? true),
    ...options,
  });
}

//#endregion
