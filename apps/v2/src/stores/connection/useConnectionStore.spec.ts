// apps/v2/src/stores/connection/useConnectionStore.spec.ts

import { act } from "@testing-library/react-native";

import { useConnectionStore } from "./useConnectionStore";

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

describe("useConnectionStore", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    act(() => {
      useConnectionStore.setState({
        status: "disconnected",
        lastConnected: null,
        reconnectAttempts: 0,
        error: null,
        lastEventId: null,
        connectionId: null,
      });
    });
  });

  //#region Initial State

  describe("initial state", () => {
    it("has correct initial values", () => {
      const state = useConnectionStore.getState();

      expect(state.status).toBe("disconnected");
      expect(state.lastConnected).toBeNull();
      expect(state.reconnectAttempts).toBe(0);
      expect(state.error).toBeNull();
      expect(state.lastEventId).toBeNull();
      expect(state.connectionId).toBeNull();
    });
  });

  //#endregion Initial State

  //#region setStatus

  describe("setStatus", () => {
    it("updates status to connecting", () => {
      act(() => {
        useConnectionStore.getState().setStatus("connecting");
      });

      expect(useConnectionStore.getState().status).toBe("connecting");
    });

    it("updates status to connected", () => {
      act(() => {
        useConnectionStore.getState().setStatus("connected");
      });

      expect(useConnectionStore.getState().status).toBe("connected");
    });

    it("updates status to disconnected", () => {
      act(() => {
        useConnectionStore.getState().setStatus("connected");
        useConnectionStore.getState().setStatus("disconnected");
      });

      expect(useConnectionStore.getState().status).toBe("disconnected");
    });

    it("updates status to reconnecting", () => {
      act(() => {
        useConnectionStore.getState().setStatus("reconnecting");
      });

      expect(useConnectionStore.getState().status).toBe("reconnecting");
    });

    it("does not affect other state properties", () => {
      act(() => {
        useConnectionStore.setState({
          lastConnected: 1234567890,
          reconnectAttempts: 3,
          error: "test error",
        });
        useConnectionStore.getState().setStatus("connecting");
      });

      const state = useConnectionStore.getState();
      expect(state.status).toBe("connecting");
      expect(state.lastConnected).toBe(1234567890);
      expect(state.reconnectAttempts).toBe(3);
      expect(state.error).toBe("test error");
    });
  });

  //#endregion setStatus

  //#region setConnected

  describe("setConnected", () => {
    it("sets status to connected", () => {
      act(() => {
        useConnectionStore.getState().setConnected();
      });

      expect(useConnectionStore.getState().status).toBe("connected");
    });

    it("sets lastConnected to current timestamp", () => {
      const beforeTime = Date.now();

      act(() => {
        useConnectionStore.getState().setConnected();
      });

      const afterTime = Date.now();
      const lastConnected = useConnectionStore.getState().lastConnected;

      expect(lastConnected).toBeGreaterThanOrEqual(beforeTime);
      expect(lastConnected).toBeLessThanOrEqual(afterTime);
    });

    it("clears error", () => {
      act(() => {
        useConnectionStore.setState({ error: "previous error" });
        useConnectionStore.getState().setConnected();
      });

      expect(useConnectionStore.getState().error).toBeNull();
    });

    it("resets reconnectAttempts to zero", () => {
      act(() => {
        useConnectionStore.setState({ reconnectAttempts: 5 });
        useConnectionStore.getState().setConnected();
      });

      expect(useConnectionStore.getState().reconnectAttempts).toBe(0);
    });

    it("updates all properties in single call", () => {
      act(() => {
        useConnectionStore.setState({
          status: "reconnecting",
          error: "connection lost",
          reconnectAttempts: 3,
        });
        useConnectionStore.getState().setConnected();
      });

      const state = useConnectionStore.getState();
      expect(state.status).toBe("connected");
      expect(state.lastConnected).not.toBeNull();
      expect(state.error).toBeNull();
      expect(state.reconnectAttempts).toBe(0);
    });
  });

  //#endregion setConnected

  //#region setDisconnected

  describe("setDisconnected", () => {
    it("sets status to disconnected", () => {
      act(() => {
        useConnectionStore.setState({ status: "connected" });
        useConnectionStore.getState().setDisconnected();
      });

      expect(useConnectionStore.getState().status).toBe("disconnected");
    });

    it("sets error when provided", () => {
      act(() => {
        useConnectionStore.getState().setDisconnected("Network error");
      });

      expect(useConnectionStore.getState().error).toBe("Network error");
    });

    it("sets error to null when not provided", () => {
      act(() => {
        useConnectionStore.setState({ error: "previous error" });
        useConnectionStore.getState().setDisconnected();
      });

      expect(useConnectionStore.getState().error).toBeNull();
    });

    it("sets error to null when undefined is provided", () => {
      act(() => {
        useConnectionStore.setState({ error: "previous error" });
        useConnectionStore.getState().setDisconnected(undefined);
      });

      expect(useConnectionStore.getState().error).toBeNull();
    });

    it("preserves other state properties", () => {
      const timestamp = 1234567890;

      act(() => {
        useConnectionStore.setState({
          status: "connected",
          lastConnected: timestamp,
          reconnectAttempts: 2,
        });
        useConnectionStore.getState().setDisconnected("error");
      });

      const state = useConnectionStore.getState();
      expect(state.lastConnected).toBe(timestamp);
      expect(state.reconnectAttempts).toBe(2);
    });
  });

  //#endregion setDisconnected

  //#region setReconnecting

  describe("setReconnecting", () => {
    it("sets status to reconnecting", () => {
      act(() => {
        useConnectionStore.getState().setReconnecting();
      });

      expect(useConnectionStore.getState().status).toBe("reconnecting");
    });

    it("increments reconnectAttempts by 1", () => {
      expect(useConnectionStore.getState().reconnectAttempts).toBe(0);

      act(() => {
        useConnectionStore.getState().setReconnecting();
      });

      expect(useConnectionStore.getState().reconnectAttempts).toBe(1);
    });

    it("increments reconnectAttempts on each call", () => {
      act(() => {
        useConnectionStore.getState().setReconnecting();
        useConnectionStore.getState().setReconnecting();
        useConnectionStore.getState().setReconnecting();
      });

      expect(useConnectionStore.getState().reconnectAttempts).toBe(3);
    });

    it("preserves lastConnected and error", () => {
      const timestamp = 1234567890;

      act(() => {
        useConnectionStore.setState({
          lastConnected: timestamp,
          error: "previous error",
        });
        useConnectionStore.getState().setReconnecting();
      });

      const state = useConnectionStore.getState();
      expect(state.lastConnected).toBe(timestamp);
      expect(state.error).toBe("previous error");
    });
  });

  //#endregion setReconnecting

  //#region resetReconnectAttempts

  describe("resetReconnectAttempts", () => {
    it("resets reconnectAttempts to zero", () => {
      act(() => {
        useConnectionStore.setState({ reconnectAttempts: 10 });
        useConnectionStore.getState().resetReconnectAttempts();
      });

      expect(useConnectionStore.getState().reconnectAttempts).toBe(0);
    });

    it("preserves other state properties", () => {
      const timestamp = 1234567890;

      act(() => {
        useConnectionStore.setState({
          status: "reconnecting",
          lastConnected: timestamp,
          reconnectAttempts: 5,
          error: "test error",
        });
        useConnectionStore.getState().resetReconnectAttempts();
      });

      const state = useConnectionStore.getState();
      expect(state.status).toBe("reconnecting");
      expect(state.lastConnected).toBe(timestamp);
      expect(state.error).toBe("test error");
      expect(state.reconnectAttempts).toBe(0);
    });

    it("is idempotent when already zero", () => {
      expect(useConnectionStore.getState().reconnectAttempts).toBe(0);

      act(() => {
        useConnectionStore.getState().resetReconnectAttempts();
      });

      expect(useConnectionStore.getState().reconnectAttempts).toBe(0);
    });
  });

  //#endregion resetReconnectAttempts

  //#region setLastEventId

  describe("setLastEventId", () => {
    it("sets lastEventId to provided value", () => {
      act(() => {
        useConnectionStore.getState().setLastEventId("evt_123");
      });

      expect(useConnectionStore.getState().lastEventId).toBe("evt_123");
    });

    it("updates existing lastEventId", () => {
      act(() => {
        useConnectionStore.setState({ lastEventId: "evt_001" });
        useConnectionStore.getState().setLastEventId("evt_002");
      });

      expect(useConnectionStore.getState().lastEventId).toBe("evt_002");
    });

    it("preserves other state properties", () => {
      const timestamp = 1234567890;

      act(() => {
        useConnectionStore.setState({
          status: "connected",
          lastConnected: timestamp,
          reconnectAttempts: 2,
          error: null,
          connectionId: "conn_abc",
        });
        useConnectionStore.getState().setLastEventId("evt_xyz");
      });

      const state = useConnectionStore.getState();
      expect(state.status).toBe("connected");
      expect(state.lastConnected).toBe(timestamp);
      expect(state.reconnectAttempts).toBe(2);
      expect(state.connectionId).toBe("conn_abc");
      expect(state.lastEventId).toBe("evt_xyz");
    });
  });

  //#endregion setLastEventId

  //#region setConnectionId

  describe("setConnectionId", () => {
    it("sets connectionId to provided value", () => {
      act(() => {
        useConnectionStore.getState().setConnectionId("conn_123");
      });

      expect(useConnectionStore.getState().connectionId).toBe("conn_123");
    });

    it("updates existing connectionId", () => {
      act(() => {
        useConnectionStore.setState({ connectionId: "conn_001" });
        useConnectionStore.getState().setConnectionId("conn_002");
      });

      expect(useConnectionStore.getState().connectionId).toBe("conn_002");
    });

    it("preserves other state properties", () => {
      const timestamp = 1234567890;

      act(() => {
        useConnectionStore.setState({
          status: "connected",
          lastConnected: timestamp,
          reconnectAttempts: 2,
          error: null,
          lastEventId: "evt_abc",
        });
        useConnectionStore.getState().setConnectionId("conn_xyz");
      });

      const state = useConnectionStore.getState();
      expect(state.status).toBe("connected");
      expect(state.lastConnected).toBe(timestamp);
      expect(state.reconnectAttempts).toBe(2);
      expect(state.lastEventId).toBe("evt_abc");
      expect(state.connectionId).toBe("conn_xyz");
    });
  });

  //#endregion setConnectionId

  //#region reset

  describe("reset", () => {
    it("resets all state to initial values", () => {
      act(() => {
        useConnectionStore.setState({
          status: "connected",
          lastConnected: 1234567890,
          reconnectAttempts: 5,
          error: "some error",
          lastEventId: "evt_123",
          connectionId: "conn_456",
        });
        useConnectionStore.getState().reset();
      });

      const state = useConnectionStore.getState();
      expect(state.status).toBe("disconnected");
      expect(state.lastConnected).toBeNull();
      expect(state.reconnectAttempts).toBe(0);
      expect(state.error).toBeNull();
      expect(state.lastEventId).toBeNull();
      expect(state.connectionId).toBeNull();
    });

    it("is idempotent when already at initial state", () => {
      const initialState = useConnectionStore.getState();

      act(() => {
        useConnectionStore.getState().reset();
      });

      const state = useConnectionStore.getState();
      expect(state.status).toBe(initialState.status);
      expect(state.lastConnected).toBe(initialState.lastConnected);
      expect(state.reconnectAttempts).toBe(initialState.reconnectAttempts);
      expect(state.error).toBe(initialState.error);
      expect(state.lastEventId).toBe(initialState.lastEventId);
      expect(state.connectionId).toBe(initialState.connectionId);
    });
  });

  //#endregion reset

  //#region Integration Scenarios

  describe("integration scenarios", () => {
    it("handles full connection lifecycle", () => {
      // Start disconnected
      expect(useConnectionStore.getState().status).toBe("disconnected");

      // Start connecting
      act(() => {
        useConnectionStore.getState().setStatus("connecting");
      });
      expect(useConnectionStore.getState().status).toBe("connecting");

      // Connection established
      act(() => {
        useConnectionStore.getState().setConnected();
      });
      expect(useConnectionStore.getState().status).toBe("connected");
      expect(useConnectionStore.getState().lastConnected).not.toBeNull();

      // Connection lost
      act(() => {
        useConnectionStore.getState().setDisconnected("Connection timeout");
      });
      expect(useConnectionStore.getState().status).toBe("disconnected");
      expect(useConnectionStore.getState().error).toBe("Connection timeout");
    });

    it("handles reconnection attempts", () => {
      // Set initial connected state
      act(() => {
        useConnectionStore.getState().setConnected();
      });
      const lastConnected = useConnectionStore.getState().lastConnected;

      // Connection lost, start reconnecting
      act(() => {
        useConnectionStore.getState().setDisconnected("Lost connection");
        useConnectionStore.getState().setReconnecting();
      });
      expect(useConnectionStore.getState().status).toBe("reconnecting");
      expect(useConnectionStore.getState().reconnectAttempts).toBe(1);

      // Multiple reconnect attempts
      act(() => {
        useConnectionStore.getState().setReconnecting();
        useConnectionStore.getState().setReconnecting();
      });
      expect(useConnectionStore.getState().reconnectAttempts).toBe(3);

      // Successfully reconnected
      act(() => {
        useConnectionStore.getState().setConnected();
      });
      expect(useConnectionStore.getState().status).toBe("connected");
      expect(useConnectionStore.getState().reconnectAttempts).toBe(0);
      expect(useConnectionStore.getState().error).toBeNull();
      expect(
        useConnectionStore.getState().lastConnected,
      ).toBeGreaterThanOrEqual(lastConnected as number);
    });

    it("handles manual reconnect attempts reset", () => {
      act(() => {
        useConnectionStore.getState().setReconnecting();
        useConnectionStore.getState().setReconnecting();
        useConnectionStore.getState().setReconnecting();
      });
      expect(useConnectionStore.getState().reconnectAttempts).toBe(3);

      act(() => {
        useConnectionStore.getState().resetReconnectAttempts();
      });
      expect(useConnectionStore.getState().reconnectAttempts).toBe(0);
      expect(useConnectionStore.getState().status).toBe("reconnecting");
    });
  });

  //#endregion Integration Scenarios

  //#region Store API

  describe("store API", () => {
    it("exposes getState method", () => {
      expect(typeof useConnectionStore.getState).toBe("function");
    });

    it("exposes setState method", () => {
      expect(typeof useConnectionStore.setState).toBe("function");
    });

    it("exposes subscribe method", () => {
      expect(typeof useConnectionStore.subscribe).toBe("function");
    });

    it("supports subscription for state changes", () => {
      const listener = jest.fn();
      const unsubscribe = useConnectionStore.subscribe(listener);

      act(() => {
        useConnectionStore.getState().setStatus("connecting");
      });

      expect(listener).toHaveBeenCalled();

      unsubscribe();

      act(() => {
        useConnectionStore.getState().setStatus("connected");
      });

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  //#endregion Store API
});
