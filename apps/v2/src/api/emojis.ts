// apps/v2/src/api/emojis.ts

/**
 * Custom Emojis API Functions for L7 State Management
 * Provides CRUD operations for custom emojis
 *
 * @module api/emojis
 */

//#region Imports

import { apiClient } from "./client";

//#endregion

//#region Types

/**
 * Custom emoji definition
 */
export type ICustomEmoji = {
  /** Unique emoji ID */
  id: string;
  /** Creator user ID */
  creator_id: string;
  /** Emoji name (used as :name:) */
  name: string;
  /** Creation timestamp in milliseconds */
  create_at: number;
  /** Last update timestamp in milliseconds */
  update_at: number;
  /** Deletion timestamp (0 if not deleted) */
  delete_at: number;
};

/**
 * Input for creating a custom emoji
 */
export type ICreateEmojiInput = {
  /** Emoji name (alphanumeric and underscores only) */
  name: string;
  /** Creator user ID */
  creator_id: string;
};

/**
 * Parameters for listing emojis
 */
export type IGetEmojisParams = {
  /** Page number (0-based) */
  page?: number;
  /** Results per page */
  per_page?: number;
  /** Sort by field */
  sort?: "name";
};

//#endregion

//#region URL Builders

/**
 * Get the emojis API route
 * @returns Emojis endpoint path
 */
export function getEmojisUrl(): string {
  return `${apiClient.getBaseRoute()}/emoji`;
}

/**
 * Get a specific emoji's route
 * @param emojiId - The emoji ID
 * @returns Emoji endpoint path
 */
export function getEmojiUrl(emojiId: string): string {
  return `${getEmojisUrl()}/${emojiId}`;
}

/**
 * Get emoji by name route
 * @param name - The emoji name
 * @returns Emoji by name endpoint path
 */
export function getEmojiByNameUrl(name: string): string {
  return `${getEmojisUrl()}/name/${name}`;
}

/**
 * Get emoji autocomplete route
 * @returns Emoji autocomplete endpoint path
 */
export function getEmojiAutocompleteUrl(): string {
  return `${getEmojisUrl()}/autocomplete`;
}

/**
 * Get emoji search route
 * @returns Emoji search endpoint path
 */
export function getEmojiSearchUrl(): string {
  return `${getEmojisUrl()}/search`;
}

//#endregion

//#region Emoji API Functions

/**
 * Get a paginated list of custom emojis
 *
 * @param params - Optional pagination and sort parameters
 * @returns Array of custom emojis
 *
 * @example
 * ```typescript
 * const emojis = await getCustomEmojis({ page: 0, per_page: 100 });
 * ```
 */
export async function getCustomEmojis(
  params?: IGetEmojisParams,
): Promise<ICustomEmoji[]> {
  const url = new URL(getEmojisUrl());

  if (params?.page !== undefined) {
    url.searchParams.set("page", String(params.page));
  }
  if (params?.per_page !== undefined) {
    url.searchParams.set("per_page", String(params.per_page));
  }
  if (params?.sort) {
    url.searchParams.set("sort", params.sort);
  }

  return apiClient.get<ICustomEmoji[]>(url.toString());
}

/**
 * Get a specific custom emoji by ID
 *
 * @param emojiId - The emoji ID
 * @returns The custom emoji
 *
 * @example
 * ```typescript
 * const emoji = await getCustomEmoji("emoji123");
 * ```
 */
export async function getCustomEmoji(emojiId: string): Promise<ICustomEmoji> {
  return apiClient.get<ICustomEmoji>(getEmojiUrl(emojiId));
}

/**
 * Get a custom emoji by name
 *
 * @param name - The emoji name
 * @returns The custom emoji
 *
 * @example
 * ```typescript
 * const emoji = await getCustomEmojiByName("thumbsup");
 * ```
 */
export async function getCustomEmojiByName(
  name: string,
): Promise<ICustomEmoji> {
  return apiClient.get<ICustomEmoji>(getEmojiByNameUrl(name));
}

/**
 * Search custom emojis by name
 *
 * @param term - Search term
 * @param prefixOnly - Only match prefix (default: false)
 * @returns Array of matching emojis
 *
 * @example
 * ```typescript
 * const emojis = await searchCustomEmojis("thumb");
 * ```
 */
export async function searchCustomEmojis(
  term: string,
  prefixOnly = false,
): Promise<ICustomEmoji[]> {
  return apiClient.post<ICustomEmoji[]>(getEmojiSearchUrl(), {
    term,
    prefix_only: prefixOnly,
  });
}

/**
 * Autocomplete emoji names
 *
 * @param name - Partial emoji name to autocomplete
 * @returns Array of matching emojis
 *
 * @example
 * ```typescript
 * const emojis = await autocompleteEmojis("thu");
 * ```
 */
export async function autocompleteEmojis(
  name: string,
): Promise<ICustomEmoji[]> {
  const url = new URL(getEmojiAutocompleteUrl());
  url.searchParams.set("name", name);
  return apiClient.get<ICustomEmoji[]>(url.toString());
}

/**
 * Create a custom emoji
 *
 * @param emoji - Emoji metadata (name, creator_id)
 * @param image - Image file for the emoji
 * @returns The created emoji
 *
 * @example
 * ```typescript
 * const emoji = await createCustomEmoji(
 *   { name: "myemoji", creator_id: "user123" },
 *   imageFile
 * );
 * ```
 */
export async function createCustomEmoji(
  emoji: ICreateEmojiInput,
  image: File,
): Promise<ICustomEmoji> {
  const formData = new FormData();
  formData.append("emoji", JSON.stringify(emoji));
  formData.append("image", image);

  const response = await fetch(getEmojisUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiClient.getToken()}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: response.statusText || "Emoji creation failed",
      status_code: response.status,
    }));
    throw new Error(errorData.message || "Emoji creation failed");
  }

  return response.json() as Promise<ICustomEmoji>;
}

/**
 * Delete a custom emoji
 *
 * @param emojiId - The emoji ID to delete
 *
 * @example
 * ```typescript
 * await deleteCustomEmoji("emoji123");
 * ```
 */
export async function deleteCustomEmoji(emojiId: string): Promise<void> {
  return apiClient.delete<void>(getEmojiUrl(emojiId));
}

/**
 * Get the image URL for a custom emoji
 *
 * @param emojiId - The emoji ID
 * @returns URL to the emoji image
 *
 * @example
 * ```typescript
 * const imageUrl = getCustomEmojiImageUrl("emoji123");
 * // Use in <img src={imageUrl} />
 * ```
 */
export function getCustomEmojiImageUrl(emojiId: string): string {
  return `${getEmojiUrl(emojiId)}/image`;
}

//#endregion
