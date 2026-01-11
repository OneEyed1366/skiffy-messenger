// apps/v2/src/mutations/files/useUploadFilesMutation.ts

/**
 * Mutation hook for uploading files to a channel
 *
 * @module mutations/files/useUploadFilesMutation
 */

//#region Imports

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { uploadFiles as uploadFilesApi } from "@/api/files";
import type { IFileUploadResponse } from "@/api/files";
import { queryKeys } from "@/queries/keys";

//#endregion

//#region Types

/**
 * Input for uploading files
 */
export type IUploadFilesInput = {
  /** Channel ID to upload files to */
  channelId: string;
  /** Array of File objects to upload */
  files: File[];
  /** Optional client-side IDs for tracking uploads */
  clientIds?: string[];
};

/**
 * Options for useUploadFilesMutation hook
 */
export type IUseUploadFilesMutationOptions = {
  onSuccess?: (response: IFileUploadResponse) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
};

//#endregion

//#region API Function

/**
 * Upload files to a channel via API
 * @param input - Upload files input
 * @returns Upload response with file metadata
 */
export async function uploadFiles(
  input: IUploadFilesInput,
): Promise<IFileUploadResponse> {
  return uploadFilesApi(input.channelId, input.files, input.clientIds);
}

//#endregion

//#region Hook

/**
 * Hook for uploading files with automatic cache invalidation
 *
 * @example
 * ```typescript
 * const { mutate: upload, isPending } = useUploadFilesMutation({
 *   onSuccess: (response) => {
 *     console.log('Uploaded files:', response.file_infos);
 *   },
 * });
 *
 * upload({
 *   channelId: 'channel-123',
 *   files: [file1, file2],
 *   clientIds: ['client-1', 'client-2'],
 * });
 * ```
 */
export function useUploadFilesMutation(
  options?: IUseUploadFilesMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadFiles,
    onSuccess: (response) => {
      // Invalidate all files queries to reflect newly uploaded files
      queryClient.invalidateQueries({
        queryKey: queryKeys.files.all,
      });

      options?.onSuccess?.(response);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
    onSettled: () => {
      options?.onSettled?.();
    },
  });
}

//#endregion
