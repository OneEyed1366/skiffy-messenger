// apps/v2/src/stores/ui/useEmojiStore.ts

import { createStore } from "../setup";

//#region Constants

const EMOJI_STORE_NAME = "emoji-store";
const DEFAULT_SKIN_TONE = 1;
const MAX_RECENT_EMOJIS = 50;

//#endregion Constants

//#region Types

type IEmojiCategory =
  | "recent"
  | "people"
  | "nature"
  | "foods"
  | "activity"
  | "places"
  | "objects"
  | "symbols"
  | "flags"
  | "custom";

type IEmojiState = {
  isPickerOpen: boolean;
  searchQuery: string;
  activeCategory: IEmojiCategory;
  recentEmojis: string[];
  skinTone: number;

  // Actions
  openPicker: () => void;
  closePicker: () => void;
  togglePicker: () => void;
  setSearchQuery: (query: string) => void;
  setActiveCategory: (category: IEmojiCategory) => void;
  addRecentEmoji: (emoji: string) => void;
  removeRecentEmoji: (emoji: string) => void;
  clearRecentEmojis: () => void;
  setSkinTone: (tone: number) => void;
  clearSearch: () => void;
  reset: () => void;
};

//#endregion Types

//#region Store

export const useEmojiStore = createStore<IEmojiState>(
  (set) => ({
    isPickerOpen: false,
    searchQuery: "",
    activeCategory: "recent",
    recentEmojis: [],
    skinTone: DEFAULT_SKIN_TONE,

    openPicker: () => set({ isPickerOpen: true }),

    closePicker: () => set({ isPickerOpen: false, searchQuery: "" }),

    togglePicker: () =>
      set((state) => ({
        isPickerOpen: !state.isPickerOpen,
        searchQuery: state.isPickerOpen ? "" : state.searchQuery,
      })),

    setSearchQuery: (query: string) => set({ searchQuery: query }),

    setActiveCategory: (category: IEmojiCategory) =>
      set({ activeCategory: category }),

    addRecentEmoji: (emoji: string) =>
      set((state) => {
        // Remove if already exists to avoid duplicates
        const filtered = state.recentEmojis.filter((e) => e !== emoji);
        // Add to front, limit to max
        const updated = [emoji, ...filtered].slice(0, MAX_RECENT_EMOJIS);
        return { recentEmojis: updated };
      }),

    removeRecentEmoji: (emoji: string) =>
      set((state) => ({
        recentEmojis: state.recentEmojis.filter((e) => e !== emoji),
      })),

    clearRecentEmojis: () => set({ recentEmojis: [] }),

    setSkinTone: (tone: number) => {
      // Validate skin tone is in valid range (1-6)
      const validTone = Math.max(1, Math.min(6, Math.round(tone)));
      set({ skinTone: validTone });
    },

    clearSearch: () => set({ searchQuery: "" }),

    reset: () =>
      set({
        isPickerOpen: false,
        searchQuery: "",
        activeCategory: "recent",
        // Note: recentEmojis and skinTone are persisted, so we don't reset them
      }),
  }),
  { name: EMOJI_STORE_NAME, persist: true },
);

//#endregion Store

//#region Exports

export type { IEmojiCategory, IEmojiState };

//#endregion Exports
