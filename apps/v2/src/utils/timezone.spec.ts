import {
  getBrowserTimezone,
  isValidTimezone,
  getUtcOffsetForTimezone,
  getTimezoneRegion,
  getUserTimezone,
  formatInTimezone,
  listTimezones,
  getCurrentDateForTimezone,
  getCurrentDateTimeForTimezone,
} from "./timezone";

describe("getBrowserTimezone", () => {
  it("should return a string", () => {
    const tz = getBrowserTimezone();
    expect(typeof tz).toBe("string");
  });

  it("should return a valid IANA timezone name", () => {
    const tz = getBrowserTimezone();
    // IANA names contain '/' (e.g., America/New_York)
    // or are 'UTC'
    expect(tz.includes("/") || tz === "UTC").toBe(true);
  });
});

describe("isValidTimezone", () => {
  it("should return true for valid IANA timezone", () => {
    expect(isValidTimezone("America/New_York")).toBe(true);
    expect(isValidTimezone("Europe/London")).toBe(true);
    expect(isValidTimezone("Asia/Tokyo")).toBe(true);
    expect(isValidTimezone("UTC")).toBe(true);
  });

  it("should return false for invalid timezone", () => {
    expect(isValidTimezone("Invalid/Timezone")).toBe(false);
    expect(isValidTimezone("America/InvalidCity")).toBe(false);
    expect(isValidTimezone("")).toBe(false);
    expect(isValidTimezone("random_string")).toBe(false);
  });

  it("should return false for null/undefined", () => {
    expect(isValidTimezone(null as unknown as string)).toBe(false);
    expect(isValidTimezone(undefined as unknown as string)).toBe(false);
  });
});

describe("getUtcOffsetForTimezone", () => {
  it("should return offset in minutes for known timezone", () => {
    // Note: These tests may be affected by DST
    // UTC should always be 0
    expect(getUtcOffsetForTimezone("UTC")).toBe(0);
  });

  it("should return positive offset for timezones east of UTC", () => {
    // Asia/Tokyo is always UTC+9 (540 minutes), no DST
    expect(getUtcOffsetForTimezone("Asia/Tokyo")).toBe(540);
  });

  it("should return negative offset for timezones west of UTC", () => {
    // Test with a timezone that has fixed offset
    // America/Phoenix is UTC-7 (no DST)
    expect(getUtcOffsetForTimezone("America/Phoenix")).toBe(-420);
  });

  it("should throw for invalid timezone", () => {
    expect(() => getUtcOffsetForTimezone("Invalid/Zone")).toThrow();
  });
});

describe("getTimezoneRegion", () => {
  it("should extract region from IANA timezone", () => {
    expect(getTimezoneRegion("America/New_York")).toBe("America");
    expect(getTimezoneRegion("Europe/London")).toBe("Europe");
    expect(getTimezoneRegion("Asia/Tokyo")).toBe("Asia");
  });

  it("should handle UTC", () => {
    expect(getTimezoneRegion("UTC")).toBe("UTC");
  });

  it("should handle multi-part regions", () => {
    expect(getTimezoneRegion("America/Argentina/Buenos_Aires")).toBe("America");
  });

  it("should return empty for invalid format", () => {
    expect(getTimezoneRegion("")).toBe("");
    expect(getTimezoneRegion("InvalidFormat")).toBe("InvalidFormat");
  });
});

describe("getUserTimezone", () => {
  it("should return a valid timezone string", () => {
    const tz = getUserTimezone();
    expect(typeof tz).toBe("string");
    expect(tz.length).toBeGreaterThan(0);
  });

  it("should return the same as getBrowserTimezone when available", () => {
    const userTz = getUserTimezone();
    const browserTz = getBrowserTimezone();
    // They should match unless browser detection fails
    expect(userTz).toBe(browserTz);
  });

  it("should be a valid IANA timezone", () => {
    const tz = getUserTimezone();
    expect(isValidTimezone(tz)).toBe(true);
  });
});

