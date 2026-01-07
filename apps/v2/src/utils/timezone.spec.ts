import {
  getBrowserTimezone,
  isValidTimezone,
  getUtcOffsetForTimezone,
  getTimezoneRegion,
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
