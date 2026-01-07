// apps/v2/src/types/bookmark.ts

/**
 * Channel bookmark-related type definitions
 * Migrated from: vendor/desktop/webapp/platform/types/src/channel_bookmarks.ts
 */

import type { IChannel } from "./channel";
import type { IFileInfo } from "./file";

//#region Bookmark Type

export type IChannelBookmarkType = "link" | "file";

//#endregion

//#region Channel Bookmark

export type IChannelBookmark = {
  id: string;
  create_at: number;
  update_at: number;
  delete_at: number;
  channel_id: string;
  owner_id: string;
  file_id?: string;
  file?: IFileInfo;
  display_name: string;
  sort_order: number;
  link_url?: string;
  image_url?: string;
  emoji?: string;
  type: IChannelBookmarkType;
  original_id?: string;
  parent_id?: string;
};

//#endregion

//#region Bookmark Create

export type IChannelBookmarkCreate = {
  display_name: string;
  image_url?: string;
  emoji?: string;
  type: IChannelBookmarkType;
} & (
  | {
      type: "link";
      link_url: string;
    }
  | {
      type: "file";
      file_id: string;
    }
);

//#endregion

//#region Bookmark Patch

export type IChannelBookmarkPatch = {
  file_id?: string;
  display_name?: string;
  sort_order?: number;
  link_url?: string;
  image_url?: string;
  emoji?: string;
};

//#endregion

//#region Bookmark With File Info

export type IChannelBookmarkWithFileInfo = IChannelBookmark & {
  file: IFileInfo;
};

//#endregion

//#region Bookmarks State

export type IChannelBookmarksState = {
  byChannelId: Record<IChannel["id"], Record<string, IChannelBookmark>>;
};

//#endregion
