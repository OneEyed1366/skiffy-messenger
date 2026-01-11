// apps/v2/src/stores/views/useChannelViewStore.spec.ts

import { act } from "@testing-library/react-native";

import { useChannelViewStore } from "./useChannelViewStore";

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

describe("useChannelViewStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useChannelViewStore.setState({
        scrollPosition: {},
        highlightedPostId: null,
        isAtBottom: true,
        unreadBannerVisible: false,
        jumpToPostId: null,
      });
    });
  });

  //#region Initial State

  describe("initial state", () => {
    it("has empty scroll position record", () => {
      const state = useChannelViewStore.getState();
      expect(state.scrollPosition).toEqual({});
    });

    it("has null highlighted post id", () => {
      const state = useChannelViewStore.getState();
      expect(state.highlightedPostId).toBeNull();
    });

    it("is at bottom by default", () => {
      const state = useChannelViewStore.getState();
      expect(state.isAtBottom).toBe(true);
    });

    it("has unread banner hidden by default", () => {
      const state = useChannelViewStore.getState();
      expect(state.unreadBannerVisible).toBe(false);
    });

    it("has null jump to post id", () => {
      const state = useChannelViewStore.getState();
      expect(state.jumpToPostId).toBeNull();
    });
  });

  //#endregion Initial State

  //#region Scroll Position

  describe("setScrollPosition", () => {
    it("sets scroll position for a channel", () => {
      act(() => {
        useChannelViewStore.getState().setScrollPosition("channel-1", 100);
      });

      const state = useChannelViewStore.getState();
      expect(state.scrollPosition["channel-1"]).toBe(100);
    });

    it("preserves existing scroll positions when setting new one", () => {
      act(() => {
        useChannelViewStore.getState().setScrollPosition("channel-1", 100);
        useChannelViewStore.getState().setScrollPosition("channel-2", 200);
      });

      const state = useChannelViewStore.getState();
      expect(state.scrollPosition["channel-1"]).toBe(100);
      expect(state.scrollPosition["channel-2"]).toBe(200);
    });

    it("updates existing scroll position for a channel", () => {
      act(() => {
        useChannelViewStore.getState().setScrollPosition("channel-1", 100);
        useChannelViewStore.getState().setScrollPosition("channel-1", 250);
      });

      const state = useChannelViewStore.getState();
      expect(state.scrollPosition["channel-1"]).toBe(250);
    });
  });

  describe("getScrollPosition", () => {
    it("returns scroll position for existing channel", () => {
      act(() => {
        useChannelViewStore.getState().setScrollPosition("channel-1", 150);
      });

      const position = useChannelViewStore.getState().getScrollPosition("channel-1");
      expect(position).toBe(150);
    });

    it("returns 0 for channel without saved position", () => {
      const position = useChannelViewStore.getState().getScrollPosition("unknown-channel");
      expect(position).toBe(0);
    });
  });

  //#endregion Scroll Position

  //#region Highlighted Post

  describe("setHighlightedPost", () => {
    it("sets highlighted post id", () => {
      act(() => {
        useChannelViewStore.getState().setHighlightedPost("post-123");
      });

      const state = useChannelViewStore.getState();
      expect(state.highlightedPostId).toBe("post-123");
    });

    it("clears highlighted post when set to null", () => {
      act(() => {
        useChannelViewStore.getState().setHighlightedPost("post-123");
        useChannelViewStore.getState().setHighlightedPost(null);
      });

      const state = useChannelViewStore.getState();
      expect(state.highlightedPostId).toBeNull();
    });
  });

  //#endregion Highlighted Post

  //#region Is At Bottom

  describe("setIsAtBottom", () => {
    it("sets isAtBottom to false", () => {
      act(() => {
        useChannelViewStore.getState().setIsAtBottom(false);
      });

      const state = useChannelViewStore.getState();
      expect(state.isAtBottom).toBe(false);
    });

    it("sets isAtBottom to true", () => {
      act(() => {
        useChannelViewStore.getState().setIsAtBottom(false);
        useChannelViewStore.getState().setIsAtBottom(true);
      });

      const state = useChannelViewStore.getState();
      expect(state.isAtBottom).toBe(true);
    });
  });

  //#endregion Is At Bottom

  //#region Unread Banner

  describe("showUnreadBanner", () => {
    it("shows unread banner", () => {
      act(() => {
        useChannelViewStore.getState().showUnreadBanner();
      });

      const state = useChannelViewStore.getState();
      expect(state.unreadBannerVisible).toBe(true);
    });
  });

  describe("hideUnreadBanner", () => {
    it("hides unread banner", () => {
      act(() => {
        useChannelViewStore.getState().showUnreadBanner();
        useChannelViewStore.getState().hideUnreadBanner();
      });

      const state = useChannelViewStore.getState();
      expect(state.unreadBannerVisible).toBe(false);
    });
  });

  //#endregion Unread Banner

  //#region Jump To Post

  describe("jumpToPost", () => {
    it("sets jump to post id", () => {
      act(() => {
        useChannelViewStore.getState().jumpToPost("post-456");
      });

      const state = useChannelViewStore.getState();
      expect(state.jumpToPostId).toBe("post-456");
    });

    it("also sets highlighted post id", () => {
      act(() => {
        useChannelViewStore.getState().jumpToPost("post-456");
      });

      const state = useChannelViewStore.getState();
      expect(state.highlightedPostId).toBe("post-456");
    });
  });

  describe("clearJumpToPost", () => {
    it("clears jump to post id", () => {
      act(() => {
        useChannelViewStore.getState().jumpToPost("post-456");
        useChannelViewStore.getState().clearJumpToPost();
      });

      const state = useChannelViewStore.getState();
      expect(state.jumpToPostId).toBeNull();
    });

    it("does not clear highlighted post id", () => {
      act(() => {
        useChannelViewStore.getState().jumpToPost("post-456");
        useChannelViewStore.getState().clearJumpToPost();
      });

      const state = useChannelViewStore.getState();
      expect(state.highlightedPostId).toBe("post-456");
    });
  });

  //#endregion Jump To Post

  //#region Store API

  describe("store API", () => {
    it("is a valid Zustand hook", () => {
      expect(typeof useChannelViewStore).toBe("function");
      expect(typeof useChannelViewStore.getState).toBe("function");
      expect(typeof useChannelViewStore.setState).toBe("function");
      expect(typeof useChannelViewStore.subscribe).toBe("function");
    });

    it("supports subscribe for state changes", () => {
      const listener = jest.fn();
      const unsubscribe = useChannelViewStore.subscribe(listener);

      act(() => {
        useChannelViewStore.getState().setIsAtBottom(false);
      });

      expect(listener).toHaveBeenCalled();

      unsubscribe();

      act(() => {
        useChannelViewStore.getState().setIsAtBottom(true);
      });

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  //#endregion Store API
});
