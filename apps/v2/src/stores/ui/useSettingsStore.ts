// apps/v2/src/stores/ui/useSettingsStore.ts

import { createStore } from "../setup";

//#region Types

type ISettingsTab =
  | "general"
  | "notifications"
  | "display"
  | "sidebar"
  | "advanced";

type ISettingsState = {
  isOpen: boolean;
  activeTab: ISettingsTab;
  hasUnsavedChanges: boolean;

  // Actions
  open: (tab?: ISettingsTab) => void;
  close: () => void;
  setTab: (tab: ISettingsTab) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
};

//#endregion Types

//#region Store

export const useSettingsStore = createStore<ISettingsState>(
  (set) => ({
    isOpen: false,
    activeTab: "general",
    hasUnsavedChanges: false,

    open: (tab) =>
      set({
        isOpen: true,
        activeTab: tab ?? "general",
      }),

    close: () =>
      set({
        isOpen: false,
        hasUnsavedChanges: false,
      }),

    setTab: (tab) => set({ activeTab: tab }),

    setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),
  }),
  { name: "settings" },
);

//#endregion Store

//#region Exports

export type { ISettingsTab, ISettingsState };

//#endregion Exports
