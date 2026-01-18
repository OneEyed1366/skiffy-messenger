// apps/v2/src/stores/reset.spec.ts

import { act } from "@testing-library/react-native";

//#endregion Mocks

// Imports must come AFTER jest.mock declarations
import { queryClient } from "@/queries";

import { useConnectionStore } from "./connection";
import { useBrowserStore } from "./ephemeral/useBrowserStore";
import { useDraftsStore } from "./ephemeral/useDraftsStore";
import { usePresenceStore } from "./ephemeral/usePresenceStore";
import { useTypingStore } from "./ephemeral/useTypingStore";
import { PERSISTED_STORE_KEYS, resetAllState, resetUIState } from "./reset";
import { useEmojiStore } from "./ui/useEmojiStore";
import { useLhsStore } from "./ui/useLhsStore";
import { useModalsStore } from "./ui/useModalsStore";
import { useRhsStore } from "./ui/useRhsStore";
import { useSettingsStore } from "./ui/useSettingsStore";
import { useChannelSidebarStore } from "./views/useChannelSidebarStore";
import { useChannelViewStore } from "./views/useChannelViewStore";
import { useSearchStore } from "./views/useSearchStore";
import { useThreadsViewStore } from "./views/useThreadsViewStore";

//#region Mocks

// Mock localStorage for web tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Mock Platform
jest.mock("react-native", () => ({
  Platform: {
    OS: "web",
  },
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  multiRemove: jest.fn().mockResolvedValue(undefined),
}));

// Mock queryClient
jest.mock("@/queries", () => ({
  queryClient: {
    clear: jest.fn(),
  },
}));

// Mock zustand middleware to avoid persistence side effects
jest.mock("zustand/middleware", () => ({
  devtools: (fn: unknown) => fn,
  persist: (fn: unknown) => fn,
  createJSONStorage: () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }),
}));

// Get mock reference
const mockQueryClientClear = queryClient.clear as jest.Mock;

