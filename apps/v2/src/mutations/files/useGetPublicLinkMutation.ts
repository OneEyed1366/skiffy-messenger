// apps/v2/src/mutations/files/useGetPublicLinkMutation.ts

/**
 * Mutation hook for generating public links for files
 *
 * @module mutations/files/useGetPublicLinkMutation
 */

//#region Imports

import { useMutation } from "@tanstack/react-query";

import { getFilePublicLink } from "@/api/files";
import type { IFilePublicLinkResponse } from "@/api/files";

//#endregion

//#region Types

/**
 * Input for getting a public link
 */
export type IGetPublicLinkInput = {
  /** File ID to generate public link for */
  fileId: string;
};

/**
 * Options for useGetPublicLinkMutation hook
 */
export type IUseGetPublicLinkMutationOptions = {
  onSuccess?: (response: IFilePublicLinkResponse) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
};

//#endregion

//#region API Function

/**
 * Get public link for a file via API
 * @param input - Get public link input
 * @returns Response containing the public link
 */
export async function getPublicLink(
  input: IGetPublicLinkInput,
): Promise<IFilePublicLinkResponse> {
  return getFilePublicLink(input.fileId);
}

//#endregion

//#region Hook

/**
 * Hook for generating public shareable links for files
 *
 * This is a mutation (not query) because it generates a new link each time,
 * which may have side effects like invalidating previous links.
 *
 * @example
 * ```typescript
 * const { mutate: getLink, isPending } = useGetPublicLinkMutation({
 *   onSuccess: (response) => {
 *     navigator.clipboard.writeText(response.link);
 *     console.log('Link copied:', response.link);
 *   },
 * });
 *
 * getLink({ fileId: 'file-123' });
 * ```
 */
export function useGetPublicLinkMutation(
  options?: IUseGetPublicLinkMutationOptions,
) {
  return useMutation({
    mutationFn: getPublicLink,
    onSuccess: (response) => {
      // No cache invalidation needed - public links don't affect other queries
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
