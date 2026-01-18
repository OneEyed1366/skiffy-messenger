// apps/v2/src/stores/views/useThreadsViewStore.spec.ts

import { act } from "@testing-library/react-native";

import { useThreadsViewStore, IThreadsFilter } from "./useThreadsViewStore";

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

describe("useThreadsViewStore", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    act(() => {
      useThreadsViewStore.setState({
        filter: "all",
        selectedThreadId: null,
        isLoading: false,
        searchQuery: "",
      });
    });
  });

  //#region Initial State

  describe("initial state", () => {
    it("has correct default values", () => {
      const state = useThreadsViewStore.getState();

      expect(state.filter).toBe("all");
      expect(state.selectedThreadId).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.searchQuery).toBe("");
    });
  });

  //#endregion Initial State

  //#region setFilter

  describe("setFilter", () => {
    it("updates filter to unread", () => {
      act(() => {
        useThreadsViewStore.getState().setFilter("unread");
      });

      expect(useThreadsViewStore.getState().filter).toBe("unread");
    });

    it("updates filter to following", () => {
      act(() => {
        useThreadsViewStore.getState().setFilter("following");
      });

      expect(useThreadsViewStore.getState().filter).toBe("following");
    });

    it("updates filter back to all", () => {
      act(() => {
        useThreadsViewStore.getState().setFilter("unread");
      });

      act(() => {
        useThreadsViewStore.getState().setFilter("all");
      });

      expect(useThreadsViewStore.getState().filter).toBe("all");
    });

    it("does not affect other state properties", () => {
      act(() => {
        useThreadsViewStore.setState({
          selectedThreadId: "thread-123",
          isLoading: true,
          searchQuery: "test",
        });
      });

      act(() => {
        useThreadsViewStore.getState().setFilter("unread");
      });

      const state = useThreadsViewStore.getState();
      expect(state.selectedThreadId).toBe("thread-123");
      expect(state.isLoading).toBe(true);
      expect(state.searchQuery).toBe("test");
    });
  });

  //#endregion setFilter

  //#region selectThread

  describe("selectThread", () => {
    it("selects a thread by id", () => {
      act(() => {
        useThreadsViewStore.getState().selectThread("thread-456");
      });

      expect(useThreadsViewStore.getState().selectedThreadId).toBe(
        "thread-456",
      );
    });

    it("can select null to deselect", () => {
      act(() => {
        useThreadsViewStore.getState().selectThread("thread-123");
      });

      act(() => {
        useThreadsViewStore.getState().selectThread(null);
      });

      expect(useThreadsViewStore.getState().selectedThreadId).toBeNull();
    });

    it("replaces previous selection", () => {
      act(() => {
        useThreadsViewStore.getState().selectThread("thread-1");
      });

      act(() => {
        useThreadsViewStore.getState().selectThread("thread-2");
      });

      expect(useThreadsViewStore.getState().selectedThreadId).toBe("thread-2");
    });

    it("does not affect other state properties", () => {
      act(() => {
        useThreadsViewStore.setState({
          filter: "unread",
          isLoading: true,
          searchQuery: "search",
        });
      });

      act(() => {
        useThreadsViewStore.getState().selectThread("thread-789");
      });

      const state = useThreadsViewStore.getState();
      expect(state.filter).toBe("unread");
      expect(state.isLoading).toBe(true);
      expect(state.searchQuery).toBe("search");
    });
  });

  //#endregion selectThread

  //#region setLoading

  describe("setLoading", () => {
    it("sets loading to true", () => {
      act(() => {
        useThreadsViewStore.getState().setLoading(true);
      });

      expect(useThreadsViewStore.getState().isLoading).toBe(true);
    });

    it("sets loading to false", () => {
      act(() => {
        useThreadsViewStore.getState().setLoading(true);
      });

      act(() => {
        useThreadsViewStore.getState().setLoading(false);
      });

      expect(useThreadsViewStore.getState().isLoading).toBe(false);
    });

    it("does not affect other state properties", () => {
      act(() => {
        useThreadsViewStore.setState({
          filter: "following",
          selectedThreadId: "thread-abc",
          searchQuery: "query",
        });
      });

      act(() => {
        useThreadsViewStore.getState().setLoading(true);
      });

      const state = useThreadsViewStore.getState();
      expect(state.filter).toBe("following");
      expect(state.selectedThreadId).toBe("thread-abc");
      expect(state.searchQuery).toBe("query");
    });
  });

  //#endregion setLoading

  //#region setSearchQuery

  describe("setSearchQuery", () => {
    it("sets search query", () => {
      act(() => {
        useThreadsViewStore.getState().setSearchQuery("hello world");
      });

      expect(useThreadsViewStore.getState().searchQuery).toBe("hello world");
    });

    it("clears search query with empty string", () => {
      act(() => {
        useThreadsViewStore.getState().setSearchQuery("test");
      });

      act(() => {
        useThreadsViewStore.getState().setSearchQuery("");
      });

      expect(useThreadsViewStore.getState().searchQuery).toBe("");
    });

    it("handles special characters", () => {
      const query = "test@#$%^&*()";

      act(() => {
        useThreadsViewStore.getState().setSearchQuery(query);
      });

      expect(useThreadsViewStore.getState().searchQuery).toBe(query);
    });

    it("handles unicode characters", () => {
      const query = "тест 测试 テスト";

      act(() => {
        useThreadsViewStore.getState().setSearchQuery(query);
      });

      expect(useThreadsViewStore.getState().searchQuery).toBe(query);
    });

    it("does not affect other state properties", () => {
      act(() => {
        useThreadsViewStore.setState({
          filter: "unread",
          selectedThreadId: "thread-xyz",
          isLoading: true,
        });
      });

      act(() => {
        useThreadsViewStore.getState().setSearchQuery("new query");
      });

      const state = useThreadsViewStore.getState();
      expect(state.filter).toBe("unread");
      expect(state.selectedThreadId).toBe("thread-xyz");
      expect(state.isLoading).toBe(true);
    });
  });

  //#endregion setSearchQuery

  //#region clearSelection

  describe("clearSelection", () => {
    it("clears selected thread id", () => {
      act(() => {
        useThreadsViewStore.getState().selectThread("thread-to-clear");
      });

      act(() => {
        useThreadsViewStore.getState().clearSelection();
      });

      expect(useThreadsViewStore.getState().selectedThreadId).toBeNull();
    });

    it("is idempotent when no selection", () => {
      act(() => {
        useThreadsViewStore.getState().clearSelection();
      });

      expect(useThreadsViewStore.getState().selectedThreadId).toBeNull();
    });

    it("does not affect other state properties", () => {
      act(() => {
        useThreadsViewStore.setState({
          filter: "following",
          selectedThreadId: "thread-123",
          isLoading: true,
          searchQuery: "preserved",
        });
      });

      act(() => {
        useThreadsViewStore.getState().clearSelection();
      });

      const state = useThreadsViewStore.getState();
      expect(state.filter).toBe("following");
      expect(state.isLoading).toBe(true);
      expect(state.searchQuery).toBe("preserved");
    });
  });

  //#endregion clearSelection

  //#region Store Subscription

  describe("store subscription", () => {
    it("notifies subscribers on state change", () => {
      const listener = jest.fn();
      const unsubscribe = useThreadsViewStore.subscribe(listener);

      act(() => {
        useThreadsViewStore.getState().setFilter("unread");
      });

      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
    });

    it("stops notifying after unsubscribe", () => {
      const listener = jest.fn();
      const unsubscribe = useThreadsViewStore.subscribe(listener);

      act(() => {
        useThreadsViewStore.getState().setFilter("unread");
      });

      unsubscribe();

      act(() => {
        useThreadsViewStore.getState().setFilter("following");
      });

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  //#endregion Store Subscription

  //#region Combined Actions

  describe("combined actions", () => {
    it("handles multiple state changes in sequence", () => {
      act(() => {
        useThreadsViewStore.getState().setFilter("unread");
        useThreadsViewStore.getState().selectThread("thread-multi");
        useThreadsViewStore.getState().setSearchQuery("combined test");
        useThreadsViewStore.getState().setLoading(true);
      });

      const state = useThreadsViewStore.getState();

      expect(state.filter).toBe("unread");
      expect(state.selectedThreadId).toBe("thread-multi");
      expect(state.searchQuery).toBe("combined test");
      expect(state.isLoading).toBe(true);
    });

    it("clearSelection followed by selectThread works correctly", () => {
      act(() => {
        useThreadsViewStore.getState().selectThread("thread-first");
      });

      act(() => {
        useThreadsViewStore.getState().clearSelection();
        useThreadsViewStore.getState().selectThread("thread-second");
      });

      expect(useThreadsViewStore.getState().selectedThreadId).toBe(
        "thread-second",
      );
    });
  });

  //#endregion Combined Actions

  //#region Type Safety

  describe("type safety", () => {
    it("filter accepts only valid values", () => {
      const validFilters: IThreadsFilter[] = ["all", "unread", "following"];

      validFilters.forEach((filter) => {
        act(() => {
          useThreadsViewStore.getState().setFilter(filter);
        });

        expect(useThreadsViewStore.getState().filter).toBe(filter);
      });
    });
  });

  //#endregion Type Safety
});
