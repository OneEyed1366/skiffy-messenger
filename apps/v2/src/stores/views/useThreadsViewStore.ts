// apps/v2/src/stores/views/useThreadsViewStore.ts

import { createStore } from "../setup";

//#region Types

type IThreadsFilter = "all" | "unread" | "following";

type IThreadsViewState = {
  filter: IThreadsFilter;
  selectedThreadId: string | null;
  isLoading: boolean;
  searchQuery: string;

  // Actions
  setFilter: (filter: IThreadsFilter) => void;
  selectThread: (threadId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
  clearSelection: () => void;
};

//#endregion Types

//#region Store

/**
 * Store for managing Threads view UI state.
 *
 * Handles filter selection, thread selection, loading state,
 * and search query for the Threads list view.
 *
 * @example
 * ```typescript
 * const filter = useThreadsViewStore((state) => state.filter);
 * const setFilter = useThreadsViewStore((state) => state.setFilter);
 *
 * // Switch to unread filter
 * setFilter("unread");
 *
 * // Select a thread
 * const selectThread = useThreadsViewStore((state) => state.selectThread);
 * selectThread("thread-123");
 * ```
 */
export const useThreadsViewStore = createStore<IThreadsViewState>(
  (set) => ({
    filter: "all",
    selectedThreadId: null,
    isLoading: false,
    searchQuery: "",

    setFilter: (filter) => set({ filter }),

    selectThread: (threadId) => set({ selectedThreadId: threadId }),

    setLoading: (loading) => set({ isLoading: loading }),

    setSearchQuery: (query) => set({ searchQuery: query }),

    clearSelection: () => set({ selectedThreadId: null }),
  }),
  { name: "threads-view" },
);

//#endregion Store

//#region Type Exports

export type { IThreadsFilter, IThreadsViewState };

//#endregion Type Exports
