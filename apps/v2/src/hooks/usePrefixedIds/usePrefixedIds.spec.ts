import { renderHook } from "@testing-library/react-native";
import {
  usePrefixedIds,
  joinIds,
  generateUniqueId,
  resetIdCounter,
} from "./usePrefixedIds";

//#region usePrefixedIds Tests
describe("usePrefixedIds", () => {
  it("generates prefixed IDs from suffix object", () => {
    const suffixes = { label: true, description: true, input: true };
    const { result } = renderHook(() => usePrefixedIds("form-field", suffixes));

    expect(result.current).toEqual({
      label: "form-field-label",
      description: "form-field-description",
      input: "form-field-input",
    });
  });

  it("handles empty suffix object", () => {
    const suffixes = {};
    const { result } = renderHook(() => usePrefixedIds("empty", suffixes));

    expect(result.current).toEqual({});
  });

  it("memoizes result", () => {
    const suffixes = { label: true };
    const { result, rerender } = renderHook(() =>
      usePrefixedIds("test", suffixes),
    );

    const firstResult = result.current;
    rerender({});
    const secondResult = result.current;

    expect(firstResult).toBe(secondResult);
  });

  it("updates when prefix changes", () => {
    const suffixes = { label: true };
    let prefix = "first";

    const { result, rerender } = renderHook(() =>
      usePrefixedIds(prefix, suffixes),
    );

    expect(result.current.label).toBe("first-label");

    prefix = "second";
    rerender({});

    expect(result.current.label).toBe("second-label");
  });
});
//#endregion usePrefixedIds Tests

//#region joinIds Tests
describe("joinIds", () => {
  it("joins multiple IDs with space", () => {
    const result = joinIds("id1", "id2", "id3");

    expect(result).toBe("id1 id2 id3");
  });

  it("filters out undefined and null", () => {
    const result = joinIds("id1", undefined, "id2", null, "id3");

    expect(result).toBe("id1 id2 id3");
  });
});
//#endregion joinIds Tests

//#region generateUniqueId Tests
describe("generateUniqueId", () => {
  beforeEach(() => {
    resetIdCounter();
  });

  it("generates incrementing IDs", () => {
    const id1 = generateUniqueId("test");
    const id2 = generateUniqueId("test");
    const id3 = generateUniqueId();

    expect(id1).toBe("test-1");
    expect(id2).toBe("test-2");
    expect(id3).toBe("id-3");
  });
});
//#endregion generateUniqueId Tests

//#region resetIdCounter Tests
describe("resetIdCounter", () => {
  it("resets counter to 0", () => {
    generateUniqueId("pre");
    generateUniqueId("pre");

    resetIdCounter();

    const id = generateUniqueId("fresh");

    expect(id).toBe("fresh-1");
  });
});
//#endregion resetIdCounter Tests
