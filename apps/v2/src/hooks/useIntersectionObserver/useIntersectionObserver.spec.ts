import { act, renderHook } from "@testing-library/react-native";
import type { LayoutChangeEvent } from "react-native";

import {
  createViewabilityConfig,
  createViewableItemsHandler,
  useIntersectionObserver,
  useMultiIntersectionObserver,
} from "./useIntersectionObserver.native";

//#region Test Helpers
function createLayoutEvent(
  width: number,
  height: number,
  x = 0,
  y = 0,
): LayoutChangeEvent {
  return {
    nativeEvent: { layout: { width, height, x, y } },
  } as LayoutChangeEvent;
}
//#endregion Test Helpers

//#region useIntersectionObserver tests
describe("useIntersectionObserver", () => {
  it("returns initial state with isIntersecting false by default", () => {
    const { result } = renderHook(() => useIntersectionObserver());

    expect(result.current.isIntersecting).toBe(false);
    expect(result.current.entry).toBeNull();
    expect(result.current.ref.current).toBeNull();
    expect(typeof result.current.onLayout).toBe("function");
    expect(typeof result.current.checkVisibility).toBe("function");
  });

  it("respects initialIsIntersecting option", () => {
    const { result } = renderHook(() =>
      useIntersectionObserver({ initialIsIntersecting: true }),
    );

    expect(result.current.isIntersecting).toBe(true);
  });

  it("updates layout when onLayout is called", () => {
    const { result } = renderHook(() => useIntersectionObserver());

    act(() => {
      result.current.onLayout(createLayoutEvent(100, 200, 10, 50));
    });

    // Layout is stored internally, check by calling checkVisibility
    act(() => {
      result.current.checkVisibility(500, 0);
    });

    expect(result.current.entry?.boundingClientRect).toEqual({
      x: 10,
      y: 50,
      width: 100,
      height: 200,
    });
  });

  it("detects element as intersecting when fully in viewport", () => {
    const { result } = renderHook(() => useIntersectionObserver());

    // Element at y=100, height=100, viewport height=500
    act(() => {
      result.current.onLayout(createLayoutEvent(100, 100, 0, 100));
    });

    act(() => {
      result.current.checkVisibility(500, 0);
    });

    expect(result.current.isIntersecting).toBe(true);
    expect(result.current.entry?.intersectionRatio).toBe(1);
  });

  it("detects element as not intersecting when scrolled out of view", () => {
    const { result } = renderHook(() => useIntersectionObserver());

    // Element at y=100, height=100 (ends at 200)
    act(() => {
      result.current.onLayout(createLayoutEvent(100, 100, 0, 100));
    });

    // Scroll past the element (scrollY=300, so element is above viewport)
    act(() => {
      result.current.checkVisibility(500, 300);
    });

    expect(result.current.isIntersecting).toBe(false);
    expect(result.current.entry?.intersectionRatio).toBe(0);
  });

  it("calls onChange callback when visibility changes", () => {
    const onChange = jest.fn();
    const { result } = renderHook(() => useIntersectionObserver({ onChange }));

    act(() => {
      result.current.onLayout(createLayoutEvent(100, 100, 0, 100));
    });

    act(() => {
      result.current.checkVisibility(500, 0);
    });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        isIntersecting: true,
        intersectionRatio: 1,
      }),
    );
  });

  it("freezes state when freezeOnceVisible is true and element becomes visible", () => {
    const onChange = jest.fn();
    const { result } = renderHook(() =>
      useIntersectionObserver({ freezeOnceVisible: true, onChange }),
    );

    act(() => {
      result.current.onLayout(createLayoutEvent(100, 100, 0, 100));
    });

    // First check - element visible
    act(() => {
      result.current.checkVisibility(500, 0);
    });

    expect(result.current.isIntersecting).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1);

    // Second check - scroll away, but should remain frozen
    act(() => {
      result.current.checkVisibility(500, 500);
    });

    // State should remain frozen at visible
    expect(result.current.isIntersecting).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1); // Not called again
  });

  it("calculates partial intersection ratio correctly", () => {
    const { result } = renderHook(() => useIntersectionObserver());

    // Element at y=0, height=200
    act(() => {
      result.current.onLayout(createLayoutEvent(100, 200, 0, 0));
    });

    // Scroll so element is half visible (scrollY=-100 means element starts at 100 in viewport)
    // Actually: element top relative to viewport = y - scrollY = 0 - (-100) = 100
    // Element at y=0, height=200, viewport=200
    // If scrollY=100, element top = 0-100 = -100, bottom = -100+200 = 100
    // Intersection = max(0, min(100, 200) - max(-100, 0)) = 100
    // Ratio = 100/200 = 0.5
    act(() => {
      result.current.checkVisibility(200, 100);
    });

    expect(result.current.entry?.intersectionRatio).toBe(0.5);
  });

  it("respects custom threshold for intersection detection", () => {
    const { result } = renderHook(() =>
      useIntersectionObserver({ threshold: 0.5 }),
    );

    // Element at y=0, height=200, viewport=200
    act(() => {
      result.current.onLayout(createLayoutEvent(100, 200, 0, 0));
    });

    // Scroll so 40% visible (below 50% threshold)
    // Element at y=0, height=200
    // scrollY = 120 means element top = -120, bottom = 80
    // Intersection = 80, ratio = 80/200 = 0.4
    act(() => {
      result.current.checkVisibility(200, 120);
    });

    expect(result.current.isIntersecting).toBe(false);
    expect(result.current.entry?.intersectionRatio).toBe(0.4);

    // Scroll so 60% visible (above threshold)
    // scrollY = 80 means element top = -80, bottom = 120
    // Intersection = 120, ratio = 120/200 = 0.6
    act(() => {
      result.current.checkVisibility(200, 80);
    });

    expect(result.current.isIntersecting).toBe(true);
    expect(result.current.entry?.intersectionRatio).toBe(0.6);
  });
});
//#endregion useIntersectionObserver tests

