// apps/v2/src/mutations/posts/usePinPostMutation.ts

/**
 * Mutation hook for pinning/unpinning posts
 *
 * @module mutations/posts/usePinPostMutation
 */

//#region Imports

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { pinPost, unpinPost } from "@/api";
import { queryKeys } from "@/queries/keys";

//#endregion

//#region Types

/**
 * Variables for pin/unpin mutation
 */
export type IPinPostMutationVariables = {
  /** Post ID to pin/unpin */
  postId: string;
  /** Channel ID for cache invalidation */
  channelId: string;
  /** Whether to pin or unpin */
  pin: boolean;
};

/**
 * Options for usePinPostMutation hook
 */
export type IUsePinPostMutationOptions = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
};

//#endregion

//#region API Function

/**
 * Pin or unpin a post via API
 * @param variables - Pin mutation variables
 */
export async function pinOrUnpinPost({
  postId,
  pin,
}: IPinPostMutationVariables): Promise<void> {
  if (pin) {
    await pinPost(postId);
  } else {
    await unpinPost(postId);
  }
}

//#endregion

//#region Hook

/**
 * Mutation hook for pinning or unpinning a post
 *
 * @param options - Optional callbacks for mutation lifecycle
 * @returns Mutation object for pin/unpin operations
 *
 * @example
 * ```typescript
 * const { mutate } = usePinPostMutation();
 * mutate({ postId: "post123", channelId: "channel456", pin: true });
 * ```
 */
export function usePinPostMutation(options?: IUsePinPostMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pinOrUnpinPost,
    onSuccess: (_data, { channelId }) => {
      // Invalidate pinned posts for this channel
      queryClient.invalidateQueries({
        queryKey: queryKeys.search.pinned(channelId),
      });
      // Invalidate posts list to update pin status
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.list(channelId),
      });
      // Invalidate infinite posts
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.infinite(channelId),
      });

      options?.onSuccess?.();
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
