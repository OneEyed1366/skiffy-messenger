// apps/v2/src/queries/users/index.ts

/**
 * Barrel export for user query hooks
 *
 * @module queries/users
 */

//#region Hook Exports

export { useUsersQuery } from "./useUsersQuery";
export type { IUseUsersQueryOptions } from "./useUsersQuery";

export { useUserQuery } from "./useUserQuery";
export type { IUseUserQueryOptions } from "./useUserQuery";

export { useCurrentUserQuery } from "./useCurrentUserQuery";
export type { IUseCurrentUserQueryOptions } from "./useCurrentUserQuery";

//#endregion
