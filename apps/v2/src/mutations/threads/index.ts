// apps/v2/src/mutations/threads/index.ts

/**
 * Barrel export for Threads mutations
 *
 * @module mutations/threads
 */

//#region Mark Thread Read

export {
  useMarkThreadReadMutation,
  markThreadRead,
} from "./useMarkThreadReadMutation";
export type {
  IMarkThreadReadInput,
  IMarkThreadReadResponse,
  IUseMarkThreadReadMutationOptions,
} from "./useMarkThreadReadMutation";

//#endregion

//#region Follow Thread

export {
  useFollowThreadMutation,
  followThread,
} from "./useFollowThreadMutation";
export type {
  IFollowThreadInput,
  IFollowThreadResponse,
  IUseFollowThreadMutationOptions,
} from "./useFollowThreadMutation";

//#endregion
