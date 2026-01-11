// apps/v2/src/stores/views/useSearchStore.ts

import { createStore } from "../setup";

//#region Constants

const MAX_RECENT_SEARCHES = 10;

const INITIAL_FILTERS: ISearchFilters = {
  from: undefined,
  in: undefined,
  before: undefined,
  after: undefined,
  on: undefined,
};

//#endregion Constants

//#region Types

type ISearchFilters = {
  from?: string;
  in?: string;
  before?: string;
  after?: string;
  on?: string;
};

type ISearchFilterKey = keyof ISearchFilters;

type ISearchState = {
  query: string;
  isSearching: boolean;
  filters: ISearchFilters;
  recentSearches: string[];

  // Actions
  setQuery: (query: string) => void;
  setSearching: (searching: boolean) => void;
  setFilter: (key: ISearchFilterKey, value: string | undefined) => void;
  clearFilters: () => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  clear: () => void;
};

//#endregion Types

//#region Store

export const useSearchStore = createStore<ISearchState>(
  (set, get) => ({
    query: "",
    isSearching: false,
    filters: { ...INITIAL_FILTERS },
    recentSearches: [],

    setQuery: (query) => set({ query }),

    setSearching: (searching) => set({ isSearching: searching }),

    setFilter: (key, value) =>
      set((state) => ({
        filters: {
          ...state.filters,
          [key]: value,
        },
      })),

    clearFilters: () => set({ filters: { ...INITIAL_FILTERS } }),

    addRecentSearch: (query) => {
      const trimmed = query.trim();
      if (!trimmed) return;

      const { recentSearches } = get();
      const filtered = recentSearches.filter((s) => s !== trimmed);
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);

      set({ recentSearches: updated });
    },

    clearRecentSearches: () => set({ recentSearches: [] }),

    clear: () =>
      set({
        query: "",
        isSearching: false,
        filters: { ...INITIAL_FILTERS },
      }),
  }),
  { name: "search-store", persist: true },
);

//#endregion Store

//#region Exports

export type { ISearchState, ISearchFilters, ISearchFilterKey };

//#endregion Exports
