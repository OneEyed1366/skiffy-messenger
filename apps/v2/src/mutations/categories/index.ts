// apps/v2/src/mutations/categories/index.ts

/**
 * Categories mutation hooks barrel export
 *
 * @module mutations/categories
 */

export { useCreateCategoryMutation } from "./useCreateCategoryMutation";
export type {
  ICreateCategoryMutationVariables,
  IUseCreateCategoryMutationOptions,
} from "./useCreateCategoryMutation";

export { useUpdateCategoryMutation } from "./useUpdateCategoryMutation";
export type {
  IUpdateCategoryMutationVariables,
  IUseUpdateCategoryMutationOptions,
} from "./useUpdateCategoryMutation";

export { useDeleteCategoryMutation } from "./useDeleteCategoryMutation";
export type {
  IDeleteCategoryMutationVariables,
  IUseDeleteCategoryMutationOptions,
} from "./useDeleteCategoryMutation";

export { useReorderCategoriesMutation } from "./useReorderCategoriesMutation";
export type {
  IReorderCategoriesMutationVariables,
  IUseReorderCategoriesMutationOptions,
} from "./useReorderCategoriesMutation";
