// apps/v2/src/stores/views/useChannelSidebarStore.ts

import { createStore } from "../setup";

//#region Types

type IChannelSidebarState = {
  filterText: string;
  showUnreadOnly: boolean;
  draggingChannelId: string | null;
  dropTargetCategoryId: string | null;

  // Actions
  setFilterText: (text: string) => void;
  toggleUnreadOnly: () => void;
  setShowUnreadOnly: (show: boolean) => void;
  startDragging: (channelId: string) => void;
  setDropTarget: (categoryId: string | null) => void;
  endDragging: () => void;
  clearFilter: () => void;
};

//#endregion Types

//#region Store

export const useChannelSidebarStore = createStore<IChannelSidebarState>(
  (set) => ({
    // State
    filterText: "",
    showUnreadOnly: false,
    draggingChannelId: null,
    dropTargetCategoryId: null,

    // Actions
    setFilterText: (text) => set({ filterText: text }),

    toggleUnreadOnly: () =>
      set((state) => ({ showUnreadOnly: !state.showUnreadOnly })),

    setShowUnreadOnly: (show) => set({ showUnreadOnly: show }),

    startDragging: (channelId) => set({ draggingChannelId: channelId }),

    setDropTarget: (categoryId) => set({ dropTargetCategoryId: categoryId }),

    endDragging: () =>
      set({ draggingChannelId: null, dropTargetCategoryId: null }),

    clearFilter: () => set({ filterText: "", showUnreadOnly: false }),
  }),
  { name: "channel-sidebar" },
);

//#endregion Store

//#region Type Exports

export type { IChannelSidebarState };

//#endregion Type Exports
