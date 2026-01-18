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
  lastEventId: string | null;
  connectionId: string | null;

  // Actions
  setStatus: (status: IConnectionStatus) => void;
  setConnected: () => void;
  setDisconnected: (error?: string) => void;
  setReconnecting: () => void;
  resetReconnectAttempts: () => void;
  setLastEventId: (id: string) => void;
  setConnectionId: (id: string) => void;
  reset: () => void;
};

//#endregion Types

//#region Store

const initialState: Omit<
  IConnectionState,
  | "setStatus"
  | "setConnected"
  | "setDisconnected"
  | "setReconnecting"
  | "resetReconnectAttempts"
  | "setLastEventId"
  | "setConnectionId"
  | "reset"
> = {
  status: "disconnected",
  lastConnected: null,
  reconnectAttempts: 0,
  error: null,
  lastEventId: null,
  connectionId: null,
};

export const useConnectionStore = createStore<IConnectionState>(
  (set) => ({
    ...initialState,

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
    setLastEventId: (id) => set({ lastEventId: id }),
    setConnectionId: (id) => set({ connectionId: id }),
    reset: () => set(initialState),
  }),
  { name: "connection" },
);

//#endregion Store

//#region Type Exports

export type { IConnectionStatus, IConnectionState };

//#endregion Type Exports
