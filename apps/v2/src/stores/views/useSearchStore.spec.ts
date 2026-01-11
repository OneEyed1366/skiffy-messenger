// apps/v2/src/stores/views/useSearchStore.spec.ts

import { act } from "@testing-library/react-native";

import { useSearchStore } from "./useSearchStore";

// Mock Platform
jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
  },
}));

// Mock devtools and persist middleware
jest.mock("zustand/middleware", () => ({
  devtools: (fn: unknown) => fn,
  persist: (fn: unknown) => fn,
  createJSONStorage: () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }),
}));

describe("useSearchStore", () => {
  beforeEach(() => {
    act(() => {
      useSearchStore.setState({
        query: "",
        isSearching: false,
        filters: {
          from: undefined,
          in: undefined,
          before: undefined,
          after: undefined,
          on: undefined,
        },
        recentSearches: [],
      });
    });
  });

  //#region Initial State

  describe("initial state", () => {
    it("has empty query by default", () => {
      expect(useSearchStore.getState().query).toBe("");
    });

    it("has isSearching false by default", () => {
      expect(useSearchStore.getState().isSearching).toBe(false);
    });

    it("has empty filters by default", () => {
      const { filters } = useSearchStore.getState();

      expect(filters.from).toBeUndefined();
      expect(filters.in).toBeUndefined();
      expect(filters.before).toBeUndefined();
      expect(filters.after).toBeUndefined();
      expect(filters.on).toBeUndefined();
    });

    it("has empty recent searches by default", () => {
      expect(useSearchStore.getState().recentSearches).toEqual([]);
    });
  });

  //#endregion Initial State

  //#region Query Actions

  describe("setQuery", () => {
    it("updates query state", () => {
      act(() => {
        useSearchStore.getState().setQuery("test query");
      });

      expect(useSearchStore.getState().query).toBe("test query");
    });

    it("can set empty query", () => {
      act(() => {
        useSearchStore.getState().setQuery("something");
        useSearchStore.getState().setQuery("");
      });

      expect(useSearchStore.getState().query).toBe("");
    });

    it("preserves special characters", () => {
      act(() => {
        useSearchStore.getState().setQuery("from:user in:channel");
      });

      expect(useSearchStore.getState().query).toBe("from:user in:channel");
    });
  });

  //#endregion Query Actions

  //#region Searching State

  describe("setSearching", () => {
    it("sets isSearching to true", () => {
      act(() => {
        useSearchStore.getState().setSearching(true);
      });

      expect(useSearchStore.getState().isSearching).toBe(true);
    });

    it("sets isSearching to false", () => {
      act(() => {
        useSearchStore.getState().setSearching(true);
        useSearchStore.getState().setSearching(false);
      });

      expect(useSearchStore.getState().isSearching).toBe(false);
    });
  });

  //#endregion Searching State

  //#region Filter Actions

  describe("setFilter", () => {
    it("sets from filter", () => {
      act(() => {
        useSearchStore.getState().setFilter("from", "john.doe");
      });

      expect(useSearchStore.getState().filters.from).toBe("john.doe");
    });

    it("sets in filter", () => {
      act(() => {
        useSearchStore.getState().setFilter("in", "general");
      });

      expect(useSearchStore.getState().filters.in).toBe("general");
    });

    it("sets before filter", () => {
      act(() => {
        useSearchStore.getState().setFilter("before", "2024-01-01");
      });

      expect(useSearchStore.getState().filters.before).toBe("2024-01-01");
    });

    it("sets after filter", () => {
      act(() => {
        useSearchStore.getState().setFilter("after", "2024-01-01");
      });

      expect(useSearchStore.getState().filters.after).toBe("2024-01-01");
    });

    it("sets on filter", () => {
      act(() => {
        useSearchStore.getState().setFilter("on", "2024-01-15");
      });

      expect(useSearchStore.getState().filters.on).toBe("2024-01-15");
    });

    it("can clear individual filter with undefined", () => {
      act(() => {
        useSearchStore.getState().setFilter("from", "user");
        useSearchStore.getState().setFilter("from", undefined);
      });

      expect(useSearchStore.getState().filters.from).toBeUndefined();
    });

    it("preserves other filters when setting one", () => {
      act(() => {
        useSearchStore.getState().setFilter("from", "user1");
        useSearchStore.getState().setFilter("in", "channel1");
      });

      const { filters } = useSearchStore.getState();
      expect(filters.from).toBe("user1");
      expect(filters.in).toBe("channel1");
    });
  });

  describe("clearFilters", () => {
    it("clears all filters", () => {
      act(() => {
        useSearchStore.getState().setFilter("from", "user");
        useSearchStore.getState().setFilter("in", "channel");
        useSearchStore.getState().setFilter("before", "2024-01-01");
        useSearchStore.getState().clearFilters();
      });

      const { filters } = useSearchStore.getState();
      expect(filters.from).toBeUndefined();
      expect(filters.in).toBeUndefined();
      expect(filters.before).toBeUndefined();
      expect(filters.after).toBeUndefined();
      expect(filters.on).toBeUndefined();
    });

    it("does not affect query", () => {
      act(() => {
        useSearchStore.getState().setQuery("my query");
        useSearchStore.getState().setFilter("from", "user");
        useSearchStore.getState().clearFilters();
      });

      expect(useSearchStore.getState().query).toBe("my query");
    });

    it("does not affect recent searches", () => {
      act(() => {
        useSearchStore.getState().addRecentSearch("search1");
        useSearchStore.getState().setFilter("from", "user");
        useSearchStore.getState().clearFilters();
      });

      expect(useSearchStore.getState().recentSearches).toEqual(["search1"]);
    });
  });

  //#endregion Filter Actions

  //#region Recent Searches

  describe("addRecentSearch", () => {
    it("adds search to recent searches", () => {
      act(() => {
        useSearchStore.getState().addRecentSearch("test query");
      });

      expect(useSearchStore.getState().recentSearches).toContain("test query");
    });

    it("adds most recent search at the beginning", () => {
      act(() => {
        useSearchStore.getState().addRecentSearch("first");
        useSearchStore.getState().addRecentSearch("second");
      });

      const { recentSearches } = useSearchStore.getState();
      expect(recentSearches[0]).toBe("second");
      expect(recentSearches[1]).toBe("first");
    });

    it("removes duplicate searches and moves to front", () => {
      act(() => {
        useSearchStore.getState().addRecentSearch("first");
        useSearchStore.getState().addRecentSearch("second");
        useSearchStore.getState().addRecentSearch("first");
      });

      const { recentSearches } = useSearchStore.getState();
      expect(recentSearches).toEqual(["first", "second"]);
    });

    it("trims whitespace from search query", () => {
      act(() => {
        useSearchStore.getState().addRecentSearch("  trimmed  ");
      });

      expect(useSearchStore.getState().recentSearches).toContain("trimmed");
    });

    it("ignores empty or whitespace-only searches", () => {
      act(() => {
        useSearchStore.getState().addRecentSearch("");
        useSearchStore.getState().addRecentSearch("   ");
      });

      expect(useSearchStore.getState().recentSearches).toEqual([]);
    });

    it("limits recent searches to 10 items", () => {
      act(() => {
        for (let i = 0; i < 15; i++) {
          useSearchStore.getState().addRecentSearch(`search${i}`);
        }
      });

      const { recentSearches } = useSearchStore.getState();
      expect(recentSearches).toHaveLength(10);
      expect(recentSearches[0]).toBe("search14");
      expect(recentSearches[9]).toBe("search5");
    });
  });

  describe("clearRecentSearches", () => {
    it("clears all recent searches", () => {
      act(() => {
        useSearchStore.getState().addRecentSearch("search1");
        useSearchStore.getState().addRecentSearch("search2");
        useSearchStore.getState().clearRecentSearches();
      });

      expect(useSearchStore.getState().recentSearches).toEqual([]);
    });

    it("does not affect query or filters", () => {
      act(() => {
        useSearchStore.getState().setQuery("my query");
        useSearchStore.getState().setFilter("from", "user");
        useSearchStore.getState().addRecentSearch("search1");
        useSearchStore.getState().clearRecentSearches();
      });

      expect(useSearchStore.getState().query).toBe("my query");
      expect(useSearchStore.getState().filters.from).toBe("user");
    });
  });

  //#endregion Recent Searches

  //#region Clear Action

  describe("clear", () => {
    it("resets query to empty string", () => {
      act(() => {
        useSearchStore.getState().setQuery("test");
        useSearchStore.getState().clear();
      });

      expect(useSearchStore.getState().query).toBe("");
    });

    it("resets isSearching to false", () => {
      act(() => {
        useSearchStore.getState().setSearching(true);
        useSearchStore.getState().clear();
      });

      expect(useSearchStore.getState().isSearching).toBe(false);
    });

    it("clears all filters", () => {
      act(() => {
        useSearchStore.getState().setFilter("from", "user");
        useSearchStore.getState().setFilter("in", "channel");
        useSearchStore.getState().clear();
      });

      const { filters } = useSearchStore.getState();
      expect(filters.from).toBeUndefined();
      expect(filters.in).toBeUndefined();
    });

    it("preserves recent searches", () => {
      act(() => {
        useSearchStore.getState().addRecentSearch("saved search");
        useSearchStore.getState().setQuery("current query");
        useSearchStore.getState().clear();
      });

      expect(useSearchStore.getState().recentSearches).toEqual([
        "saved search",
      ]);
    });
  });

  //#endregion Clear Action

  //#region Store Integration

  describe("store integration", () => {
    it("is a valid Zustand store", () => {
      expect(typeof useSearchStore).toBe("function");
      expect(typeof useSearchStore.getState).toBe("function");
      expect(typeof useSearchStore.setState).toBe("function");
      expect(typeof useSearchStore.subscribe).toBe("function");
    });

    it("supports subscription to state changes", () => {
      const listener = jest.fn();
      const unsubscribe = useSearchStore.subscribe(listener);

      act(() => {
        useSearchStore.getState().setQuery("new query");
      });

      expect(listener).toHaveBeenCalled();
      unsubscribe();
    });

    it("can combine multiple actions in sequence", () => {
      act(() => {
        const store = useSearchStore.getState();
        store.setQuery("my search");
        store.setFilter("from", "alice");
        store.setFilter("in", "general");
        store.setSearching(true);
      });

      const state = useSearchStore.getState();
      expect(state.query).toBe("my search");
      expect(state.filters.from).toBe("alice");
      expect(state.filters.in).toBe("general");
      expect(state.isSearching).toBe(true);
    });
  });

  //#endregion Store Integration
});
