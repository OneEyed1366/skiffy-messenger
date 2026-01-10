import { act, renderHook } from "@testing-library/react-native";
import type { LayoutChangeEvent } from "react-native";

import { useElementDimensions } from "./useElementDimensions";

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

//#region useElementDimensions tests
describe("useElementDimensions", () => {
  it("returns initial dimensions as zeros", () => {
    const { result } = renderHook(() => useElementDimensions());

    expect(result.current.dimensions).toEqual({
      width: 0,
      height: 0,
      x: 0,
      y: 0,
    });
  });

  it("returns a stable onLayout callback reference", () => {
    const { result, rerender } = renderHook(() => useElementDimensions());

    const firstCallback = result.current.onLayout;
    rerender({});
    const secondCallback = result.current.onLayout;

    expect(firstCallback).toBe(secondCallback);
  });

  it("updates dimensions when onLayout is called", () => {
    const { result } = renderHook(() => useElementDimensions());

    act(() => {
      result.current.onLayout(createLayoutEvent(100, 200, 10, 20));
    });

    expect(result.current.dimensions).toEqual({
      width: 100,
      height: 200,
      x: 10,
      y: 20,
    });
  });

  it("updates dimensions when layout changes", () => {
    const { result } = renderHook(() => useElementDimensions());

    act(() => {
      result.current.onLayout(createLayoutEvent(100, 200));
    });

    expect(result.current.dimensions).toEqual({
      width: 100,
      height: 200,
      x: 0,
      y: 0,
    });

    act(() => {
      result.current.onLayout(createLayoutEvent(300, 400, 50, 60));
    });

    expect(result.current.dimensions).toEqual({
      width: 300,
      height: 400,
      x: 50,
      y: 60,
    });
  });

  it("avoids re-render when dimensions are unchanged", () => {
    const { result } = renderHook(() => useElementDimensions());

    act(() => {
      result.current.onLayout(createLayoutEvent(100, 200, 10, 20));
    });

    const dimensionsRef = result.current.dimensions;

    act(() => {
      result.current.onLayout(createLayoutEvent(100, 200, 10, 20));
    });

    // Same object reference means no re-render occurred
    expect(result.current.dimensions).toBe(dimensionsRef);
  });

  it("triggers re-render when only width changes", () => {
    const { result } = renderHook(() => useElementDimensions());

    act(() => {
      result.current.onLayout(createLayoutEvent(100, 200, 10, 20));
    });

    const dimensionsRef = result.current.dimensions;

    act(() => {
      result.current.onLayout(createLayoutEvent(150, 200, 10, 20));
    });

    expect(result.current.dimensions).not.toBe(dimensionsRef);
    expect(result.current.dimensions.width).toBe(150);
  });

  it("triggers re-render when only height changes", () => {
    const { result } = renderHook(() => useElementDimensions());

    act(() => {
      result.current.onLayout(createLayoutEvent(100, 200, 10, 20));
    });

    const dimensionsRef = result.current.dimensions;

    act(() => {
      result.current.onLayout(createLayoutEvent(100, 250, 10, 20));
    });

    expect(result.current.dimensions).not.toBe(dimensionsRef);
    expect(result.current.dimensions.height).toBe(250);
  });

  it("triggers re-render when only position changes", () => {
    const { result } = renderHook(() => useElementDimensions());

    act(() => {
      result.current.onLayout(createLayoutEvent(100, 200, 10, 20));
    });

    const dimensionsRef = result.current.dimensions;

    act(() => {
      result.current.onLayout(createLayoutEvent(100, 200, 30, 40));
    });

    expect(result.current.dimensions).not.toBe(dimensionsRef);
    expect(result.current.dimensions.x).toBe(30);
    expect(result.current.dimensions.y).toBe(40);
  });
});
//#endregion useElementDimensions tests
