import { act, renderHook } from "@testing-library/react-native";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

import { useScrollPosition } from "./useScrollPosition.native";

//#region Test Helpers
function createScrollEvent(
  x: number,
  y: number,
): NativeSyntheticEvent<NativeScrollEvent> {
  return {
    nativeEvent: {
      contentOffset: { x, y },
      contentSize: { width: 1000, height: 2000 },
      layoutMeasurement: { width: 375, height: 667 },
      contentInset: { top: 0, left: 0, bottom: 0, right: 0 },
      zoomScale: 1,
    },
  } as NativeSyntheticEvent<NativeScrollEvent>;
}
//#endregion Test Helpers

//#region useScrollPosition (native) tests
describe("useScrollPosition (native)", () => {
  describe("initial state", () => {
    it("returns initial position at {0, 0}", () => {
      const { result } = renderHook(() => useScrollPosition());

      expect(result.current.position).toEqual({ x: 0, y: 0 });
    });

    it("returns initial direction as null", () => {
      const { result } = renderHook(() => useScrollPosition());

      expect(result.current.direction).toBeNull();
    });

    it("returns onScroll handler function", () => {
      const { result } = renderHook(() => useScrollPosition());

      expect(typeof result.current.onScroll).toBe("function");
    });

    it("returns default scrollEventThrottle of 16ms", () => {
      const { result } = renderHook(() => useScrollPosition());

      expect(result.current.scrollEventThrottle).toBe(16);
    });
  });

  describe("custom throttle", () => {
    it("respects custom throttleMs option", () => {
      const { result } = renderHook(() =>
        useScrollPosition({ throttleMs: 32 }),
      );

      expect(result.current.scrollEventThrottle).toBe(32);
    });
  });

  describe("position tracking", () => {
    it("updates position on scroll event", () => {
      const { result } = renderHook(() => useScrollPosition());

      act(() => {
        result.current.onScroll(createScrollEvent(0, 100));
      });

      expect(result.current.position).toEqual({ x: 0, y: 100 });
    });

    it("tracks both x and y position", () => {
      const { result } = renderHook(() => useScrollPosition());

      act(() => {
        result.current.onScroll(createScrollEvent(50, 150));
      });

      expect(result.current.position).toEqual({ x: 50, y: 150 });
    });

    it("updates position on multiple scroll events", () => {
      const { result } = renderHook(() => useScrollPosition());

      act(() => {
        result.current.onScroll(createScrollEvent(0, 100));
      });
      expect(result.current.position).toEqual({ x: 0, y: 100 });

      act(() => {
        result.current.onScroll(createScrollEvent(0, 200));
      });
      expect(result.current.position).toEqual({ x: 0, y: 200 });

      act(() => {
        result.current.onScroll(createScrollEvent(50, 250));
      });
      expect(result.current.position).toEqual({ x: 50, y: 250 });
    });
  });

  describe("direction detection", () => {
    it("detects scroll down direction", () => {
      const { result } = renderHook(() => useScrollPosition());

      act(() => {
        result.current.onScroll(createScrollEvent(0, 0));
      });

      act(() => {
        result.current.onScroll(createScrollEvent(0, 100));
      });

      expect(result.current.direction).toBe("down");
    });

    it("detects scroll up direction", () => {
      const { result } = renderHook(() => useScrollPosition());

      act(() => {
        result.current.onScroll(createScrollEvent(0, 100));
      });

      act(() => {
        result.current.onScroll(createScrollEvent(0, 50));
      });

      expect(result.current.direction).toBe("up");
    });

    it("detects scroll right direction", () => {
      const { result } = renderHook(() => useScrollPosition());

      act(() => {
        result.current.onScroll(createScrollEvent(0, 0));
      });

      act(() => {
        result.current.onScroll(createScrollEvent(100, 0));
      });

      expect(result.current.direction).toBe("right");
    });

    it("detects scroll left direction", () => {
      const { result } = renderHook(() => useScrollPosition());

      act(() => {
        result.current.onScroll(createScrollEvent(100, 0));
      });

      act(() => {
        result.current.onScroll(createScrollEvent(50, 0));
      });

      expect(result.current.direction).toBe("left");
    });

    it("prioritizes vertical direction over horizontal when equal", () => {
      const { result } = renderHook(() => useScrollPosition());

      act(() => {
        result.current.onScroll(createScrollEvent(0, 0));
      });

      // Equal delta for both x and y
      act(() => {
        result.current.onScroll(createScrollEvent(50, 50));
      });

      expect(result.current.direction).toBe("down");
    });

    it("prioritizes vertical direction when larger", () => {
      const { result } = renderHook(() => useScrollPosition());

      act(() => {
        result.current.onScroll(createScrollEvent(0, 0));
      });

      // Larger y delta
      act(() => {
        result.current.onScroll(createScrollEvent(30, 100));
      });

      expect(result.current.direction).toBe("down");
    });

    it("prioritizes horizontal direction when larger", () => {
      const { result } = renderHook(() => useScrollPosition());

      act(() => {
        result.current.onScroll(createScrollEvent(0, 0));
      });

      // Larger x delta
      act(() => {
        result.current.onScroll(createScrollEvent(100, 30));
      });

      expect(result.current.direction).toBe("right");
    });

    it("returns null direction when no scroll change", () => {
      const { result } = renderHook(() => useScrollPosition());

      act(() => {
        result.current.onScroll(createScrollEvent(50, 100));
      });

      // Same position
      act(() => {
        result.current.onScroll(createScrollEvent(50, 100));
      });

      expect(result.current.direction).toBeNull();
    });

    it("updates direction on direction change", () => {
      const { result } = renderHook(() => useScrollPosition());

      // Scroll down
      act(() => {
        result.current.onScroll(createScrollEvent(0, 0));
      });
      act(() => {
        result.current.onScroll(createScrollEvent(0, 100));
      });
      expect(result.current.direction).toBe("down");

      // Scroll up
      act(() => {
        result.current.onScroll(createScrollEvent(0, 50));
      });
      expect(result.current.direction).toBe("up");

      // Scroll right
      act(() => {
        result.current.onScroll(createScrollEvent(100, 50));
      });
      expect(result.current.direction).toBe("right");

      // Scroll left
      act(() => {
        result.current.onScroll(createScrollEvent(50, 50));
      });
      expect(result.current.direction).toBe("left");
    });
  });

  describe("edge cases", () => {
    it("handles negative scroll values", () => {
      const { result } = renderHook(() => useScrollPosition());

      // Some platforms may report negative values during bounce
      act(() => {
        result.current.onScroll(createScrollEvent(-10, -20));
      });

      expect(result.current.position).toEqual({ x: -10, y: -20 });
    });

    it("handles large scroll values", () => {
      const { result } = renderHook(() => useScrollPosition());

      act(() => {
        result.current.onScroll(createScrollEvent(10000, 50000));
      });

      expect(result.current.position).toEqual({ x: 10000, y: 50000 });
    });

    it("handles decimal scroll values", () => {
      const { result } = renderHook(() => useScrollPosition());

      act(() => {
        result.current.onScroll(createScrollEvent(10.5, 20.75));
      });

      expect(result.current.position).toEqual({ x: 10.5, y: 20.75 });
    });
  });
});
//#endregion useScrollPosition (native) tests
