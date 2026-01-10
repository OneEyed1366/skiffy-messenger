import { renderHook } from "@testing-library/react-native";

import {
  usePrevious,
  usePreviousWithInitial,
  useHasChanged,
  useFirstRender,
  usePreviousDistinct,
} from "./usePrevious";

//#region usePrevious tests
describe("usePrevious", () => {
  it("returns undefined on first render", () => {
    const { result } = renderHook(() => usePrevious(1));
    expect(result.current).toBeUndefined();
  });

  it("returns previous value after rerender", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => usePrevious(value),
      {
        initialProps: { value: 1 },
      },
    );

    expect(result.current).toBeUndefined();

    rerender({ value: 2 });
    expect(result.current).toBe(1);

    rerender({ value: 3 });
    expect(result.current).toBe(2);
  });

  it("works with objects", () => {
    const obj1 = { a: 1 };
    const obj2 = { a: 2 };

    const { result, rerender } = renderHook(
      ({ value }: { value: { a: number } }) => usePrevious(value),
      {
        initialProps: { value: obj1 },
      },
    );

    expect(result.current).toBeUndefined();

    rerender({ value: obj2 });
    expect(result.current).toBe(obj1);
  });
});
//#endregion usePrevious tests

//#region usePreviousWithInitial tests
describe("usePreviousWithInitial", () => {
  it("returns initial value on first render", () => {
    const { result } = renderHook(() => usePreviousWithInitial(10, 0));
    expect(result.current).toBe(0);
  });

  it("returns previous value after rerender", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => usePreviousWithInitial(value, 0),
      { initialProps: { value: 1 } },
    );

    expect(result.current).toBe(0);

    rerender({ value: 2 });
    expect(result.current).toBe(1);

    rerender({ value: 3 });
    expect(result.current).toBe(2);
  });
});
//#endregion usePreviousWithInitial tests

//#region useHasChanged tests
describe("useHasChanged", () => {
  it("returns true on first render (undefined !== value)", () => {
    const { result } = renderHook(() => useHasChanged(1));
    expect(result.current).toBe(true);
  });

  it("returns true when value changes", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => useHasChanged(value),
      { initialProps: { value: 1 } },
    );

    rerender({ value: 2 });
    expect(result.current).toBe(true);
  });

  it("returns false when value stays the same", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => useHasChanged(value),
      { initialProps: { value: 1 } },
    );

    rerender({ value: 1 });
    expect(result.current).toBe(false);
  });

  it("uses custom compareFn", () => {
    const compareFn = (
      prev: { id: number } | undefined,
      curr: { id: number },
    ) => prev?.id !== curr.id;

    const { result, rerender } = renderHook(
      ({ value }: { value: { id: number } }) => useHasChanged(value, compareFn),
      { initialProps: { value: { id: 1 } } },
    );

    // Different object reference but same id
    rerender({ value: { id: 1 } });
    expect(result.current).toBe(false);

    // Different id
    rerender({ value: { id: 2 } });
    expect(result.current).toBe(true);
  });
});
//#endregion useHasChanged tests

//#region useFirstRender tests
describe("useFirstRender", () => {
  it("returns true on first render", () => {
    const { result } = renderHook(() => useFirstRender());
    expect(result.current).toBe(true);
  });

  it("returns false on subsequent renders", () => {
    const { result, rerender } = renderHook(() => useFirstRender());

    expect(result.current).toBe(true);

    rerender({});
    expect(result.current).toBe(false);

    rerender({});
    expect(result.current).toBe(false);
  });
});
//#endregion useFirstRender tests

//#region usePreviousDistinct tests
describe("usePreviousDistinct", () => {
  it("returns undefined on first render", () => {
    const { result } = renderHook(() => usePreviousDistinct(1));
    expect(result.current).toBeUndefined();
  });

  it("returns previous distinct value", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => usePreviousDistinct(value),
      { initialProps: { value: 1 } },
    );

    expect(result.current).toBeUndefined();

    rerender({ value: 2 });
    expect(result.current).toBe(1);

    rerender({ value: 3 });
    expect(result.current).toBe(2);
  });

  it("ignores duplicate consecutive values", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => usePreviousDistinct(value),
      { initialProps: { value: 1 } },
    );

    rerender({ value: 2 });
    expect(result.current).toBe(1);

    // Same value, should not update previous
    rerender({ value: 2 });
    expect(result.current).toBe(1);

    rerender({ value: 3 });
    expect(result.current).toBe(2);
  });

  it("uses custom compareFn for equality", () => {
    const compareFn = (a: { id: number }, b: { id: number }) => a.id === b.id;

    const { result, rerender } = renderHook(
      ({ value }: { value: { id: number } }) =>
        usePreviousDistinct(value, compareFn),
      { initialProps: { value: { id: 1 } } },
    );

    expect(result.current).toBeUndefined();

    // Different object but same id - should be considered equal
    rerender({ value: { id: 1 } });
    expect(result.current).toBeUndefined();

    // Different id - should update
    rerender({ value: { id: 2 } });
    expect(result.current).toEqual({ id: 1 });
  });
});
//#endregion usePreviousDistinct tests
