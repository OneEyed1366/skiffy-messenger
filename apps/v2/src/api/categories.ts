// apps/v2/src/api/categories.ts

/**
 * Channel Categories API Functions for L7 State Management
 * Provides CRUD operations for sidebar channel categories
 *
 * @module api/categories
 */

//#region Imports

import { apiClient } from "./client";
import { getUserUrl } from "./urls";

//#endregion

//#region Types

/**
 * Category sorting method
 */
export type ICategorySorting = "alpha" | "recent" | "manual";

/**
 * Category type
 */
export type ICategoryType =
  | "favorites"
  | "channels"
  | "direct_messages"
  | "custom";

/**
 * Channel category definition
 */
export type IChannelCategory = {
  /** Unique category ID */
  id: string;
  /** User who owns this category */
  user_id: string;
  /** Team this category belongs to */
  team_id: string;
  /** Display name shown in sidebar */
  display_name: string;
  /** How channels are sorted in this category */
  sorting: ICategorySorting;
  /** Category type (system or custom) */
  type: ICategoryType;
  /** Whether category is muted */
  muted: boolean;
  /** Whether category is collapsed in sidebar */
  collapsed: boolean;
  /** Ordered list of channel IDs in this category */
  channel_ids: string[];
};

/**
 * Response containing categories and their order
 */
export type IChannelCategoriesWithOrder = {
  /** Array of category definitions */
  categories: IChannelCategory[];
  /** Ordered array of category IDs */
  order: string[];
};

/**
 * Input for creating a new category
 */
export type ICreateCategoryInput = {
  /** Display name for the category */
  display_name: string;
  /** Channel IDs to add to this category */
  channel_ids?: string[];
  /** Sort method (defaults to manual) */
  sorting?: ICategorySorting;
};

/**
 * Input for updating a category
 */
export type IUpdateCategoryInput = {
  /** Updated display name */
  display_name?: string;
  /** Updated channel IDs */
  channel_ids?: string[];
  /** Updated sort method */
  sorting?: ICategorySorting;
  /** Whether category is muted */
  muted?: boolean;
  /** Whether category is collapsed */
  collapsed?: boolean;
};

//#endregion

//#region URL Builders

/**
 * Get the channel categories URL for a user/team
 * @param userId - The user ID
 * @param teamId - The team ID
 * @returns Categories endpoint path
 */
export function getCategoriesUrl(userId: string, teamId: string): string {
  return `${getUserUrl(userId)}/teams/${teamId}/channels/categories`;
}

/**
 * Get the URL for a specific category
 * @param userId - The user ID
 * @param teamId - The team ID
 * @param categoryId - The category ID
 * @returns Category endpoint path
 */
export function getCategoryUrl(
  userId: string,
  teamId: string,
  categoryId: string,
): string {
  return `${getCategoriesUrl(userId, teamId)}/${categoryId}`;
}

/**
 * Get the category order URL
 * @param userId - The user ID
 * @param teamId - The team ID
 * @returns Category order endpoint path
 */
export function getCategoryOrderUrl(userId: string, teamId: string): string {
  return `${getCategoriesUrl(userId, teamId)}/order`;
}

//#endregion

//#region Category API Functions

/**
 * Get all channel categories for a user in a team
 *
 * @param userId - The user ID
 * @param teamId - The team ID
 * @returns Categories with their order
 *
 * @example
 * ```typescript
 * const { categories, order } = await getChannelCategories("user123", "team456");
 * ```
 */
export async function getChannelCategories(
  userId: string,
  teamId: string,
): Promise<IChannelCategoriesWithOrder> {
  const url = getCategoriesUrl(userId, teamId);
  return apiClient.get<IChannelCategoriesWithOrder>(url);
}

/**
 * Create a new channel category
 *
 * @param userId - The user ID
 * @param teamId - The team ID
 * @param category - Category creation input
 * @returns The created category
 *
 * @example
 * ```typescript
 * const category = await createChannelCategory("user123", "team456", {
 *   display_name: "My Projects",
 *   channel_ids: ["channel1", "channel2"]
 * });
 * ```
 */
export async function createChannelCategory(
  userId: string,
  teamId: string,
  category: ICreateCategoryInput,
): Promise<IChannelCategory> {
  const url = getCategoriesUrl(userId, teamId);
  return apiClient.post<IChannelCategory>(url, category);
}

/**
 * Update an existing channel category
 *
 * @param userId - The user ID
 * @param teamId - The team ID
 * @param categoryId - The category ID to update
 * @param data - Update data
 * @returns The updated category
 *
 * @example
 * ```typescript
 * const updated = await updateChannelCategory("user123", "team456", "cat789", {
 *   display_name: "Renamed Category",
 *   collapsed: true
 * });
 * ```
 */
export async function updateChannelCategory(
  userId: string,
  teamId: string,
  categoryId: string,
  data: IUpdateCategoryInput,
): Promise<IChannelCategory> {
  const url = getCategoryUrl(userId, teamId, categoryId);
  return apiClient.put<IChannelCategory>(url, data);
}

/**
 * Delete a channel category
 *
 * Only custom categories can be deleted. System categories (favorites, channels, direct_messages)
 * cannot be deleted.
 *
 * @param userId - The user ID
 * @param teamId - The team ID
 * @param categoryId - The category ID to delete
 *
 * @example
 * ```typescript
 * await deleteChannelCategory("user123", "team456", "cat789");
 * ```
 */
export async function deleteChannelCategory(
  userId: string,
  teamId: string,
  categoryId: string,
): Promise<void> {
  const url = getCategoryUrl(userId, teamId, categoryId);
  return apiClient.delete<void>(url);
}

/**
 * Update the order of channel categories
 *
 * @param userId - The user ID
 * @param teamId - The team ID
 * @param order - Ordered array of category IDs
 *
 * @example
 * ```typescript
 * await updateCategoryOrder("user123", "team456", ["cat1", "cat2", "cat3"]);
 * ```
 */
export async function updateCategoryOrder(
  userId: string,
  teamId: string,
  order: string[],
): Promise<void> {
  const url = getCategoryOrderUrl(userId, teamId);
  return apiClient.put<void>(url, order);
}

//#endregion
