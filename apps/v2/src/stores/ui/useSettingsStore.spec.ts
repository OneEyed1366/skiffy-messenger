// apps/v2/src/stores/ui/useSettingsStore.spec.ts

import { act } from "@testing-library/react-native";

import { createStore } from "../setup";
import type { ISettingsTab, ISettingsState } from "./useSettingsStore";

// Mock Platform
jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
  },
}));

// Mock devtools middleware
jest.mock("zustand/middleware", () => ({
  devtools: (fn: unknown) => fn,
  persist: (fn: unknown) => fn,
  createJSONStorage: () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }),
}));

//#region Test Setup

/**
 * Factory for creating a fresh store instance per test.
 * Bc Zustand stores are singletons, we need fresh instances to isolate tests.
 */
function createSettingsStore() {
  return createStore<ISettingsState>(
    (set) => ({
      isOpen: false,
      activeTab: "general",
      hasUnsavedChanges: false,

      open: (tab?: ISettingsTab) =>
        set({
          isOpen: true,
          activeTab: tab ?? "general",
        }),

      close: () =>
        set({
          isOpen: false,
          hasUnsavedChanges: false,
        }),

      setTab: (tab: ISettingsTab) => set({ activeTab: tab }),

      setHasUnsavedChanges: (hasChanges: boolean) =>
        set({ hasUnsavedChanges: hasChanges }),
    }),
    { name: "settings-test" },
  );
}

//#endregion Test Setup

