//#region Types

/**
 * Type for query keys object
 */
export type IQueryKeys = typeof queryKeys;

//#endregion

//#region Query Keys
/**
 * Centralized query key factory for type-safe cache invalidation.
 * Pattern: queryKeys.<domain>.<action>(...args)
 *
 * @example
 * queryKeys.users.all // ['users']
 * queryKeys.users.detail('123') // ['users', 'detail', '123']
 */
export const queryKeys = {
  //#region Posts Keys
  posts: {
    all: ["posts"] as const,
    list: (channelId: string, params?: unknown) =>
      ["posts", "list", channelId, params] as const,
    detail: (postId: string) => ["posts", "detail", postId] as const,
    infinite: (channelId: string) => ["posts", "infinite", channelId] as const,
  },
  //#endregion

  //#region Channels Keys
  channels: {
    all: ["channels"] as const,
    list: (teamId: string) => ["channels", "list", teamId] as const,
    detail: (channelId: string) => ["channels", "detail", channelId] as const,
    members: (channelId: string) => ["channels", "members", channelId] as const,
  },
  //#endregion

  //#region Users Keys
  users: {
    all: ["users"] as const,
    list: (params?: unknown) => ["users", "list", params] as const,
    detail: (userId: string) => ["users", "detail", userId] as const,
    current: () => ["users", "current"] as const,
  },
  //#endregion

  //#region Teams Keys
  teams: {
    all: ["teams"] as const,
    list: () => ["teams", "list"] as const,
    detail: (teamId: string) => ["teams", "detail", teamId] as const,
  },
  //#endregion

  //#region Threads Keys
  threads: {
    all: ["threads"] as const,
    list: (userId: string, teamId?: string, params?: unknown) =>
      ["threads", "list", userId, teamId, params] as const,
    detail: (userId: string, threadId: string) =>
      ["threads", "detail", userId, threadId] as const,
  },
  //#endregion

  //#region Files Keys
  files: {
    all: ["files"] as const,
    detail: (fileId: string) =>
      [...queryKeys.files.all, "detail", fileId] as const,
    forPost: (postId: string) =>
      [...queryKeys.files.all, "forPost", postId] as const,
  },
  //#endregion

  //#region Search Keys
  search: {
    all: ["search"] as const,
    posts: (teamId: string | null, terms: string, params?: unknown) =>
      [...queryKeys.search.all, "posts", teamId, terms, params] as const,
    flagged: (userId: string, params?: unknown) =>
      [...queryKeys.search.all, "flagged", userId, params] as const,
    pinned: (channelId: string) =>
      [...queryKeys.search.all, "pinned", channelId] as const,
  },
  //#endregion

  //#region Categories Keys
  categories: {
    all: ["categories"] as const,
    forTeam: (userId: string, teamId: string) =>
      [...queryKeys.categories.all, userId, teamId] as const,
  },
  //#endregion

  //#region Emojis Keys
  emojis: {
    all: ["emojis"] as const,
    list: (params?: unknown) =>
      [...queryKeys.emojis.all, "list", params] as const,
    detail: (emojiId: string) =>
      [...queryKeys.emojis.all, "detail", emojiId] as const,
    byName: (name: string) =>
      [...queryKeys.emojis.all, "byName", name] as const,
    autocomplete: (term: string) =>
      [...queryKeys.emojis.all, "autocomplete", term] as const,
    search: (term: string) =>
      [...queryKeys.emojis.all, "search", term] as const,
  },
  //#endregion

  //#region Reactions Keys
  reactions: {
    all: ["reactions"] as const,
    forPost: (postId: string) =>
      [...queryKeys.reactions.all, "forPost", postId] as const,
  },
  //#endregion

  //#region Config Keys
  config: {
    client: () => ["config", "client"] as const,
    server: () => ["config", "server"] as const,
  },
  //#endregion

  //#region Preferences Keys
  preferences: {
    all: ["preferences"] as const,
    byCategory: (category: string) => ["preferences", category] as const,
  },
  //#endregion
} as const;
//#endregion
