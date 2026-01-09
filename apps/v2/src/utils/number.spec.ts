import {
  formatNumber,
  formatCompactNumber,
  formatPercent,
  formatCurrency,
  ordinal,
  clamp,
  roundTo,
  isFiniteNumber,
} from "./number";

//#region isFiniteNumber

describe("isFiniteNumber", () => {
  describe("valid finite numbers", () => {
    it("should return true for integers", () => {
      expect(isFiniteNumber(0)).toBe(true);
      expect(isFiniteNumber(42)).toBe(true);
      expect(isFiniteNumber(-42)).toBe(true);
    });

    it("should return true for floats", () => {
      expect(isFiniteNumber(3.14)).toBe(true);
      expect(isFiniteNumber(-3.14)).toBe(true);
      expect(isFiniteNumber(0.001)).toBe(true);
    });
  });

  describe("invalid numbers", () => {
    it("should return false for NaN", () => {
      expect(isFiniteNumber(NaN)).toBe(false);
    });

    it("should return false for Infinity", () => {
      expect(isFiniteNumber(Infinity)).toBe(false);
      expect(isFiniteNumber(-Infinity)).toBe(false);
    });
  });

  describe("non-number types", () => {
    it("should return false for strings", () => {
      expect(isFiniteNumber("42")).toBe(false);
      expect(isFiniteNumber("")).toBe(false);
    });

    it("should return false for null/undefined", () => {
      expect(isFiniteNumber(null)).toBe(false);
      expect(isFiniteNumber(undefined)).toBe(false);
    });

    it("should return false for objects/arrays", () => {
      expect(isFiniteNumber({})).toBe(false);
      expect(isFiniteNumber([])).toBe(false);
      expect(isFiniteNumber([42])).toBe(false);
    });

    it("should return false for boolean", () => {
      expect(isFiniteNumber(true)).toBe(false);
      expect(isFiniteNumber(false)).toBe(false);
    });
  });
});

//#endregion

//#region formatNumber

describe("formatNumber", () => {
  describe("basic formatting", () => {
    it("should format integers with thousand separators", () => {
      expect(formatNumber(1234567)).toBe("1,234,567");
      expect(formatNumber(1000)).toBe("1,000");
      expect(formatNumber(100)).toBe("100");
    });

    it("should format decimals", () => {
      expect(formatNumber(1234567.89)).toBe("1,234,567.89");
      // Intl.NumberFormat defaults to max 3 fraction digits
      expect(formatNumber(3.14159)).toBe("3.142");
      expect(formatNumber(3.14159, { maximumFractionDigits: 5 })).toBe(
        "3.14159",
      );
    });

    it("should handle negative numbers", () => {
      expect(formatNumber(-1234567)).toBe("-1,234,567");
      expect(formatNumber(-3.14)).toBe("-3.14");
    });

    it("should handle zero", () => {
      expect(formatNumber(0)).toBe("0");
    });
  });

  describe("locale support", () => {
    it("should format with German locale", () => {
      expect(formatNumber(1234567.89, { locale: "de-DE" })).toBe(
        "1.234.567,89",
      );
    });

    it("should format with French locale", () => {
      // French uses non-breaking space as thousand separator
      const result = formatNumber(1234567.89, { locale: "fr-FR" });
      expect(result).toMatch(/1\s?234\s?567,89/);
    });
  });

  describe("fraction digits options", () => {
    it("should respect minimumFractionDigits", () => {
      expect(formatNumber(3.1, { minimumFractionDigits: 2 })).toBe("3.10");
      expect(formatNumber(3, { minimumFractionDigits: 2 })).toBe("3.00");
    });

    it("should respect maximumFractionDigits", () => {
      expect(formatNumber(3.14159, { maximumFractionDigits: 2 })).toBe("3.14");
      expect(formatNumber(3.14159, { maximumFractionDigits: 0 })).toBe("3");
    });
  });

  describe("edge cases", () => {
    it("should return string representation for NaN", () => {
      expect(formatNumber(NaN)).toBe("NaN");
    });

    it("should return string representation for Infinity", () => {
      expect(formatNumber(Infinity)).toBe("Infinity");
      expect(formatNumber(-Infinity)).toBe("-Infinity");
    });
  });
});

//#endregion

//#region formatCompactNumber

