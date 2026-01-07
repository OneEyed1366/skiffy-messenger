/**
 * Channel category type definitions
 * Migrated from: vendor/desktop/webapp/platform/types/src/channel_categories.ts
 */

//#region Category Type & Sorting

export type IChannelCategoryType =
  | "favorites"
  | "channels"
  | "direct_messages"
  | "custom";

export type ICategorySorting = "alpha" | "" | "recent" | "manual";

export const CATEGORY_SORTING = {
  Alphabetical: "alpha",
  Default: "", // behaves the same as manual
  Recency: "recent",
  Manual: "manual",
} as const;

export const CATEGORY_TYPES = {
  FAVORITES: "favorites",
  CHANNELS: "channels",
  DIRECT_MESSAGES: "direct_messages",
  CUSTOM: "custom",
} as const satisfies Record<string, IChannelCategoryType>;

//#endregion

//#region Channel Category

export type IChannelCategory = {
  id: string;
  user_id: string;
  team_id: string;
  type: IChannelCategoryType;
  display_name: string;
  sorting: ICategorySorting;
  channel_ids: string[];
  muted: boolean;
  collapsed: boolean;
};

//#endregion

//#region Ordered Categories

export type IOrderedChannelCategories = {
  categories: IChannelCategory[];
  order: string[];
};

//#endregion

//#region State

export type IChannelCategoriesState = {
  byId: Record<string, IChannelCategory>;
  orderByTeam: Record<string, string[]>;
};

//#endregion