describe("useSettingsStore", () => {
  //#region Initial State

  describe("initial state", () => {
    it("has isOpen set to false initially", () => {
      const useStore = createSettingsStore();
      const state = useStore.getState();

      expect(state.isOpen).toBe(false);
    });

    it("has activeTab set to general initially", () => {
      const useStore = createSettingsStore();
      const state = useStore.getState();

      expect(state.activeTab).toBe("general");
    });

    it("has hasUnsavedChanges set to false initially", () => {
      const useStore = createSettingsStore();
      const state = useStore.getState();

      expect(state.hasUnsavedChanges).toBe(false);
    });
  });

  //#endregion Initial State

  //#region open Action

  describe("open", () => {
    it("sets isOpen to true", () => {
      const useStore = createSettingsStore();

      act(() => {
        useStore.getState().open();
      });

      expect(useStore.getState().isOpen).toBe(true);
    });

    it("defaults to general tab when no tab specified", () => {
      const useStore = createSettingsStore();

      act(() => {
        useStore.getState().open();
      });

      expect(useStore.getState().activeTab).toBe("general");
    });

    it("opens to specified tab", () => {
      const useStore = createSettingsStore();

      act(() => {
        useStore.getState().open("notifications");
      });

      expect(useStore.getState().isOpen).toBe(true);
      expect(useStore.getState().activeTab).toBe("notifications");
    });

    it("opens to display tab", () => {
      const useStore = createSettingsStore();

      act(() => {
        useStore.getState().open("display");
      });

      expect(useStore.getState().activeTab).toBe("display");
    });

    it("opens to sidebar tab", () => {
      const useStore = createSettingsStore();

      act(() => {
        useStore.getState().open("sidebar");
      });

      expect(useStore.getState().activeTab).toBe("sidebar");
    });

    it("opens to advanced tab", () => {
      const useStore = createSettingsStore();

      act(() => {
        useStore.getState().open("advanced");
      });

      expect(useStore.getState().activeTab).toBe("advanced");
    });

    it("can be called multiple times to change tab", () => {
      const useStore = createSettingsStore();

      act(() => {
        useStore.getState().open("notifications");
      });
      expect(useStore.getState().activeTab).toBe("notifications");

      act(() => {
        useStore.getState().open("display");
      });
      expect(useStore.getState().activeTab).toBe("display");
      expect(useStore.getState().isOpen).toBe(true);
    });
  });

  //#endregion open Action

  //#region close Action

  describe("close", () => {
    it("sets isOpen to false", () => {
      const useStore = createSettingsStore();

      act(() => {
        useStore.getState().open();
      });
      expect(useStore.getState().isOpen).toBe(true);

      act(() => {
        useStore.getState().close();
      });
      expect(useStore.getState().isOpen).toBe(false);
    });

    it("resets hasUnsavedChanges to false", () => {
      const useStore = createSettingsStore();

      act(() => {
        useStore.getState().open();
        useStore.getState().setHasUnsavedChanges(true);
      });
      expect(useStore.getState().hasUnsavedChanges).toBe(true);

      act(() => {
        useStore.getState().close();
      });
      expect(useStore.getState().hasUnsavedChanges).toBe(false);
    });

    it("handles close when already closed", () => {
      const useStore = createSettingsStore();

      act(() => {
        useStore.getState().close();
      });

      expect(useStore.getState().isOpen).toBe(false);
    });

    it("preserves activeTab after close", () => {
      const useStore = createSettingsStore();

      act(() => {
        useStore.getState().open("advanced");
      });

      act(() => {
        useStore.getState().close();
      });

      // activeTab is preserved (not reset to general)
      expect(useStore.getState().activeTab).toBe("advanced");
    });
  });

  //#endregion close Action

  //#region setTab Action

  describe("setTab", () => {
    it("changes activeTab", () => {
      const useStore = createSettingsStore();

      act(() => {
        useStore.getState().setTab("notifications");
      });

      expect(useStore.getState().activeTab).toBe("notifications");
    });

    it("changes tab while settings is open", () => {
      const useStore = createSettingsStore();

      act(() => {
        useStore.getState().open("general");
      });

      act(() => {
        useStore.getState().setTab("display");
      });

      expect(useStore.getState().activeTab).toBe("display");
      expect(useStore.getState().isOpen).toBe(true);
    });

    it("changes tab while settings is closed", () => {
      const useStore = createSettingsStore();

      act(() => {
        useStore.getState().setTab("sidebar");
      });

      expect(useStore.getState().activeTab).toBe("sidebar");
      expect(useStore.getState().isOpen).toBe(false);
    });

    it("does not affect hasUnsavedChanges", () => {
      const useStore = createSettingsStore();

      act(() => {
        useStore.getState().setHasUnsavedChanges(true);
      });

      act(() => {
        useStore.getState().setTab("advanced");
      });

      expect(useStore.getState().hasUnsavedChanges).toBe(true);
    });
  });

  //#endregion setTab Action

  //#region setHasUnsavedChanges Action

  describe("setHasUnsavedChanges", () => {
    it("sets hasUnsavedChanges to true", () => {
      const useStore = createSettingsStore();

      act(() => {
        useStore.getState().setHasUnsavedChanges(true);
      });

      expect(useStore.getState().hasUnsavedChanges).toBe(true);
    });

    it("sets hasUnsavedChanges to false", () => {
      const useStore = createSettingsStore();

      act(() => {
        useStore.getState().setHasUnsavedChanges(true);
      });
      expect(useStore.getState().hasUnsavedChanges).toBe(true);

      act(() => {
        useStore.getState().setHasUnsavedChanges(false);
      });
      expect(useStore.getState().hasUnsavedChanges).toBe(false);
    });

    it("does not affect isOpen state", () => {
      const useStore = createSettingsStore();

      act(() => {
        useStore.getState().open();
      });

      act(() => {
        useStore.getState().setHasUnsavedChanges(true);
      });

      expect(useStore.getState().isOpen).toBe(true);
    });

    it("does not affect activeTab state", () => {
      const useStore = createSettingsStore();

      act(() => {
        useStore.getState().open("advanced");
      });

      act(() => {
        useStore.getState().setHasUnsavedChanges(true);
      });

      expect(useStore.getState().activeTab).toBe("advanced");
    });
  });

  //#endregion setHasUnsavedChanges Action

  //#region Tab Types

  describe("tab types", () => {
    const tabTypes: ISettingsTab[] = [
      "general",
      "notifications",
      "display",
      "sidebar",
      "advanced",
    ];

    it.each(tabTypes)("supports %s tab type via open", (tab) => {
      const useStore = createSettingsStore();

      act(() => {
        useStore.getState().open(tab);
      });

      expect(useStore.getState().activeTab).toBe(tab);
      expect(useStore.getState().isOpen).toBe(true);
    });

    it.each(tabTypes)("supports %s tab type via setTab", (tab) => {
      const useStore = createSettingsStore();

      act(() => {
        useStore.getState().setTab(tab);
      });

      expect(useStore.getState().activeTab).toBe(tab);
    });
  });

  //#endregion Tab Types

  //#region Integration Scenarios

  describe("integration scenarios", () => {
    it("handles typical settings flow: open -> edit -> save -> close", () => {
      const useStore = createSettingsStore();

      // Open settings to notifications tab
      act(() => {
        useStore.getState().open("notifications");
      });
      expect(useStore.getState().isOpen).toBe(true);
      expect(useStore.getState().activeTab).toBe("notifications");
      expect(useStore.getState().hasUnsavedChanges).toBe(false);

      // User makes changes
      act(() => {
        useStore.getState().setHasUnsavedChanges(true);
      });
      expect(useStore.getState().hasUnsavedChanges).toBe(true);

      // User saves (external action resets unsaved flag)
      act(() => {
        useStore.getState().setHasUnsavedChanges(false);
      });
      expect(useStore.getState().hasUnsavedChanges).toBe(false);

      // Close settings
      act(() => {
        useStore.getState().close();
      });
      expect(useStore.getState().isOpen).toBe(false);
    });

    it("handles tab navigation flow: open -> switch tabs -> close", () => {
      const useStore = createSettingsStore();

      // Open to general
      act(() => {
        useStore.getState().open("general");
      });

      // Navigate through tabs
      act(() => {
        useStore.getState().setTab("notifications");
      });
      expect(useStore.getState().activeTab).toBe("notifications");

      act(() => {
        useStore.getState().setTab("display");
      });
      expect(useStore.getState().activeTab).toBe("display");

      act(() => {
        useStore.getState().setTab("sidebar");
      });
      expect(useStore.getState().activeTab).toBe("sidebar");

      act(() => {
        useStore.getState().setTab("advanced");
      });
      expect(useStore.getState().activeTab).toBe("advanced");

      // Close
      act(() => {
        useStore.getState().close();
      });
      expect(useStore.getState().isOpen).toBe(false);
      // Tab preserved
      expect(useStore.getState().activeTab).toBe("advanced");
    });

    it("handles unsaved changes warning flow", () => {
      const useStore = createSettingsStore();

      // Open and make changes
      act(() => {
        useStore.getState().open("general");
        useStore.getState().setHasUnsavedChanges(true);
      });

      // Check if there are unsaved changes before allowing close
      expect(useStore.getState().hasUnsavedChanges).toBe(true);

      // User confirms discard - close resets unsaved flag
      act(() => {
        useStore.getState().close();
      });
      expect(useStore.getState().hasUnsavedChanges).toBe(false);
      expect(useStore.getState().isOpen).toBe(false);
    });

    it("handles reopen after close", () => {
      const useStore = createSettingsStore();

      // Open to advanced tab
      act(() => {
        useStore.getState().open("advanced");
      });

      // Close
      act(() => {
        useStore.getState().close();
      });

      // Reopen without specifying tab - should go to general (default)
      act(() => {
        useStore.getState().open();
      });
      expect(useStore.getState().isOpen).toBe(true);
      expect(useStore.getState().activeTab).toBe("general");
    });

    it("handles deep link scenario: open directly to specific tab", () => {
      const useStore = createSettingsStore();

      // Simulate deep link to advanced settings
      act(() => {
        useStore.getState().open("advanced");
      });

      expect(useStore.getState().isOpen).toBe(true);
      expect(useStore.getState().activeTab).toBe("advanced");
      expect(useStore.getState().hasUnsavedChanges).toBe(false);
    });
  });

  //#endregion Integration Scenarios

  //#region Store Subscription

  describe("store subscription", () => {
    it("notifies subscribers on open", () => {
      const useStore = createSettingsStore();
      const listener = jest.fn();

      useStore.subscribe(listener);

      act(() => {
        useStore.getState().open();
      });

      expect(listener).toHaveBeenCalled();
    });

    it("notifies subscribers on close", () => {
      const useStore = createSettingsStore();
      const listener = jest.fn();

      act(() => {
        useStore.getState().open();
      });

      useStore.subscribe(listener);

      act(() => {
        useStore.getState().close();
      });

      expect(listener).toHaveBeenCalled();
    });

    it("notifies subscribers on tab change", () => {
      const useStore = createSettingsStore();
      const listener = jest.fn();

      useStore.subscribe(listener);

      act(() => {
        useStore.getState().setTab("notifications");
      });

      expect(listener).toHaveBeenCalled();
    });

    it("notifies subscribers on unsaved changes", () => {
      const useStore = createSettingsStore();
      const listener = jest.fn();

      useStore.subscribe(listener);

      act(() => {
        useStore.getState().setHasUnsavedChanges(true);
      });

      expect(listener).toHaveBeenCalled();
    });

    it("allows unsubscribing", () => {
      const useStore = createSettingsStore();
      const listener = jest.fn();

      const unsubscribe = useStore.subscribe(listener);
      unsubscribe();

      act(() => {
        useStore.getState().open();
      });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  //#endregion Store Subscription
});
