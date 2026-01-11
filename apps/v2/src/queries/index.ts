export { queryClient, queryClientConfig } from "./client";
export { queryKeys } from "./keys";
export type { IQueryKeys } from "./keys";

//#region Channel Query Hooks

export {
  useChannelsQuery,
  useChannelQuery,
  useChannelMembersQuery,
} from "./channels";
export type {
  IUseChannelsQueryOptions,
  IUseChannelQueryOptions,
  IUseChannelMembersQueryOptions,
} from "./channels";

//#endregion

//#region Posts Query Hooks

export {
  usePostsQuery,
  usePostQuery,
  useInfinitePostsQuery,
} from "./posts";
export type {
  IUsePostsQueryOptions,
  IUsePostQueryOptions,
  IUseInfinitePostsQueryOptions,
} from "./posts";

//#endregion

//#region Threads Query Hooks

export { useThreadsQuery, useThreadQuery } from "./threads";
export type {
  IUseThreadsQueryOptions,
  IUseThreadQueryOptions,
} from "./threads";

//#endregion

//#region Users Query Hooks

export { useUsersQuery, useUserQuery, useCurrentUserQuery } from "./users";
export type {
  IUseUsersQueryOptions,
  IUseUserQueryOptions,
  IUseCurrentUserQueryOptions,
} from "./users";

//#endregion

//#region Teams Query Hooks

export { useTeamsQuery, useTeamQuery } from "./teams";
export type { IUseTeamsQueryOptions, IUseTeamQueryOptions } from "./teams";

//#endregion

//#region Config Query Hooks

export { useClientConfigQuery, useServerConfigQuery } from "./config";
export type {
  IUseClientConfigQueryOptions,
  IUseServerConfigQueryOptions,
} from "./config";

//#endregion

//#region Preferences Query Hooks

export { usePreferencesQuery, usePreferencesByCategoryQuery } from "./preferences";
export type {
  IUsePreferencesQueryOptions,
  IUsePreferencesByCategoryQueryOptions,
} from "./preferences";

//#endregion
