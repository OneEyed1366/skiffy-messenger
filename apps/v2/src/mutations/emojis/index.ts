// apps/v2/src/mutations/emojis/index.ts

/**
 * Emojis mutation hooks barrel export
 *
 * @module mutations/emojis
 */

export { useCreateEmojiMutation } from "./useCreateEmojiMutation";
export type {
  ICreateEmojiMutationVariables,
  IUseCreateEmojiMutationOptions,
} from "./useCreateEmojiMutation";

export { useDeleteEmojiMutation } from "./useDeleteEmojiMutation";
export type {
  IDeleteEmojiMutationVariables,
  IUseDeleteEmojiMutationOptions,
} from "./useDeleteEmojiMutation";
