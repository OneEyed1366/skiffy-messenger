// apps/v2/src/queries/files/useFileQuery.ts

/**
 * TanStack Query hook for fetching a single file's metadata
 *
 * @module queries/files/useFileQuery
 */

//#region Imports

import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";

import { getFileInfo } from "@/api/files";
import type { IFileInfo } from "@/api/files";

import { queryKeys } from "../keys";

//#endregion

//#region Types

/**
 * Options for useFileQuery hook
 * TData generic allows for select transformations
 */
export type IUseFileQueryOptions<TData = IFileInfo> = Omit<
  UseQueryOptions<IFileInfo, Error, TData>,
  "queryKey" | "queryFn"
>;

//#endregion

//#region Hook

/**
 * Hook to fetch a single file's metadata by ID
 *
 * @param fileId - The file ID to fetch
 * @param options - Additional query options
 * @returns Query result with file info data
 *
 * @example
 * ```tsx
 * const { data: file, isLoading } = useFileQuery("file-123");
 *
 * // With select transformation
 * const { data: fileName } = useFileQuery("file-123", {
 *   select: (file) => file.name,
 * });
 * ```
 */
export function useFileQuery<TData = IFileInfo>(
  fileId: string,
  options?: IUseFileQueryOptions<TData>,
) {
  return useQuery({
    queryKey: queryKeys.files.detail(fileId),
    queryFn: () => getFileInfo(fileId),
    enabled: Boolean(fileId),
    ...options,
  });
}

//#endregion
