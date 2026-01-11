// apps/v2/src/mutations/posts/useDeletePostMutation.ts

/**
 * Mutation hook for deleting posts
 *
 * @module mutations/posts/useDeletePostMutation
 */

//#region Imports

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/api";
import { getPostUrl } from "@/api/urls";
import { queryKeys } from "@/queries/keys";
import type { IPost } from "@/types";

//#endregion

//#region Types

/**
 * Input for deleting a post
 */
export type IDeletePostInput = {
  post_id: string;
  channel_id: string;
};

/**
 * Context for optimistic update rollback
 */
type IDeletePostContext = {
  previousPost: IPost | undefined;
};

/**
 * Options for useDeletePostMutation hook
 */
export type IUseDeletePostMutationOptions = {
  onSuccess?: (postId: string) => void;
  onError?: (error: Error, variables: IDeletePostInput, context: IDeletePostContext | undefined) => void;
  onSettled?: () => void;
};

//#endregion

//#region API Function

/**
 * Delete a post via API
 * @param input - Post deletion input
 * @returns Status response
 */
export async function deletePost(
  input: IDeletePostInput,
): Promise<{ status: string }> {
  const url = getPostUrl(input.post_id);
  return apiClient.delete<{ status: string }>(url);
}

//#endregion

//#region Hook

/**
 * Hook for deleting posts with optimistic updates and cache invalidation
 *
 * @example
 * ```typescript
 * const { mutate: deletePost, isPending } = useDeletePostMutation({
 *   onSuccess: (postId) => console.log('Deleted:', postId),
 * });
 *
 * deletePost({
 *   post_id: 'post-123',
 *   channel_id: 'channel-456',
 * });
 * ```
 */
export function useDeletePostMutation(options?: IUseDeletePostMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,
    onMutate: async (input) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.posts.detail(input.post_id),
      });

      // Snapshot the previous value
      const previousPost = queryClient.getQueryData<IPost>(
        queryKeys.posts.detail(input.post_id),
      );

      // Optimistically update to deleted state
      if (previousPost) {
        queryClient.setQueryData<IPost>(queryKeys.posts.detail(input.post_id), {
          ...previousPost,
          state: "DELETED",
          delete_at: Date.now(),
        });
      }

      return { previousPost };
    },
    onSuccess: (_data, variables) => {
      // Remove the post from cache
      queryClient.removeQueries({
        queryKey: queryKeys.posts.detail(variables.post_id),
      });

      // Invalidate the posts list for the channel
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.list(variables.channel_id),
      });

      // Also invalidate infinite queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.infinite(variables.channel_id),
      });

      options?.onSuccess?.(variables.post_id);
    },
    onError: (error: Error, variables, context) => {
      // Roll back on error
      if (context?.previousPost) {
        queryClient.setQueryData(
          queryKeys.posts.detail(variables.post_id),
          context.previousPost,
        );
      }

      options?.onError?.(error, variables, context);
    },
    onSettled: () => {
      options?.onSettled?.();
    },
  });
}

//#endregion
