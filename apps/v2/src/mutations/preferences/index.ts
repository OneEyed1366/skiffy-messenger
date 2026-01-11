// apps/v2/src/mutations/preferences/index.ts

/**
 * Barrel export for Preferences mutations
 *
 * @module mutations/preferences
 */

//#region Save Preference

export {
  useSavePreferenceMutation,
  useSavePreferencesMutation,
} from "./useSavePreferenceMutation";
export type {
  ISavePreferenceMutationInput,
  ISavePreferencesMutationInput,
  IUseSavePreferenceMutationOptions,
  IUseSavePreferencesMutationOptions,
} from "./useSavePreferenceMutation";

//#endregion

//#region Delete Preference

export { useDeletePreferenceMutation } from "./useDeletePreferenceMutation";
export type {
  IDeletePreferenceMutationInput,
  IUseDeletePreferenceMutationOptions,
} from "./useDeletePreferenceMutation";

//#endregion
