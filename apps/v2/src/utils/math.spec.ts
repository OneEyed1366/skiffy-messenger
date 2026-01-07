import { mod, stringToNumber, numberToFixedDynamic } from "./math";

describe("mod", () => {
  describe("positive numbers", () => {
    it("should return correct modulo for positive numbers", () => {
      expect(mod(5, 3)).toBe(2);
      expect(mod(10, 5)).toBe(0);
      expect(mod(7, 4)).toBe(3);
    });
  });

  describe("negative numbers (Euclidean modulo)", () => {
    it("should return positive result for negative dividend", () => {
      // This is the key difference from JavaScript % operator
      // -1 % 5 in JS = -1, but mod(-1, 5) should = 4
      expect(mod(-1, 5)).toBe(4);
      expect(mod(-2, 5)).toBe(3);
      expect(mod(-5, 5)).toBe(0);
    });

    it("should handle negative divisor", () => {
      expect(mod(5, -3)).toBe(-1);
      expect(mod(-5, -3)).toBe(-2);
    });
  });

  describe("edge cases", () => {
    it("should return 0 for 0 dividend", () => {
      expect(mod(0, 5)).toBe(0);
    });

    it("should handle large numbers", () => {
      expect(mod(1000000007, 1000000)).toBe(7);
    });
  });
});

describe("stringToNumber", () => {
  it("should parse valid integer strings", () => {
    expect(stringToNumber("123")).toBe(123);
    expect(stringToNumber("0")).toBe(0);
    expect(stringToNumber("-456")).toBe(-456);
  });

  it("should return 0 for empty string", () => {
    expect(stringToNumber("")).toBe(0);
  });

  it("should return 0 for undefined", () => {
    expect(stringToNumber(undefined)).toBe(0);
  });

  it("should return 0 for null", () => {
    expect(stringToNumber(null as unknown as string)).toBe(0);
  });

  it("should parse integer part of float strings", () => {
    expect(stringToNumber("123.456")).toBe(123);
  });

  it("should return NaN for non-numeric strings", () => {
    expect(stringToNumber("abc")).toBeNaN();
  });

  it("should handle whitespace", () => {
    expect(stringToNumber("  42  ")).toBe(42);
  });
});

describe("numberToFixedDynamic", () => {
  it("should format number with specified places", () => {
    expect(numberToFixedDynamic(3.12345, 4)).toBe("3.1235");
  });

  it("should remove trailing zeros", () => {
    expect(numberToFixedDynamic(3.01, 4)).toBe("3.01");
    expect(numberToFixedDynamic(3.1, 4)).toBe("3.1");
    expect(numberToFixedDynamic(3.0, 4)).toBe("3");
  });

  it("should handle integer input", () => {
    expect(numberToFixedDynamic(3, 4)).toBe("3");
    expect(numberToFixedDynamic(100, 2)).toBe("100");
  });

  it("should handle zero places", () => {
    expect(numberToFixedDynamic(3.5, 0)).toBe("4");
    expect(numberToFixedDynamic(3.14159, 0)).toBe("3");
  });

  it("should handle negative places as 0", () => {
    expect(numberToFixedDynamic(3.14159, -1)).toBe("3");
  });

  it("should handle zero value", () => {
    expect(numberToFixedDynamic(0, 2)).toBe("0");
  });

  it("should handle negative numbers", () => {
    expect(numberToFixedDynamic(-3.14, 2)).toBe("-3.14");
    expect(numberToFixedDynamic(-3.1, 2)).toBe("-3.1");
  });

  it("should preserve necessary decimal places", () => {
    expect(numberToFixedDynamic(0.001, 3)).toBe("0.001");
    expect(numberToFixedDynamic(0.001, 4)).toBe("0.001");
  });
});
