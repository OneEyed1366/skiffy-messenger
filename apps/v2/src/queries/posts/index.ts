// apps/v2/src/queries/posts/index.ts

/**
 * Barrel export for posts query hooks
 *
 * @module queries/posts
 */

//#region Hook Exports

export { usePostsQuery } from "./usePostsQuery";
export type { IUsePostsQueryOptions } from "./usePostsQuery";

export { usePostQuery } from "./usePostQuery";
export type { IUsePostQueryOptions } from "./usePostQuery";

export { useInfinitePostsQuery } from "./useInfinitePostsQuery";
export type { IUseInfinitePostsQueryOptions } from "./useInfinitePostsQuery";

//#endregion
