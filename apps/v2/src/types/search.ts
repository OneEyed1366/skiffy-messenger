// apps/v2/src/types/search.ts

/**
 * Search-related type definitions
 * Migrated from: vendor/desktop/webapp/platform/types/src/search.ts
 */

//#region Search Query

export type ISearch = {
  terms: string;
  isOrSearch: boolean;
};

//#endregion

//#region Search Parameter

export type ISearchParameter = {
  terms: string;
  is_or_search: boolean;
  time_zone_offset?: number;
  page: number;
  per_page: number;
  include_deleted_channels: boolean;
};

//#endregion

//#region Search State

export type ISearchMatches = {
  [postId: string]: string[];
};

export type ISearchTruncationInfo = {
  posts: number;
  files: number;
};

export type ISearchState = {
  current: ISearch | null;
  results: string[];
  fileResults: string[];
  flagged: string[];
  pinned: Record<string, string[]>;
  isSearchingTerm: boolean;
  isSearchGettingMore: boolean;
  isLimitedResults: number;
  matches: ISearchMatches;
  truncationInfo?: ISearchTruncationInfo;
};

//#endregion
