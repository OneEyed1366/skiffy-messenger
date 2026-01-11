// apps/v2/src/mutations/emojis/useDeleteEmojiMutation.ts

/**
 * Mutation hook for deleting custom emojis
 *
 * @module mutations/emojis/useDeleteEmojiMutation
 */

//#region Imports

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteCustomEmoji } from "@/api";
import { queryKeys } from "@/queries/keys";

//#endregion

//#region Types

export type IDeleteEmojiMutationVariables = {
  emojiId: string;
};

export type IUseDeleteEmojiMutationOptions = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

//#endregion

//#region Hook

/**
 * Mutation hook for deleting a custom emoji
 *
 * @param options - Optional callbacks
 * @returns Mutation object
 *
 * @example
 * ```typescript
 * const { mutate } = useDeleteEmojiMutation();
 * mutate({ emojiId: "emoji123" });
 * ```
 */
export function useDeleteEmojiMutation(
  options?: IUseDeleteEmojiMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ emojiId }: IDeleteEmojiMutationVariables) =>
      deleteCustomEmoji(emojiId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.emojis.all,
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

//#endregion
