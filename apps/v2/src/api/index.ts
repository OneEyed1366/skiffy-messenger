// apps/v2/src/api/index.ts

/**
 * Barrel export for API module
 *
 * @module api
 */

//#region Type Exports

export { ApiError } from "./types";
export type { IApiError, IApiErrorResponse, IRequestOptions } from "./types";

//#endregion

//#region Client Exports

export { apiClient } from "./client";

//#endregion

//#region Channels API Exports

export {
  getChannels,
  getChannel,
  getChannelMembers,
  createChannel,
  updateChannel,
  deleteChannel,
  joinChannel,
  leaveChannel,
} from "./channels";
export type {
  ICreateChannelInput,
  IUpdateChannelInput,
  IChannelMemberResponse,
} from "./channels";

//#endregion

//#region Posts API Exports

export {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  addReaction,
  removeReaction,
} from "./posts";
export type {
  IGetPostsParams,
  ICreatePostData,
  IUpdatePostData,
} from "./posts";

//#endregion

//#region Threads API Exports

export {
  getThreads,
  getThread,
  markThreadRead,
  followThread,
} from "./threads";
export type {
  IGetThreadsParams,
  IMarkThreadReadResponse,
  IFollowThreadResponse,
} from "./threads";

//#endregion

//#region Users API Exports

export {
  getUsers,
  getUser,
  getCurrentUser,
  updateUser,
  updateStatus,
} from "./users";
export type {
  IGetUsersParams,
  IUpdateUserInput,
  IUpdateStatusInput,
} from "./users";

//#endregion

//#region Teams API Exports

export { getTeams, getTeam, joinTeam, leaveTeam } from "./teams";
export type { ITeamMemberResponse } from "./teams";

//#endregion

//#region Config API Exports

export { getClientConfig, getServerConfig } from "./config";
export type {
  IClientConfig,
  IClientNativeAppSettings,
  IServerConfig,
  IServiceSettings,
  ITeamSettings,
  ISqlSettings,
  ILogSettings,
  INotificationLogSettings,
  IPasswordSettings,
  IFileSettings,
  IEmailSettings,
  IRateLimitSettings,
  IPrivacySettings,
  ISupportSettings,
  IAnnouncementSettings,
  IThemeSettings,
  ILocalizationSettings,
  ISamlSettings,
  INativeAppSettings,
  IClusterSettings,
  IMetricsSettings,
  IAnalyticsSettings,
  IComplianceSettings,
  ILdapSettings,
  IPluginSettings,
  IDataRetentionSettings,
  IMessageExportSettings,
  IGlobalRelaySettings,
  IJobSettings,
  IElasticsearchSettings,
  IBleveSettings,
  IExperimentalSettings,
  IDisplaySettings,
  IGuestAccountsSettings,
  IImageProxySettings,
} from "./config";

//#endregion

//#region URL Exports

export {
  getUsersUrl,
  getUserUrl,
  getCurrentUserUrl,
  getPostsUrl,
  getPostUrl,
  getChannelPostsUrl,
  getChannelsUrl,
  getChannelUrl,
  getChannelMembersUrl,
  getTeamsUrl,
  getTeamUrl,
  getTeamChannelsUrl,
  getTeamMembersUrl,
  getThreadsUrl,
  getThreadUrl,
  getConfigUrl,
  getClientConfigUrl,
  getServerConfigUrl,
  getPreferencesUrl,
  getPreferencesByCategoryUrl,
} from "./urls";

//#endregion

//#region Preferences API Exports

export {
  getPreferences,
  getPreferencesByCategory,
  savePreference,
  savePreferences,
  deletePreference,
} from "./preferences";
export type {
  ISavePreferenceInput,
  IDeletePreferenceInput,
} from "./preferences";

//#endregion
