import {
  unique,
  uniqueBy,
  chunk,
  groupBy,
  insertWithoutDuplicates,
  removeItem,
} from "./array";

describe("unique", () => {
  it("should remove duplicate primitives", () => {
    expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
  });

  it("should preserve order (first occurrence)", () => {
    expect(unique([3, 1, 2, 1, 3])).toEqual([3, 1, 2]);
  });

  it("should handle empty array", () => {
    expect(unique([])).toEqual([]);
  });

  it("should handle strings", () => {
    expect(unique(["a", "b", "a", "c"])).toEqual(["a", "b", "c"]);
  });

  it("should not mutate original array", () => {
    const original = [1, 2, 2, 3];
    const result = unique(original);
    expect(original).toEqual([1, 2, 2, 3]);
    expect(result).not.toBe(original);
  });
});

describe("uniqueBy", () => {
  it("should remove duplicates by key", () => {
    const items = [
      { id: 1, name: "a" },
      { id: 2, name: "b" },
      { id: 1, name: "c" },
    ];
    expect(uniqueBy(items, (item) => item.id)).toEqual([
      { id: 1, name: "a" },
      { id: 2, name: "b" },
    ]);
  });

  it("should handle empty array", () => {
    expect(uniqueBy([], (x) => x)).toEqual([]);
  });

  it("should preserve first occurrence", () => {
    const items = [
      { type: "A", value: 1 },
      { type: "B", value: 2 },
      { type: "A", value: 3 },
    ];
    const result = uniqueBy(items, (item) => item.type);
    expect(result).toHaveLength(2);
    expect(result[0].value).toBe(1);
  });
});

describe("chunk", () => {
  it("should split array into chunks", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("should handle exact division", () => {
    expect(chunk([1, 2, 3, 4], 2)).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it("should handle chunk size larger than array", () => {
    expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
  });

  it("should handle empty array", () => {
    expect(chunk([], 2)).toEqual([]);
  });

  it("should handle chunk size of 1", () => {
    expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
  });

  it("should throw for invalid chunk size", () => {
    expect(() => chunk([1, 2, 3], 0)).toThrow();
    expect(() => chunk([1, 2, 3], -1)).toThrow();
  });
});

describe("groupBy", () => {
  it("should group by key", () => {
    const items = [
      { type: "A", value: 1 },
      { type: "B", value: 2 },
      { type: "A", value: 3 },
    ];
    const result = groupBy(items, (item) => item.type);
    expect(result).toEqual({
      A: [
        { type: "A", value: 1 },
        { type: "A", value: 3 },
      ],
      B: [{ type: "B", value: 2 }],
    });
  });

  it("should handle empty array", () => {
    expect(groupBy([], (x) => x)).toEqual({});
  });

  it("should handle single item", () => {
    const result = groupBy([{ key: "a" }], (item) => item.key);
    expect(result).toEqual({ a: [{ key: "a" }] });
  });
});

describe("insertWithoutDuplicates", () => {
  it("should insert item if not present", () => {
    expect(insertWithoutDuplicates([1, 2, 3], 4)).toEqual([1, 2, 3, 4]);
  });

  it("should not insert duplicate", () => {
    expect(insertWithoutDuplicates([1, 2, 3], 2)).toEqual([1, 2, 3]);
  });

  it("should handle empty array", () => {
    expect(insertWithoutDuplicates([], 1)).toEqual([1]);
  });

  it("should not mutate original", () => {
    const original = [1, 2, 3];
    const result = insertWithoutDuplicates(original, 4);
    expect(original).toEqual([1, 2, 3]);
    expect(result).not.toBe(original);
  });
});

describe("removeItem", () => {
  it("should remove item from array", () => {
    expect(removeItem([1, 2, 3], 2)).toEqual([1, 3]);
  });

  it("should return same content if item not found", () => {
    expect(removeItem([1, 2, 3], 4)).toEqual([1, 2, 3]);
  });

  it("should remove only first occurrence", () => {
    expect(removeItem([1, 2, 2, 3], 2)).toEqual([1, 2, 3]);
  });

  it("should handle empty array", () => {
    expect(removeItem([], 1)).toEqual([]);
  });

  it("should not mutate original", () => {
    const original = [1, 2, 3];
    const result = removeItem(original, 2);
    expect(original).toEqual([1, 2, 3]);
    expect(result).not.toBe(original);
  });
});
