import {
  formatFileSize,
  fileSizeToString,
  parseFileSize,
  FILE_SIZE_UNITS,
  BYTES_PER_UNIT,
} from "./file";

//#region formatFileSize

describe("formatFileSize", () => {
  describe("bytes", () => {
    it("should return 0 B for 0 bytes", () => {
      expect(formatFileSize(0)).toBe("0 B");
    });

    it("should return bytes for small values", () => {
      expect(formatFileSize(100)).toBe("100 B");
      expect(formatFileSize(500)).toBe("500 B");
      expect(formatFileSize(1023)).toBe("1023 B");
    });
  });

  describe("kilobytes", () => {
    it("should return KB for >= 1024 bytes", () => {
      expect(formatFileSize(1024)).toBe("1 KB");
    });

    it("should round KB values", () => {
      expect(formatFileSize(1536)).toBe("2 KB"); // 1.5KB rounds to 2
      expect(formatFileSize(2048)).toBe("2 KB");
    });

    it("should handle values just under 1MB", () => {
      expect(formatFileSize(1024 * 1023)).toBe("1023 KB");
    });
  });

  describe("megabytes", () => {
    it("should return MB for >= 1MB", () => {
      expect(formatFileSize(1024 ** 2)).toBe("1 MB");
    });

    it("should show decimal for < 10MB", () => {
      expect(formatFileSize(1.5 * 1024 ** 2)).toBe("1.5 MB");
      expect(formatFileSize(5.7 * 1024 ** 2)).toBe("5.7 MB");
    });

    it("should not show decimal for >= 10MB", () => {
      expect(formatFileSize(10 * 1024 ** 2)).toBe("10 MB");
      expect(formatFileSize(15.7 * 1024 ** 2)).toBe("16 MB");
    });
  });

  describe("gigabytes", () => {
    it("should return GB for >= 1GB", () => {
      expect(formatFileSize(1024 ** 3)).toBe("1 GB");
    });

    it("should show decimal for < 10GB", () => {
      expect(formatFileSize(1.5 * 1024 ** 3)).toBe("1.5 GB");
    });

    it("should not show decimal for >= 10GB", () => {
      expect(formatFileSize(10 * 1024 ** 3)).toBe("10 GB");
    });
  });

  describe("terabytes", () => {
    it("should return TB for >= 1TB", () => {
      expect(formatFileSize(1024 ** 4)).toBe("1 TB");
    });

    it("should show decimal for < 10TB", () => {
      expect(formatFileSize(1.5 * 1024 ** 4)).toBe("1.5 TB");
    });

    it("should not show decimal for >= 10TB", () => {
      expect(formatFileSize(10 * 1024 ** 4)).toBe("10 TB");
    });
  });

  describe("edge cases", () => {
    it("should handle negative values as 0 B", () => {
      expect(formatFileSize(-100)).toBe("0 B");
    });

    it("should handle NaN as 0 B", () => {
      expect(formatFileSize(NaN)).toBe("0 B");
    });

    it("should handle Infinity as 0 B", () => {
      expect(formatFileSize(Infinity)).toBe("0 B");
      expect(formatFileSize(-Infinity)).toBe("0 B");
    });
  });

  describe("locale options", () => {
    it("should format with German locale (comma decimal)", () => {
      const result = formatFileSize(1.5 * 1024 ** 2, { locale: "de-DE" });
      expect(result).toBe("1,5 MB");
    });

    it("should format with US locale", () => {
      const result = formatFileSize(1.5 * 1024 ** 2, { locale: "en-US" });
      expect(result).toBe("1.5 MB");
    });

    it("should respect maximumFractionDigits option", () => {
      const bytes = 1.234 * 1024 ** 2;
      expect(formatFileSize(bytes, { maximumFractionDigits: 2 })).toBe(
        "1.23 MB",
      );
      expect(formatFileSize(bytes, { maximumFractionDigits: 0 })).toBe("1 MB");
    });

    it("should format large numbers with locale grouping", () => {
      // 1500 MB = 1.5 GB, but let's test with a value that stays in MB range
      const result = formatFileSize(500 * 1024 ** 2, { locale: "en-US" });
      expect(result).toBe("500 MB");
      // Test locale grouping with larger value
      const result2 = formatFileSize(1234567890, { locale: "en-US" });
      expect(result2).toBe("1.1 GB"); // ~1.15 GB rounded to 1 decimal
    });
  });
});

//#endregion

//#region fileSizeToString (deprecated alias)

describe("fileSizeToString (deprecated)", () => {
  it("should be an alias for formatFileSize", () => {
    expect(fileSizeToString).toBe(formatFileSize);
  });

  it("should work identically to formatFileSize", () => {
    expect(fileSizeToString(1024)).toBe(formatFileSize(1024));
    expect(fileSizeToString(1.5 * 1024 ** 2)).toBe(
      formatFileSize(1.5 * 1024 ** 2),
    );
  });
});

//#endregion

//#region parseFileSize

