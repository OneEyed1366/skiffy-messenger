// apps/v2/src/stores/ui/useModalsStore.spec.ts

import { act } from "@testing-library/react-native";

import { createStore } from "../setup";
import type { IModalType, IModalsState } from "./useModalsStore";

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
function createModalsStore() {
  return createStore<IModalsState>(
    (set, get) => ({
      stack: [],

      openModal: (type: IModalType, props?: Record<string, unknown>) =>
        set((state) => ({
          stack: [...state.stack, { type, props }],
        })),

      closeModal: () =>
        set((state) => ({
          stack: state.stack.slice(0, -1),
        })),

      closeAllModals: () => set({ stack: [] }),

      isModalOpen: (type: IModalType) =>
        get().stack.some((modal) => modal.type === type),

      getCurrentModal: () => {
        const { stack } = get();
        return stack.length > 0 ? stack[stack.length - 1] : null;
      },
    }),
    { name: "modals-test" },
  );
}

//#endregion Test Setup

describe("useModalsStore", () => {
  //#region Initial State

  describe("initial state", () => {
    it("has empty stack initially", () => {
      const useStore = createModalsStore();
      const state = useStore.getState();

      expect(state.stack).toEqual([]);
    });

    it("getCurrentModal returns null when stack is empty", () => {
      const useStore = createModalsStore();
      const state = useStore.getState();

      expect(state.getCurrentModal()).toBeNull();
    });

    it("isModalOpen returns false for any type when stack is empty", () => {
      const useStore = createModalsStore();
      const state = useStore.getState();

      expect(state.isModalOpen("create_channel")).toBe(false);
      expect(state.isModalOpen("user_settings")).toBe(false);
      expect(state.isModalOpen("confirm")).toBe(false);
    });
  });

  //#endregion Initial State

  //#region openModal Action

  describe("openModal", () => {
    it("adds modal to stack", () => {
      const useStore = createModalsStore();

      act(() => {
        useStore.getState().openModal("create_channel");
      });

      const state = useStore.getState();
      expect(state.stack).toHaveLength(1);
      expect(state.stack[0].type).toBe("create_channel");
    });

    it("adds modal with props", () => {
      const useStore = createModalsStore();
      const props = { channelId: "123", name: "general" };

      act(() => {
        useStore.getState().openModal("edit_channel", props);
      });

      const state = useStore.getState();
      expect(state.stack[0].props).toEqual(props);
    });

    it("stacks multiple modals in order", () => {
      const useStore = createModalsStore();

      act(() => {
        useStore.getState().openModal("create_channel");
        useStore.getState().openModal("confirm", { message: "Are you sure?" });
      });

      const state = useStore.getState();
      expect(state.stack).toHaveLength(2);
      expect(state.stack[0].type).toBe("create_channel");
      expect(state.stack[1].type).toBe("confirm");
    });

    it("allows opening same modal type multiple times", () => {
      const useStore = createModalsStore();

      act(() => {
        useStore.getState().openModal("confirm", { id: 1 });
        useStore.getState().openModal("confirm", { id: 2 });
      });

      const state = useStore.getState();
      expect(state.stack).toHaveLength(2);
      expect(state.stack[0].props).toEqual({ id: 1 });
      expect(state.stack[1].props).toEqual({ id: 2 });
    });

    it("handles undefined props", () => {
      const useStore = createModalsStore();

      act(() => {
        useStore.getState().openModal("user_settings");
      });

      const state = useStore.getState();
      expect(state.stack[0].props).toBeUndefined();
    });
  });

  //#endregion openModal Action

  //#region closeModal Action

  describe("closeModal", () => {
    it("removes top modal from stack", () => {
      const useStore = createModalsStore();

      act(() => {
        useStore.getState().openModal("create_channel");
        useStore.getState().openModal("confirm");
      });

      act(() => {
        useStore.getState().closeModal();
      });

      const state = useStore.getState();
      expect(state.stack).toHaveLength(1);
      expect(state.stack[0].type).toBe("create_channel");
    });

    it("results in empty stack when closing last modal", () => {
      const useStore = createModalsStore();

      act(() => {
        useStore.getState().openModal("create_channel");
      });

      act(() => {
        useStore.getState().closeModal();
      });

      const state = useStore.getState();
      expect(state.stack).toHaveLength(0);
    });

    it("handles closing when stack is already empty", () => {
      const useStore = createModalsStore();

      act(() => {
        useStore.getState().closeModal();
      });

      const state = useStore.getState();
      expect(state.stack).toHaveLength(0);
    });

    it("preserves earlier modals when closing", () => {
      const useStore = createModalsStore();
      const props1 = { id: "first" };
      const props2 = { id: "second" };

      act(() => {
        useStore.getState().openModal("create_channel", props1);
        useStore.getState().openModal("edit_channel", props2);
        useStore.getState().openModal("confirm");
      });

      act(() => {
        useStore.getState().closeModal();
      });

      const state = useStore.getState();
      expect(state.stack).toHaveLength(2);
      expect(state.stack[0]).toEqual({ type: "create_channel", props: props1 });
      expect(state.stack[1]).toEqual({ type: "edit_channel", props: props2 });
    });
  });

  //#endregion closeModal Action

  //#region closeAllModals Action

  describe("closeAllModals", () => {
    it("clears entire stack", () => {
      const useStore = createModalsStore();

      act(() => {
        useStore.getState().openModal("create_channel");
        useStore.getState().openModal("confirm");
        useStore.getState().openModal("user_settings");
      });

      act(() => {
        useStore.getState().closeAllModals();
      });

      const state = useStore.getState();
      expect(state.stack).toHaveLength(0);
    });

    it("handles empty stack", () => {
      const useStore = createModalsStore();

      act(() => {
        useStore.getState().closeAllModals();
      });

      const state = useStore.getState();
      expect(state.stack).toHaveLength(0);
    });
  });

  //#endregion closeAllModals Action

  //#region isModalOpen Selector

  describe("isModalOpen", () => {
    it("returns true when modal type is in stack", () => {
      const useStore = createModalsStore();

      act(() => {
        useStore.getState().openModal("create_channel");
      });

      expect(useStore.getState().isModalOpen("create_channel")).toBe(true);
    });

    it("returns false when modal type is not in stack", () => {
      const useStore = createModalsStore();

      act(() => {
        useStore.getState().openModal("create_channel");
      });

      expect(useStore.getState().isModalOpen("user_settings")).toBe(false);
    });

    it("returns true when modal type appears anywhere in stack", () => {
      const useStore = createModalsStore();

      act(() => {
        useStore.getState().openModal("create_channel");
        useStore.getState().openModal("confirm");
        useStore.getState().openModal("user_settings");
      });

      // First modal should still be detectable
      expect(useStore.getState().isModalOpen("create_channel")).toBe(true);
    });

    it("returns false after modal is closed", () => {
      const useStore = createModalsStore();

      act(() => {
        useStore.getState().openModal("create_channel");
      });

      expect(useStore.getState().isModalOpen("create_channel")).toBe(true);

      act(() => {
        useStore.getState().closeModal();
      });

      expect(useStore.getState().isModalOpen("create_channel")).toBe(false);
    });
  });

  //#endregion isModalOpen Selector

  //#region getCurrentModal Selector

  describe("getCurrentModal", () => {
    it("returns top modal from stack", () => {
      const useStore = createModalsStore();
      const props = { message: "Confirm?" };

      act(() => {
        useStore.getState().openModal("create_channel");
        useStore.getState().openModal("confirm", props);
      });

      const current = useStore.getState().getCurrentModal();
      expect(current).toEqual({ type: "confirm", props });
    });

    it("returns null when stack is empty", () => {
      const useStore = createModalsStore();

      const current = useStore.getState().getCurrentModal();
      expect(current).toBeNull();
    });

    it("updates when modal is closed", () => {
      const useStore = createModalsStore();

      act(() => {
        useStore.getState().openModal("create_channel");
        useStore.getState().openModal("confirm");
      });

      expect(useStore.getState().getCurrentModal()?.type).toBe("confirm");

      act(() => {
        useStore.getState().closeModal();
      });

      expect(useStore.getState().getCurrentModal()?.type).toBe("create_channel");
    });

    it("returns null after closeAllModals", () => {
      const useStore = createModalsStore();

      act(() => {
        useStore.getState().openModal("create_channel");
        useStore.getState().openModal("confirm");
      });

      act(() => {
        useStore.getState().closeAllModals();
      });

      expect(useStore.getState().getCurrentModal()).toBeNull();
    });
  });

  //#endregion getCurrentModal Selector

  //#region Modal Types

  describe("modal types", () => {
    const modalTypes: IModalType[] = [
      "create_channel",
      "edit_channel",
      "delete_channel",
      "invite_members",
      "user_settings",
      "channel_info",
      "confirm",
      "custom",
    ];

    it.each(modalTypes)("supports %s modal type", (type) => {
      const useStore = createModalsStore();

      act(() => {
        useStore.getState().openModal(type);
      });

      expect(useStore.getState().isModalOpen(type)).toBe(true);
      expect(useStore.getState().getCurrentModal()?.type).toBe(type);
    });
  });

  //#endregion Modal Types

  //#region Integration Scenarios

  describe("integration scenarios", () => {
    it("handles complex modal flow: open -> open -> close -> open", () => {
      const useStore = createModalsStore();

      // Open channel creation
      act(() => {
        useStore.getState().openModal("create_channel", { teamId: "team-1" });
      });
      expect(useStore.getState().stack).toHaveLength(1);

      // Open confirmation on top
      act(() => {
        useStore.getState().openModal("confirm", { message: "Create?" });
      });
      expect(useStore.getState().stack).toHaveLength(2);
      expect(useStore.getState().getCurrentModal()?.type).toBe("confirm");

      // Close confirmation
      act(() => {
        useStore.getState().closeModal();
      });
      expect(useStore.getState().stack).toHaveLength(1);
      expect(useStore.getState().getCurrentModal()?.type).toBe("create_channel");

      // Open invite members
      act(() => {
        useStore.getState().openModal("invite_members");
      });
      expect(useStore.getState().stack).toHaveLength(2);
      expect(useStore.getState().getCurrentModal()?.type).toBe("invite_members");

      // Props from first modal should be preserved
      expect(useStore.getState().stack[0].props).toEqual({ teamId: "team-1" });
    });

    it("handles escape-all scenario (closeAllModals)", () => {
      const useStore = createModalsStore();

      // Stack up multiple modals
      act(() => {
        useStore.getState().openModal("user_settings");
        useStore.getState().openModal("channel_info", { channelId: "ch-1" });
        useStore.getState().openModal("confirm", { action: "leave" });
      });

      expect(useStore.getState().stack).toHaveLength(3);
      expect(useStore.getState().isModalOpen("user_settings")).toBe(true);
      expect(useStore.getState().isModalOpen("channel_info")).toBe(true);
      expect(useStore.getState().isModalOpen("confirm")).toBe(true);

      // User presses escape or navigates away
      act(() => {
        useStore.getState().closeAllModals();
      });

      expect(useStore.getState().stack).toHaveLength(0);
      expect(useStore.getState().isModalOpen("user_settings")).toBe(false);
      expect(useStore.getState().isModalOpen("channel_info")).toBe(false);
      expect(useStore.getState().isModalOpen("confirm")).toBe(false);
      expect(useStore.getState().getCurrentModal()).toBeNull();
    });
  });

  //#endregion Integration Scenarios

  //#region Store Subscription

  describe("store subscription", () => {
    it("notifies subscribers on modal open", () => {
      const useStore = createModalsStore();
      const listener = jest.fn();

      useStore.subscribe(listener);

      act(() => {
        useStore.getState().openModal("create_channel");
      });

      expect(listener).toHaveBeenCalled();
    });

    it("notifies subscribers on modal close", () => {
      const useStore = createModalsStore();
      const listener = jest.fn();

      act(() => {
        useStore.getState().openModal("create_channel");
      });

      useStore.subscribe(listener);

      act(() => {
        useStore.getState().closeModal();
      });

      expect(listener).toHaveBeenCalled();
    });

    it("allows unsubscribing", () => {
      const useStore = createModalsStore();
      const listener = jest.fn();

      const unsubscribe = useStore.subscribe(listener);
      unsubscribe();

      act(() => {
        useStore.getState().openModal("create_channel");
      });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  //#endregion Store Subscription
});
