// apps/v2/src/queries/search/index.ts

/**
 * Search query hooks barrel export
 *
 * @module queries/search
 */

export { useSearchPostsQuery } from "./useSearchPostsQuery";
export type { IUseSearchPostsQueryOptions } from "./useSearchPostsQuery";

export { useFlaggedPostsQuery } from "./useFlaggedPostsQuery";
export type { IUseFlaggedPostsQueryOptions } from "./useFlaggedPostsQuery";

export { usePinnedPostsQuery } from "./usePinnedPostsQuery";
export type { IUsePinnedPostsQueryOptions } from "./usePinnedPostsQuery";