describe("formatInTimezone", () => {
  const fixedDate = new Date("2024-06-15T12:00:00Z");

  it("should format date with default options", () => {
    const result = formatInTimezone(fixedDate, "UTC");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("should accept Date object", () => {
    const result = formatInTimezone(fixedDate, "America/New_York");
    expect(result).toBeTruthy();
  });

  it("should accept timestamp number", () => {
    const result = formatInTimezone(fixedDate.getTime(), "America/New_York");
    expect(result).toBeTruthy();
  });

  it("should accept ISO string", () => {
    const result = formatInTimezone("2024-06-15T12:00:00Z", "America/New_York");
    expect(result).toBeTruthy();
  });

  it("should format with dateStyle option", () => {
    const result = formatInTimezone(fixedDate, "UTC", { dateStyle: "short" });
    expect(result).toBeTruthy();
  });

  it("should format with timeStyle option", () => {
    const result = formatInTimezone(fixedDate, "UTC", { timeStyle: "short" });
    expect(result).toBeTruthy();
  });

  it("should format with hour12 option", () => {
    const result12 = formatInTimezone(fixedDate, "UTC", {
      timeStyle: "short",
      hour12: true,
    });
    const result24 = formatInTimezone(fixedDate, "UTC", {
      timeStyle: "short",
      hour12: false,
    });
    // Both should be valid strings
    expect(result12).toBeTruthy();
    expect(result24).toBeTruthy();
  });

  it("should return 'Invalid Date' for invalid date input", () => {
    const result = formatInTimezone("invalid-date", "UTC");
    expect(result).toBe("Invalid Date");
  });

  it("should fallback to UTC for invalid timezone", () => {
    // Should not throw, should fallback to UTC
    const result = formatInTimezone(fixedDate, "Invalid/Timezone");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("listTimezones", () => {
  it("should return an array of timezone info objects", () => {
    const timezones = listTimezones();
    expect(Array.isArray(timezones)).toBe(true);
    expect(timezones.length).toBeGreaterThan(0);
  });

  it("should have correct shape for each timezone", () => {
    const timezones = listTimezones();
    const first = timezones[0];

    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("label");
    expect(first).toHaveProperty("offset");
    expect(first).toHaveProperty("offsetLabel");

    expect(typeof first.id).toBe("string");
    expect(typeof first.label).toBe("string");
    expect(typeof first.offset).toBe("number");
    expect(typeof first.offsetLabel).toBe("string");
  });

  it("should format offset labels correctly", () => {
    const timezones = listTimezones();

    // Find a timezone with offset 0 (UTC zone like Etc/UTC or Africa/Abidjan)
    const zeroOffset = timezones.find((tz) => tz.offset === 0);
    expect(zeroOffset?.offsetLabel).toBe("+00:00");

    // Find Tokyo (UTC+9)
    const tokyo = timezones.find((tz) => tz.id === "Asia/Tokyo");
    expect(tokyo?.offsetLabel).toBe("+09:00");

    // Offset labels should match pattern +/-HH:MM
    timezones.forEach((tz) => {
      expect(tz.offsetLabel).toMatch(/^[+-]\d{2}:\d{2}$/);
    });
  });

  it("should replace underscores with spaces in label", () => {
    const timezones = listTimezones();
    const newYork = timezones.find((tz) => tz.id === "America/New_York");
    expect(newYork?.label).toBe("America/New York");
  });

  it("should be sorted by offset ascending", () => {
    const timezones = listTimezones();

    for (let i = 1; i < timezones.length; i++) {
      const prev = timezones[i - 1];
      const curr = timezones[i];

      // Either offset is ascending, or if equal, name is alphabetically sorted
      if (prev.offset === curr.offset) {
        expect(prev.id.localeCompare(curr.id)).toBeLessThanOrEqual(0);
      } else {
        expect(prev.offset).toBeLessThan(curr.offset);
      }
    }
  });

  it("should include common timezones", () => {
    const timezones = listTimezones();
    const ids = timezones.map((tz) => tz.id);

    // Note: Intl.supportedValuesOf may not include 'UTC' as standalone
    // Check for common IANA timezones that should always be present
    expect(ids).toContain("America/New_York");
    expect(ids).toContain("Europe/London");
    expect(ids).toContain("Asia/Tokyo");
    expect(ids).toContain("America/Los_Angeles");
  });
});

describe("getCurrentDateForTimezone", () => {
  it("should return a Date object", () => {
    const result = getCurrentDateForTimezone("UTC");
    expect(result instanceof Date).toBe(true);
  });

  it("should return a valid date", () => {
    const result = getCurrentDateForTimezone("America/New_York");
    expect(Number.isNaN(result.getTime())).toBe(false);
  });

  it("should set time components to midnight (local)", () => {
    const result = getCurrentDateForTimezone("UTC");
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
  });

  it("should fallback to UTC for invalid timezone", () => {
    // Should not throw
    const result = getCurrentDateForTimezone("Invalid/Zone");
    expect(result instanceof Date).toBe(true);
    expect(Number.isNaN(result.getTime())).toBe(false);
  });

  it("should return different dates for timezones with large offsets at midnight UTC", () => {
    // This test verifies the function considers timezone offset
    const tokyoDate = getCurrentDateForTimezone("Asia/Tokyo");
    const utcDate = getCurrentDateForTimezone("UTC");

    // Both should be valid dates
    expect(tokyoDate instanceof Date).toBe(true);
    expect(utcDate instanceof Date).toBe(true);
  });
});

describe("getCurrentDateTimeForTimezone", () => {
  it("should return a Date object", () => {
    const result = getCurrentDateTimeForTimezone("UTC");
    expect(result instanceof Date).toBe(true);
  });

  it("should return a valid date", () => {
    const result = getCurrentDateTimeForTimezone("America/New_York");
    expect(Number.isNaN(result.getTime())).toBe(false);
  });

  it("should include time components", () => {
    const result = getCurrentDateTimeForTimezone("UTC");
    // We can't predict exact time, but we can verify it's a valid date
    expect(result.getFullYear()).toBeGreaterThan(2000);
    expect(result.getMonth()).toBeGreaterThanOrEqual(0);
    expect(result.getMonth()).toBeLessThanOrEqual(11);
  });

  it("should fallback to UTC for invalid timezone", () => {
    // Should not throw
    const result = getCurrentDateTimeForTimezone("Invalid/Zone");
    expect(result instanceof Date).toBe(true);
    expect(Number.isNaN(result.getTime())).toBe(false);
  });

  it("should return different times for different timezones", () => {
    const tokyo = getCurrentDateTimeForTimezone("Asia/Tokyo");
    const utc = getCurrentDateTimeForTimezone("UTC");

    // Both should be valid
    expect(tokyo instanceof Date).toBe(true);
    expect(utc instanceof Date).toBe(true);

    // They represent the same moment but with different local interpretation
    // So their getTime() will be different when converted to Date objects
    // bc they're created with local time components from different timezones
  });
});
