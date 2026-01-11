// apps/v2/src/stores/setup.spec.ts

import { act } from "@testing-library/react-native";

import { createStore } from "./setup";

// Mock Platform
jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
  },
}));

// Mock devtools and persist middleware to track their usage
const mockDevtools = jest.fn<unknown, [unknown, unknown?]>();
const mockPersist = jest.fn<unknown, [unknown, unknown?]>();
const mockCreateJSONStorage = jest.fn<
  { getItem: jest.Mock; setItem: jest.Mock; removeItem: jest.Mock },
  [unknown?]
>();

mockCreateJSONStorage.mockReturnValue({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
});

jest.mock("zustand/middleware", () => ({
  devtools: (fn: unknown, options?: unknown) => {
    mockDevtools(fn, options);
    return fn;
  },
  persist: (fn: unknown, options?: unknown) => {
    mockPersist(fn, options);
    return fn;
  },
  createJSONStorage: (getStorageFn?: unknown) => {
    return mockCreateJSONStorage(getStorageFn);
  },
}));

//#region Test Types

type ITestState = {
  count: number;
  name: string;
  increment: () => void;
  setName: (name: string) => void;
};

//#endregion Test Types

describe("createStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //#region Basic Store Creation

  describe("basic store creation", () => {
    it("returns a valid Zustand hook", () => {
      const useStore = createStore<ITestState>(
        (set) => ({
          count: 0,
          name: "test",
          increment: () => set((state) => ({ count: state.count + 1 })),
          setName: (name) => set({ name }),
        }),
        { name: "test-store" },
      );

      expect(typeof useStore).toBe("function");
      expect(typeof useStore.getState).toBe("function");
      expect(typeof useStore.setState).toBe("function");
      expect(typeof useStore.subscribe).toBe("function");
    });

    it("initializes store with correct initial state", () => {
      const useStore = createStore<ITestState>(
        (set) => ({
          count: 10,
          name: "initial",
          increment: () => set((state) => ({ count: state.count + 1 })),
          setName: (name) => set({ name }),
        }),
        { name: "test-store" },
      );

      const state = useStore.getState();

      expect(state.count).toBe(10);
      expect(state.name).toBe("initial");
    });
  });

  //#endregion Basic Store Creation

  //#region State Updates

  describe("state updates", () => {
    it("can read and update state", () => {
      const useStore = createStore<ITestState>(
        (set) => ({
          count: 0,
          name: "test",
          increment: () => set((state) => ({ count: state.count + 1 })),
          setName: (name) => set({ name }),
        }),
        { name: "counter-store" },
      );

      expect(useStore.getState().count).toBe(0);

      act(() => {
        useStore.getState().increment();
      });

      expect(useStore.getState().count).toBe(1);

      act(() => {
        useStore.getState().increment();
        useStore.getState().increment();
      });

      expect(useStore.getState().count).toBe(3);
    });

    it("can update multiple state properties", () => {
      const useStore = createStore<ITestState>(
        (set) => ({
          count: 0,
          name: "test",
          increment: () => set((state) => ({ count: state.count + 1 })),
          setName: (name) => set({ name }),
        }),
        { name: "multi-update-store" },
      );

      act(() => {
        useStore.getState().setName("updated");
        useStore.getState().increment();
      });

      const state = useStore.getState();
      expect(state.name).toBe("updated");
      expect(state.count).toBe(1);
    });

    it("supports direct setState calls", () => {
      const useStore = createStore<ITestState>(
        (set) => ({
          count: 0,
          name: "test",
          increment: () => set((state) => ({ count: state.count + 1 })),
          setName: (name) => set({ name }),
        }),
        { name: "set-state-store" },
      );

      act(() => {
        useStore.setState({ count: 100 });
      });

      expect(useStore.getState().count).toBe(100);
    });
  });

  //#endregion State Updates

  //#region Devtools Middleware

  describe("devtools middleware", () => {
    it("is always enabled", () => {
      createStore<ITestState>(
        (set) => ({
          count: 0,
          name: "test",
          increment: () => set((state) => ({ count: state.count + 1 })),
          setName: (name) => set({ name }),
        }),
        { name: "devtools-test" },
      );

      expect(mockDevtools).toHaveBeenCalled();
    });

    it("passes store name to devtools", () => {
      createStore<ITestState>(
        (set) => ({
          count: 0,
          name: "test",
          increment: () => set((state) => ({ count: state.count + 1 })),
          setName: (name) => set({ name }),
        }),
        { name: "my-custom-store" },
      );

      expect(mockDevtools).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ name: "my-custom-store" }),
      );
    });

    it("enables devtools even without persist option", () => {
      mockDevtools.mockClear();

      createStore<ITestState>(
        (set) => ({
          count: 0,
          name: "test",
          increment: () => set((state) => ({ count: state.count + 1 })),
          setName: (name) => set({ name }),
        }),
        { name: "no-persist-store", persist: false },
      );

      expect(mockDevtools).toHaveBeenCalled();
      expect(mockPersist).not.toHaveBeenCalled();
    });
  });

  //#endregion Devtools Middleware

  //#region Persist Middleware

  describe("persist middleware", () => {
    it("is enabled when persist option is true", () => {
      createStore<ITestState>(
        (set) => ({
          count: 0,
          name: "test",
          increment: () => set((state) => ({ count: state.count + 1 })),
          setName: (name) => set({ name }),
        }),
        { name: "persist-store", persist: true },
      );

      expect(mockPersist).toHaveBeenCalled();
    });

    it("is not enabled when persist option is false", () => {
      mockPersist.mockClear();

      createStore<ITestState>(
        (set) => ({
          count: 0,
          name: "test",
          increment: () => set((state) => ({ count: state.count + 1 })),
          setName: (name) => set({ name }),
        }),
        { name: "no-persist-store", persist: false },
      );

      expect(mockPersist).not.toHaveBeenCalled();
    });

    it("is not enabled by default", () => {
      mockPersist.mockClear();

      createStore<ITestState>(
        (set) => ({
          count: 0,
          name: "test",
          increment: () => set((state) => ({ count: state.count + 1 })),
          setName: (name) => set({ name }),
        }),
        { name: "default-store" },
      );

      expect(mockPersist).not.toHaveBeenCalled();
    });

    it("passes store name to persist middleware", () => {
      createStore<ITestState>(
        (set) => ({
          count: 0,
          name: "test",
          increment: () => set((state) => ({ count: state.count + 1 })),
          setName: (name) => set({ name }),
        }),
        { name: "named-persist-store", persist: true },
      );

      expect(mockPersist).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ name: "named-persist-store" }),
      );
    });
  });

  //#endregion Persist Middleware

  //#region Store Subscription

  describe("store subscription", () => {
    it("supports subscribe for state changes", () => {
      const useStore = createStore<ITestState>(
        (set) => ({
          count: 0,
          name: "test",
          increment: () => set((state) => ({ count: state.count + 1 })),
          setName: (name) => set({ name }),
        }),
        { name: "subscription-store" },
      );

      const listener = jest.fn();
      const unsubscribe = useStore.subscribe(listener);

      act(() => {
        useStore.getState().increment();
      });

      expect(listener).toHaveBeenCalled();

      unsubscribe();

      act(() => {
        useStore.getState().increment();
      });

      // Listener should only have been called once (before unsubscribe)
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  //#endregion Store Subscription
});
