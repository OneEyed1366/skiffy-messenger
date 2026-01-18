// apps/v2/src/services/websocket/socket.spec.ts

import { websocketService } from "./socket";
import { useConnectionStore } from "@/stores/connection";

//#region Mocks

jest.mock("rxjs/webSocket", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Subject: MockSubject } = require("rxjs");
  return {
    webSocket: jest.fn(() => {
      const mockSubject = new MockSubject();
      const originalComplete = mockSubject.complete.bind(mockSubject);
      return Object.assign(mockSubject, {
        next: jest.fn((value: unknown) => mockSubject.next(value)),
        complete: jest.fn(() => originalComplete()),
      });
    }),
  };
});

//#endregion Mocks

//#region Tests

describe("WebSocketService", () => {
  beforeEach(() => {
    useConnectionStore.getState().reset();
  });

  //#region connect
  describe("connect", () => {
    it("sets connection state to connecting", () => {
      websocketService.connect({
        url: "wss://test.com/ws",
        token: "test-token",
      });

      expect(useConnectionStore.getState().status).toBe("connecting");
    });

    it("returns events$ observable", () => {
      const events$ = websocketService.connect({
        url: "wss://test.com/ws",
        token: "test-token",
      });

      expect(events$).toBeDefined();
      expect(typeof events$.subscribe).toBe("function");
    });
  });
  //#endregion connect

  //#region disconnect
  describe("disconnect", () => {
    it("sets connection state to disconnected", () => {
      websocketService.connect({
        url: "wss://test.com/ws",
        token: "test-token",
      });

      websocketService.disconnect();

      expect(useConnectionStore.getState().status).toBe("disconnected");
    });
  });
  //#endregion disconnect

  //#region isConnected
  describe("isConnected", () => {
    it("returns false when disconnected", () => {
      expect(websocketService.isConnected()).toBe(false);
    });
  });
  //#endregion isConnected
});

//#endregion Tests
