// apps/v2/src/hooks/useResizeObserver/useResizeObserver.spec.ts

import { act, renderHook } from "@testing-library/react-native";
import { Platform } from "react-native";

import {
  useResizeObserver,
  useElementDimensionsById,
  type IDimensions,
} from "./useResizeObserver";

//#region Mock ResizeObserver

type IResizeObserverCallback = (
  entries: ResizeObserverEntry[],
  observer: ResizeObserver,
) => void;

class MockResizeObserver {
  callback: IResizeObserverCallback;
  elements: Element[] = [];
  static instances: MockResizeObserver[] = [];

  constructor(callback: IResizeObserverCallback) {
    this.callback = callback;
    MockResizeObserver.instances.push(this);
  }

  observe(element: Element): void {
    this.elements.push(element);
  }

  unobserve(element: Element): void {
    this.elements = this.elements.filter((el) => el !== element);
  }

  disconnect(): void {
    this.elements = [];
  }

  simulateResize(width: number, height: number, x = 0, y = 0): void {
    const entries = this.elements.map(
      (target) =>
        ({
          target,
          contentRect: {
            width,
            height,
            x,
            y,
            top: y,
            left: x,
            bottom: y + height,
            right: x + width,
          } as DOMRectReadOnly,
          borderBoxSize: [],
          contentBoxSize: [],
          devicePixelContentBoxSize: [],
        }) as ResizeObserverEntry,
    );
    this.callback(entries, this as unknown as ResizeObserver);
  }

  static reset(): void {
    MockResizeObserver.instances = [];
  }

  static getLastInstance(): MockResizeObserver | undefined {
    return MockResizeObserver.instances[
      MockResizeObserver.instances.length - 1
    ];
  }
}

//#endregion Mock ResizeObserver

//#region Mock Element

function createMockElement(dimensions: {
  x: number;
  y: number;
  width: number;
  height: number;
}): Element {
  return {
    getBoundingClientRect: jest.fn().mockReturnValue(dimensions),
  } as unknown as Element;
}

//#endregion Mock Element

//#region Mock Document

type IGetElementByIdMock = jest.Mock<Element | null, [string]>;

const mockDocument = {
  getElementById: jest.fn() as IGetElementByIdMock,
  createElement: jest.fn(() => {
    return createMockElement({ x: 0, y: 0, width: 0, height: 0 });
  }),
};

// Set up document mock before any tests run
// @ts-expect-error - mocking document in RN environment
globalThis.document = mockDocument;

//#endregion Mock Document

//#region Test Setup

const originalResizeObserver = globalThis.ResizeObserver;
const originalPlatformOS = Platform.OS;

beforeEach(() => {
  MockResizeObserver.reset();
  globalThis.ResizeObserver =
    MockResizeObserver as unknown as typeof ResizeObserver;
  Platform.OS = "web";
  jest.useFakeTimers();
  mockDocument.getElementById.mockReset();
});

afterEach(() => {
  globalThis.ResizeObserver = originalResizeObserver;
  Platform.OS = originalPlatformOS;
  jest.useRealTimers();
});

//#endregion Test Setup

//#region useResizeObserver Tests

describe("useResizeObserver", () => {
  it("returns initial dimensions as zeros", () => {
    const { result } = renderHook(() => useResizeObserver<HTMLDivElement>());

    expect(result.current.dimensions).toEqual({
      width: 0,
      height: 0,
      x: 0,
      y: 0,
    });
  });

  it("returns a stable ref object", () => {
    const { result, rerender } = renderHook(() =>
      useResizeObserver<HTMLDivElement>(),
    );

    const firstRef = result.current.ref;
    rerender({});
    const secondRef = result.current.ref;

    expect(firstRef).toBe(secondRef);
  });

  it("updates dimensions when ResizeObserver fires", () => {
    const mockElement = createMockElement({
      x: 10,
      y: 20,
      width: 100,
      height: 200,
    });

    const { result, rerender } = renderHook(() =>
      useResizeObserver<HTMLDivElement>(),
    );

    // Set the ref
    act(() => {
      result.current.ref.current = mockElement as HTMLDivElement;
    });

    // Re-render to trigger effect with ref attached
    rerender({});

    // Get observer and simulate resize
    const observer = MockResizeObserver.getLastInstance();
    expect(observer).toBeDefined();
    expect(observer?.elements).toContain(mockElement);

    act(() => {
      observer?.simulateResize(100, 200, 10, 20);
    });

    expect(result.current.dimensions).toEqual({
      width: 100,
      height: 200,
      x: 10,
      y: 20,
    });
  });

  it("returns no-op on native platforms", () => {
    Platform.OS = "ios";

    const { result } = renderHook(() => useResizeObserver<HTMLDivElement>());

    expect(result.current.dimensions).toEqual({
      width: 0,
      height: 0,
      x: 0,
      y: 0,
    });

    // No observer should be created
    expect(MockResizeObserver.instances.length).toBe(0);
  });

  it("debounces resize updates when debounceMs is set", () => {
    const mockElement = createMockElement({
      x: 0,
      y: 0,
      width: 200,
      height: 200,
    });

    const { result, rerender } = renderHook(() =>
      useResizeObserver<HTMLDivElement>({ debounceMs: 100 }),
    );

    act(() => {
      result.current.ref.current = mockElement as HTMLDivElement;
    });

    rerender({});

    const observer = MockResizeObserver.getLastInstance();

    // Simulate multiple rapid resizes
    act(() => {
      observer?.simulateResize(100, 100);
      observer?.simulateResize(150, 150);
      observer?.simulateResize(200, 200);
    });

    // Dimensions should not update yet
    expect(result.current.dimensions.width).toBe(0);

    // Advance timer
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Now should have the last dimensions
    expect(result.current.dimensions.width).toBe(200);
  });

  it("cleans up observer on unmount", () => {
    const mockElement = createMockElement({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });

    const { result, unmount, rerender } = renderHook(() =>
      useResizeObserver<HTMLDivElement>(),
    );

    act(() => {
      result.current.ref.current = mockElement as HTMLDivElement;
    });

    rerender({});

    const observer = MockResizeObserver.getLastInstance();
    const disconnectSpy = jest.spyOn(observer!, "disconnect");

    unmount();

    expect(disconnectSpy).toHaveBeenCalled();
  });

  it("avoids re-render when dimensions are unchanged", () => {
    const mockElement = createMockElement({
      x: 10,
      y: 20,
      width: 100,
      height: 200,
    });

    const { result, rerender } = renderHook(() =>
      useResizeObserver<HTMLDivElement>(),
    );

    act(() => {
      result.current.ref.current = mockElement as HTMLDivElement;
    });

    rerender({});

    const observer = MockResizeObserver.getLastInstance();

    act(() => {
      observer?.simulateResize(100, 200, 10, 20);
    });

    const dimensionsRef = result.current.dimensions;

    // Simulate same dimensions
    act(() => {
      observer?.simulateResize(100, 200, 10, 20);
    });

    // Same object reference means no re-render occurred
    expect(result.current.dimensions).toBe(dimensionsRef);
  });
});

