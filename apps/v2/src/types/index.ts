// apps/v2/src/types/index.ts

/**
 * Barrel export for all type definitions
 * Migrated from: vendor/desktop/webapp/platform/types/src/
 */

//#region User Types (T0.01)

export type {
  IUserProfile,
  IUserProfileWithLastViewAt,
  IUserNotifyProps,
  IUserTimezone,
  IUserStatus,
  IUserStatusValue,
  IUserCustomStatus,
  ICustomStatusDuration,
  IUserAccessToken,
  IUsersStats,
  IFilteredUsersStatsOpts,
  IDesktopNotificationSound,
  ICallsNotificationSound,
  INotifyLevel,
} from "./user";

//#endregion

//#region Channel Types (T0.02)

export type {
  IChannel,
  IChannelType,
  IServerChannel,
  IChannelWithTeamData,
  IChannelBanner,
  IChannelNotifyProps,
  IChannelMembership,
  IChannelUnread,
  IChannelStats,
  IChannelMessageCount,
  IChannelModeration,
  IChannelModerationPatch,
  IChannelMemberCountByGroup,
  IChannelSearchOpts,
  IChannelViewResponse,
} from "./channel";

//#endregion

//#region Post Types (T0.03)

export type {
  IPost,
  IPostType,
  IPostState,
  IPostPriority,
  IPostPriorityMetadata,
  IPostEmbed,
  IPostEmbedType,
  IPostImage,
  IPostMetadata,
  IPostAcknowledgement,
  IPostList,
  IPaginatedPostList,
  IPostSearchResults,
  IPostOrderBlock,
  IReaction,
  IMessageAttachment,
  IMessageAttachmentField,
  IPostAction,
  IPostActionOption,
  IMessageHistory,
  IOpenGraphMetadata,
  IOpenGraphMetadataImage,
  IPostPreviewMetadata,
} from "./post";

//#endregion

//#region Team Types (T0.04)

export type {
  ITeam,
  ITeamType,
  ITeamUnread,
  ITeamMembership,
  ITeamStats,
  ITeamsWithCount,
  ITeamMemberWithError,
  ITeamInviteWithError,
  ITeamSearchOpts,
} from "./team";

//#endregion

//#region File Types (T0.05)

export type {
  IFileInfo,
  IFileUploadResponse,
  IFileSearchResultItem,
  IFileSearchResults,
  IFileType,
  IFileSizeUnit,
  IFilePublicLink,
} from "./file";

export { FILE_SIZES } from "./file";

//#endregion

//#region Emoji Types (T0.06)

export type {
  ICustomEmoji,
  ISystemEmoji,
  IEmojiSkinVariation,
  IEmojiCategory,
  IEmoji,
  IEmojiSkinTone,
  IEmojisState,
} from "./emoji";

//#endregion

//#region Draft Types (T0.07)

export type {
  IDraft,
  IScheduledPost,
  IScheduledPostErrorCode,
  ISchedulingInfo,
  IDraftsState,
  IScheduledPostsState,
} from "./draft";

//#endregion

//#region Thread Types (T0.08)

export { IUserThreadType, threadIsSynthetic } from "./thread";

export type {
  IUserThread,
  IUserThreadSynthetic,
  IUserThreadWithPost,
  IUserThreadList,
  IThreadCounts,
  IThreadsState,
} from "./thread";

//#endregion

//#region Category Types (T0.09)

export type {
  IChannelCategoryType,
  ICategorySorting,
  IChannelCategory,
  IOrderedChannelCategories,
  IChannelCategoriesState,
} from "./category";

export { CATEGORY_SORTING, CATEGORY_TYPES } from "./category";

//#endregion

//#region Bookmark Types (T0.10)

export type {
  IChannelBookmarkType,
  IChannelBookmark,
  IChannelBookmarkCreate,
  IChannelBookmarkPatch,
  IChannelBookmarkWithFileInfo,
  IChannelBookmarksState,
} from "./bookmark";

//#endregion

//#region Group Types (T0.11)

export { ESyncableType, EGroupSource, EPluginGroupSourcePrefix } from "./group";

export type {
  IGroup,
  IGroupPatch,
  ICustomGroupPatch,
  IGroupCreateWithUserIds,
  ISyncablePatch,
  IGroupTeam,
  IGroupChannel,
  IGroupSyncable,
  IGroupSyncablesState,
  IGroupsState,
  IGroupStats,
  IGroupSearchOpts,
  IGetGroupsParams,
  IGetGroupsForUserParams,
  IGroupSearchParams,
  IMixedUnlinkedGroup,
  IMixedUnlinkedGroupRedux,
  IGroupMember,
  IGroupMembership,
  IUserWithGroup,
  IGroupsWithCount,
  IUsersWithGroupsAndCount,
  IGroupPermissions,
} from "./group";

//#endregion

//#region Preference Types (T0.12)

export type { IPreference, IPreferences } from "./preference";

//#endregion

//#region Session Types (T0.13)

export type { ISession, IAudit } from "./session";

//#endregion

//#region Search Types (T0.14)

export type {
  ISearch,
  ISearchParameter,
  ISearchMatches,
  ISearchTruncationInfo,
  ISearchState,
} from "./search";

//#endregion

//#region Utility Types (T0.15)

export type {
  // Entity constraint
  IEntity,
  // Relation types
  IRelationOneToOne,
  IRelationOneToMany,
  IRelationOneToManyUnique,
  // ID mapped collections
  IIDMappedObjects,
  IIDMappedCollection,
  // Deep partial
  IDeepPartial,
  // Type-level utilities
  IValueOf,
  IRequireOnlyOne,
  IIntersection,
  IEither,
  IPartialExcept,
} from "./utility";

export {
  // Type guards
  isArrayOf,
  isStringArray,
  isRecordOf,
  // Collection helpers
  collectionFromArray,
  collectionToArray,
  collectionReplaceItem,
  collectionAddItem,
  collectionRemoveItem,
  idMappedObjectsFromArr,
} from "./utility";

//#endregion
