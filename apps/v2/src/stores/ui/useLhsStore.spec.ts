// apps/v2/src/stores/ui/useLhsStore.spec.ts

import { act } from "@testing-library/react-native";

import { useLhsStore } from "./useLhsStore";

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

describe("useLhsStore", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    act(() => {
      useLhsStore.setState({
        isOpen: true,
        width: 240,
        activeTeamId: null,
        activeChannelId: null,
        collapsedCategories: new Set<string>(),
      });
    });
  });

  //#region Initial State

  describe("initial state", () => {
    it("has correct default values", () => {
      const state = useLhsStore.getState();

      expect(state.isOpen).toBe(true);
      expect(state.width).toBe(240);
      expect(state.activeTeamId).toBeNull();
      expect(state.activeChannelId).toBeNull();
      expect(state.collapsedCategories).toBeInstanceOf(Set);
      expect(state.collapsedCategories.size).toBe(0);
    });

    it("has all required action methods", () => {
      const state = useLhsStore.getState();

      expect(typeof state.open).toBe("function");
      expect(typeof state.close).toBe("function");
      expect(typeof state.toggle).toBe("function");
      expect(typeof state.setWidth).toBe("function");
      expect(typeof state.setActiveTeam).toBe("function");
      expect(typeof state.setActiveChannel).toBe("function");
      expect(typeof state.toggleCategory).toBe("function");
      expect(typeof state.expandCategory).toBe("function");
      expect(typeof state.collapseCategory).toBe("function");
    });
  });

  //#endregion Initial State

  //#region Open/Close Actions

  describe("open/close actions", () => {
    it("open sets isOpen to true", () => {
      act(() => {
        useLhsStore.getState().close();
      });
      expect(useLhsStore.getState().isOpen).toBe(false);

      act(() => {
        useLhsStore.getState().open();
      });
      expect(useLhsStore.getState().isOpen).toBe(true);
    });

    it("close sets isOpen to false", () => {
      expect(useLhsStore.getState().isOpen).toBe(true);

      act(() => {
        useLhsStore.getState().close();
      });
      expect(useLhsStore.getState().isOpen).toBe(false);
    });

    it("toggle flips isOpen state", () => {
      expect(useLhsStore.getState().isOpen).toBe(true);

      act(() => {
        useLhsStore.getState().toggle();
      });
      expect(useLhsStore.getState().isOpen).toBe(false);

      act(() => {
        useLhsStore.getState().toggle();
      });
      expect(useLhsStore.getState().isOpen).toBe(true);
    });

    it("open is idempotent when already open", () => {
      expect(useLhsStore.getState().isOpen).toBe(true);

      act(() => {
        useLhsStore.getState().open();
      });
      expect(useLhsStore.getState().isOpen).toBe(true);
    });

    it("close is idempotent when already closed", () => {
      act(() => {
        useLhsStore.getState().close();
      });
      expect(useLhsStore.getState().isOpen).toBe(false);

      act(() => {
        useLhsStore.getState().close();
      });
      expect(useLhsStore.getState().isOpen).toBe(false);
    });
  });

  //#endregion Open/Close Actions

  //#region Width Action

  describe("setWidth action", () => {
    it("updates width to specified value", () => {
      act(() => {
        useLhsStore.getState().setWidth(300);
      });
      expect(useLhsStore.getState().width).toBe(300);
    });

    it("accepts zero width", () => {
      act(() => {
        useLhsStore.getState().setWidth(0);
      });
      expect(useLhsStore.getState().width).toBe(0);
    });

    it("accepts large width values", () => {
      act(() => {
        useLhsStore.getState().setWidth(1000);
      });
      expect(useLhsStore.getState().width).toBe(1000);
    });
  });

  //#endregion Width Action

  //#region Active Team Actions

  describe("setActiveTeam action", () => {
    it("sets activeTeamId to specified value", () => {
      act(() => {
        useLhsStore.getState().setActiveTeam("team-1");
      });
      expect(useLhsStore.getState().activeTeamId).toBe("team-1");
    });

    it("can change team to different value", () => {
      act(() => {
        useLhsStore.getState().setActiveTeam("team-1");
      });
      expect(useLhsStore.getState().activeTeamId).toBe("team-1");

      act(() => {
        useLhsStore.getState().setActiveTeam("team-2");
      });
      expect(useLhsStore.getState().activeTeamId).toBe("team-2");
    });

    it("accepts empty string as team id", () => {
      act(() => {
        useLhsStore.getState().setActiveTeam("");
      });
      expect(useLhsStore.getState().activeTeamId).toBe("");
    });
  });

  //#endregion Active Team Actions

  //#region Active Channel Actions

  describe("setActiveChannel action", () => {
    it("sets activeChannelId to specified value", () => {
      act(() => {
        useLhsStore.getState().setActiveChannel("channel-1");
      });
      expect(useLhsStore.getState().activeChannelId).toBe("channel-1");
    });

    it("can change channel to different value", () => {
      act(() => {
        useLhsStore.getState().setActiveChannel("channel-1");
      });
      expect(useLhsStore.getState().activeChannelId).toBe("channel-1");

      act(() => {
        useLhsStore.getState().setActiveChannel("channel-2");
      });
      expect(useLhsStore.getState().activeChannelId).toBe("channel-2");
    });

    it("accepts empty string as channel id", () => {
      act(() => {
        useLhsStore.getState().setActiveChannel("");
      });
      expect(useLhsStore.getState().activeChannelId).toBe("");
    });
  });

  //#endregion Active Channel Actions

  //#region Category Actions

  describe("toggleCategory action", () => {
    it("collapses an expanded category", () => {
      expect(useLhsStore.getState().collapsedCategories.has("cat-1")).toBe(
        false,
      );

      act(() => {
        useLhsStore.getState().toggleCategory("cat-1");
      });
      expect(useLhsStore.getState().collapsedCategories.has("cat-1")).toBe(
        true,
      );
    });

    it("expands a collapsed category", () => {
      act(() => {
        useLhsStore.getState().toggleCategory("cat-1");
      });
      expect(useLhsStore.getState().collapsedCategories.has("cat-1")).toBe(
        true,
      );

      act(() => {
        useLhsStore.getState().toggleCategory("cat-1");
      });
      expect(useLhsStore.getState().collapsedCategories.has("cat-1")).toBe(
        false,
      );
    });

    it("handles multiple categories independently", () => {
      act(() => {
        useLhsStore.getState().toggleCategory("cat-1");
        useLhsStore.getState().toggleCategory("cat-2");
      });

      const collapsed = useLhsStore.getState().collapsedCategories;
      expect(collapsed.has("cat-1")).toBe(true);
      expect(collapsed.has("cat-2")).toBe(true);

      act(() => {
        useLhsStore.getState().toggleCategory("cat-1");
      });

      const updated = useLhsStore.getState().collapsedCategories;
      expect(updated.has("cat-1")).toBe(false);
      expect(updated.has("cat-2")).toBe(true);
    });
  });

  describe("expandCategory action", () => {
    it("removes category from collapsed set", () => {
      act(() => {
        useLhsStore.getState().toggleCategory("cat-1");
      });
      expect(useLhsStore.getState().collapsedCategories.has("cat-1")).toBe(
        true,
      );

      act(() => {
        useLhsStore.getState().expandCategory("cat-1");
      });
      expect(useLhsStore.getState().collapsedCategories.has("cat-1")).toBe(
        false,
      );
    });

    it("is idempotent when category is already expanded", () => {
      expect(useLhsStore.getState().collapsedCategories.has("cat-1")).toBe(
        false,
      );

      act(() => {
        useLhsStore.getState().expandCategory("cat-1");
      });
      expect(useLhsStore.getState().collapsedCategories.has("cat-1")).toBe(
        false,
      );
    });

    it("does not affect other collapsed categories", () => {
      act(() => {
        useLhsStore.getState().toggleCategory("cat-1");
        useLhsStore.getState().toggleCategory("cat-2");
      });

      act(() => {
        useLhsStore.getState().expandCategory("cat-1");
      });

      const collapsed = useLhsStore.getState().collapsedCategories;
      expect(collapsed.has("cat-1")).toBe(false);
      expect(collapsed.has("cat-2")).toBe(true);
    });
  });

  describe("collapseCategory action", () => {
    it("adds category to collapsed set", () => {
      expect(useLhsStore.getState().collapsedCategories.has("cat-1")).toBe(
        false,
      );

      act(() => {
        useLhsStore.getState().collapseCategory("cat-1");
      });
      expect(useLhsStore.getState().collapsedCategories.has("cat-1")).toBe(
        true,
      );
    });

    it("is idempotent when category is already collapsed", () => {
      act(() => {
        useLhsStore.getState().collapseCategory("cat-1");
      });
      expect(useLhsStore.getState().collapsedCategories.has("cat-1")).toBe(
        true,
      );

      act(() => {
        useLhsStore.getState().collapseCategory("cat-1");
      });
      expect(useLhsStore.getState().collapsedCategories.has("cat-1")).toBe(
        true,
      );
    });

    it("does not affect other categories", () => {
      act(() => {
        useLhsStore.getState().collapseCategory("cat-1");
      });

      act(() => {
        useLhsStore.getState().collapseCategory("cat-2");
      });

      const collapsed = useLhsStore.getState().collapsedCategories;
      expect(collapsed.has("cat-1")).toBe(true);
      expect(collapsed.has("cat-2")).toBe(true);
      expect(collapsed.size).toBe(2);
    });
  });

  //#endregion Category Actions

  //#region Store Subscription

  describe("store subscription", () => {
    it("notifies subscribers on state changes", () => {
      const listener = jest.fn();
      const unsubscribe = useLhsStore.subscribe(listener);

      act(() => {
        useLhsStore.getState().toggle();
      });

      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
    });

    it("stops notifying after unsubscribe", () => {
      const listener = jest.fn();
      const unsubscribe = useLhsStore.subscribe(listener);

      act(() => {
        useLhsStore.getState().toggle();
      });
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      act(() => {
        useLhsStore.getState().toggle();
      });
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  //#endregion Store Subscription

  //#region State Immutability

  describe("state immutability", () => {
    it("creates new Set reference when modifying collapsedCategories", () => {
      const initialSet = useLhsStore.getState().collapsedCategories;

      act(() => {
        useLhsStore.getState().toggleCategory("cat-1");
      });

      const updatedSet = useLhsStore.getState().collapsedCategories;
      expect(updatedSet).not.toBe(initialSet);
    });

    it("does not mutate original Set on toggle", () => {
      act(() => {
        useLhsStore.getState().collapseCategory("cat-1");
      });

      const setBeforeToggle = useLhsStore.getState().collapsedCategories;
      const sizeBefore = setBeforeToggle.size;

      act(() => {
        useLhsStore.getState().toggleCategory("cat-2");
      });

      // Original reference should still have only cat-1
      expect(setBeforeToggle.size).toBe(sizeBefore);
    });
  });

  //#endregion State Immutability

  //#region Complex Scenarios

  describe("complex scenarios", () => {
    it("handles rapid state changes", () => {
      act(() => {
        useLhsStore.getState().toggle();
        useLhsStore.getState().toggle();
        useLhsStore.getState().toggle();
        useLhsStore.getState().setWidth(500);
        useLhsStore.getState().setActiveTeam("team-x");
        useLhsStore.getState().setActiveChannel("channel-y");
        useLhsStore.getState().collapseCategory("cat-a");
        useLhsStore.getState().collapseCategory("cat-b");
        useLhsStore.getState().expandCategory("cat-a");
      });

      const state = useLhsStore.getState();
      expect(state.isOpen).toBe(false); // toggled 3 times from true
      expect(state.width).toBe(500);
      expect(state.activeTeamId).toBe("team-x");
      expect(state.activeChannelId).toBe("channel-y");
      expect(state.collapsedCategories.has("cat-a")).toBe(false);
      expect(state.collapsedCategories.has("cat-b")).toBe(true);
    });

    it("maintains independence between state properties", () => {
      act(() => {
        useLhsStore.getState().close();
      });
      expect(useLhsStore.getState().width).toBe(240); // unchanged

      act(() => {
        useLhsStore.getState().setWidth(100);
      });
      expect(useLhsStore.getState().isOpen).toBe(false); // unchanged
      expect(useLhsStore.getState().activeTeamId).toBeNull(); // unchanged

      act(() => {
        useLhsStore.getState().setActiveTeam("team-1");
      });
      expect(useLhsStore.getState().width).toBe(100); // unchanged
      expect(useLhsStore.getState().activeChannelId).toBeNull(); // unchanged
    });
  });

  //#endregion Complex Scenarios
});
