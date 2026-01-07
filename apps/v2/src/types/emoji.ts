/**
 * Emoji-related type definitions
 * Migrated from: vendor/desktop/webapp/platform/types/src/emojis.ts
 */

//#region Custom Emoji

export type ICustomEmoji = {
  id: string;
  name: string;
  category: "custom";
  create_at: number;
  update_at: number;
  delete_at: number;
  creator_id: string;
};

//#endregion

//#region System Emoji

export type ISystemEmoji = {
  name: string;
  unified: string;
  category: IEmojiCategory;
  short_names: string[];
  batch: number;
  skin_variations?: Record<string, IEmojiSkinVariation>;
};

export type IEmojiSkinVariation = {
  unified: string;
};

//#endregion

//#region Emoji Categories

export type IEmojiCategory =
  | "recent"
  | "smileys-emotion"
  | "people-body"
  | "animals-nature"
  | "food-drink"
  | "travel-places"
  | "activities"
  | "objects"
  | "symbols"
  | "flags"
  | "custom";

//#endregion

//#region Emoji Union Type

export type IEmoji = ISystemEmoji | ICustomEmoji;

//#endregion

//#region Emoji Skin Tone

export type IEmojiSkinTone =
  | "default"
  | "1F3FB" // light
  | "1F3FC" // medium-light
  | "1F3FD" // medium
  | "1F3FE" // medium-dark
  | "1F3FF"; // dark

//#endregion

//#region Emoji State

export type IEmojisState = {
  customEmoji: Record<string, ICustomEmoji>;
  nonExistentEmoji: Set<string>;
};

//#endregion
