// apps/v2/src/queries/config/useServerConfigQuery.ts

/**
 * Query hook for fetching server configuration (admin only)
 *
 * @module queries/config/useServerConfigQuery
 */

//#region Imports

import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";

import { getServerConfig } from "@/api/config";
import type { IServerConfig } from "@/api/config";

import { queryKeys } from "../keys";

//#endregion

//#region Types

/**
 * Options for useServerConfigQuery hook
 * TData generic allows for select transformations
 */
export type IUseServerConfigQueryOptions<TData = IServerConfig> = Omit<
  UseQueryOptions<IServerConfig, Error, TData>,
  "queryKey" | "queryFn"
>;

//#endregion

//#region Constants

/**
 * Default stale time for server config (5 minutes)
 * Server config may be modified by admins, so use shorter stale time than client config
 */
const SERVER_CONFIG_STALE_TIME = 5 * 60 * 1000;

/**
 * Default gc time for server config (30 minutes)
 */
const SERVER_CONFIG_GC_TIME = 30 * 60 * 1000;

//#endregion

//#region Hook

/**
 * Hook to fetch server configuration (admin only)
 *
 * Server config contains full server settings including sensitive configuration.
 * Requires system admin permissions to access.
 *
 * @param options - Additional query options
 * @returns Query result with server config data
 *
 * @example
 * ```tsx
 * const { data: serverConfig, isLoading, error } = useServerConfigQuery({
 *   enabled: isAdmin,
 * });
 *
 * if (serverConfig?.ServiceSettings.EnableDeveloper) {
 *   // Show developer options
 * }
 * ```
 */
export function useServerConfigQuery<TData = IServerConfig>(
  options?: IUseServerConfigQueryOptions<TData>,
) {
  return useQuery({
    queryKey: queryKeys.config.server(),
    queryFn: getServerConfig,
    staleTime: SERVER_CONFIG_STALE_TIME,
    gcTime: SERVER_CONFIG_GC_TIME,
    ...options,
  });
}

//#endregion
