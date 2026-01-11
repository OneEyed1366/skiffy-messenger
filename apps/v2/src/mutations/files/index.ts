// apps/v2/src/mutations/files/index.ts

/**
 * Barrel export for Files mutations
 *
 * @module mutations/files
 */

//#region Upload Files

export { useUploadFilesMutation, uploadFiles } from "./useUploadFilesMutation";
export type {
  IUploadFilesInput,
  IUseUploadFilesMutationOptions,
} from "./useUploadFilesMutation";

//#endregion

//#region Get Public Link

export {
  useGetPublicLinkMutation,
  getPublicLink,
} from "./useGetPublicLinkMutation";
export type {
  IGetPublicLinkInput,
  IUseGetPublicLinkMutationOptions,
} from "./useGetPublicLinkMutation";

//#endregion
