// apps/v2/src/stores/ui/useRhsStore.spec.ts

import { act } from "@testing-library/react-native";

import { useRhsStore } from "./useRhsStore";

// Mock Platform
jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
  },
}));

// Mock Zustand middleware
jest.mock("zustand/middleware", () => ({
  devtools: (fn: unknown) => fn,
  persist: (fn: unknown) => fn,
  createJSONStorage: () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }),
}));

describe("useRhsStore", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    act(() => {
      useRhsStore.setState({
        isOpen: false,
        view: "none",
        channelId: null,
        threadId: null,
        userId: null,
        searchTerms: null,
        isExpanded: false,
        previousView: null,
        previousState: null,
      });
    });
  });

  //#region Initial State

  describe("initial state", () => {
    it("has correct initial values", () => {
      const state = useRhsStore.getState();

      expect(state.isOpen).toBe(false);
      expect(state.view).toBe("none");
      expect(state.channelId).toBeNull();
      expect(state.threadId).toBeNull();
      expect(state.userId).toBeNull();
      expect(state.searchTerms).toBeNull();
      expect(state.isExpanded).toBe(false);
      expect(state.previousView).toBeNull();
    });
  });

  //#endregion Initial State

  //#region openThread

  describe("openThread", () => {
    it("opens RHS with thread view", () => {
      act(() => {
        useRhsStore.getState().openThread("channel-1", "thread-1");
      });

      const state = useRhsStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.view).toBe("thread");
      expect(state.channelId).toBe("channel-1");
      expect(state.threadId).toBe("thread-1");
    });

    it("clears unrelated fields", () => {
      // First set some unrelated state
      act(() => {
        useRhsStore.setState({
          userId: "user-1",
          searchTerms: "search query",
        });
      });

      act(() => {
        useRhsStore.getState().openThread("channel-1", "thread-1");
      });

      const state = useRhsStore.getState();
      expect(state.userId).toBeNull();
      expect(state.searchTerms).toBeNull();
    });

    it("stores previous view when transitioning", () => {
      act(() => {
        useRhsStore.getState().openChannelInfo("channel-1");
      });

      act(() => {
        useRhsStore.getState().openThread("channel-1", "thread-1");
      });

      const state = useRhsStore.getState();
      expect(state.previousView).toBe("channel_info");
    });

    it("does not store none as previous view", () => {
      act(() => {
        useRhsStore.getState().openThread("channel-1", "thread-1");
      });

      const state = useRhsStore.getState();
      expect(state.previousView).toBeNull();
    });
  });

  //#endregion openThread

  //#region openChannelInfo

  describe("openChannelInfo", () => {
    it("opens RHS with channel_info view", () => {
      act(() => {
        useRhsStore.getState().openChannelInfo("channel-1");
      });

      const state = useRhsStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.view).toBe("channel_info");
      expect(state.channelId).toBe("channel-1");
      expect(state.threadId).toBeNull();
      expect(state.userId).toBeNull();
      expect(state.searchTerms).toBeNull();
    });

    it("stores previous view when transitioning from thread", () => {
      act(() => {
        useRhsStore.getState().openThread("channel-1", "thread-1");
      });

      act(() => {
        useRhsStore.getState().openChannelInfo("channel-2");
      });

      const state = useRhsStore.getState();
      expect(state.previousView).toBe("thread");
    });
  });

  //#endregion openChannelInfo

  //#region openChannelMembers

  describe("openChannelMembers", () => {
    it("opens RHS with channel_members view", () => {
      act(() => {
        useRhsStore.getState().openChannelMembers("channel-1");
      });

      const state = useRhsStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.view).toBe("channel_members");
      expect(state.channelId).toBe("channel-1");
      expect(state.threadId).toBeNull();
    });
  });

  //#endregion openChannelMembers

  //#region openPinnedPosts

  describe("openPinnedPosts", () => {
    it("opens RHS with pinned_posts view", () => {
      act(() => {
        useRhsStore.getState().openPinnedPosts("channel-1");
      });

      const state = useRhsStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.view).toBe("pinned_posts");
      expect(state.channelId).toBe("channel-1");
    });
  });

  //#endregion openPinnedPosts

  //#region openSearchResults

  describe("openSearchResults", () => {
    it("opens RHS with search_results view", () => {
      act(() => {
        useRhsStore.getState().openSearchResults("test query");
      });

      const state = useRhsStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.view).toBe("search_results");
      expect(state.searchTerms).toBe("test query");
      expect(state.channelId).toBeNull();
      expect(state.threadId).toBeNull();
      expect(state.userId).toBeNull();
    });
  });

  //#endregion openSearchResults

  //#region openUserProfile

  describe("openUserProfile", () => {
    it("opens RHS with user_profile view", () => {
      act(() => {
        useRhsStore.getState().openUserProfile("user-1");
      });

      const state = useRhsStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.view).toBe("user_profile");
      expect(state.userId).toBe("user-1");
      expect(state.channelId).toBeNull();
      expect(state.threadId).toBeNull();
      expect(state.searchTerms).toBeNull();
    });
  });

  //#endregion openUserProfile

  //#region close

  describe("close", () => {
    it("closes RHS and resets all state", () => {
      act(() => {
        useRhsStore.getState().openThread("channel-1", "thread-1");
      });

      act(() => {
        useRhsStore.getState().setExpanded(true);
      });

      act(() => {
        useRhsStore.getState().close();
      });

      const state = useRhsStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.view).toBe("none");
      expect(state.channelId).toBeNull();
      expect(state.threadId).toBeNull();
      expect(state.userId).toBeNull();
      expect(state.searchTerms).toBeNull();
      expect(state.previousView).toBeNull();
    });

    it("preserves isExpanded when closing", () => {
      act(() => {
        useRhsStore.getState().openThread("channel-1", "thread-1");
        useRhsStore.getState().setExpanded(true);
      });

      act(() => {
        useRhsStore.getState().close();
      });

      // isExpanded is preserved (user preference)
      expect(useRhsStore.getState().isExpanded).toBe(true);
    });
  });

  //#endregion close

  //#region toggle

  describe("toggle", () => {
    it("closes RHS when open", () => {
      act(() => {
        useRhsStore.getState().openThread("channel-1", "thread-1");
      });

      act(() => {
        useRhsStore.getState().toggle();
      });

      const state = useRhsStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.view).toBe("none");
    });

    it("does nothing when closed and view is none", () => {
      act(() => {
        useRhsStore.getState().toggle();
      });

      const state = useRhsStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.view).toBe("none");
    });

    it("opens RHS when closed but view is set", () => {
      // Manually set a view without opening
      act(() => {
        useRhsStore.setState({ view: "thread", isOpen: false });
      });

      act(() => {
        useRhsStore.getState().toggle();
      });

      expect(useRhsStore.getState().isOpen).toBe(true);
    });
  });

  //#endregion toggle

  //#region setExpanded

  describe("setExpanded", () => {
    it("sets expanded to true", () => {
      act(() => {
        useRhsStore.getState().setExpanded(true);
      });

      expect(useRhsStore.getState().isExpanded).toBe(true);
    });

    it("sets expanded to false", () => {
      act(() => {
        useRhsStore.getState().setExpanded(true);
      });

      act(() => {
        useRhsStore.getState().setExpanded(false);
      });

      expect(useRhsStore.getState().isExpanded).toBe(false);
    });
  });

  //#endregion setExpanded

  //#region goBack

  describe("goBack", () => {
    it("returns to previous view", () => {
      act(() => {
        useRhsStore.getState().openChannelInfo("channel-1");
      });

      act(() => {
        useRhsStore.getState().openThread("channel-1", "thread-1");
      });

      act(() => {
        useRhsStore.getState().goBack();
      });

      const state = useRhsStore.getState();
      expect(state.view).toBe("channel_info");
      expect(state.isOpen).toBe(true);
      expect(state.previousView).toBeNull();
    });

    it("closes RHS when no previous view", () => {
      act(() => {
        useRhsStore.getState().openThread("channel-1", "thread-1");
      });

      act(() => {
        useRhsStore.getState().goBack();
      });

      const state = useRhsStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.view).toBe("none");
    });

    it("preserves channelId for channel-related views", () => {
      act(() => {
        useRhsStore.getState().openChannelInfo("channel-1");
      });

      act(() => {
        useRhsStore.getState().openUserProfile("user-1");
      });

      act(() => {
        useRhsStore.getState().goBack();
      });

      const state = useRhsStore.getState();
      expect(state.view).toBe("channel_info");
      expect(state.channelId).toBe("channel-1");
    });

    it("clears channelId when returning to non-channel view", () => {
      act(() => {
        useRhsStore.getState().openSearchResults("query");
      });

      act(() => {
        useRhsStore.getState().openChannelInfo("channel-1");
      });

      act(() => {
        useRhsStore.getState().goBack();
      });

      const state = useRhsStore.getState();
      expect(state.view).toBe("search_results");
      expect(state.channelId).toBeNull();
    });

    it("clears threadId when going back", () => {
      act(() => {
        useRhsStore.getState().openChannelInfo("channel-1");
      });

      act(() => {
        useRhsStore.getState().openThread("channel-1", "thread-1");
      });

      act(() => {
        useRhsStore.getState().goBack();
      });

      const state = useRhsStore.getState();
      expect(state.threadId).toBeNull();
    });
  });

  //#endregion goBack

  //#region View Transitions

  describe("view transitions", () => {
    it("handles multiple transitions correctly", () => {
      // Open channel info
      act(() => {
        useRhsStore.getState().openChannelInfo("channel-1");
      });
      expect(useRhsStore.getState().view).toBe("channel_info");

      // Open thread (from channel info)
      act(() => {
        useRhsStore.getState().openThread("channel-1", "thread-1");
      });
      expect(useRhsStore.getState().view).toBe("thread");
      expect(useRhsStore.getState().previousView).toBe("channel_info");

      // Open user profile (from thread)
      act(() => {
        useRhsStore.getState().openUserProfile("user-1");
      });
      expect(useRhsStore.getState().view).toBe("user_profile");
      expect(useRhsStore.getState().previousView).toBe("thread");

      // Go back to thread
      act(() => {
        useRhsStore.getState().goBack();
      });
      expect(useRhsStore.getState().view).toBe("thread");
      expect(useRhsStore.getState().previousView).toBeNull();
    });

    it("switches between different channels", () => {
      act(() => {
        useRhsStore.getState().openChannelInfo("channel-1");
      });

      act(() => {
        useRhsStore.getState().openChannelInfo("channel-2");
      });

      const state = useRhsStore.getState();
      expect(state.channelId).toBe("channel-2");
      expect(state.previousView).toBe("channel_info");
    });
  });

  //#endregion View Transitions

  //#region Edge Cases

  describe("edge cases", () => {
    it("handles rapid open/close cycles", () => {
      act(() => {
        useRhsStore.getState().openThread("c1", "t1");
        useRhsStore.getState().close();
        useRhsStore.getState().openChannelInfo("c2");
        useRhsStore.getState().close();
        useRhsStore.getState().openUserProfile("u1");
      });

      const state = useRhsStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.view).toBe("user_profile");
      expect(state.userId).toBe("u1");
    });

    it("handles empty string IDs", () => {
      act(() => {
        useRhsStore.getState().openThread("", "");
      });

      const state = useRhsStore.getState();
      expect(state.channelId).toBe("");
      expect(state.threadId).toBe("");
    });
  });

  //#endregion Edge Cases
});
