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
    infinite: (channelId: string) =>
      ["posts", "infinite", channelId] as const,
  },
  //#endregion

  //#region Channels Keys
  channels: {
    all: ["channels"] as const,
    list: (teamId: string) => ["channels", "list", teamId] as const,
    detail: (channelId: string) => ["channels", "detail", channelId] as const,
    members: (channelId: string) =>
      ["channels", "members", channelId] as const,
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
