// apps/v2/src/mutations/posts/index.ts

/**
 * Barrel export for Posts mutations
 *
 * @module mutations/posts
 */

//#region Create Post

export { useCreatePostMutation, createPost } from "./useCreatePostMutation";
export type {
  ICreatePostInput,
  IUseCreatePostMutationOptions,
} from "./useCreatePostMutation";

//#endregion

//#region Update Post

export { useUpdatePostMutation, updatePost } from "./useUpdatePostMutation";
export type {
  IUpdatePostInput,
  IUseUpdatePostMutationOptions,
} from "./useUpdatePostMutation";

//#endregion

//#region Delete Post

export { useDeletePostMutation, deletePost } from "./useDeletePostMutation";
export type {
  IDeletePostInput,
  IUseDeletePostMutationOptions,
} from "./useDeletePostMutation";

//#endregion

//#region Reactions

export {
  useAddReactionMutation,
  useRemoveReactionMutation,
  addReaction,
  removeReaction,
} from "./useReactionMutation";
export type {
  IAddReactionInput,
  IRemoveReactionInput,
  IUseAddReactionMutationOptions,
  IUseRemoveReactionMutationOptions,
} from "./useReactionMutation";

//#endregion
