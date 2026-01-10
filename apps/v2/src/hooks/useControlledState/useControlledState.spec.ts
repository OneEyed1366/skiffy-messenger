import { act, renderHook } from "@testing-library/react-native";

import { useControlledState } from "./useControlledState";

//#region Controlled mode tests
describe("useControlledState - controlled mode", () => {
  it("returns controlled value when value is provided", () => {
    const { result } = renderHook(() =>
      useControlledState({ value: "controlled" }),
    );

    const [value, , isControlled] = result.current;
    expect(value).toBe("controlled");
    expect(isControlled).toBe(true);
  });

  it("treats empty string as controlled value", () => {
    const { result } = renderHook(() => useControlledState({ value: "" }));

    const [value, , isControlled] = result.current;
    expect(value).toBe("");
    expect(isControlled).toBe(true);
  });

  it("treats zero as controlled value", () => {
    const { result } = renderHook(() => useControlledState({ value: 0 }));

    const [value, , isControlled] = result.current;
    expect(value).toBe(0);
    expect(isControlled).toBe(true);
  });

  it("treats false as controlled value", () => {
    const { result } = renderHook(() => useControlledState({ value: false }));

    const [value, , isControlled] = result.current;
    expect(value).toBe(false);
    expect(isControlled).toBe(true);
  });

  it("calls onChange when setValue is called in controlled mode", () => {
    const onChange = jest.fn();
    const { result } = renderHook(() =>
      useControlledState({ value: "initial", onChange }),
    );

    act(() => {
      result.current[1]("new value");
    });

    expect(onChange).toHaveBeenCalledWith("new value");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("does not update value internally in controlled mode", () => {
    const onChange = jest.fn();
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useControlledState({ value, onChange }),
      { initialProps: { value: "initial" } },
    );

    // Try to set new value
    act(() => {
      result.current[1]("attempted change");
    });

    // Value should still be the controlled value
    expect(result.current[0]).toBe("initial");

    // Only updates when prop changes
    rerender({ value: "new controlled value" });
    expect(result.current[0]).toBe("new controlled value");
  });
});
//#endregion Controlled mode tests

//#region Uncontrolled mode tests
describe("useControlledState - uncontrolled mode", () => {
  it("returns defaultValue when no value is provided", () => {
    const { result } = renderHook(() =>
      useControlledState({ defaultValue: "default" }),
    );

    const [value, , isControlled] = result.current;
    expect(value).toBe("default");
    expect(isControlled).toBe(false);
  });

  it("returns undefined when neither value nor defaultValue provided", () => {
    const { result } = renderHook(() =>
      useControlledState<string | undefined>({}),
    );

    const [value, , isControlled] = result.current;
    expect(value).toBeUndefined();
    expect(isControlled).toBe(false);
  });

  it("updates internal state when setValue is called", () => {
    const { result } = renderHook(() =>
      useControlledState({ defaultValue: "initial" }),
    );

    expect(result.current[0]).toBe("initial");

    act(() => {
      result.current[1]("updated");
    });

    expect(result.current[0]).toBe("updated");
  });

  it("calls onChange when setValue is called in uncontrolled mode", () => {
    const onChange = jest.fn();
    const { result } = renderHook(() =>
      useControlledState({ defaultValue: "initial", onChange }),
    );

    act(() => {
      result.current[1]("new value");
    });

    expect(onChange).toHaveBeenCalledWith("new value");
    expect(result.current[0]).toBe("new value");
  });
});
//#endregion Uncontrolled mode tests

//#region Updater function tests
describe("useControlledState - updater functions", () => {
  it("supports updater function in uncontrolled mode", () => {
    const { result } = renderHook(() =>
      useControlledState({ defaultValue: 10 }),
    );

    act(() => {
      result.current[1]((prev) => prev + 5);
    });

    expect(result.current[0]).toBe(15);
  });

  it("supports updater function in controlled mode", () => {
    const onChange = jest.fn();
    const { result } = renderHook(() =>
      useControlledState({ value: 10, onChange }),
    );

    act(() => {
      result.current[1]((prev) => prev * 2);
    });

    expect(onChange).toHaveBeenCalledWith(20);
  });
});
//#endregion Updater function tests

//#region Dev warnings tests
describe("useControlledState - dev warnings", () => {
  const originalWarn = console.warn;

  beforeEach(() => {
    console.warn = jest.fn();
  });

  afterEach(() => {
    console.warn = originalWarn;
  });

  it("warns when switching from controlled to uncontrolled", () => {
    const { rerender } = renderHook(
      ({ value }: { value: string | undefined }) =>
        useControlledState({ value }),
      { initialProps: { value: "controlled" as string | undefined } },
    );

    // Switch to uncontrolled
    rerender({ value: undefined });

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("controlled to uncontrolled"),
    );
  });

  it("warns when switching from uncontrolled to controlled", () => {
    const { rerender } = renderHook(
      ({ value }: { value: string | undefined }) =>
        useControlledState({ value, defaultValue: "default" }),
      { initialProps: { value: undefined as string | undefined } },
    );

    // Switch to controlled
    rerender({ value: "now controlled" });

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("uncontrolled to controlled"),
    );
  });
});
//#endregion Dev warnings tests
