// apps/v2/src/mutations/emojis/useCreateEmojiMutation.ts

/**
 * Mutation hook for creating custom emojis
 *
 * @module mutations/emojis/useCreateEmojiMutation
 */

//#region Imports

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ICreateEmojiInput, ICustomEmoji } from "@/api";
import { createCustomEmoji } from "@/api";
import { queryKeys } from "@/queries/keys";

//#endregion

//#region Types

export type ICreateEmojiMutationVariables = {
  emoji: ICreateEmojiInput;
  image: File;
};

export type IUseCreateEmojiMutationOptions = {
  onSuccess?: (data: ICustomEmoji) => void;
  onError?: (error: Error) => void;
};

//#endregion

//#region Hook

/**
 * Mutation hook for creating a custom emoji
 *
 * @param options - Optional callbacks
 * @returns Mutation object
 *
 * @example
 * ```typescript
 * const { mutate } = useCreateEmojiMutation();
 * mutate({
 *   emoji: { name: "myemoji", creator_id: "user123" },
 *   image: file
 * });
 * ```
 */
export function useCreateEmojiMutation(
  options?: IUseCreateEmojiMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ emoji, image }: ICreateEmojiMutationVariables) =>
      createCustomEmoji(emoji, image),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.emojis.all,
      });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

//#endregion
