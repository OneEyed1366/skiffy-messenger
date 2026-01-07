// apps/v2/src/types/file.ts

/**
 * File-related type definitions
 * Migrated from: vendor/desktop/webapp/platform/types/src/files.ts
 */

//#region File Info

export type IFileInfo = {
  id: string;
  user_id: string;
  channel_id: string;
  create_at: number;
  update_at: number;
  delete_at: number;
  name: string;
  extension: string;
  size: number;
  mime_type: string;
  width: number;
  height: number;
  has_preview_image: boolean;
  clientId?: string;
  post_id?: string;
  mini_preview?: string;
  archived: boolean;
  link?: string;
};

//#endregion

//#region File Upload

export type IFileUploadResponse = {
  file_infos: IFileInfo[];
  client_ids: string[];
};

//#endregion

//#region File Search

export type IFileSearchResultItem = IFileInfo & {
  channel_display_name: string;
};

export type IFileSearchResults = {
  order: string[];
  file_infos: Record<string, IFileSearchResultItem>;
  next_file_id: string;
};

//#endregion

//#region File Types

export type IFileType =
  | "text"
  | "image"
  | "audio"
  | "video"
  | "spreadsheet"
  | "code"
  | "word"
  | "presentation"
  | "pdf"
  | "patch"
  | "svg"
  | "other";

//#endregion

//#region File Sizes

export const FILE_SIZES = {
  Byte: 1,
  Kilobyte: 1024,
  Megabyte: 1024 * 1024,
  Gigabyte: 1024 * 1024 * 1024,
} as const;

export type IFileSizeUnit = keyof typeof FILE_SIZES;

//#endregion

//#region Public Link

export type IFilePublicLink = {
  link: string;
};

//#endregion