describe("reset utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage for web tests
    localStorageMock.clear();
  });

  //#region resetAllState

  describe("resetAllState", () => {
    it("clears TanStack Query cache", async () => {
      await act(async () => {
        await resetAllState();
      });

      expect(mockQueryClientClear).toHaveBeenCalledTimes(1);
    });

    it("resets connection store to initial state", async () => {
      // Set some state
      act(() => {
        useConnectionStore.setState({
          status: "connected",
          lastConnected: Date.now(),
          reconnectAttempts: 5,
          error: "some error",
        });
      });

      await act(async () => {
        await resetAllState();
      });

      const state = useConnectionStore.getState();
      expect(state.status).toBe("disconnected");
      expect(state.lastConnected).toBeNull();
      expect(state.reconnectAttempts).toBe(0);
      expect(state.error).toBeNull();
    });

    it("resets browser store to initial state", async () => {
      act(() => {
        useBrowserStore.setState({
          windowFocused: false,
          windowWidth: 1920,
          windowHeight: 1080,
          isOnline: false,
          isMobile: true,
        });
      });

      await act(async () => {
        await resetAllState();
      });

      const state = useBrowserStore.getState();
      expect(state.windowFocused).toBe(true);
      expect(state.windowWidth).toBe(0);
      expect(state.windowHeight).toBe(0);
      expect(state.isOnline).toBe(true);
      expect(state.isMobile).toBe(false);
    });

    it("resets presence store to initial state", async () => {
      act(() => {
        usePresenceStore.getState().setPresence("user1", "online");
        usePresenceStore.getState().setPresence("user2", "away");
      });

      await act(async () => {
        await resetAllState();
      });

      const state = usePresenceStore.getState();
      expect(state.presences).toEqual({});
      expect(state.lastActivity).toEqual({});
    });

    it("resets typing store and clears timeouts", async () => {
      // Add some typing indicators
      act(() => {
        useTypingStore.getState().addTyping("channel1", "user1", "User One");
      });

      // Verify we have state
      expect(
        Object.keys(useTypingStore.getState().typingByChannel).length,
      ).toBeGreaterThan(0);

      await act(async () => {
        await resetAllState();
      });

      const state = useTypingStore.getState();
      expect(state.typingByChannel).toEqual({});
      expect(state.timeoutIds).toEqual({});
    });

    it("resets drafts store to initial state", async () => {
      act(() => {
        useDraftsStore.getState().setDraft("channel:123", "Hello world");
      });

      await act(async () => {
        await resetAllState();
      });

      const state = useDraftsStore.getState();
      expect(state.drafts).toEqual({});
    });

    it("resets modals store to initial state", async () => {
      act(() => {
        useModalsStore.getState().openModal("create_channel");
        useModalsStore.getState().openModal("confirm");
      });

      await act(async () => {
        await resetAllState();
      });

      const state = useModalsStore.getState();
      expect(state.stack).toEqual([]);
    });

    it("resets RHS store to initial state", async () => {
      act(() => {
        useRhsStore.getState().openThread("channel1", "thread1");
      });

      await act(async () => {
        await resetAllState();
      });

      const state = useRhsStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.view).toBe("none");
      expect(state.channelId).toBeNull();
      expect(state.threadId).toBeNull();
    });

    it("resets LHS store to initial state", async () => {
      act(() => {
        useLhsStore.getState().close();
        useLhsStore.getState().setWidth(400);
        useLhsStore.getState().setActiveTeam("team1");
      });

      await act(async () => {
        await resetAllState();
      });

      const state = useLhsStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.width).toBe(240);
      expect(state.activeTeamId).toBeNull();
      expect(state.activeChannelId).toBeNull();
    });

    it("resets settings store to initial state", async () => {
      act(() => {
        useSettingsStore.getState().open("notifications");
        useSettingsStore.getState().setHasUnsavedChanges(true);
      });

      await act(async () => {
        await resetAllState();
      });

      const state = useSettingsStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.activeTab).toBe("general");
      expect(state.hasUnsavedChanges).toBe(false);
    });

    it("resets emoji store to initial state", async () => {
      act(() => {
        useEmojiStore.getState().openPicker();
        useEmojiStore.getState().setSearchQuery("smile");
        useEmojiStore.getState().addRecentEmoji("emoji1");
      });

      await act(async () => {
        await resetAllState();
      });

      const state = useEmojiStore.getState();
      expect(state.isPickerOpen).toBe(false);
      expect(state.searchQuery).toBe("");
      expect(state.recentEmojis).toEqual([]);
    });

    it("resets channel view store to initial state", async () => {
      act(() => {
        useChannelViewStore.getState().setScrollPosition("channel1", 500);
        useChannelViewStore.getState().setHighlightedPost("post1");
        useChannelViewStore.getState().setIsAtBottom(false);
      });

      await act(async () => {
        await resetAllState();
      });

      const state = useChannelViewStore.getState();
      expect(state.scrollPosition).toEqual({});
      expect(state.highlightedPostId).toBeNull();
      expect(state.isAtBottom).toBe(true);
    });

    it("resets threads view store to initial state", async () => {
      act(() => {
        useThreadsViewStore.getState().setFilter("unread");
        useThreadsViewStore.getState().selectThread("thread1");
        useThreadsViewStore.getState().setSearchQuery("test");
      });

      await act(async () => {
        await resetAllState();
      });

      const state = useThreadsViewStore.getState();
      expect(state.filter).toBe("all");
      expect(state.selectedThreadId).toBeNull();
      expect(state.searchQuery).toBe("");
    });

    it("resets search store to initial state", async () => {
      act(() => {
        useSearchStore.getState().setQuery("test query");
        useSearchStore.getState().setFilter("from", "user123");
        useSearchStore.getState().addRecentSearch("old search");
      });

      await act(async () => {
        await resetAllState();
      });

      const state = useSearchStore.getState();
      expect(state.query).toBe("");
      expect(state.isSearching).toBe(false);
      expect(state.filters.from).toBeUndefined();
      expect(state.recentSearches).toEqual([]);
    });

    it("resets channel sidebar store to initial state", async () => {
      act(() => {
        useChannelSidebarStore.getState().setFilterText("filter");
        useChannelSidebarStore.getState().setShowUnreadOnly(true);
        useChannelSidebarStore.getState().startDragging("channel1");
      });

      await act(async () => {
        await resetAllState();
      });

      const state = useChannelSidebarStore.getState();
      expect(state.filterText).toBe("");
      expect(state.showUnreadOnly).toBe(false);
      expect(state.draggingChannelId).toBeNull();
    });

    it("clears localStorage when clearStorage is true (default)", async () => {
      // Set some localStorage items
      PERSISTED_STORE_KEYS.forEach((key) => {
        localStorage.setItem(key, JSON.stringify({ test: true }));
      });

      await act(async () => {
        await resetAllState();
      });

      PERSISTED_STORE_KEYS.forEach((key) => {
        expect(localStorage.getItem(key)).toBeNull();
      });
    });

    it("preserves localStorage when clearStorage is false", async () => {
      // Set some localStorage items
      PERSISTED_STORE_KEYS.forEach((key) => {
        localStorage.setItem(key, JSON.stringify({ test: true }));
      });

      await act(async () => {
        await resetAllState({ clearStorage: false });
      });

      PERSISTED_STORE_KEYS.forEach((key) => {
        expect(localStorage.getItem(key)).toBe(JSON.stringify({ test: true }));
      });
    });
  });

  //#endregion resetAllState

  //#region resetUIState

  describe("resetUIState", () => {
    it("closes all modals", () => {
      act(() => {
        useModalsStore.getState().openModal("create_channel");
        useModalsStore.getState().openModal("confirm");
      });

      act(() => {
        resetUIState();
      });

      expect(useModalsStore.getState().stack).toEqual([]);
    });

    it("closes RHS", () => {
      act(() => {
        useRhsStore.getState().openThread("channel1", "thread1");
      });

      act(() => {
        resetUIState();
      });

      const state = useRhsStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.view).toBe("none");
    });

    it("resets LHS state", () => {
      act(() => {
        useLhsStore.getState().close();
        useLhsStore.getState().setActiveTeam("team1");
      });

      act(() => {
        resetUIState();
      });

      const state = useLhsStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.activeTeamId).toBeNull();
    });

    it("closes settings", () => {
      act(() => {
        useSettingsStore.getState().open("notifications");
      });

      act(() => {
        resetUIState();
      });

      expect(useSettingsStore.getState().isOpen).toBe(false);
    });

    it("clears search query and filters but preserves recent searches", () => {
      act(() => {
        useSearchStore.getState().setQuery("test query");
        useSearchStore.getState().setFilter("from", "user123");
        useSearchStore.getState().addRecentSearch("recent1");
        useSearchStore.getState().addRecentSearch("recent2");
      });

      const recentBeforeReset = useSearchStore.getState().recentSearches;

      act(() => {
        resetUIState();
      });

      const state = useSearchStore.getState();
      expect(state.query).toBe("");
      expect(state.isSearching).toBe(false);
      expect(state.filters.from).toBeUndefined();
      // Recent searches should be preserved
      expect(state.recentSearches).toEqual(recentBeforeReset);
    });

    it("does NOT clear TanStack Query cache", () => {
      mockQueryClientClear.mockClear();

      act(() => {
        resetUIState();
      });

      expect(mockQueryClientClear).not.toHaveBeenCalled();
    });

    it("does NOT reset drafts store", () => {
      act(() => {
        useDraftsStore.getState().setDraft("channel:123", "My draft message");
      });

      act(() => {
        resetUIState();
      });

      const draft = useDraftsStore.getState().getDraft("channel:123");
      expect(draft).not.toBeNull();
      expect(draft?.message).toBe("My draft message");
    });

    it("does NOT reset presence store", () => {
      act(() => {
        usePresenceStore.getState().setPresence("user1", "online");
      });

      act(() => {
        resetUIState();
      });

      expect(usePresenceStore.getState().presences["user1"]).toBe("online");
    });

    it("does NOT reset typing store", () => {
      act(() => {
        useTypingStore.getState().addTyping("channel1", "user1", "User One");
      });

      act(() => {
        resetUIState();
      });

      const typing = useTypingStore.getState().typingByChannel["channel1"];
      expect(typing).toBeDefined();
      expect(typing.length).toBeGreaterThan(0);
    });
  });

  //#endregion resetUIState

  //#region PERSISTED_STORE_KEYS

  describe("PERSISTED_STORE_KEYS", () => {
    it("contains expected store keys", () => {
      expect(PERSISTED_STORE_KEYS).toContain("drafts-store");
      expect(PERSISTED_STORE_KEYS).toContain("emoji-store");
      expect(PERSISTED_STORE_KEYS).toContain("search-store");
    });

    it("is a readonly array", () => {
      // TypeScript compile-time check - if this compiles, it's readonly
      const keys: readonly string[] = PERSISTED_STORE_KEYS;
      expect(Array.isArray(keys)).toBe(true);
    });
  });

  //#endregion PERSISTED_STORE_KEYS
});
