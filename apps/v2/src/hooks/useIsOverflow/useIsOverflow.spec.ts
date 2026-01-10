import { act, renderHook } from "@testing-library/react-native";
import type { LayoutChangeEvent } from "react-native";

import { useIsOverflow, useIsVerticalOverflow } from "./useIsOverflow";

//#region Test Helpers
function createLayoutEvent(width: number, height: number): LayoutChangeEvent {
  return {
    nativeEvent: { layout: { x: 0, y: 0, width, height } },
  } as LayoutChangeEvent;
}
//#endregion Test Helpers

//#region useIsOverflow tests
describe("useIsOverflow", () => {
  it("returns initial state with no overflow", () => {
    const { result } = renderHook(() => useIsOverflow());

    expect(result.current.isOverflow).toBe(false);
    expect(result.current.isVerticalOverflow).toBe(false);
    expect(result.current.isHorizontalOverflow).toBe(false);
    expect(result.current.containerSize).toEqual({ width: 0, height: 0 });
    expect(result.current.contentSize).toEqual({ width: 0, height: 0 });
  });

  it("detects vertical overflow when content exceeds container height", () => {
    const { result } = renderHook(() =>
      useIsOverflow({ direction: "vertical" }),
    );

    act(() => {
      result.current.onContainerLayout(createLayoutEvent(300, 200));
      result.current.onContentLayout(createLayoutEvent(300, 400));
    });

    expect(result.current.isOverflow).toBe(true);
    expect(result.current.isVerticalOverflow).toBe(true);
    expect(result.current.isHorizontalOverflow).toBe(false);
  });

  it("detects horizontal overflow when content exceeds container width", () => {
    const { result } = renderHook(() =>
      useIsOverflow({ direction: "horizontal" }),
    );

    act(() => {
      result.current.onContainerLayout(createLayoutEvent(200, 300));
      result.current.onContentLayout(createLayoutEvent(400, 300));
    });

    expect(result.current.isOverflow).toBe(true);
    expect(result.current.isVerticalOverflow).toBe(false);
    expect(result.current.isHorizontalOverflow).toBe(true);
  });

  it("detects overflow in both directions when direction is 'both'", () => {
    const { result } = renderHook(() => useIsOverflow({ direction: "both" }));

    act(() => {
      result.current.onContainerLayout(createLayoutEvent(200, 200));
      result.current.onContentLayout(createLayoutEvent(400, 400));
    });

    expect(result.current.isOverflow).toBe(true);
    expect(result.current.isVerticalOverflow).toBe(true);
    expect(result.current.isHorizontalOverflow).toBe(true);
  });

  it("uses maxHeight when provided instead of container height", () => {
    const { result } = renderHook(() =>
      useIsOverflow({ direction: "vertical", maxHeight: 100 }),
    );

    act(() => {
      result.current.onContainerLayout(createLayoutEvent(300, 500));
      result.current.onContentLayout(createLayoutEvent(300, 150));
    });

    expect(result.current.isOverflow).toBe(true);
    expect(result.current.isVerticalOverflow).toBe(true);
  });

  it("uses maxWidth when provided instead of container width", () => {
    const { result } = renderHook(() =>
      useIsOverflow({ direction: "horizontal", maxWidth: 100 }),
    );

    act(() => {
      result.current.onContainerLayout(createLayoutEvent(500, 300));
      result.current.onContentLayout(createLayoutEvent(150, 300));
    });

    expect(result.current.isOverflow).toBe(true);
    expect(result.current.isHorizontalOverflow).toBe(true);
  });

  it("defaults to vertical direction when no direction specified", () => {
    const { result } = renderHook(() => useIsOverflow());

    act(() => {
      result.current.onContainerLayout(createLayoutEvent(200, 200));
      result.current.onContentLayout(createLayoutEvent(200, 300));
    });

    expect(result.current.isOverflow).toBe(true);
    expect(result.current.isVerticalOverflow).toBe(true);
  });

  it("avoids re-render when container dimensions unchanged", () => {
    const { result } = renderHook(() => useIsOverflow());

    act(() => {
      result.current.onContainerLayout(createLayoutEvent(200, 200));
    });

    const containerRef = result.current.containerSize;

    act(() => {
      result.current.onContainerLayout(createLayoutEvent(200, 200));
    });

    expect(result.current.containerSize).toBe(containerRef);
  });

  it("avoids re-render when content dimensions unchanged", () => {
    const { result } = renderHook(() => useIsOverflow());

    act(() => {
      result.current.onContentLayout(createLayoutEvent(100, 100));
    });

    const contentRef = result.current.contentSize;

    act(() => {
      result.current.onContentLayout(createLayoutEvent(100, 100));
    });

    expect(result.current.contentSize).toBe(contentRef);
  });

  it("reports no overflow when content fits within container", () => {
    const { result } = renderHook(() => useIsOverflow({ direction: "both" }));

    act(() => {
      result.current.onContainerLayout(createLayoutEvent(400, 400));
      result.current.onContentLayout(createLayoutEvent(200, 200));
    });

    expect(result.current.isOverflow).toBe(false);
    expect(result.current.isVerticalOverflow).toBe(false);
    expect(result.current.isHorizontalOverflow).toBe(false);
  });
});
//#endregion useIsOverflow tests

//#region useIsVerticalOverflow tests
describe("useIsVerticalOverflow", () => {
  it("returns initial state with no overflow", () => {
    const { result } = renderHook(() => useIsVerticalOverflow(200));

    expect(result.current.isOverflow).toBe(false);
    expect(result.current.contentHeight).toBe(0);
  });

  it("detects overflow when content height exceeds maxHeight", () => {
    const { result } = renderHook(() => useIsVerticalOverflow(100));

    act(() => {
      result.current.onLayout(createLayoutEvent(300, 150));
    });

    expect(result.current.isOverflow).toBe(true);
    expect(result.current.contentHeight).toBe(150);
  });

  it("reports no overflow when content fits within maxHeight", () => {
    const { result } = renderHook(() => useIsVerticalOverflow(200));

    act(() => {
      result.current.onLayout(createLayoutEvent(300, 100));
    });

    expect(result.current.isOverflow).toBe(false);
    expect(result.current.contentHeight).toBe(100);
  });

  it("avoids re-render when height unchanged", () => {
    const { result } = renderHook(() => useIsVerticalOverflow(200));

    act(() => {
      result.current.onLayout(createLayoutEvent(300, 150));
    });

    const heightBefore = result.current.contentHeight;

    act(() => {
      result.current.onLayout(createLayoutEvent(400, 150)); // Width changed, height same
    });

    expect(result.current.contentHeight).toBe(heightBefore);
  });
});
//#endregion useIsVerticalOverflow tests
