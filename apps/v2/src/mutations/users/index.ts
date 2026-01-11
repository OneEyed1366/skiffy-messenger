// apps/v2/src/mutations/users/index.ts

/**
 * Barrel export for user mutations
 *
 * @module mutations/users
 */

//#region Update User Mutation

export { useUpdateUserMutation, updateUser } from "./useUpdateUserMutation";

export type {
  IUpdateUserInput,
  IUseUpdateUserMutationOptions,
} from "./useUpdateUserMutation";

//#endregion

//#region Update Status Mutation

export {
  useUpdateStatusMutation,
  updateStatus,
} from "./useUpdateStatusMutation";

export type {
  IUpdateStatusInput,
  IUseUpdateStatusMutationOptions,
} from "./useUpdateStatusMutation";

//#endregion