describe("formatCompactNumber", () => {
  describe("thousands (K)", () => {
    it("should format thousands as K", () => {
      expect(formatCompactNumber(1500)).toBe("1.5K");
      expect(formatCompactNumber(1000)).toBe("1K");
      expect(formatCompactNumber(9999)).toBe("10K");
    });
  });

  describe("millions (M)", () => {
    it("should format millions as M", () => {
      expect(formatCompactNumber(1500000)).toBe("1.5M");
      expect(formatCompactNumber(1000000)).toBe("1M");
    });
  });

  describe("billions (B)", () => {
    it("should format billions as B", () => {
      expect(formatCompactNumber(1500000000)).toBe("1.5B");
      expect(formatCompactNumber(1000000000)).toBe("1B");
    });
  });

  describe("threshold behavior", () => {
    it("should not compact numbers below default threshold (1000)", () => {
      expect(formatCompactNumber(500)).toBe("500");
      expect(formatCompactNumber(999)).toBe("999");
    });

    it("should respect custom threshold", () => {
      expect(formatCompactNumber(500, { threshold: 100 })).toBe("500");
      expect(formatCompactNumber(5000, { threshold: 10000 })).toBe("5,000");
    });
  });

  describe("negative numbers", () => {
    it("should handle negative numbers", () => {
      expect(formatCompactNumber(-1500)).toBe("-1.5K");
      expect(formatCompactNumber(-500)).toBe("-500");
    });
  });

  describe("edge cases", () => {
    it("should return string representation for NaN", () => {
      expect(formatCompactNumber(NaN)).toBe("NaN");
    });

    it("should return string representation for Infinity", () => {
      expect(formatCompactNumber(Infinity)).toBe("Infinity");
    });
  });
});

//#endregion

//#region formatPercent

describe("formatPercent", () => {
  describe("basic formatting", () => {
    it("should format decimal as percentage", () => {
      expect(formatPercent(0.5)).toBe("50%");
      // Intl.NumberFormat style: 'percent' defaults to 0 fraction digits
      expect(formatPercent(0.1234)).toBe("12%");
      expect(formatPercent(0.1234, { minimumFractionDigits: 2 })).toBe(
        "12.34%",
      );
      expect(formatPercent(1)).toBe("100%");
    });

    it("should handle percentages over 100%", () => {
      expect(formatPercent(1.5)).toBe("150%");
      expect(formatPercent(2)).toBe("200%");
    });

    it("should handle zero", () => {
      expect(formatPercent(0)).toBe("0%");
    });

    it("should handle negative percentages", () => {
      expect(formatPercent(-0.5)).toBe("-50%");
    });
  });

  describe("fraction digits options", () => {
    it("should respect minimumFractionDigits", () => {
      expect(formatPercent(0.5, { minimumFractionDigits: 2 })).toBe("50.00%");
    });

    it("should respect maximumFractionDigits", () => {
      expect(formatPercent(0.12345, { maximumFractionDigits: 1 })).toBe(
        "12.3%",
      );
      expect(formatPercent(0.12345, { maximumFractionDigits: 0 })).toBe("12%");
    });
  });

  describe("edge cases", () => {
    it("should return string representation for NaN", () => {
      expect(formatPercent(NaN)).toBe("NaN");
    });

    it("should return string representation for Infinity", () => {
      expect(formatPercent(Infinity)).toBe("Infinity");
    });
  });
});

//#endregion

//#region formatCurrency

describe("formatCurrency", () => {
  describe("USD formatting", () => {
    it("should format USD with symbol", () => {
      expect(formatCurrency(1234.56, "USD")).toBe("$1,234.56");
    });

    it("should format USD with code", () => {
      const result = formatCurrency(1234.56, "USD", { display: "code" });
      expect(result).toMatch(/USD\s*1,234\.56/);
    });

    it("should format USD with name", () => {
      const result = formatCurrency(1234.56, "USD", { display: "name" });
      expect(result).toMatch(/1,234\.56\s*US dollars/);
    });
  });

  describe("EUR formatting", () => {
    it("should format EUR with German locale", () => {
      const result = formatCurrency(1234.56, "EUR", { locale: "de-DE" });
      expect(result).toMatch(/1\.234,56\s*€/);
    });
  });

  describe("negative amounts", () => {
    it("should handle negative currency amounts", () => {
      expect(formatCurrency(-1234.56, "USD")).toBe("-$1,234.56");
    });
  });

  describe("zero and small amounts", () => {
    it("should handle zero", () => {
      expect(formatCurrency(0, "USD")).toBe("$0.00");
    });

    it("should handle small amounts", () => {
      expect(formatCurrency(0.01, "USD")).toBe("$0.01");
      expect(formatCurrency(0.99, "USD")).toBe("$0.99");
    });
  });

  describe("edge cases", () => {
    it("should return string representation for NaN", () => {
      expect(formatCurrency(NaN, "USD")).toBe("NaN");
    });

    it("should return string representation for Infinity", () => {
      expect(formatCurrency(Infinity, "USD")).toBe("Infinity");
    });
  });
});

//#endregion

//#region ordinal

