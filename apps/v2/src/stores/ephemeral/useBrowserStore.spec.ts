// apps/v2/src/stores/ephemeral/useBrowserStore.spec.ts

import { act } from "@testing-library/react-native";

import { useBrowserStore } from "./useBrowserStore";

// Mock Platform
jest.mock("react-native", () => ({
  Platform: {
    OS: "web",
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

describe("useBrowserStore", () => {
  beforeEach(() => {
    act(() => {
      useBrowserStore.setState({
        windowFocused: true,
        windowWidth: 0,
        windowHeight: 0,
        isOnline: true,
        isMobile: false,
      });
    });
  });

  //#region Initial State

  describe("initial state", () => {
    it("has windowFocused true by default", () => {
      const state = useBrowserStore.getState();
      expect(state.windowFocused).toBe(true);
    });

    it("has windowWidth 0 by default", () => {
      const state = useBrowserStore.getState();
      expect(state.windowWidth).toBe(0);
    });

    it("has windowHeight 0 by default", () => {
      const state = useBrowserStore.getState();
      expect(state.windowHeight).toBe(0);
    });

    it("has isOnline true by default", () => {
      const state = useBrowserStore.getState();
      expect(state.isOnline).toBe(true);
    });

    it("has isMobile false by default", () => {
      const state = useBrowserStore.getState();
      expect(state.isMobile).toBe(false);
    });
  });

  //#endregion Initial State

  //#region setWindowFocused

  describe("setWindowFocused", () => {
    it("sets windowFocused to false", () => {
      act(() => {
        useBrowserStore.getState().setWindowFocused(false);
      });

      const state = useBrowserStore.getState();
      expect(state.windowFocused).toBe(false);
    });

    it("sets windowFocused to true", () => {
      act(() => {
        useBrowserStore.getState().setWindowFocused(false);
      });

      act(() => {
        useBrowserStore.getState().setWindowFocused(true);
      });

      const state = useBrowserStore.getState();
      expect(state.windowFocused).toBe(true);
    });

    it("does not affect other state properties", () => {
      act(() => {
        useBrowserStore.setState({
          windowWidth: 1024,
          windowHeight: 768,
          isOnline: true,
          isMobile: false,
        });
      });

      act(() => {
        useBrowserStore.getState().setWindowFocused(false);
      });

      const state = useBrowserStore.getState();
      expect(state.windowWidth).toBe(1024);
      expect(state.windowHeight).toBe(768);
      expect(state.isOnline).toBe(true);
      expect(state.isMobile).toBe(false);
    });
  });

  //#endregion setWindowFocused

  //#region setWindowDimensions

  describe("setWindowDimensions", () => {
    it("sets window width and height", () => {
      act(() => {
        useBrowserStore.getState().setWindowDimensions(1920, 1080);
      });

      const state = useBrowserStore.getState();
      expect(state.windowWidth).toBe(1920);
      expect(state.windowHeight).toBe(1080);
    });

    it("updates dimensions on resize", () => {
      act(() => {
        useBrowserStore.getState().setWindowDimensions(1920, 1080);
      });

      act(() => {
        useBrowserStore.getState().setWindowDimensions(1024, 768);
      });

      const state = useBrowserStore.getState();
      expect(state.windowWidth).toBe(1024);
      expect(state.windowHeight).toBe(768);
    });

    it("handles zero dimensions", () => {
      act(() => {
        useBrowserStore.getState().setWindowDimensions(1920, 1080);
      });

      act(() => {
        useBrowserStore.getState().setWindowDimensions(0, 0);
      });

      const state = useBrowserStore.getState();
      expect(state.windowWidth).toBe(0);
      expect(state.windowHeight).toBe(0);
    });

    it("does not affect other state properties", () => {
      act(() => {
        useBrowserStore.setState({
          windowFocused: false,
          isOnline: false,
          isMobile: true,
        });
      });

      act(() => {
        useBrowserStore.getState().setWindowDimensions(1920, 1080);
      });

      const state = useBrowserStore.getState();
      expect(state.windowFocused).toBe(false);
      expect(state.isOnline).toBe(false);
      expect(state.isMobile).toBe(true);
    });
  });

  //#endregion setWindowDimensions

  //#region setOnline

  describe("setOnline", () => {
    it("sets isOnline to false", () => {
      act(() => {
        useBrowserStore.getState().setOnline(false);
      });

      const state = useBrowserStore.getState();
      expect(state.isOnline).toBe(false);
    });

    it("sets isOnline to true", () => {
      act(() => {
        useBrowserStore.getState().setOnline(false);
      });

      act(() => {
        useBrowserStore.getState().setOnline(true);
      });

      const state = useBrowserStore.getState();
      expect(state.isOnline).toBe(true);
    });

    it("does not affect other state properties", () => {
      act(() => {
        useBrowserStore.setState({
          windowFocused: false,
          windowWidth: 1024,
          windowHeight: 768,
          isMobile: true,
        });
      });

      act(() => {
        useBrowserStore.getState().setOnline(false);
      });

      const state = useBrowserStore.getState();
      expect(state.windowFocused).toBe(false);
      expect(state.windowWidth).toBe(1024);
      expect(state.windowHeight).toBe(768);
      expect(state.isMobile).toBe(true);
    });
  });

  //#endregion setOnline

  //#region setIsMobile

  describe("setIsMobile", () => {
    it("sets isMobile to true", () => {
      act(() => {
        useBrowserStore.getState().setIsMobile(true);
      });

      const state = useBrowserStore.getState();
      expect(state.isMobile).toBe(true);
    });

    it("sets isMobile to false", () => {
      act(() => {
        useBrowserStore.getState().setIsMobile(true);
      });

      act(() => {
        useBrowserStore.getState().setIsMobile(false);
      });

      const state = useBrowserStore.getState();
      expect(state.isMobile).toBe(false);
    });

    it("does not affect other state properties", () => {
      act(() => {
        useBrowserStore.setState({
          windowFocused: false,
          windowWidth: 1024,
          windowHeight: 768,
          isOnline: false,
        });
      });

      act(() => {
        useBrowserStore.getState().setIsMobile(true);
      });

      const state = useBrowserStore.getState();
      expect(state.windowFocused).toBe(false);
      expect(state.windowWidth).toBe(1024);
      expect(state.windowHeight).toBe(768);
      expect(state.isOnline).toBe(false);
    });
  });

  //#endregion setIsMobile

  //#region Subscription

  describe("subscription", () => {
    it("notifies subscribers on windowFocused change", () => {
      const listener = jest.fn();
      const unsubscribe = useBrowserStore.subscribe(listener);

      act(() => {
        useBrowserStore.getState().setWindowFocused(false);
      });

      expect(listener).toHaveBeenCalled();

      unsubscribe();
    });

    it("notifies subscribers on dimensions change", () => {
      const listener = jest.fn();
      const unsubscribe = useBrowserStore.subscribe(listener);

      act(() => {
        useBrowserStore.getState().setWindowDimensions(1920, 1080);
      });

      expect(listener).toHaveBeenCalled();

      unsubscribe();
    });

    it("notifies subscribers on online status change", () => {
      const listener = jest.fn();
      const unsubscribe = useBrowserStore.subscribe(listener);

      act(() => {
        useBrowserStore.getState().setOnline(false);
      });

      expect(listener).toHaveBeenCalled();

      unsubscribe();
    });

    it("notifies subscribers on isMobile change", () => {
      const listener = jest.fn();
      const unsubscribe = useBrowserStore.subscribe(listener);

      act(() => {
        useBrowserStore.getState().setIsMobile(true);
      });

      expect(listener).toHaveBeenCalled();

      unsubscribe();
    });

    it("does not notify after unsubscribe", () => {
      const listener = jest.fn();
      const unsubscribe = useBrowserStore.subscribe(listener);

      unsubscribe();

      act(() => {
        useBrowserStore.getState().setWindowFocused(false);
      });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  //#endregion Subscription

  //#region Combined State Changes

  describe("combined state changes", () => {
    it("maintains correct state after multiple actions", () => {
      act(() => {
        useBrowserStore.getState().setWindowDimensions(1920, 1080);
        useBrowserStore.getState().setWindowFocused(false);
        useBrowserStore.getState().setOnline(false);
        useBrowserStore.getState().setIsMobile(true);
      });

      const state = useBrowserStore.getState();
      expect(state.windowWidth).toBe(1920);
      expect(state.windowHeight).toBe(1080);
      expect(state.windowFocused).toBe(false);
      expect(state.isOnline).toBe(false);
      expect(state.isMobile).toBe(true);
    });

    it("handles rapid state changes", () => {
      act(() => {
        for (let i = 0; i < 10; i++) {
          useBrowserStore.getState().setWindowDimensions(i * 100, i * 50);
        }
      });

      const state = useBrowserStore.getState();
      expect(state.windowWidth).toBe(900);
      expect(state.windowHeight).toBe(450);
    });
  });

  //#endregion Combined State Changes
});
