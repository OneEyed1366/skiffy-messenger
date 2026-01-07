import { fileSizeToString } from "./file";

describe("fileSizeToString", () => {
  describe("bytes", () => {
    it("should return 0B for 0 bytes", () => {
      expect(fileSizeToString(0)).toBe("0B");
    });

    it("should return bytes for small values", () => {
      expect(fileSizeToString(100)).toBe("100B");
      expect(fileSizeToString(500)).toBe("500B");
      expect(fileSizeToString(1023)).toBe("1023B");
    });
  });

  describe("kilobytes", () => {
    it("should return KB for >= 1024 bytes", () => {
      expect(fileSizeToString(1024)).toBe("1KB");
    });

    it("should round KB values", () => {
      expect(fileSizeToString(1536)).toBe("2KB"); // 1.5KB rounds to 2
      expect(fileSizeToString(2048)).toBe("2KB");
    });

    it("should handle values just under 1MB", () => {
      expect(fileSizeToString(1024 * 1023)).toBe("1023KB");
    });
  });

  describe("megabytes", () => {
    it("should return MB for >= 1MB", () => {
      expect(fileSizeToString(1024 ** 2)).toBe("1MB");
    });

    it("should show decimal for < 10MB", () => {
      expect(fileSizeToString(1.5 * 1024 ** 2)).toBe("1.5MB");
      expect(fileSizeToString(5.7 * 1024 ** 2)).toBe("5.7MB");
    });

    it("should not show decimal for >= 10MB", () => {
      expect(fileSizeToString(10 * 1024 ** 2)).toBe("10MB");
      expect(fileSizeToString(15.7 * 1024 ** 2)).toBe("16MB");
    });
  });

  describe("gigabytes", () => {
    it("should return GB for >= 1GB", () => {
      expect(fileSizeToString(1024 ** 3)).toBe("1GB");
    });

    it("should show decimal for < 10GB", () => {
      expect(fileSizeToString(1.5 * 1024 ** 3)).toBe("1.5GB");
    });

    it("should not show decimal for >= 10GB", () => {
      expect(fileSizeToString(10 * 1024 ** 3)).toBe("10GB");
    });
  });

  describe("terabytes", () => {
    it("should return TB for >= 1TB", () => {
      expect(fileSizeToString(1024 ** 4)).toBe("1TB");
    });

    it("should show decimal for < 10TB", () => {
      expect(fileSizeToString(1.5 * 1024 ** 4)).toBe("1.5TB");
    });

    it("should not show decimal for >= 10TB", () => {
      expect(fileSizeToString(10 * 1024 ** 4)).toBe("10TB");
    });
  });

  describe("edge cases", () => {
    it("should handle negative values as 0", () => {
      expect(fileSizeToString(-100)).toBe("0B");
    });

    it("should handle NaN as 0", () => {
      expect(fileSizeToString(NaN)).toBe("0B");
    });
  });
});
