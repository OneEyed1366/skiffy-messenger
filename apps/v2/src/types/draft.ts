/**
 * Draft and scheduled post type definitions
 * Migrated from: vendor/desktop/webapp/platform/types/src/drafts.ts
 */

import type { IPostType, IPostMetadata, IPostPriorityMetadata } from "./post";

//#region Draft

export type IDraft = {
  create_at: number;
  update_at: number;
  delete_at: number;
  user_id: string;
  channel_id: string;
  root_id: string;
  message: string;
  type?: IPostType;
  props: Record<string, unknown>;
  file_ids?: string[];
  metadata?: IPostMetadata;
  priority?: IPostPriorityMetadata;
};

//#endregion

//#region Scheduled Post

export type IScheduledPostErrorCode =
  | "unknown_error"
  | "channel_archived"
  | "channel_not_found"
  | "user_missing_from_channel"
  | "no_channel_permission"
  | "no_channel_member"
  | "thread_deleted"
  | "unable_to_send";

export type IScheduledPost = Omit<IDraft, "delete_at"> & {
  id: string;
  scheduled_at: number;
  processed_at?: number;
  error_code?: IScheduledPostErrorCode;
};

//#endregion

//#region Scheduling Info

export type ISchedulingInfo = {
  scheduled_at?: number;
};

//#endregion

//#region Drafts State

export type IDraftsState = {
  drafts: Record<string, IDraft>;
  draftsByChannel: Record<string, string[]>;
  draftsByThread: Record<string, string[]>;
};

//#endregion

//#region Scheduled Posts State

export type IScheduledPostsState = {
  byId: Record<string, IScheduledPost | undefined>;
  byTeamId: Record<string, string[]>;
  errorsByTeamId: Record<string, string[]>;
  byChannelOrThreadId: Record<string, string[]>;
};

//#endregion
