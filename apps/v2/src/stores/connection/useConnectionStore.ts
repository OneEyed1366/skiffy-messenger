// apps/v2/src/stores/connection/useConnectionStore.ts

import { createStore } from "../setup";

//#region Types

type IConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting";

type IConnectionState = {
  status: IConnectionStatus;
  lastConnected: number | null;
  reconnectAttempts: number;
  error: string | null;

  // Actions
  setStatus: (status: IConnectionStatus) => void;
  setConnected: () => void;
  setDisconnected: (error?: string) => void;
  setReconnecting: () => void;
  resetReconnectAttempts: () => void;
};

//#endregion Types

//#region Store

export const useConnectionStore = createStore<IConnectionState>(
  (set) => ({
    status: "disconnected",
    lastConnected: null,
    reconnectAttempts: 0,
    error: null,

    setStatus: (status) => set({ status }),
    setConnected: () =>
      set({
        status: "connected",
        lastConnected: Date.now(),
        error: null,
        reconnectAttempts: 0,
      }),
    setDisconnected: (error) =>
      set({ status: "disconnected", error: error ?? null }),
    setReconnecting: () =>
      set((state) => ({
        status: "reconnecting",
        reconnectAttempts: state.reconnectAttempts + 1,
      })),
    resetReconnectAttempts: () => set({ reconnectAttempts: 0 }),
  }),
  { name: "connection" },
);

//#endregion Store

//#region Type Exports

export type { IConnectionStatus, IConnectionState };

//#endregion Type Exports
