import {
  isEmptyObject,
  shallowEqual,
  keyMirror,
  deleteKeysFromObject,
  pickKeysFromObject,
} from "./object";

describe("isEmptyObject", () => {
  it("should return true for null", () => {
    expect(isEmptyObject(null)).toBe(true);
  });

  it("should return true for undefined", () => {
    expect(isEmptyObject(undefined)).toBe(true);
  });

  it("should return true for empty object", () => {
    expect(isEmptyObject({})).toBe(true);
  });

  it("should return false for object with properties", () => {
    expect(isEmptyObject({ a: 1 })).toBe(false);
  });

  it("should return false for object with falsy values", () => {
    expect(isEmptyObject({ a: null })).toBe(false);
    expect(isEmptyObject({ a: undefined })).toBe(false);
    expect(isEmptyObject({ a: 0 })).toBe(false);
    expect(isEmptyObject({ a: "" })).toBe(false);
  });

  it("should return true for empty array", () => {
    expect(isEmptyObject([])).toBe(true);
  });

  it("should return false for non-empty array", () => {
    expect(isEmptyObject([1, 2, 3])).toBe(false);
  });
});

describe("shallowEqual", () => {
  it("should return true for identical primitives", () => {
    expect(shallowEqual(1, 1)).toBe(true);
    expect(shallowEqual("a", "a")).toBe(true);
    expect(shallowEqual(true, true)).toBe(true);
  });

  it("should return false for different primitives", () => {
    expect(shallowEqual(1, 2)).toBe(false);
    expect(shallowEqual("a", "b")).toBe(false);
  });

  it("should return true for same reference", () => {
    const obj = { a: 1 };
    expect(shallowEqual(obj, obj)).toBe(true);
  });

  it("should return true for shallow equal objects", () => {
    expect(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
  });

  it("should return false for objects with different keys", () => {
    expect(shallowEqual({ a: 1 }, { b: 1 })).toBe(false);
  });

  it("should return false for objects with different values", () => {
    expect(shallowEqual({ a: 1 }, { a: 2 })).toBe(false);
  });

  it("should return false for nested objects (not deep equal)", () => {
    expect(shallowEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(false);
  });

  it("should return true for null/null", () => {
    expect(shallowEqual(null, null)).toBe(true);
  });

  it("should return false for null vs object", () => {
    expect(shallowEqual(null, {})).toBe(false);
    expect(shallowEqual({}, null)).toBe(false);
  });

  it("should handle arrays", () => {
    expect(shallowEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(shallowEqual([1, 2], [1, 2, 3])).toBe(false);
  });
});

describe("keyMirror", () => {
  it("should create object with keys equal to values", () => {
    const result = keyMirror({ A: null, B: null, C: null });
    expect(result).toEqual({ A: "A", B: "B", C: "C" });
  });

  it("should mirror any object keys regardless of original values", () => {
    const result = keyMirror({ foo: 123, bar: "baz" });
    expect(result).toEqual({ foo: "foo", bar: "bar" });
  });

  it("should handle empty object", () => {
    const result = keyMirror({});
    expect(result).toEqual({});
  });

  it("should throw for non-object input", () => {
    expect(() =>
      keyMirror(null as unknown as Record<string, unknown>),
    ).toThrow();
    expect(() => keyMirror([] as unknown as Record<string, unknown>)).toThrow();
  });

  it("should only include own properties", () => {
    const proto = { inherited: null };
    const obj = Object.create(proto);
    obj.own = null;
    const result = keyMirror(obj);
    expect(result).toEqual({ own: "own" });
    expect(result).not.toHaveProperty("inherited");
  });
});

describe("deleteKeysFromObject", () => {
  it("should delete specified keys", () => {
    const result = deleteKeysFromObject({ a: 1, b: 2, c: 3 }, ["a", "c"]);
    expect(result).toEqual({ b: 2 });
  });

  it("should return same object if keys do not exist", () => {
    const result = deleteKeysFromObject({ a: 1 }, ["b", "c"]);
    expect(result).toEqual({ a: 1 });
  });

  it("should handle empty keys array", () => {
    const result = deleteKeysFromObject({ a: 1 }, []);
    expect(result).toEqual({ a: 1 });
  });

  it("should be immutable - not modify original", () => {
    const original = { a: 1, b: 2 };
    const result = deleteKeysFromObject(original, ["a"]);
    expect(original).toEqual({ a: 1, b: 2 }); // original unchanged
    expect(result).toEqual({ b: 2 });
  });
});

describe("pickKeysFromObject", () => {
  it("should pick specified keys", () => {
    const result = pickKeysFromObject({ a: 1, b: 2, c: 3 }, ["a", "c"]);
    expect(result).toEqual({ a: 1, c: 3 });
  });

  it("should ignore keys that do not exist", () => {
    const result = pickKeysFromObject({ a: 1 }, ["a", "b"]);
    expect(result).toEqual({ a: 1 });
  });

  it("should handle empty keys array", () => {
    const result = pickKeysFromObject({ a: 1 }, []);
    expect(result).toEqual({});
  });

  it("should be immutable - not modify original", () => {
    const original = { a: 1, b: 2 };
    const result = pickKeysFromObject(original, ["a"]);
    expect(original).toEqual({ a: 1, b: 2 }); // original unchanged
    expect(result).toEqual({ a: 1 });
  });
});
