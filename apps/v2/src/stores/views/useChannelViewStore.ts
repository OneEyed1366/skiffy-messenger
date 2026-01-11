// apps/v2/src/stores/views/useChannelViewStore.ts

import { createStore } from "../setup";

//#region Types

type IChannelViewState = {
  scrollPosition: Record<string, number>; // channelId -> scroll position
  highlightedPostId: string | null;
  isAtBottom: boolean;
  unreadBannerVisible: boolean;
  jumpToPostId: string | null;

  // Actions
  setScrollPosition: (channelId: string, position: number) => void;
  getScrollPosition: (channelId: string) => number;
  setHighlightedPost: (postId: string | null) => void;
  setIsAtBottom: (isAtBottom: boolean) => void;
  showUnreadBanner: () => void;
  hideUnreadBanner: () => void;
  jumpToPost: (postId: string) => void;
  clearJumpToPost: () => void;
};

//#endregion Types

//#region Store

export const useChannelViewStore = createStore<IChannelViewState>(
  (set, get) => ({
    scrollPosition: {},
    highlightedPostId: null,
    isAtBottom: true,
    unreadBannerVisible: false,
    jumpToPostId: null,

    setScrollPosition: (channelId, position) =>
      set((state) => ({
        scrollPosition: {
          ...state.scrollPosition,
          [channelId]: position,
        },
      })),

    getScrollPosition: (channelId) => {
      const state = get();
      return state.scrollPosition[channelId] ?? 0;
    },

    setHighlightedPost: (postId) =>
      set({
        highlightedPostId: postId,
      }),

    setIsAtBottom: (isAtBottom) =>
      set({
        isAtBottom,
      }),

    showUnreadBanner: () =>
      set({
        unreadBannerVisible: true,
      }),

    hideUnreadBanner: () =>
      set({
        unreadBannerVisible: false,
      }),

    jumpToPost: (postId) =>
      set({
        jumpToPostId: postId,
        highlightedPostId: postId,
      }),

    clearJumpToPost: () =>
      set({
        jumpToPostId: null,
      }),
  }),
  { name: "channel-view" },
);

//#endregion Store
