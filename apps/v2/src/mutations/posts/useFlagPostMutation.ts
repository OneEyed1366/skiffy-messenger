// apps/v2/src/mutations/posts/useFlagPostMutation.ts

/**
 * Mutation hook for flagging/unflagging posts (saved posts)
 *
 * @module mutations/posts/useFlagPostMutation
 */

//#region Imports

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { savePreference, deletePreference } from "@/api";
import { queryKeys } from "@/queries/keys";

//#endregion

//#region Types

/**
 * Variables for flag/unflag mutation
 */
export type IFlagPostMutationVariables = {
  /** User ID who is flagging */
  userId: string;
  /** Post ID to flag/unflag */
  postId: string;
  /** Whether to flag or unflag */
  flag: boolean;
};

/**
 * Options for useFlagPostMutation hook
 */
export type IUseFlagPostMutationOptions = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
};

//#endregion

//#region Constants

const FLAG_CATEGORY = "flagged_post";

//#endregion

//#region API Function

/**
 * Flag or unflag a post via API
 * @param variables - Flag mutation variables
 */
export async function flagOrUnflagPost({
  userId,
  postId,
  flag,
}: IFlagPostMutationVariables): Promise<void> {
  if (flag) {
    await savePreference(userId, {
      category: FLAG_CATEGORY,
      name: postId,
      value: "true",
    });
  } else {
    await deletePreference(userId, FLAG_CATEGORY, postId);
  }
}

//#endregion

//#region Hook

/**
 * Mutation hook for flagging or unflagging a post (save/unsave)
 *
 * Flagged posts are stored as user preferences with category "flagged_post"
 *
 * @param options - Optional callbacks for mutation lifecycle
 * @returns Mutation object for flag/unflag operations
 *
 * @example
 * ```typescript
 * const { mutate } = useFlagPostMutation();
 * mutate({ userId: "user123", postId: "post456", flag: true });
 * ```
 */
export function useFlagPostMutation(options?: IUseFlagPostMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: flagOrUnflagPost,
    onSuccess: (_data, { userId }) => {
      // Invalidate flagged posts for this user
      queryClient.invalidateQueries({
        queryKey: queryKeys.search.flagged(userId),
      });
      // Invalidate preferences
      queryClient.invalidateQueries({
        queryKey: queryKeys.preferences.all,
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
