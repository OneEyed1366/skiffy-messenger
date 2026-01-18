// apps/v2/src/stores/ui/useEmojiStore.spec.ts

import { act } from "@testing-library/react-native";

import { useEmojiStore } from "./useEmojiStore";

// Mock Platform
jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
  },
}));

// Mock zustand middleware
jest.mock("zustand/middleware", () => ({
  devtools: (fn: unknown) => fn,
  persist: (fn: unknown) => fn,
  createJSONStorage: () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }),
}));

describe("useEmojiStore", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    act(() => {
      useEmojiStore.setState({
        isPickerOpen: false,
        searchQuery: "",
        activeCategory: "recent",
        recentEmojis: [],
        skinTone: 1,
      });
    });
  });

  //#region Initial State

  describe("initial state", () => {
    it("has correct default values", () => {
      const state = useEmojiStore.getState();

      expect(state.isPickerOpen).toBe(false);
      expect(state.searchQuery).toBe("");
      expect(state.activeCategory).toBe("recent");
      expect(state.recentEmojis).toEqual([]);
      expect(state.skinTone).toBe(1);
    });

    it("has all required action methods", () => {
      const state = useEmojiStore.getState();

      expect(typeof state.openPicker).toBe("function");
      expect(typeof state.closePicker).toBe("function");
      expect(typeof state.togglePicker).toBe("function");
      expect(typeof state.setSearchQuery).toBe("function");
      expect(typeof state.setActiveCategory).toBe("function");
      expect(typeof state.addRecentEmoji).toBe("function");
      expect(typeof state.removeRecentEmoji).toBe("function");
      expect(typeof state.clearRecentEmojis).toBe("function");
      expect(typeof state.setSkinTone).toBe("function");
      expect(typeof state.clearSearch).toBe("function");
      expect(typeof state.reset).toBe("function");
    });
  });

  //#endregion Initial State

  //#region Picker Actions

  describe("picker actions", () => {
    it("openPicker sets isPickerOpen to true", () => {
      expect(useEmojiStore.getState().isPickerOpen).toBe(false);

      act(() => {
        useEmojiStore.getState().openPicker();
      });
      expect(useEmojiStore.getState().isPickerOpen).toBe(true);
    });

    it("closePicker sets isPickerOpen to false and clears search", () => {
      act(() => {
        useEmojiStore.setState({
          isPickerOpen: true,
          searchQuery: "smile",
        });
      });

      act(() => {
        useEmojiStore.getState().closePicker();
      });

      const state = useEmojiStore.getState();
      expect(state.isPickerOpen).toBe(false);
      expect(state.searchQuery).toBe("");
    });

    it("togglePicker flips isPickerOpen state", () => {
      expect(useEmojiStore.getState().isPickerOpen).toBe(false);

      act(() => {
        useEmojiStore.getState().togglePicker();
      });
      expect(useEmojiStore.getState().isPickerOpen).toBe(true);

      act(() => {
        useEmojiStore.getState().togglePicker();
      });
      expect(useEmojiStore.getState().isPickerOpen).toBe(false);
    });

    it("togglePicker clears search when closing", () => {
      act(() => {
        useEmojiStore.setState({
          isPickerOpen: true,
          searchQuery: "heart",
        });
      });

      act(() => {
        useEmojiStore.getState().togglePicker();
      });

      expect(useEmojiStore.getState().searchQuery).toBe("");
    });

    it("openPicker is idempotent when already open", () => {
      act(() => {
        useEmojiStore.getState().openPicker();
      });
      expect(useEmojiStore.getState().isPickerOpen).toBe(true);

      act(() => {
        useEmojiStore.getState().openPicker();
      });
      expect(useEmojiStore.getState().isPickerOpen).toBe(true);
    });

    it("closePicker is idempotent when already closed", () => {
      expect(useEmojiStore.getState().isPickerOpen).toBe(false);

      act(() => {
        useEmojiStore.getState().closePicker();
      });
      expect(useEmojiStore.getState().isPickerOpen).toBe(false);
    });
  });

  //#endregion Picker Actions

  //#region Search Actions

  describe("search actions", () => {
    it("setSearchQuery updates search query", () => {
      act(() => {
        useEmojiStore.getState().setSearchQuery("smile");
      });
      expect(useEmojiStore.getState().searchQuery).toBe("smile");
    });

    it("setSearchQuery accepts empty string", () => {
      act(() => {
        useEmojiStore.getState().setSearchQuery("test");
      });
      expect(useEmojiStore.getState().searchQuery).toBe("test");

      act(() => {
        useEmojiStore.getState().setSearchQuery("");
      });
      expect(useEmojiStore.getState().searchQuery).toBe("");
    });

    it("setSearchQuery handles special characters", () => {
      act(() => {
        useEmojiStore.getState().setSearchQuery("heart ❤️");
      });
      expect(useEmojiStore.getState().searchQuery).toBe("heart ❤️");
    });

    it("clearSearch resets search query to empty string", () => {
      act(() => {
        useEmojiStore.getState().setSearchQuery("face");
      });
      expect(useEmojiStore.getState().searchQuery).toBe("face");

      act(() => {
        useEmojiStore.getState().clearSearch();
      });
      expect(useEmojiStore.getState().searchQuery).toBe("");
    });

    it("clearSearch does not affect other state", () => {
      act(() => {
        useEmojiStore.setState({
          isPickerOpen: true,
          searchQuery: "test",
          activeCategory: "people",
        });
      });

      act(() => {
        useEmojiStore.getState().clearSearch();
      });

      const state = useEmojiStore.getState();
      expect(state.isPickerOpen).toBe(true);
      expect(state.activeCategory).toBe("people");
    });
  });

  //#endregion Search Actions

  //#region Category Actions

  describe("category actions", () => {
    it("setActiveCategory updates active category", () => {
      act(() => {
        useEmojiStore.getState().setActiveCategory("people");
      });
      expect(useEmojiStore.getState().activeCategory).toBe("people");
    });

    it("setActiveCategory accepts all valid categories", () => {
      const categories = [
        "recent",
        "people",
        "nature",
        "foods",
        "activity",
        "places",
        "objects",
        "symbols",
        "flags",
        "custom",
      ] as const;

      categories.forEach((category) => {
        act(() => {
          useEmojiStore.getState().setActiveCategory(category);
        });
        expect(useEmojiStore.getState().activeCategory).toBe(category);
      });
    });

    it("setActiveCategory does not affect other state", () => {
      act(() => {
        useEmojiStore.setState({
          isPickerOpen: true,
          searchQuery: "test",
          skinTone: 3,
        });
      });

      act(() => {
        useEmojiStore.getState().setActiveCategory("nature");
      });

      const state = useEmojiStore.getState();
      expect(state.isPickerOpen).toBe(true);
      expect(state.searchQuery).toBe("test");
      expect(state.skinTone).toBe(3);
    });
  });

  //#endregion Category Actions

  //#region Recent Emojis Actions

  describe("recent emojis actions", () => {
    it("addRecentEmoji adds emoji to front of list", () => {
      act(() => {
        useEmojiStore.getState().addRecentEmoji("smile");
      });
      expect(useEmojiStore.getState().recentEmojis).toEqual(["smile"]);

      act(() => {
        useEmojiStore.getState().addRecentEmoji("heart");
      });
      expect(useEmojiStore.getState().recentEmojis).toEqual(["heart", "smile"]);
    });

    it("addRecentEmoji moves existing emoji to front", () => {
      act(() => {
        useEmojiStore.setState({
          recentEmojis: ["a", "b", "c"],
        });
      });

      act(() => {
        useEmojiStore.getState().addRecentEmoji("b");
      });
      expect(useEmojiStore.getState().recentEmojis).toEqual(["b", "a", "c"]);
    });

    it("addRecentEmoji limits list to 50 emojis", () => {
      const fiftyEmojis = Array.from({ length: 50 }, (_, i) => `emoji-${i}`);
      act(() => {
        useEmojiStore.setState({ recentEmojis: fiftyEmojis });
      });

      act(() => {
        useEmojiStore.getState().addRecentEmoji("new-emoji");
      });

      const recent = useEmojiStore.getState().recentEmojis;
      expect(recent.length).toBe(50);
      expect(recent[0]).toBe("new-emoji");
      expect(recent[49]).toBe("emoji-48"); // emoji-49 was pushed out
    });

    it("removeRecentEmoji removes specified emoji", () => {
      act(() => {
        useEmojiStore.setState({
          recentEmojis: ["a", "b", "c"],
        });
      });

      act(() => {
        useEmojiStore.getState().removeRecentEmoji("b");
      });
      expect(useEmojiStore.getState().recentEmojis).toEqual(["a", "c"]);
    });

    it("removeRecentEmoji does nothing if emoji not found", () => {
      act(() => {
        useEmojiStore.setState({
          recentEmojis: ["a", "b", "c"],
        });
      });

      act(() => {
        useEmojiStore.getState().removeRecentEmoji("x");
      });
      expect(useEmojiStore.getState().recentEmojis).toEqual(["a", "b", "c"]);
    });

    it("clearRecentEmojis empties the list", () => {
      act(() => {
        useEmojiStore.setState({
          recentEmojis: ["a", "b", "c"],
        });
      });

      act(() => {
        useEmojiStore.getState().clearRecentEmojis();
      });
      expect(useEmojiStore.getState().recentEmojis).toEqual([]);
    });

    it("clearRecentEmojis is idempotent on empty list", () => {
      expect(useEmojiStore.getState().recentEmojis).toEqual([]);

      act(() => {
        useEmojiStore.getState().clearRecentEmojis();
      });
      expect(useEmojiStore.getState().recentEmojis).toEqual([]);
    });
  });

  //#endregion Recent Emojis Actions

  //#region Skin Tone Actions

  describe("skin tone actions", () => {
    it("setSkinTone updates skin tone", () => {
      act(() => {
        useEmojiStore.getState().setSkinTone(3);
      });
      expect(useEmojiStore.getState().skinTone).toBe(3);
    });

    it("setSkinTone accepts valid range 1-6", () => {
      [1, 2, 3, 4, 5, 6].forEach((tone) => {
        act(() => {
          useEmojiStore.getState().setSkinTone(tone);
        });
        expect(useEmojiStore.getState().skinTone).toBe(tone);
      });
    });

    it("setSkinTone clamps values below 1 to 1", () => {
      act(() => {
        useEmojiStore.getState().setSkinTone(0);
      });
      expect(useEmojiStore.getState().skinTone).toBe(1);

      act(() => {
        useEmojiStore.getState().setSkinTone(-5);
      });
      expect(useEmojiStore.getState().skinTone).toBe(1);
    });

    it("setSkinTone clamps values above 6 to 6", () => {
      act(() => {
        useEmojiStore.getState().setSkinTone(7);
      });
      expect(useEmojiStore.getState().skinTone).toBe(6);

      act(() => {
        useEmojiStore.getState().setSkinTone(100);
      });
      expect(useEmojiStore.getState().skinTone).toBe(6);
    });

    it("setSkinTone rounds decimal values", () => {
      act(() => {
        useEmojiStore.getState().setSkinTone(3.7);
      });
      expect(useEmojiStore.getState().skinTone).toBe(4);

      act(() => {
        useEmojiStore.getState().setSkinTone(2.2);
      });
      expect(useEmojiStore.getState().skinTone).toBe(2);
    });
  });

  //#endregion Skin Tone Actions

  //#region Reset Action

  describe("reset action", () => {
    it("resets transient state but preserves persisted values", () => {
      act(() => {
        useEmojiStore.setState({
          isPickerOpen: true,
          searchQuery: "test",
          activeCategory: "people",
          recentEmojis: ["a", "b"],
          skinTone: 4,
        });
      });

      act(() => {
        useEmojiStore.getState().reset();
      });

      const state = useEmojiStore.getState();
      expect(state.isPickerOpen).toBe(false);
      expect(state.searchQuery).toBe("");
      expect(state.activeCategory).toBe("recent");
      // Persisted values should remain unchanged
      expect(state.recentEmojis).toEqual(["a", "b"]);
      expect(state.skinTone).toBe(4);
    });
  });

  //#endregion Reset Action

  //#region Store Subscription

  describe("store subscription", () => {
    it("notifies subscribers on state changes", () => {
      const listener = jest.fn();
      const unsubscribe = useEmojiStore.subscribe(listener);

      act(() => {
        useEmojiStore.getState().openPicker();
      });

      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
    });

    it("stops notifying after unsubscribe", () => {
      const listener = jest.fn();
      const unsubscribe = useEmojiStore.subscribe(listener);

      act(() => {
        useEmojiStore.getState().openPicker();
      });
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      act(() => {
        useEmojiStore.getState().closePicker();
      });
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  //#endregion Store Subscription

  //#region State Immutability

  describe("state immutability", () => {
    it("creates new array reference when modifying recentEmojis", () => {
      act(() => {
        useEmojiStore.setState({ recentEmojis: ["a", "b"] });
      });

      const initialArray = useEmojiStore.getState().recentEmojis;

      act(() => {
        useEmojiStore.getState().addRecentEmoji("c");
      });

      const updatedArray = useEmojiStore.getState().recentEmojis;
      expect(updatedArray).not.toBe(initialArray);
    });

    it("does not mutate original array on add", () => {
      act(() => {
        useEmojiStore.setState({ recentEmojis: ["a", "b"] });
      });

      const arrayBeforeAdd = useEmojiStore.getState().recentEmojis;
      const lengthBefore = arrayBeforeAdd.length;

      act(() => {
        useEmojiStore.getState().addRecentEmoji("c");
      });

      expect(arrayBeforeAdd.length).toBe(lengthBefore);
    });

    it("does not mutate original array on remove", () => {
      act(() => {
        useEmojiStore.setState({ recentEmojis: ["a", "b", "c"] });
      });

      const arrayBeforeRemove = useEmojiStore.getState().recentEmojis;

      act(() => {
        useEmojiStore.getState().removeRecentEmoji("b");
      });

      expect(arrayBeforeRemove).toEqual(["a", "b", "c"]);
    });
  });

  //#endregion State Immutability

  //#region Complex Scenarios

  describe("complex scenarios", () => {
    it("handles rapid state changes", () => {
      act(() => {
        useEmojiStore.getState().openPicker();
        useEmojiStore.getState().setSearchQuery("face");
        useEmojiStore.getState().setActiveCategory("people");
        useEmojiStore.getState().addRecentEmoji("smile");
        useEmojiStore.getState().addRecentEmoji("heart");
        useEmojiStore.getState().setSkinTone(4);
        useEmojiStore.getState().clearSearch();
        useEmojiStore.getState().setActiveCategory("nature");
      });

      const state = useEmojiStore.getState();
      expect(state.isPickerOpen).toBe(true);
      expect(state.searchQuery).toBe("");
      expect(state.activeCategory).toBe("nature");
      expect(state.recentEmojis).toEqual(["heart", "smile"]);
      expect(state.skinTone).toBe(4);
    });

    it("maintains independence between state properties", () => {
      act(() => {
        useEmojiStore.getState().openPicker();
      });
      expect(useEmojiStore.getState().searchQuery).toBe("");

      act(() => {
        useEmojiStore.getState().setSearchQuery("test");
      });
      expect(useEmojiStore.getState().isPickerOpen).toBe(true);
      expect(useEmojiStore.getState().activeCategory).toBe("recent");

      act(() => {
        useEmojiStore.getState().addRecentEmoji("emoji");
      });
      expect(useEmojiStore.getState().searchQuery).toBe("test");
      expect(useEmojiStore.getState().skinTone).toBe(1);
    });

    it("handles complete workflow: open, search, select, close", () => {
      // Open picker
      act(() => {
        useEmojiStore.getState().openPicker();
      });
      expect(useEmojiStore.getState().isPickerOpen).toBe(true);

      // Search for emoji
      act(() => {
        useEmojiStore.getState().setSearchQuery("smile");
      });
      expect(useEmojiStore.getState().searchQuery).toBe("smile");

      // Select emoji (adds to recent)
      act(() => {
        useEmojiStore.getState().addRecentEmoji("smile");
      });
      expect(useEmojiStore.getState().recentEmojis).toContain("smile");

      // Close picker (clears search)
      act(() => {
        useEmojiStore.getState().closePicker();
      });
      expect(useEmojiStore.getState().isPickerOpen).toBe(false);
      expect(useEmojiStore.getState().searchQuery).toBe("");
      // Recent emojis persist
      expect(useEmojiStore.getState().recentEmojis).toContain("smile");
    });
  });

  //#endregion Complex Scenarios

  //#region Edge Cases

  describe("edge cases", () => {
    it("handles unicode emoji names", () => {
      act(() => {
        useEmojiStore.getState().addRecentEmoji("👍");
        useEmojiStore.getState().addRecentEmoji("🎉");
        useEmojiStore.getState().addRecentEmoji("❤️");
      });

      expect(useEmojiStore.getState().recentEmojis).toEqual(["❤️", "🎉", "👍"]);
    });

    it("handles empty string as emoji name", () => {
      act(() => {
        useEmojiStore.getState().addRecentEmoji("");
      });
      expect(useEmojiStore.getState().recentEmojis).toEqual([""]);
    });

    it("handles very long search queries", () => {
      const longQuery = "a".repeat(1000);
      act(() => {
        useEmojiStore.getState().setSearchQuery(longQuery);
      });
      expect(useEmojiStore.getState().searchQuery).toBe(longQuery);
    });

    it("handles duplicate emoji additions correctly", () => {
      act(() => {
        useEmojiStore.getState().addRecentEmoji("smile");
        useEmojiStore.getState().addRecentEmoji("heart");
        useEmojiStore.getState().addRecentEmoji("smile");
      });

      const recent = useEmojiStore.getState().recentEmojis;
      expect(recent).toEqual(["smile", "heart"]);
      expect(recent.filter((e) => e === "smile").length).toBe(1);
    });
  });

  //#endregion Edge Cases
});
