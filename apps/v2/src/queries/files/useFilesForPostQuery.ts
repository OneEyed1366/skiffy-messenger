// apps/v2/src/queries/files/useFilesForPostQuery.ts

/**
 * TanStack Query hook for fetching files attached to a post
 *
 * @module queries/files/useFilesForPostQuery
 */

//#region Imports

import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";

import { getFilesForPost } from "@/api/files";
import type { IFileInfo } from "@/api/files";

import { queryKeys } from "../keys";

//#endregion

//#region Types

/**
 * Options for useFilesForPostQuery hook
 * TData generic allows for select transformations
 */
export type IUseFilesForPostQueryOptions<TData = IFileInfo[]> = Omit<
  UseQueryOptions<IFileInfo[], Error, TData>,
  "queryKey" | "queryFn"
>;

//#endregion

//#region Hook

/**
 * Hook to fetch all files attached to a post
 *
 * @param postId - The post ID to fetch files for
 * @param options - Additional query options
 * @returns Query result with array of file info data
 *
 * @example
 * ```tsx
 * const { data: files, isLoading } = useFilesForPostQuery("post-123");
 *
 * // With select transformation
 * const { data: imageFiles } = useFilesForPostQuery("post-123", {
 *   select: (files) => files.filter(f => f.mime_type.startsWith("image/")),
 * });
 * ```
 */
export function useFilesForPostQuery<TData = IFileInfo[]>(
  postId: string,
  options?: IUseFilesForPostQueryOptions<TData>,
) {
  return useQuery({
    queryKey: queryKeys.files.forPost(postId),
    queryFn: () => getFilesForPost(postId),
    enabled: Boolean(postId),
    ...options,
  });
}

//#endregion
