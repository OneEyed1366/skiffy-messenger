// apps/v2/src/stores/views/useChannelSidebarStore.spec.ts

import { act } from "@testing-library/react-native";

import { useChannelSidebarStore } from "./useChannelSidebarStore";

//#region Mocks

jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
  },
}));

jest.mock("zustand/middleware", () => ({
  devtools: (fn: unknown) => fn,
  persist: (fn: unknown) => fn,
  createJSONStorage: () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }),
}));

//#endregion Mocks

describe("useChannelSidebarStore", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    act(() => {
      useChannelSidebarStore.setState({
        filterText: "",
        showUnreadOnly: false,
        draggingChannelId: null,
        dropTargetCategoryId: null,
      });
    });
  });

  //#region Initial State

  describe("initial state", () => {
    it("has empty filter text", () => {
      const state = useChannelSidebarStore.getState();

      expect(state.filterText).toBe("");
    });

    it("has showUnreadOnly disabled", () => {
      const state = useChannelSidebarStore.getState();

      expect(state.showUnreadOnly).toBe(false);
    });

    it("has no dragging channel", () => {
      const state = useChannelSidebarStore.getState();

      expect(state.draggingChannelId).toBeNull();
    });

    it("has no drop target", () => {
      const state = useChannelSidebarStore.getState();

      expect(state.dropTargetCategoryId).toBeNull();
    });
  });

  //#endregion Initial State

  //#region Filter Actions

  describe("setFilterText", () => {
    it("updates filter text", () => {
      act(() => {
        useChannelSidebarStore.getState().setFilterText("general");
      });

      expect(useChannelSidebarStore.getState().filterText).toBe("general");
    });

    it("allows empty filter text", () => {
      act(() => {
        useChannelSidebarStore.getState().setFilterText("test");
      });

      act(() => {
        useChannelSidebarStore.getState().setFilterText("");
      });

      expect(useChannelSidebarStore.getState().filterText).toBe("");
    });

    it("preserves special characters", () => {
      act(() => {
        useChannelSidebarStore.getState().setFilterText("test-channel_123");
      });

      expect(useChannelSidebarStore.getState().filterText).toBe(
        "test-channel_123",
      );
    });
  });

  describe("clearFilter", () => {
    it("clears filter text", () => {
      act(() => {
        useChannelSidebarStore.getState().setFilterText("search");
      });

      act(() => {
        useChannelSidebarStore.getState().clearFilter();
      });

      expect(useChannelSidebarStore.getState().filterText).toBe("");
    });

    it("resets showUnreadOnly to false", () => {
      act(() => {
        useChannelSidebarStore.getState().setShowUnreadOnly(true);
      });

      act(() => {
        useChannelSidebarStore.getState().clearFilter();
      });

      expect(useChannelSidebarStore.getState().showUnreadOnly).toBe(false);
    });

    it("clears both filter text and showUnreadOnly together", () => {
      act(() => {
        useChannelSidebarStore.getState().setFilterText("test");
        useChannelSidebarStore.getState().setShowUnreadOnly(true);
      });

      act(() => {
        useChannelSidebarStore.getState().clearFilter();
      });

      const state = useChannelSidebarStore.getState();
      expect(state.filterText).toBe("");
      expect(state.showUnreadOnly).toBe(false);
    });
  });

  //#endregion Filter Actions

  //#region Unread Filter Actions

  describe("toggleUnreadOnly", () => {
    it("toggles from false to true", () => {
      act(() => {
        useChannelSidebarStore.getState().toggleUnreadOnly();
      });

      expect(useChannelSidebarStore.getState().showUnreadOnly).toBe(true);
    });

    it("toggles from true to false", () => {
      act(() => {
        useChannelSidebarStore.getState().setShowUnreadOnly(true);
      });

      act(() => {
        useChannelSidebarStore.getState().toggleUnreadOnly();
      });

      expect(useChannelSidebarStore.getState().showUnreadOnly).toBe(false);
    });

    it("toggles multiple times correctly", () => {
      act(() => {
        useChannelSidebarStore.getState().toggleUnreadOnly();
      });
      expect(useChannelSidebarStore.getState().showUnreadOnly).toBe(true);

      act(() => {
        useChannelSidebarStore.getState().toggleUnreadOnly();
      });
      expect(useChannelSidebarStore.getState().showUnreadOnly).toBe(false);

      act(() => {
        useChannelSidebarStore.getState().toggleUnreadOnly();
      });
      expect(useChannelSidebarStore.getState().showUnreadOnly).toBe(true);
    });
  });

  describe("setShowUnreadOnly", () => {
    it("sets showUnreadOnly to true", () => {
      act(() => {
        useChannelSidebarStore.getState().setShowUnreadOnly(true);
      });

      expect(useChannelSidebarStore.getState().showUnreadOnly).toBe(true);
    });

    it("sets showUnreadOnly to false", () => {
      act(() => {
        useChannelSidebarStore.getState().setShowUnreadOnly(true);
      });

      act(() => {
        useChannelSidebarStore.getState().setShowUnreadOnly(false);
      });

      expect(useChannelSidebarStore.getState().showUnreadOnly).toBe(false);
    });
  });

  //#endregion Unread Filter Actions

  //#region Drag and Drop Actions

  describe("startDragging", () => {
    it("sets dragging channel id", () => {
      act(() => {
        useChannelSidebarStore.getState().startDragging("channel-123");
      });

      expect(useChannelSidebarStore.getState().draggingChannelId).toBe(
        "channel-123",
      );
    });

    it("replaces existing dragging channel", () => {
      act(() => {
        useChannelSidebarStore.getState().startDragging("channel-1");
      });

      act(() => {
        useChannelSidebarStore.getState().startDragging("channel-2");
      });

      expect(useChannelSidebarStore.getState().draggingChannelId).toBe(
        "channel-2",
      );
    });
  });

  describe("setDropTarget", () => {
    it("sets drop target category id", () => {
      act(() => {
        useChannelSidebarStore.getState().setDropTarget("category-456");
      });

      expect(useChannelSidebarStore.getState().dropTargetCategoryId).toBe(
        "category-456",
      );
    });

    it("sets drop target to null", () => {
      act(() => {
        useChannelSidebarStore.getState().setDropTarget("category-1");
      });

      act(() => {
        useChannelSidebarStore.getState().setDropTarget(null);
      });

      expect(useChannelSidebarStore.getState().dropTargetCategoryId).toBeNull();
    });

    it("replaces existing drop target", () => {
      act(() => {
        useChannelSidebarStore.getState().setDropTarget("category-1");
      });

      act(() => {
        useChannelSidebarStore.getState().setDropTarget("category-2");
      });

      expect(useChannelSidebarStore.getState().dropTargetCategoryId).toBe(
        "category-2",
      );
    });
  });

  describe("endDragging", () => {
    it("clears dragging channel id", () => {
      act(() => {
        useChannelSidebarStore.getState().startDragging("channel-123");
      });

      act(() => {
        useChannelSidebarStore.getState().endDragging();
      });

      expect(useChannelSidebarStore.getState().draggingChannelId).toBeNull();
    });

    it("clears drop target category id", () => {
      act(() => {
        useChannelSidebarStore.getState().setDropTarget("category-456");
      });

      act(() => {
        useChannelSidebarStore.getState().endDragging();
      });

      expect(useChannelSidebarStore.getState().dropTargetCategoryId).toBeNull();
    });

    it("clears both dragging channel and drop target together", () => {
      act(() => {
        useChannelSidebarStore.getState().startDragging("channel-123");
        useChannelSidebarStore.getState().setDropTarget("category-456");
      });

      act(() => {
        useChannelSidebarStore.getState().endDragging();
      });

      const state = useChannelSidebarStore.getState();
      expect(state.draggingChannelId).toBeNull();
      expect(state.dropTargetCategoryId).toBeNull();
    });
  });

  //#endregion Drag and Drop Actions

  //#region Store Subscription

  describe("store subscription", () => {
    it("notifies subscribers on state change", () => {
      const listener = jest.fn();
      const unsubscribe = useChannelSidebarStore.subscribe(listener);

      act(() => {
        useChannelSidebarStore.getState().setFilterText("test");
      });

      expect(listener).toHaveBeenCalled();

      unsubscribe();
    });

    it("stops notifying after unsubscribe", () => {
      const listener = jest.fn();
      const unsubscribe = useChannelSidebarStore.subscribe(listener);

      unsubscribe();

      act(() => {
        useChannelSidebarStore.getState().setFilterText("test");
      });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  //#endregion Store Subscription

  //#region State Independence

  describe("state independence", () => {
    it("does not affect drag state when changing filter", () => {
      act(() => {
        useChannelSidebarStore.getState().startDragging("channel-123");
        useChannelSidebarStore.getState().setDropTarget("category-456");
      });

      act(() => {
        useChannelSidebarStore.getState().setFilterText("search");
      });

      const state = useChannelSidebarStore.getState();
      expect(state.draggingChannelId).toBe("channel-123");
      expect(state.dropTargetCategoryId).toBe("category-456");
    });

    it("does not affect filter state when changing drag state", () => {
      act(() => {
        useChannelSidebarStore.getState().setFilterText("search");
        useChannelSidebarStore.getState().setShowUnreadOnly(true);
      });

      act(() => {
        useChannelSidebarStore.getState().startDragging("channel-123");
        useChannelSidebarStore.getState().endDragging();
      });

      const state = useChannelSidebarStore.getState();
      expect(state.filterText).toBe("search");
      expect(state.showUnreadOnly).toBe(true);
    });
  });

  //#endregion State Independence
});
