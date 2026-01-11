// apps/v2/src/mutations/posts/useUpdatePostMutation.ts

/**
 * Mutation hook for updating existing posts
 *
 * @module mutations/posts/useUpdatePostMutation
 */

//#region Imports

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/api";
import { getPostUrl } from "@/api/urls";
import { queryKeys } from "@/queries/keys";
import type { IPost, IPostMetadata } from "@/types";

//#endregion

//#region Types

/**
 * Input for updating an existing post
 */
export type IUpdatePostInput = {
  post_id: string;
  message?: string;
  is_pinned?: boolean;
  props?: Record<string, unknown>;
  metadata?: Partial<IPostMetadata>;
};

/**
 * Context for optimistic update rollback
 */
type IUpdatePostContext = {
  previousPost: IPost | undefined;
};

/**
 * Options for useUpdatePostMutation hook
 */
export type IUseUpdatePostMutationOptions = {
  onSuccess?: (post: IPost) => void;
  onError?: (error: Error, variables: IUpdatePostInput, context: IUpdatePostContext | undefined) => void;
  onSettled?: () => void;
};

//#endregion

//#region API Function

/**
 * Update an existing post via API
 * @param input - Post update input
 * @returns Updated post
 */
export async function updatePost(input: IUpdatePostInput): Promise<IPost> {
  const { post_id, ...updateData } = input;
  const url = getPostUrl(post_id);
  return apiClient.put<IPost>(url, { id: post_id, ...updateData });
}

//#endregion

//#region Hook

/**
 * Hook for updating posts with optimistic updates and cache invalidation
 *
 * @example
 * ```typescript
 * const { mutate: updatePost, isPending } = useUpdatePostMutation({
 *   onSuccess: (post) => console.log('Updated:', post.id),
 * });
 *
 * updatePost({
 *   post_id: 'post-123',
 *   message: 'Updated message',
 * });
 * ```
 */
export function useUpdatePostMutation(options?: IUseUpdatePostMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePost,
    onMutate: async (input) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.posts.detail(input.post_id),
      });

      // Snapshot the previous value
      const previousPost = queryClient.getQueryData<IPost>(
        queryKeys.posts.detail(input.post_id),
      );

      // Optimistically update to the new value
      if (previousPost) {
        queryClient.setQueryData<IPost>(
          queryKeys.posts.detail(input.post_id),
          {
            ...previousPost,
            message: input.message ?? previousPost.message,
            is_pinned: input.is_pinned ?? previousPost.is_pinned,
            props: input.props ?? previousPost.props,
            metadata: input.metadata
              ? { ...previousPost.metadata, ...input.metadata }
              : previousPost.metadata,
            update_at: Date.now(),
          },
        );
      }

      return { previousPost };
    },
    onSuccess: (post) => {
      // Invalidate the post detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(post.id),
      });

      // Invalidate the posts list for the channel
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.list(post.channel_id),
      });

      options?.onSuccess?.(post);
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
