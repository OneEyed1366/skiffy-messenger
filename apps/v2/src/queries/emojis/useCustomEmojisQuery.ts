// apps/v2/src/queries/emojis/useCustomEmojisQuery.ts

/**
 * Query hook for fetching custom emojis
 *
 * @module queries/emojis/useCustomEmojisQuery
 */

//#region Imports

import { useQuery } from "@tanstack/react-query";

import type { IGetEmojisParams } from "@/api";
import { getCustomEmojis } from "@/api";
import { queryKeys } from "../keys";

//#endregion

//#region Types

export type IUseCustomEmojisQueryOptions = {
  /** Pagination and sort params */
  params?: IGetEmojisParams;
  /** Whether the query is enabled */
  enabled?: boolean;
};

//#endregion

//#region Hook

/**
 * Query hook for fetching custom emojis
 *
 * @param options - Query options including pagination params
 * @returns Query result with custom emojis array
 *
 * @example
 * ```typescript
 * const { data, isLoading } = useCustomEmojisQuery({
 *   params: { page: 0, per_page: 100 }
 * });
 * ```
 */
export function useCustomEmojisQuery({
  params,
  enabled = true,
}: IUseCustomEmojisQueryOptions = {}) {
  return useQuery({
    queryKey: queryKeys.emojis.list(params),
    queryFn: () => getCustomEmojis(params),
    enabled,
    staleTime: 5 * 60_000, // 5 minutes - emojis change infrequently
  });
}

//#endregion
