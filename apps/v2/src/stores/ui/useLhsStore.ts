// apps/v2/src/stores/ui/useLhsStore.ts

import { createStore } from "../setup";

//#region Constants

const LHS_STORE_NAME = "lhs-store";
const DEFAULT_WIDTH = 240;

//#endregion Constants

//#region Types

type ILhsState = {
  isOpen: boolean;
  width: number;
  activeTeamId: string | null;
  activeChannelId: string | null;
  collapsedCategories: Set<string>;

  // Actions
  open: () => void;
  close: () => void;
  toggle: () => void;
  setWidth: (width: number) => void;
  setActiveTeam: (teamId: string) => void;
  setActiveChannel: (channelId: string) => void;
  toggleCategory: (categoryId: string) => void;
  expandCategory: (categoryId: string) => void;
  collapseCategory: (categoryId: string) => void;
};

//#endregion Types

//#region Store

export const useLhsStore = createStore<ILhsState>(
  (set) => ({
    isOpen: true,
    width: DEFAULT_WIDTH,
    activeTeamId: null,
    activeChannelId: null,
    collapsedCategories: new Set<string>(),

    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),

    setWidth: (width: number) => set({ width }),

    setActiveTeam: (teamId: string) => set({ activeTeamId: teamId }),

    setActiveChannel: (channelId: string) =>
      set({ activeChannelId: channelId }),

    toggleCategory: (categoryId: string) =>
      set((state) => {
        const next = new Set(state.collapsedCategories);
        if (next.has(categoryId)) {
          next.delete(categoryId);
        } else {
          next.add(categoryId);
        }
        return { collapsedCategories: next };
      }),

    expandCategory: (categoryId: string) =>
      set((state) => {
        if (!state.collapsedCategories.has(categoryId)) {
          return state;
        }
        const next = new Set(state.collapsedCategories);
        next.delete(categoryId);
        return { collapsedCategories: next };
      }),

    collapseCategory: (categoryId: string) =>
      set((state) => {
        if (state.collapsedCategories.has(categoryId)) {
          return state;
        }
        const next = new Set(state.collapsedCategories);
        next.add(categoryId);
        return { collapsedCategories: next };
      }),
  }),
  { name: LHS_STORE_NAME },
);

//#endregion Store

//#region Exports

export type { ILhsState };

//#endregion Exports
