// apps/v2/src/types/thread.ts

/**
 * Thread-related type definitions
 * Migrated from: vendor/desktop/webapp/platform/types/src/threads.ts
 */

import type { IChannel } from "./channel";
import type { IPost } from "./post";
import type { ITeam } from "./team";
import type { IUserProfile } from "./user";
import type {
  IIDMappedObjects,
  IRelationOneToMany,
  IRelationOneToOne,
} from "./utility";

//#region Thread Type Enum

export enum IUserThreadType {
  Synthetic = "S", // derived from post
}

//#endregion

//#region User Thread

export type IUserThread = {
  id: string;
  reply_count: number;
  last_reply_at: number;
  last_viewed_at: number;
  participants: ({ id: IUserProfile["id"] } | IUserProfile)[];
  unread_replies: number;
  unread_mentions: number;
  is_following: boolean;
  is_urgent?: boolean;
  type?: IUserThreadType;

  /**
   * Only depend on channel_id and user_id for UserThread<>Channel/User mapping,
   * use normalized post store/selectors as those are kept up-to-date in the store
   */
  post: {
    channel_id: IChannel["id"];
    user_id: IUserProfile["id"];
  };
};

//#endregion

//#region Synthetic Thread

type ISyntheticMissingKeys =
  | "unread_replies"
  | "unread_mentions"
  | "last_viewed_at";

export type IUserThreadSynthetic = Omit<IUserThread, ISyntheticMissingKeys> & {
  type: IUserThreadType.Synthetic;
};

/**
 * Type guard to check if a thread is synthetic
 */
export function threadIsSynthetic(
  thread: IUserThread | IUserThreadSynthetic,
): thread is IUserThreadSynthetic {
  return thread.type === IUserThreadType.Synthetic;
}

//#endregion

//#region Thread with Post

export type IUserThreadWithPost = IUserThread & { post: IPost };

//#endregion

//#region Thread List

export type IUserThreadList = {
  total: number;
  total_unread_threads: number;
  total_unread_mentions: number;
  total_unread_urgent_mentions?: number;
  threads: IUserThreadWithPost[];
};

//#endregion

//#region Thread Counts

export type IThreadCounts = {
  total: number;
  total_unread_threads: number;
  total_unread_mentions: number;
  total_unread_urgent_mentions?: number;
};

//#endregion

//#region Threads State

export type IThreadsState = {
  threadsInTeam: IRelationOneToMany<ITeam, IUserThread>;
  unreadThreadsInTeam: IRelationOneToMany<ITeam, IUserThread>;
  threads: IIDMappedObjects<IUserThread>;
  counts: IRelationOneToOne<ITeam, IThreadCounts>;
  countsIncludingDirect: IRelationOneToOne<ITeam, IThreadCounts>;
};

//#endregion
