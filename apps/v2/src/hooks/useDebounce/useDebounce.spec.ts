import { renderHook, act } from "@testing-library/react-native";

import {
  useDebounce,
  useDebouncedCallback,
  useThrottle,
  useThrottledCallback,
} from "./useDebounce";

//#region Test Setup
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});
//#endregion Test Setup

//#region useDebounce tests
describe("useDebounce", () => {
  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 300));
    expect(result.current).toBe("initial");
  });

  it("debounces value updates", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 300),
      { initialProps: { value: "initial" } },
    );

    rerender({ value: "updated" });
    expect(result.current).toBe("initial");

    act(() => {
      jest.advanceTimersByTime(299);
    });
    expect(result.current).toBe("initial");

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe("updated");
  });

  it("resets timer on rapid changes", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 300),
      { initialProps: { value: "initial" } },
    );

    rerender({ value: "first" });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    rerender({ value: "second" });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Should still be initial because timer was reset
    expect(result.current).toBe("initial");

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe("second");
  });

  it("uses default delay of 300ms", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => useDebounce(value),
      { initialProps: { value: 1 } },
    );

    rerender({ value: 2 });
    expect(result.current).toBe(1);

    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe(2);
  });
});
//#endregion useDebounce tests

//#region useDebouncedCallback tests
describe("useDebouncedCallback", () => {
  it("debounces callback execution", () => {
    const callback = jest.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(callback, { delay: 300 }),
    );

    result.current("arg1");
    result.current("arg2");
    result.current("arg3");

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("arg3");
  });

  it("supports leading edge execution", () => {
    const callback = jest.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(callback, { delay: 300, leading: true }),
    );

    result.current("first");
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("first");

    result.current("second");
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Leading already called, trailing should not call again with same args
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("cancel() stops pending execution", () => {
    const callback = jest.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(callback, { delay: 300 }),
    );

    result.current("test");
    expect(result.current.pending()).toBe(true);

    result.current.cancel();
    expect(result.current.pending()).toBe(false);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("flush() executes pending callback immediately", () => {
    const callback = jest.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(callback, { delay: 300 }),
    );

    result.current("flushed");
    expect(callback).not.toHaveBeenCalled();

    result.current.flush();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("flushed");
  });

  it("pending() returns correct state", () => {
    const callback = jest.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(callback, { delay: 300 }),
    );

    expect(result.current.pending()).toBe(false);

    result.current("test");
    expect(result.current.pending()).toBe(true);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current.pending()).toBe(false);
  });

  it("supports maxWait option", () => {
    const callback = jest.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(callback, { delay: 300, maxWait: 500 }),
    );

    // Keep calling to reset debounce timer
    result.current("call1");
    act(() => {
      jest.advanceTimersByTime(200);
    });

    result.current("call2");
    act(() => {
      jest.advanceTimersByTime(200);
    });

    result.current("call3");
    // At 400ms total, maxWait not reached yet
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(100);
    });
    // At 500ms, maxWait triggers
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("call3");
  });

  it("cleans up on unmount", () => {
    const callback = jest.fn();
    const { result, unmount } = renderHook(() =>
      useDebouncedCallback(callback, { delay: 300 }),
    );

    result.current("test");
    unmount();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
//#endregion useDebouncedCallback tests

//#region useThrottle tests
describe("useThrottle", () => {
  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useThrottle("initial", 300));
    expect(result.current).toBe("initial");
  });

  it("throttles value updates", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => useThrottle(value, 300),
      { initialProps: { value: 1 } },
    );

    // First update goes through immediately
    rerender({ value: 2 });
    expect(result.current).toBe(2);

    // Subsequent updates within interval are throttled
    rerender({ value: 3 });
    expect(result.current).toBe(2);

    rerender({ value: 4 });
    expect(result.current).toBe(2);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe(4);
  });

  it("uses default interval of 300ms", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => useThrottle(value),
      { initialProps: { value: 1 } },
    );

    rerender({ value: 2 });
    expect(result.current).toBe(2);

    rerender({ value: 3 });
    expect(result.current).toBe(2);

    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe(3);
  });
});
//#endregion useThrottle tests

//#region useThrottledCallback tests
describe("useThrottledCallback", () => {
  it("executes immediately on first call (leading)", () => {
    const callback = jest.fn();
    const { result } = renderHook(() =>
      useThrottledCallback(callback, { interval: 300 }),
    );

    result.current("first");
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("first");
  });

  it("throttles subsequent calls", () => {
    const callback = jest.fn();
    const { result } = renderHook(() =>
      useThrottledCallback(callback, { interval: 300 }),
    );

    result.current("first");
    result.current("second");
    result.current("third");

    // Only first call executed immediately
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("first");

    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Trailing call with last args
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith("third");
  });

  it("supports trailing: false", () => {
    const callback = jest.fn();
    const { result } = renderHook(() =>
      useThrottledCallback(callback, { interval: 300, trailing: false }),
    );

    result.current("first");
    result.current("second");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("first");

    act(() => {
      jest.advanceTimersByTime(300);
    });

    // No trailing call
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("supports leading: false", () => {
    const callback = jest.fn();
    const { result } = renderHook(() =>
      useThrottledCallback(callback, { interval: 300, leading: false }),
    );

    result.current("first");
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("first");
  });

  it("cancel() stops pending trailing call", () => {
    const callback = jest.fn();
    const { result } = renderHook(() =>
      useThrottledCallback(callback, { interval: 300 }),
    );

    result.current("first");
    result.current("second");

    expect(callback).toHaveBeenCalledTimes(1);

    result.current.cancel();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Trailing call was cancelled
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("cleans up on unmount", () => {
    const callback = jest.fn();
    const { result, unmount } = renderHook(() =>
      useThrottledCallback(callback, { interval: 300 }),
    );

    result.current("first");
    result.current("second");

    unmount();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Only leading call, trailing was cleaned up
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
//#endregion useThrottledCallback tests
