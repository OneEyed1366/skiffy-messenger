// apps/v2/src/mutations/index.ts

/**
 * Barrel export for all mutations
 *
 * @module mutations
 */

//#region Posts Mutations

export {
  // Hooks
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useAddReactionMutation,
  useRemoveReactionMutation,
  usePinPostMutation,
  useFlagPostMutation,
  // API Functions
  createPost,
  updatePost,
  deletePost,
  addReaction,
  removeReaction,
  pinOrUnpinPost,
  flagOrUnflagPost,
} from "./posts";

export type {
  // Create Post
  ICreatePostInput,
  IUseCreatePostMutationOptions,
  // Update Post
  IUpdatePostInput,
  IUseUpdatePostMutationOptions,
  // Delete Post
  IDeletePostInput,
  IUseDeletePostMutationOptions,
  // Reactions
  IAddReactionInput,
  IRemoveReactionInput,
  IUseAddReactionMutationOptions,
  IUseRemoveReactionMutationOptions,
  // Pin Post
  IPinPostMutationVariables,
  IUsePinPostMutationOptions,
  // Flag Post
  IFlagPostMutationVariables,
  IUseFlagPostMutationOptions,
} from "./posts";

//#endregion

//#region Channel Mutations

export {
  useCreateChannelMutation,
  useUpdateChannelMutation,
  useDeleteChannelMutation,
  useJoinChannelMutation,
  useLeaveChannelMutation,
} from "./channels";

export type {
  ICreateChannelInput,
  ICreateChannelMutationOptions,
  IUpdateChannelInput,
  IUpdateChannelMutationOptions,
  IDeleteChannelInput,
  IDeleteChannelResponse,
  IDeleteChannelMutationOptions,
  IJoinChannelInput,
  IJoinChannelMutationOptions,
  ILeaveChannelInput,
  ILeaveChannelResponse,
  ILeaveChannelMutationOptions,
} from "./channels";

//#endregion

//#region Users Mutations

export {
  useUpdateUserMutation,
  useUpdateStatusMutation,
  updateUser,
  updateStatus,
} from "./users";

export type {
  IUpdateUserInput,
  IUseUpdateUserMutationOptions,
  IUpdateStatusInput,
  IUseUpdateStatusMutationOptions,
} from "./users";

//#endregion

//#region Thread Mutations

export {
  useMarkThreadReadMutation,
  useFollowThreadMutation,
  markThreadRead,
  followThread,
} from "./threads";

export type {
  IMarkThreadReadInput,
  IMarkThreadReadResponse,
  IUseMarkThreadReadMutationOptions,
  IFollowThreadInput,
  IFollowThreadResponse,
  IUseFollowThreadMutationOptions,
} from "./threads";

//#endregion

//#region Teams Mutations

export { useJoinTeamMutation, useLeaveTeamMutation } from "./teams";

export type {
  IJoinTeamInput,
  IJoinTeamMutationOptions,
  ILeaveTeamInput,
  ILeaveTeamResponse,
  ILeaveTeamMutationOptions,
} from "./teams";

//#endregion

//#region Preferences Mutations

export {
  useSavePreferenceMutation,
  useSavePreferencesMutation,
  useDeletePreferenceMutation,
} from "./preferences";

export type {
  ISavePreferenceMutationInput,
  ISavePreferencesMutationInput,
  IUseSavePreferenceMutationOptions,
  IUseSavePreferencesMutationOptions,
  IDeletePreferenceMutationInput,
  IUseDeletePreferenceMutationOptions,
} from "./preferences";

//#endregion

//#region Files Mutations

export {
  // Hooks
  useUploadFilesMutation,
  useGetPublicLinkMutation,
  // API Functions
  uploadFiles,
  getPublicLink,
} from "./files";

export type {
  // Upload Files
  IUploadFilesInput,
  IUseUploadFilesMutationOptions,
  // Get Public Link
  IGetPublicLinkInput,
  IUseGetPublicLinkMutationOptions,
} from "./files";

//#endregion

//#region Categories Mutations

export {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useReorderCategoriesMutation,
} from "./categories";

export type {
  ICreateCategoryMutationVariables,
  IUseCreateCategoryMutationOptions,
  IUpdateCategoryMutationVariables,
  IUseUpdateCategoryMutationOptions,
  IDeleteCategoryMutationVariables,
  IUseDeleteCategoryMutationOptions,
  IReorderCategoriesMutationVariables,
  IUseReorderCategoriesMutationOptions,
} from "./categories";

//#endregion

//#region Emojis Mutations

export { useCreateEmojiMutation, useDeleteEmojiMutation } from "./emojis";

export type {
  ICreateEmojiMutationVariables,
  IUseCreateEmojiMutationOptions,
  IDeleteEmojiMutationVariables,
  IUseDeleteEmojiMutationOptions,
} from "./emojis";

//#endregion
