import { renderHook } from "@testing-library/react-native";

import { useDidUpdate } from "./useDidUpdate";

describe("useDidUpdate", () => {
  it("does not call effect on initial render", () => {
    const effect = jest.fn();

    renderHook(() => useDidUpdate(effect, [1]));

    expect(effect).not.toHaveBeenCalled();
  });

  it("does not call effect with undefined deps on initial render", () => {
    const effect = jest.fn();

    renderHook(() => useDidUpdate(effect));

    expect(effect).not.toHaveBeenCalled();
  });

  it("calls effect when deps change after mount", () => {
    const effect = jest.fn();
    let dep = 1;

    const { rerender } = renderHook(() => useDidUpdate(effect, [dep]));
    expect(effect).not.toHaveBeenCalled();

    dep = 2;
    rerender({});

    expect(effect).toHaveBeenCalledTimes(1);
  });

  it("calls effect multiple times on multiple updates", () => {
    const effect = jest.fn();
    let dep = 1;

    const { rerender } = renderHook(() => useDidUpdate(effect, [dep]));
    expect(effect).not.toHaveBeenCalled();

    dep = 2;
    rerender({});
    expect(effect).toHaveBeenCalledTimes(1);

    dep = 3;
    rerender({});
    expect(effect).toHaveBeenCalledTimes(2);

    dep = 4;
    rerender({});
    expect(effect).toHaveBeenCalledTimes(3);
  });

  it("does not call effect when deps are the same", () => {
    const effect = jest.fn();
    const dep = 1;

    const { rerender } = renderHook(() => useDidUpdate(effect, [dep]));
    expect(effect).not.toHaveBeenCalled();

    rerender({});
    expect(effect).not.toHaveBeenCalled();

    rerender({});
    expect(effect).not.toHaveBeenCalled();
  });

  it("calls cleanup on subsequent updates", () => {
    const cleanup = jest.fn();
    const effect = jest.fn(() => cleanup);
    let dep = 1;

    const { rerender } = renderHook(() => useDidUpdate(effect, [dep]));
    expect(cleanup).not.toHaveBeenCalled();

    dep = 2;
    rerender({});
    expect(effect).toHaveBeenCalledTimes(1);
    expect(cleanup).not.toHaveBeenCalled();

    dep = 3;
    rerender({});
    expect(effect).toHaveBeenCalledTimes(2);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("calls cleanup on unmount after update", () => {
    const cleanup = jest.fn();
    const effect = jest.fn(() => cleanup);
    let dep = 1;

    const { rerender, unmount } = renderHook(() => useDidUpdate(effect, [dep]));

    dep = 2;
    rerender({});
    expect(effect).toHaveBeenCalledTimes(1);
    expect(cleanup).not.toHaveBeenCalled();

    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("never runs effect with empty deps after mount", () => {
    const effect = jest.fn();

    const { rerender } = renderHook(() => useDidUpdate(effect, []));
    expect(effect).not.toHaveBeenCalled();

    rerender({});
    expect(effect).not.toHaveBeenCalled();

    rerender({});
    expect(effect).not.toHaveBeenCalled();

    rerender({});
    expect(effect).not.toHaveBeenCalled();
  });
});
