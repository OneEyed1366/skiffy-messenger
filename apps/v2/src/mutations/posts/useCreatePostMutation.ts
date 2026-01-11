// apps/v2/src/mutations/posts/useCreatePostMutation.ts

/**
 * Mutation hook for creating new posts
 *
 * @module mutations/posts/useCreatePostMutation
 */

//#region Imports

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/api";
import { getChannelPostsUrl } from "@/api/urls";
import { queryKeys } from "@/queries/keys";
import type { IPost, IPostMetadata } from "@/types";

//#endregion

//#region Types

/**
 * Input for creating a new post
 */
export type ICreatePostInput = {
  channel_id: string;
  message: string;
  root_id?: string;
  file_ids?: string[];
  props?: Record<string, unknown>;
  metadata?: Partial<IPostMetadata>;
};

/**
 * Options for useCreatePostMutation hook
 */
export type IUseCreatePostMutationOptions = {
  onSuccess?: (post: IPost) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
};

//#endregion

//#region API Function

/**
 * Create a new post via API
 * @param input - Post creation input
 * @returns Created post
 */
export async function createPost(input: ICreatePostInput): Promise<IPost> {
  const url = getChannelPostsUrl(input.channel_id);
  return apiClient.post<IPost>(url, input);
}

//#endregion

//#region Hook

/**
 * Hook for creating new posts with automatic cache invalidation
 *
 * @example
 * ```typescript
 * const { mutate: createPost, isPending } = useCreatePostMutation({
 *   onSuccess: (post) => console.log('Created:', post.id),
 * });
 *
 * createPost({
 *   channel_id: 'channel-123',
 *   message: 'Hello, world!',
 * });
 * ```
 */
export function useCreatePostMutation(options?: IUseCreatePostMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: (post) => {
      // Invalidate the posts list for the channel
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.list(post.channel_id),
      });

      // Also invalidate infinite queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.infinite(post.channel_id),
      });

      options?.onSuccess?.(post);
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