//#region useMultiIntersectionObserver tests
describe("useMultiIntersectionObserver", () => {
  it("initializes with null activeKey and empty intersectingKeys", () => {
    const { result } = renderHook(() =>
      useMultiIntersectionObserver(["section1", "section2"]),
    );

    expect(result.current.activeKey).toBeNull();
    expect(result.current.intersectingKeys.size).toBe(0);
  });

  it("allows manual setting of activeKey", () => {
    const { result } = renderHook(() =>
      useMultiIntersectionObserver(["section1", "section2"]),
    );

    act(() => {
      result.current.setActiveKey("section2");
    });

    expect(result.current.activeKey).toBe("section2");
  });

  it("tracks multiple elements visibility", () => {
    const { result } = renderHook(() =>
      useMultiIntersectionObserver(["section1", "section2", "section3"]),
    );

    // Set layouts for all sections
    act(() => {
      result.current.handleLayout("section1")(
        createLayoutEvent(100, 100, 0, 0),
      );
      result.current.handleLayout("section2")(
        createLayoutEvent(100, 100, 0, 150),
      );
      result.current.handleLayout("section3")(
        createLayoutEvent(100, 100, 0, 300),
      );
    });

    // Check visibility with viewport showing sections 1 and 2
    act(() => {
      result.current.checkAllVisibility(250, 0);
    });

    expect(result.current.intersectingKeys.has("section1")).toBe(true);
    expect(result.current.intersectingKeys.has("section2")).toBe(true);
    expect(result.current.intersectingKeys.has("section3")).toBe(false);
    expect(result.current.activeKey).toBe("section1");
  });

  it("updates activeKey to first visible section based on keys order", () => {
    const { result } = renderHook(() =>
      useMultiIntersectionObserver(["section1", "section2"]),
    );

    act(() => {
      result.current.handleLayout("section1")(
        createLayoutEvent(100, 100, 0, 0),
      );
      result.current.handleLayout("section2")(
        createLayoutEvent(100, 100, 0, 150),
      );
    });

    // Scroll so only section2 is visible
    act(() => {
      result.current.checkAllVisibility(200, 150);
    });

    expect(result.current.activeKey).toBe("section2");
    expect(result.current.intersectingKeys.has("section1")).toBe(false);
    expect(result.current.intersectingKeys.has("section2")).toBe(true);
  });
});
//#endregion useMultiIntersectionObserver tests

//#region FlashList helper tests
describe("createViewabilityConfig", () => {
  it("creates config with default threshold of 50", () => {
    const config = createViewabilityConfig();

    expect(config.itemVisiblePercentThreshold).toBe(50);
    expect(config.minimumViewTime).toBe(0);
    expect(config.waitForInteraction).toBe(false);
  });

  it("creates config with custom threshold", () => {
    const config = createViewabilityConfig(75);

    expect(config.itemVisiblePercentThreshold).toBe(75);
  });
});

describe("createViewableItemsHandler", () => {
  it("extracts visible item IDs and calls callback", () => {
    const onVisibleIdsChange = jest.fn();
    const keyExtractor = (item: { id: string }) => item.id;
    const handler = createViewableItemsHandler(
      onVisibleIdsChange,
      keyExtractor,
    );

    handler({
      viewableItems: [
        { isViewable: true, item: { id: "item1" }, index: 0, key: "item1" },
        { isViewable: true, item: { id: "item2" }, index: 1, key: "item2" },
        { isViewable: false, item: { id: "item3" }, index: 2, key: "item3" },
      ],
      changed: [],
    });

    expect(onVisibleIdsChange).toHaveBeenCalledTimes(1);
    const visibleIds = onVisibleIdsChange.mock.calls[0][0];
    expect(visibleIds.has("item1")).toBe(true);
    expect(visibleIds.has("item2")).toBe(true);
    expect(visibleIds.has("item3")).toBe(false);
  });

  it("handles empty viewable items", () => {
    const onVisibleIdsChange = jest.fn();
    const keyExtractor = (item: { id: string }) => item.id;
    const handler = createViewableItemsHandler(
      onVisibleIdsChange,
      keyExtractor,
    );

    handler({
      viewableItems: [],
      changed: [],
    });

    expect(onVisibleIdsChange).toHaveBeenCalledWith(new Set());
  });
});
//#endregion FlashList helper tests
