// apps/v2/src/stores/ui/useRhsStore.ts

import { createStore } from "../setup";

//#region Types

type IRhsView =
  | "thread"
  | "channel_info"
  | "channel_members"
  | "pinned_posts"
  | "search_results"
  | "user_profile"
  | "none";

type IRhsPreviousState = {
  view: IRhsView;
  channelId: string | null;
};

type IRhsState = {
  isOpen: boolean;
  view: IRhsView;
  channelId: string | null;
  threadId: string | null;
  userId: string | null;
  searchTerms: string | null;
  isExpanded: boolean;
  previousView: IRhsView | null;
  previousState: IRhsPreviousState | null;

  // Actions
  openThread: (channelId: string, threadId: string) => void;
  openChannelInfo: (channelId: string) => void;
  openChannelMembers: (channelId: string) => void;
  openPinnedPosts: (channelId: string) => void;
  openSearchResults: (searchTerms: string) => void;
  openUserProfile: (userId: string) => void;
  close: () => void;
  toggle: () => void;
  setExpanded: (expanded: boolean) => void;
  goBack: () => void;
};

//#endregion Types

//#region Store

export const useRhsStore = createStore<IRhsState>(
  (set, get) => ({
    // Initial state
    isOpen: false,
    view: "none",
    channelId: null,
    threadId: null,
    userId: null,
    searchTerms: null,
    isExpanded: false,
    previousView: null,
    previousState: null,

    // Actions
    openThread: (channelId, threadId) => {
      const { view, channelId: currentChannelId } = get();
      set({
        isOpen: true,
        view: "thread",
        channelId,
        threadId,
        userId: null,
        searchTerms: null,
        previousView: view !== "none" ? view : null,
        previousState:
          view !== "none" ? { view, channelId: currentChannelId } : null,
      });
    },

    openChannelInfo: (channelId) => {
      const { view, channelId: currentChannelId } = get();
      set({
        isOpen: true,
        view: "channel_info",
        channelId,
        threadId: null,
        userId: null,
        searchTerms: null,
        previousView: view !== "none" ? view : null,
        previousState:
          view !== "none" ? { view, channelId: currentChannelId } : null,
      });
    },

    openChannelMembers: (channelId) => {
      const { view, channelId: currentChannelId } = get();
      set({
        isOpen: true,
        view: "channel_members",
        channelId,
        threadId: null,
        userId: null,
        searchTerms: null,
        previousView: view !== "none" ? view : null,
        previousState:
          view !== "none" ? { view, channelId: currentChannelId } : null,
      });
    },

    openPinnedPosts: (channelId) => {
      const { view, channelId: currentChannelId } = get();
      set({
        isOpen: true,
        view: "pinned_posts",
        channelId,
        threadId: null,
        userId: null,
        searchTerms: null,
        previousView: view !== "none" ? view : null,
        previousState:
          view !== "none" ? { view, channelId: currentChannelId } : null,
      });
    },

    openSearchResults: (searchTerms) => {
      const { view, channelId: currentChannelId } = get();
      set({
        isOpen: true,
        view: "search_results",
        channelId: null,
        threadId: null,
        userId: null,
        searchTerms,
        previousView: view !== "none" ? view : null,
        previousState:
          view !== "none" ? { view, channelId: currentChannelId } : null,
      });
    },

    openUserProfile: (userId) => {
      const { view, channelId: currentChannelId } = get();
      set({
        isOpen: true,
        view: "user_profile",
        channelId: null,
        threadId: null,
        userId,
        searchTerms: null,
        previousView: view !== "none" ? view : null,
        previousState:
          view !== "none" ? { view, channelId: currentChannelId } : null,
      });
    },

    close: () => {
      set({
        isOpen: false,
        view: "none",
        channelId: null,
        threadId: null,
        userId: null,
        searchTerms: null,
        previousView: null,
        previousState: null,
      });
    },

    toggle: () => {
      const { isOpen, view } = get();
      if (isOpen) {
        set({
          isOpen: false,
          view: "none",
          channelId: null,
          threadId: null,
          userId: null,
          searchTerms: null,
          previousView: null,
          previousState: null,
        });
      } else if (view !== "none") {
        set({ isOpen: true });
      }
    },

    setExpanded: (expanded) => {
      set({ isExpanded: expanded });
    },

    goBack: () => {
      const { previousState } = get();
      if (previousState && previousState.view !== "none") {
        // Restore previous view with its channelId
        set({
          view: previousState.view,
          channelId: previousState.channelId,
          previousView: null,
          previousState: null,
          threadId: null,
          userId: null,
          searchTerms: null,
        });
      } else {
        // No previous view, close the RHS
        set({
          isOpen: false,
          view: "none",
          channelId: null,
          threadId: null,
          userId: null,
          searchTerms: null,
          previousView: null,
          previousState: null,
        });
      }
    },
  }),
  { name: "rhs-store" },
);

//#endregion Store

//#region Exports

export type { IRhsView, IRhsState };

//#endregion Exports