describe("ordinal", () => {
  describe("basic ordinals", () => {
    it("should format 1st, 2nd, 3rd", () => {
      expect(ordinal(1)).toBe("1st");
      expect(ordinal(2)).toBe("2nd");
      expect(ordinal(3)).toBe("3rd");
    });

    it("should format 4th onwards with th", () => {
      expect(ordinal(4)).toBe("4th");
      expect(ordinal(5)).toBe("5th");
      expect(ordinal(10)).toBe("10th");
    });
  });

  describe("teen numbers (special case)", () => {
    it("should format 11th, 12th, 13th (not 11st, 12nd, 13rd)", () => {
      expect(ordinal(11)).toBe("11th");
      expect(ordinal(12)).toBe("12th");
      expect(ordinal(13)).toBe("13th");
    });
  });

  describe("twenties and beyond", () => {
    it("should format 21st, 22nd, 23rd", () => {
      expect(ordinal(21)).toBe("21st");
      expect(ordinal(22)).toBe("22nd");
      expect(ordinal(23)).toBe("23rd");
    });

    it("should format 33rd", () => {
      expect(ordinal(33)).toBe("33rd");
    });

    it("should format 100th, 101st", () => {
      expect(ordinal(100)).toBe("100th");
      expect(ordinal(101)).toBe("101st");
    });

    it("should format 111th, 112th, 113th (not 111st, 112nd, 113rd)", () => {
      expect(ordinal(111)).toBe("111th");
      expect(ordinal(112)).toBe("112th");
      expect(ordinal(113)).toBe("113th");
    });
  });

  describe("zero and negative numbers", () => {
    it("should format 0th", () => {
      expect(ordinal(0)).toBe("0th");
    });

    it("should format negative numbers", () => {
      expect(ordinal(-1)).toBe("-1st");
      expect(ordinal(-2)).toBe("-2nd");
      expect(ordinal(-11)).toBe("-11th");
    });
  });

  describe("edge cases", () => {
    it("should return string representation for NaN", () => {
      expect(ordinal(NaN)).toBe("NaN");
    });

    it("should return string representation for Infinity", () => {
      expect(ordinal(Infinity)).toBe("Infinity");
    });
  });
});

//#endregion

//#region clamp

describe("clamp", () => {
  describe("within range", () => {
    it("should return value when within range", () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });
  });

  describe("below minimum", () => {
    it("should return min when value is below", () => {
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(-100, 0, 10)).toBe(0);
    });
  });

  describe("above maximum", () => {
    it("should return max when value is above", () => {
      expect(clamp(15, 0, 10)).toBe(10);
      expect(clamp(100, 0, 10)).toBe(10);
    });
  });

  describe("inverted min/max", () => {
    it("should handle inverted min/max gracefully", () => {
      expect(clamp(5, 10, 0)).toBe(5);
      expect(clamp(-5, 10, 0)).toBe(0);
      expect(clamp(15, 10, 0)).toBe(10);
    });
  });

  describe("edge cases", () => {
    it("should handle equal min and max", () => {
      expect(clamp(5, 5, 5)).toBe(5);
      expect(clamp(0, 5, 5)).toBe(5);
      expect(clamp(10, 5, 5)).toBe(5);
    });

    it("should handle negative ranges", () => {
      expect(clamp(-5, -10, -1)).toBe(-5);
      expect(clamp(0, -10, -1)).toBe(-1);
      expect(clamp(-15, -10, -1)).toBe(-10);
    });
  });
});

//#endregion

//#region roundTo

describe("roundTo", () => {
  describe("positive decimal places", () => {
    it("should round to specified decimal places", () => {
      expect(roundTo(1.2345, 2)).toBe(1.23);
      expect(roundTo(1.2355, 2)).toBe(1.24);
      expect(roundTo(1.5, 0)).toBe(2);
    });

    it("should handle exact values", () => {
      expect(roundTo(1.25, 2)).toBe(1.25);
      expect(roundTo(3, 2)).toBe(3);
    });
  });

  describe("zero decimal places", () => {
    it("should round to integer", () => {
      expect(roundTo(1.4, 0)).toBe(1);
      expect(roundTo(1.5, 0)).toBe(2);
      expect(roundTo(1.6, 0)).toBe(2);
    });
  });

  describe("negative decimal places", () => {
    it("should round to tens, hundreds, etc.", () => {
      expect(roundTo(1234, -1)).toBe(1230);
      expect(roundTo(1234, -2)).toBe(1200);
      expect(roundTo(1234, -3)).toBe(1000);
    });

    it("should handle rounding up", () => {
      expect(roundTo(1250, -2)).toBe(1300);
      expect(roundTo(1500, -3)).toBe(2000);
    });
  });

  describe("negative numbers", () => {
    it("should round negative numbers correctly", () => {
      expect(roundTo(-1.2345, 2)).toBe(-1.23);
      expect(roundTo(-1.2355, 2)).toBe(-1.24);
    });
  });

  describe("edge cases", () => {
    it("should return NaN for NaN input", () => {
      expect(roundTo(NaN, 2)).toBeNaN();
    });

    it("should return Infinity for Infinity input", () => {
      expect(roundTo(Infinity, 2)).toBe(Infinity);
      expect(roundTo(-Infinity, 2)).toBe(-Infinity);
    });

    it("should handle zero", () => {
      expect(roundTo(0, 2)).toBe(0);
    });
  });
});

//#endregion