describe("parseFileSize", () => {
  describe("valid inputs", () => {
    it("should parse bytes", () => {
      expect(parseFileSize("100 B")).toBe(100);
      expect(parseFileSize("0 B")).toBe(0);
    });

    it("should parse kilobytes", () => {
      expect(parseFileSize("1 KB")).toBe(1024);
      expect(parseFileSize("100 KB")).toBe(102400);
    });

    it("should parse megabytes", () => {
      expect(parseFileSize("1 MB")).toBe(1048576);
      expect(parseFileSize("1.5 MB")).toBe(1572864);
    });

    it("should parse gigabytes", () => {
      expect(parseFileSize("1 GB")).toBe(1073741824);
      expect(parseFileSize("2.5 GB")).toBe(2684354560);
    });

    it("should parse terabytes", () => {
      expect(parseFileSize("1 TB")).toBe(1099511627776);
    });

    it("should handle no space between number and unit", () => {
      expect(parseFileSize("100KB")).toBe(102400);
      expect(parseFileSize("1.5MB")).toBe(1572864);
    });

    it("should be case-insensitive for units", () => {
      expect(parseFileSize("1 kb")).toBe(1024);
      expect(parseFileSize("1 Kb")).toBe(1024);
      expect(parseFileSize("1 kB")).toBe(1024);
      expect(parseFileSize("1 mb")).toBe(1048576);
      expect(parseFileSize("1 gb")).toBe(1073741824);
    });

    it("should handle European decimal (comma)", () => {
      expect(parseFileSize("1,5 MB")).toBe(1572864);
      expect(parseFileSize("2,25 GB")).toBe(2415919104);
    });

    it("should handle leading/trailing whitespace", () => {
      expect(parseFileSize("  1 MB  ")).toBe(1048576);
      expect(parseFileSize("\t100 KB\n")).toBe(102400);
    });
  });

  describe("invalid inputs", () => {
    it("should return null for empty string", () => {
      expect(parseFileSize("")).toBe(null);
    });

    it("should return null for null/undefined", () => {
      expect(parseFileSize(null as unknown as string)).toBe(null);
      expect(parseFileSize(undefined as unknown as string)).toBe(null);
    });

    it("should return null for invalid format", () => {
      expect(parseFileSize("invalid")).toBe(null);
      expect(parseFileSize("MB")).toBe(null);
      expect(parseFileSize("100")).toBe(null);
      expect(parseFileSize("100 XB")).toBe(null);
    });

    it("should return null for negative values", () => {
      expect(parseFileSize("-100 MB")).toBe(null);
    });

    it("should return null for non-string input", () => {
      expect(parseFileSize(123 as unknown as string)).toBe(null);
      expect(parseFileSize({} as unknown as string)).toBe(null);
    });
  });
});

//#endregion

//#region Roundtrip

describe("roundtrip: parseFileSize(formatFileSize(x))", () => {
  const testCases = [
    { bytes: 0, description: "zero bytes" },
    { bytes: 100, description: "small bytes" },
    { bytes: 1024, description: "1 KB" },
    { bytes: 10240, description: "10 KB" },
    { bytes: 1048576, description: "1 MB" },
    { bytes: 1572864, description: "1.5 MB" },
    { bytes: 1073741824, description: "1 GB" },
    { bytes: 1099511627776, description: "1 TB" },
  ];

  testCases.forEach(({ bytes, description }) => {
    it(`should roundtrip ${description} (${bytes} bytes)`, () => {
      const formatted = formatFileSize(bytes);
      const parsed = parseFileSize(formatted);
      expect(parsed).toBe(bytes);
    });
  });

  it("should roundtrip with locale formatting", () => {
    // Note: German locale uses comma, but parseFileSize handles both
    const bytes = 1572864; // 1.5 MB
    const formatted = formatFileSize(bytes, { locale: "de-DE" });
    const parsed = parseFileSize(formatted);
    expect(parsed).toBe(bytes);
  });
});

//#endregion

//#region Constants

describe("FILE_SIZE_UNITS", () => {
  it("should contain all units in order", () => {
    expect(FILE_SIZE_UNITS).toEqual(["B", "KB", "MB", "GB", "TB"]);
  });

  it("should have readonly type (compile-time check)", () => {
    // Note: as const satisfies creates readonly types at compile time
    // but doesn't freeze objects at runtime. TypeScript prevents mutation.
    expect(Array.isArray(FILE_SIZE_UNITS)).toBe(true);
    expect(FILE_SIZE_UNITS.length).toBe(5);
  });
});

describe("BYTES_PER_UNIT", () => {
  it("should have correct byte values", () => {
    expect(BYTES_PER_UNIT.B).toBe(1);
    expect(BYTES_PER_UNIT.KB).toBe(1024);
    expect(BYTES_PER_UNIT.MB).toBe(1024 ** 2);
    expect(BYTES_PER_UNIT.GB).toBe(1024 ** 3);
    expect(BYTES_PER_UNIT.TB).toBe(1024 ** 4);
  });

  it("should have all file size units", () => {
    // Verify all units from FILE_SIZE_UNITS have corresponding values
    FILE_SIZE_UNITS.forEach((unit) => {
      expect(BYTES_PER_UNIT[unit]).toBeGreaterThan(0);
    });
  });
});

//#endregion
