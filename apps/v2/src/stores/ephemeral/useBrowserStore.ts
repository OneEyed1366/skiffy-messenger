// apps/v2/src/stores/ephemeral/useBrowserStore.ts

import { createStore } from "../setup";

//#region Types

type IBrowserState = {
  windowFocused: boolean;
  windowWidth: number;
  windowHeight: number;
  isOnline: boolean;
  isMobile: boolean;

  // Actions
  setWindowFocused: (focused: boolean) => void;
  setWindowDimensions: (width: number, height: number) => void;
  setOnline: (online: boolean) => void;
  setIsMobile: (mobile: boolean) => void;
};

//#endregion Types

//#region Store

/**
 * Ephemeral store for browser/window state.
 * Tracks window focus, dimensions, online status, and device type.
 * Not persisted - resets on app restart.
 */
export const useBrowserStore = createStore<IBrowserState>(
  (set) => ({
    windowFocused: true,
    windowWidth: 0,
    windowHeight: 0,
    isOnline: true,
    isMobile: false,

    setWindowFocused: (focused) => set({ windowFocused: focused }),

    setWindowDimensions: (width, height) =>
      set({ windowWidth: width, windowHeight: height }),

    setOnline: (online) => set({ isOnline: online }),

    setIsMobile: (mobile) => set({ isMobile: mobile }),
  }),
  { name: "browser-store" },
);

//#endregion Store

//#region Exports

export type { IBrowserState };

//#endregion Exports
