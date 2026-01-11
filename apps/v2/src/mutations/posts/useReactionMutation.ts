// apps/v2/src/mutations/posts/useReactionMutation.ts

/**
 * Mutation hooks for adding and removing emoji reactions
 *
 * @module mutations/posts/useReactionMutation
 */

//#region Imports

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/api";
import { queryKeys } from "@/queries/keys";
import type { IPost, IReaction } from "@/types";

//#endregion

//#region Types

/**
 * Input for adding a reaction
 */
export type IAddReactionInput = {
  post_id: string;
  emoji_name: string;
  user_id: string;
};

/**
 * Input for removing a reaction
 */
export type IRemoveReactionInput = {
  post_id: string;
  emoji_name: string;
  user_id: string;
};

/**
 * Context for optimistic update rollback
 */
type IReactionContext = {
  previousPost: IPost | undefined;
};

/**
 * Options for useAddReactionMutation hook
 */
export type IUseAddReactionMutationOptions = {
  onSuccess?: (reaction: IReaction) => void;
  onError?: (error: Error, variables: IAddReactionInput, context: IReactionContext | undefined) => void;
  onSettled?: () => void;
};

/**
 * Options for useRemoveReactionMutation hook
 */
export type IUseRemoveReactionMutationOptions = {
  onSuccess?: () => void;
  onError?: (error: Error, variables: IRemoveReactionInput, context: IReactionContext | undefined) => void;
  onSettled?: () => void;
};

//#endregion

//#region URL Builders

/**
 * Get reactions URL for a post
 * @param postId - The post ID
 * @returns Reactions endpoint URL
 */
function getReactionsUrl(postId: string): string {
  return `${apiClient.getPostsRoute()}/${postId}/reactions`;
}

/**
 * Get specific reaction URL for deletion
 * @param userId - The user ID
 * @param postId - The post ID
 * @param emojiName - The emoji name
 * @returns Reaction endpoint URL
 */
function getReactionUrl(
  userId: string,
  postId: string,
  emojiName: string,
): string {
  return `${apiClient.getUsersRoute()}/${userId}/posts/${postId}/reactions/${emojiName}`;
}

//#endregion

//#region API Functions

/**
 * Add a reaction to a post via API
 * @param input - Reaction input
 * @returns Created reaction
 */
export async function addReaction(input: IAddReactionInput): Promise<IReaction> {
  const url = getReactionsUrl(input.post_id);
  return apiClient.post<IReaction>(url, {
    user_id: input.user_id,
    post_id: input.post_id,
    emoji_name: input.emoji_name,
  });
}

/**
 * Remove a reaction from a post via API
 * @param input - Reaction input
 * @returns Status response
 */
export async function removeReaction(
  input: IRemoveReactionInput,
): Promise<{ status: string }> {
  const url = getReactionUrl(input.user_id, input.post_id, input.emoji_name);
  return apiClient.delete<{ status: string }>(url);
}

//#endregion

//#region Add Reaction Hook

/**
 * Hook for adding reactions with optimistic updates
 *
 * @example
 * ```typescript
 * const { mutate: addReaction, isPending } = useAddReactionMutation({
 *   onSuccess: (reaction) => console.log('Added reaction:', reaction.emoji_name),
 * });
 *
 * addReaction({
 *   post_id: 'post-123',
 *   emoji_name: '+1',
 *   user_id: 'user-456',
 * });
 * ```
 */
export function useAddReactionMutation(
  options?: IUseAddReactionMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addReaction,
    onMutate: async (input) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.posts.detail(input.post_id),
      });

      // Snapshot the previous value
      const previousPost = queryClient.getQueryData<IPost>(
        queryKeys.posts.detail(input.post_id),
      );

      // Optimistically add the reaction
      if (previousPost) {
        const newReaction: IReaction = {
          user_id: input.user_id,
          post_id: input.post_id,
          emoji_name: input.emoji_name,
          create_at: Date.now(),
        };

        const existingReactions = previousPost.metadata?.reactions ?? [];
        const hasReaction = existingReactions.some(
          (r) =>
            r.emoji_name === input.emoji_name && r.user_id === input.user_id,
        );

        if (!hasReaction) {
          queryClient.setQueryData<IPost>(
            queryKeys.posts.detail(input.post_id),
            {
              ...previousPost,
              metadata: {
                ...previousPost.metadata,
                reactions: [...existingReactions, newReaction],
              },
            },
          );
        }
      }

      return { previousPost };
    },
    onSuccess: (reaction) => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(reaction.post_id),
      });

      options?.onSuccess?.(reaction);
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

//#region Remove Reaction Hook

/**
 * Hook for removing reactions with optimistic updates
 *
 * @example
 * ```typescript
 * const { mutate: removeReaction, isPending } = useRemoveReactionMutation({
 *   onSuccess: () => console.log('Removed reaction'),
 * });
 *
 * removeReaction({
 *   post_id: 'post-123',
 *   emoji_name: '+1',
 *   user_id: 'user-456',
 * });
 * ```
 */
export function useRemoveReactionMutation(
  options?: IUseRemoveReactionMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeReaction,
    onMutate: async (input) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.posts.detail(input.post_id),
      });

      // Snapshot the previous value
      const previousPost = queryClient.getQueryData<IPost>(
        queryKeys.posts.detail(input.post_id),
      );

      // Optimistically remove the reaction
      if (previousPost) {
        const existingReactions = previousPost.metadata?.reactions ?? [];
        const filteredReactions = existingReactions.filter(
          (r) =>
            !(r.emoji_name === input.emoji_name && r.user_id === input.user_id),
        );

        queryClient.setQueryData<IPost>(queryKeys.posts.detail(input.post_id), {
          ...previousPost,
          metadata: {
            ...previousPost.metadata,
            reactions: filteredReactions,
          },
        });
      }

      return { previousPost };
    },
    onSuccess: (_data, variables) => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(variables.post_id),
      });

      options?.onSuccess?.();
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
