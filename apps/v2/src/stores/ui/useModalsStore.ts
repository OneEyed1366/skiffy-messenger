// apps/v2/src/stores/ui/useModalsStore.ts

import { createStore } from "../setup";

//#region Types

type IModalType =
  | "create_channel"
  | "edit_channel"
  | "delete_channel"
  | "invite_members"
  | "user_settings"
  | "channel_info"
  | "confirm"
  | "custom";

type IModalData = {
  type: IModalType;
  props?: Record<string, unknown>;
};

type IModalsState = {
  stack: IModalData[];

  // Actions
  openModal: (type: IModalType, props?: Record<string, unknown>) => void;
  closeModal: () => void;
  closeAllModals: () => void;

  // Selectors
  isModalOpen: (type: IModalType) => boolean;
  getCurrentModal: () => IModalData | null;
};

//#endregion Types

//#region Store

export const useModalsStore = createStore<IModalsState>(
  (set, get) => ({
    stack: [],

    openModal: (type, props) =>
      set((state) => ({
        stack: [...state.stack, { type, props }],
      })),

    closeModal: () =>
      set((state) => ({
        stack: state.stack.slice(0, -1),
      })),

    closeAllModals: () => set({ stack: [] }),

    isModalOpen: (type) => get().stack.some((modal) => modal.type === type),

    getCurrentModal: () => {
      const { stack } = get();
      return stack.length > 0 ? stack[stack.length - 1] : null;
    },
  }),
  { name: "modals" },
);

//#endregion Store

//#region Exports

export type { IModalType, IModalData, IModalsState };

//#endregion Exports
