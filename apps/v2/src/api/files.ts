// apps/v2/src/api/files.ts

/**
 * Files API Functions for L7 State Management
 * Provides HTTP operations for file upload, download, and metadata retrieval
 *
 * @module api/files
 */

//#region Imports

import { apiClient } from "./client";
import {
  getFilesUrl,
  getFileUrl,
  getFilesForPostUrl,
  getFileThumbnailUrl as getFileThumbnailRoute,
  getFilePreviewUrl as getFilePreviewRoute,
  getFileDownloadUrl as getFileDownloadRoute,
} from "./urls";

//#endregion

//#region Types

/**
 * File metadata information
 */
export type IFileInfo = {
  /** Unique file identifier */
  id: string;
  /** ID of the user who uploaded the file */
  user_id: string;
  /** ID of the post the file is attached to */
  post_id: string;
  /** ID of the channel containing the post */
  channel_id: string;
  /** Creation timestamp in milliseconds */
  create_at: number;
  /** Last update timestamp in milliseconds */
  update_at: number;
  /** Deletion timestamp in milliseconds (0 if not deleted) */
  delete_at: number;
  /** Original filename */
  name: string;
  /** File extension (e.g., "jpg", "pdf") */
  extension: string;
  /** File size in bytes */
  size: number;
  /** MIME type (e.g., "image/jpeg") */
  mime_type: string;
  /** Image width in pixels (for images only) */
  width?: number;
  /** Image height in pixels (for images only) */
  height?: number;
  /** Whether a preview image was generated */
  has_preview_image?: boolean;
  /** Base64-encoded mini preview thumbnail */
  mini_preview?: string;
};

/**
 * Response from file upload endpoint
 */
export type IFileUploadResponse = {
  /** Array of uploaded file metadata */
  file_infos: IFileInfo[];
  /** Client-provided IDs for tracking uploads */
  client_ids?: string[];
};

/**
 * Response from public link endpoint
 */
export type IFilePublicLinkResponse = {
  /** Public shareable link to the file */
  link: string;
};

//#endregion

//#region File Metadata API Functions

/**
 * Fetch file metadata for all files attached to a post
 * @param postId - The post ID to fetch files for
 * @returns Array of file info objects
 */
export async function getFilesForPost(postId: string): Promise<IFileInfo[]> {
  return apiClient.get<IFileInfo[]>(getFilesForPostUrl(postId));
}

/**
 * Fetch metadata for a single file
 * @param fileId - The file ID to fetch
 * @returns File info object
 */
export async function getFileInfo(fileId: string): Promise<IFileInfo> {
  const url = `${getFileUrl(fileId)}/info`;
  return apiClient.get<IFileInfo>(url);
}

//#endregion

//#region File URL Builders

/**
 * Get the thumbnail URL for an image file
 * Use this URL directly in img src or fetch for binary data
 * @param fileId - The file ID
 * @param timestamp - Optional cache-busting timestamp
 * @returns Full URL to the file thumbnail
 */
export function getFileThumbnailUrl(
  fileId: string,
  timestamp?: number,
): string {
  return getFileThumbnailRoute(fileId, timestamp);
}

/**
 * Get the preview URL for an image file
 * Preview is a larger version than thumbnail
 * @param fileId - The file ID
 * @param timestamp - Optional cache-busting timestamp
 * @returns Full URL to the file preview
 */
export function getFilePreviewUrl(fileId: string, timestamp?: number): string {
  return getFilePreviewRoute(fileId, timestamp);
}

/**
 * Get the download URL for a file
 * @param fileId - The file ID
 * @returns Full URL to download the file
 */
export function getFileDownloadUrl(fileId: string): string {
  return getFileDownloadRoute(fileId);
}

//#endregion

//#region File Link API Functions

/**
 * Get a public shareable link for a file
 * @param fileId - The file ID
 * @returns Object containing the public link
 */
export async function getFilePublicLink(
  fileId: string,
): Promise<IFilePublicLinkResponse> {
  const url = `${getFileUrl(fileId)}/link`;
  return apiClient.get<IFilePublicLinkResponse>(url);
}

//#endregion

//#region File Upload API Functions

/**
 * Upload files to a channel
 * Files are uploaded as multipart/form-data
 * @param channelId - The channel ID to upload files to
 * @param files - Array of File objects to upload
 * @param clientIds - Optional array of client-side IDs for tracking uploads
 * @returns Upload response with file metadata
 */
export async function uploadFiles(
  channelId: string,
  files: File[],
  clientIds?: string[],
): Promise<IFileUploadResponse> {
  const formData = new FormData();
  formData.append("channel_id", channelId);

  files.forEach((file, index) => {
    formData.append("files", file);
    if (clientIds?.[index]) {
      formData.append("client_ids", clientIds[index]);
    }
  });

  // For multipart/form-data, we need to exclude Content-Type header
  // to let the browser set the correct boundary
  const response = await fetch(getFilesUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiClient.getToken()}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: response.statusText || "File upload failed",
      status_code: response.status,
    }));
    throw new Error(errorData.message || "File upload failed");
  }

  return response.json() as Promise<IFileUploadResponse>;
}

//#endregion
