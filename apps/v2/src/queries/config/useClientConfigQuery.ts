// apps/v2/src/queries/config/useClientConfigQuery.ts

/**
 * Query hook for fetching client configuration
 *
 * @module queries/config/useClientConfigQuery
 */

//#region Imports

import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";

import { getClientConfig } from "@/api/config";
import type { IClientConfig } from "@/api/config";

import { queryKeys } from "../keys";

//#endregion

//#region Types

/**
 * Options for useClientConfigQuery hook
 * TData generic allows for select transformations
 */
export type IUseClientConfigQueryOptions<TData = IClientConfig> = Omit<
  UseQueryOptions<IClientConfig, Error, TData>,
  "queryKey" | "queryFn"
>;

//#endregion

//#region Constants

/**
 * Default stale time for client config (30 minutes)
 * Client config rarely changes, so we can cache it for a longer period
 */
const CLIENT_CONFIG_STALE_TIME = 30 * 60 * 1000;

/**
 * Default gc time for client config (1 hour)
 */
const CLIENT_CONFIG_GC_TIME = 60 * 60 * 1000;

//#endregion

//#region Hook

/**
 * Hook to fetch client configuration
 *
 * Client config contains version info, feature flags, and client-specific settings.
 * Uses a long stale time since configuration rarely changes during a session.
 *
 * @param options - Additional query options
 * @returns Query result with client config data
 *
 * @example
 * ```tsx
 * const { data: config, isLoading } = useClientConfigQuery();
 *
 * if (config?.EnableEmojiPicker === "true") {
 *   // Show emoji picker
 * }
 * ```
 */
export function useClientConfigQuery<TData = IClientConfig>(
  options?: IUseClientConfigQueryOptions<TData>,
) {
  return useQuery({
    queryKey: queryKeys.config.client(),
    queryFn: getClientConfig,
    staleTime: CLIENT_CONFIG_STALE_TIME,
    gcTime: CLIENT_CONFIG_GC_TIME,
    ...options,
  });
}

//#endregion