//#endregion useResizeObserver Tests

//#region useElementDimensionsById Tests

describe("useElementDimensionsById", () => {
  it("returns initial dimensions as zeros", () => {
    mockDocument.getElementById.mockReturnValue(null);

    const { result } = renderHook(() => useElementDimensionsById("test-id"));

    expect(result.current).toEqual({
      width: 0,
      height: 0,
      x: 0,
      y: 0,
    });
  });

  it("observes element by ID", () => {
    const mockElement = createMockElement({
      x: 5,
      y: 10,
      width: 150,
      height: 250,
    });
    mockDocument.getElementById.mockReturnValue(mockElement);

    const { result } = renderHook(() => useElementDimensionsById("my-element"));

    const observer = MockResizeObserver.getLastInstance();
    expect(observer?.elements).toContain(mockElement);

    act(() => {
      observer?.simulateResize(150, 250, 5, 10);
    });

    expect(result.current).toEqual({
      width: 150,
      height: 250,
      x: 5,
      y: 10,
    });
  });

  it("returns no-op on native platforms", () => {
    Platform.OS = "android";

    const mockElement = createMockElement({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
    mockDocument.getElementById.mockReturnValue(mockElement);

    const { result } = renderHook(() => useElementDimensionsById("test-id"));

    expect(result.current).toEqual({
      width: 0,
      height: 0,
      x: 0,
      y: 0,
    });

    // No observer should be created
    expect(MockResizeObserver.instances.length).toBe(0);
  });

  it("debounces resize updates when debounceMs is set", () => {
    const mockElement = createMockElement({
      x: 0,
      y: 0,
      width: 300,
      height: 400,
    });
    mockDocument.getElementById.mockReturnValue(mockElement);

    const { result } = renderHook(() =>
      useElementDimensionsById("debounce-test", { debounceMs: 50 }),
    );

    const observer = MockResizeObserver.getLastInstance();

    // Multiple rapid resizes
    act(() => {
      observer?.simulateResize(100, 100);
      observer?.simulateResize(200, 200);
      observer?.simulateResize(300, 400);
    });

    // Not updated yet
    expect(result.current.width).toBe(0);

    // Advance timer
    act(() => {
      jest.advanceTimersByTime(50);
    });

    // Now updated to last value
    expect(result.current).toEqual({
      width: 300,
      height: 400,
      x: 0,
      y: 0,
    });
  });

  it("re-observes when elementId changes", () => {
    const mockElement1 = createMockElement({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });

    const mockElement2 = createMockElement({
      x: 0,
      y: 0,
      width: 200,
      height: 200,
    });

    mockDocument.getElementById.mockImplementation((id: string) => {
      if (id === "element-1") return mockElement1;
      if (id === "element-2") return mockElement2;
      return null;
    });

    const { result, rerender } = renderHook<IDimensions, { id: string }>(
      ({ id }) => useElementDimensionsById(id),
      { initialProps: { id: "element-1" } },
    );

    const observer1 = MockResizeObserver.getLastInstance();
    expect(observer1?.elements).toContain(mockElement1);

    act(() => {
      observer1?.simulateResize(100, 100);
    });

    expect(result.current.width).toBe(100);

    // Change elementId
    rerender({ id: "element-2" });

    const observer2 = MockResizeObserver.getLastInstance();
    expect(observer2?.elements).toContain(mockElement2);

    act(() => {
      observer2?.simulateResize(200, 200);
    });

    expect(result.current.width).toBe(200);
  });

  it("cleans up debounce timeout on unmount", () => {
    const mockElement = createMockElement({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
    mockDocument.getElementById.mockReturnValue(mockElement);

    const { unmount } = renderHook(() =>
      useElementDimensionsById("cleanup-test", { debounceMs: 100 }),
    );

    const observer = MockResizeObserver.getLastInstance();

    // Trigger resize with debounce
    act(() => {
      observer?.simulateResize(100, 100);
    });

    // Unmount before debounce completes
    unmount();

    // Advance timer - should not throw
    expect(() => {
      act(() => {
        jest.advanceTimersByTime(100);
      });
    }).not.toThrow();
  });
});

//#endregion useElementDimensionsById Tests
