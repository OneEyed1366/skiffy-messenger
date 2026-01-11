// apps/v2/src/queries/config/index.ts

/**
 * Barrel export for config query hooks
 *
 * @module queries/config
 */

//#region Hook Exports

export { useClientConfigQuery } from "./useClientConfigQuery";
export type { IUseClientConfigQueryOptions } from "./useClientConfigQuery";

export { useServerConfigQuery } from "./useServerConfigQuery";
export type { IUseServerConfigQueryOptions } from "./useServerConfigQuery";

//#endregion
