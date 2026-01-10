// apps/v2/src/hooks/useClickOutside/useClickOutside.spec.ts
//
// NOTE: This hook is web-only and uses document event listeners.
// Full web functionality tests would require a jsdom environment.
// These tests focus on the native platform no-op behavior and
// basic hook structure validation.

import { renderHook } from "@testing-library/react-native";
import { Platform } from "react-native";

import { useClickOutside } from "./useClickOutside";

//#region Mock Setup

// Store original Platform.OS to restore after tests
const originalPlatformOS = Platform.OS;

// Mock document at module level for web tests
const eventListeners: Map<string, Set<EventListener>> = new Map();

const mockAddEventListener = jest.fn(
  (type: string, listener: EventListener) => {
    if (!eventListeners.has(type)) {
      eventListeners.set(type, new Set());
    }
    eventListeners.get(type)?.add(listener);
  },
);

const mockRemoveEventListener = jest.fn(
  (type: string, listener: EventListener) => {
    eventListeners.get(type)?.delete(listener);
  },
);

globalThis.document = {
  addEventListener: mockAddEventListener,
  removeEventListener: mockRemoveEventListener,
} as unknown as typeof document;

// Create a mock element
function createMockElement(containsResult: boolean = false) {
  return {
    contains: jest.fn().mockReturnValue(containsResult),
  };
}

//#endregion Mock Setup

describe("useClickOutside", () => {
  beforeEach(() => {
    eventListeners.clear();
    mockAddEventListener.mockClear();
    mockRemoveEventListener.mockClear();
  });

  afterEach(() => {
    Platform.OS = originalPlatformOS;
  });

  describe("native platforms", () => {
    it("should be a no-op on iOS", () => {
      Platform.OS = "ios";

      const handler = jest.fn();
      const ref = { current: createMockElement() } as unknown as React.RefObject<HTMLDivElement>;

      renderHook(() => useClickOutside(ref, handler));

      expect(mockAddEventListener).not.toHaveBeenCalled();
    });

    it("should be a no-op on Android", () => {
      Platform.OS = "android";

      const handler = jest.fn();
      const ref = { current: createMockElement() } as unknown as React.RefObject<HTMLDivElement>;

      renderHook(() => useClickOutside(ref, handler));

      expect(mockAddEventListener).not.toHaveBeenCalled();
    });
  });

  describe("hook structure", () => {
    it("should not throw when called with valid arguments", () => {
      const handler = jest.fn();
      const ref = { current: createMockElement() } as unknown as React.RefObject<HTMLDivElement>;

      expect(() => {
        renderHook(() => useClickOutside(ref, handler));
      }).not.toThrow();
    });

    it("should not throw when called with null ref", () => {
      const handler = jest.fn();
      const ref = { current: null };

      expect(() => {
        renderHook(() => useClickOutside(ref, handler));
      }).not.toThrow();
    });

    it("should not throw with all options provided", () => {
      const handler = jest.fn();
      const ref = { current: createMockElement() } as unknown as React.RefObject<HTMLDivElement>;

      expect(() => {
        renderHook(() =>
          useClickOutside(ref, handler, {
            eventType: "click",
            enabled: false,
          }),
        );
      }).not.toThrow();
    });

    it("should accept all valid event types", () => {
      const handler = jest.fn();
      const ref = { current: createMockElement() } as unknown as React.RefObject<HTMLDivElement>;

      expect(() => {
        renderHook(() =>
          useClickOutside(ref, handler, {
            eventType: "mousedown",
          }),
        );
      }).not.toThrow();

      expect(() => {
        renderHook(() =>
          useClickOutside(ref, handler, {
            eventType: "mouseup",
          }),
        );
      }).not.toThrow();

      expect(() => {
        renderHook(() =>
          useClickOutside(ref, handler, {
            eventType: "click",
          }),
        );
      }).not.toThrow();
    });
  });

  describe("enabled option", () => {
    it("should not throw when enabled is true", () => {
      const handler = jest.fn();
      const ref = { current: createMockElement() } as unknown as React.RefObject<HTMLDivElement>;

      expect(() => {
        renderHook(() =>
          useClickOutside(ref, handler, {
            enabled: true,
          }),
        );
      }).not.toThrow();
    });

    it("should not throw when enabled is false", () => {
      const handler = jest.fn();
      const ref = { current: createMockElement() } as unknown as React.RefObject<HTMLDivElement>;

      expect(() => {
        renderHook(() =>
          useClickOutside(ref, handler, {
            enabled: false,
          }),
        );
      }).not.toThrow();
    });
  });
});
