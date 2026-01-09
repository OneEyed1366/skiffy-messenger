import {
  isSameDay,
  isSameMonth,
  isSameYear,
  isToday,
  isYesterday,
  isTomorrow,
  isWithinLastWeek,
  toUTCUnixSeconds,
  fromUnixSeconds,
  getDiff,
  isWithin,
  formatDate,
  formatDateShort,
  formatTime,
  formatDateTime,
  formatDateTimeShort,
  getRelativeTime,
  formatRelativeDate,
} from "./date";

//#region Test Helpers

/**
 * Creates a date relative to now
 */
function createRelativeDate(days: number, hours = 0, minutes = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(date.getHours() + hours);
  date.setMinutes(date.getMinutes() + minutes);
  return date;
}

/**
 * Creates a fixed date for consistent testing
 */
function createFixedDate(
  year: number,
  month: number,
  day: number,
  hours = 0,
  minutes = 0,
  seconds = 0,
): Date {
  return new Date(year, month - 1, day, hours, minutes, seconds);
}

//#endregion

describe("isSameDay", () => {
  it("should return true for same day", () => {
    const a = new Date(2024, 0, 15, 10, 30);
    const b = new Date(2024, 0, 15, 22, 45);
    expect(isSameDay(a, b)).toBe(true);
  });

  it("should return false for different days", () => {
    const a = new Date(2024, 0, 15);
    const b = new Date(2024, 0, 16);
    expect(isSameDay(a, b)).toBe(false);
  });

  it("should return false for same day different month", () => {
    const a = new Date(2024, 0, 15);
    const b = new Date(2024, 1, 15);
    expect(isSameDay(a, b)).toBe(false);
  });

  it("should return false for same day different year", () => {
    const a = new Date(2024, 0, 15);
    const b = new Date(2025, 0, 15);
    expect(isSameDay(a, b)).toBe(false);
  });
});

describe("isSameMonth", () => {
  it("should return true for same month and year", () => {
    const a = new Date(2024, 5, 1);
    const b = new Date(2024, 5, 30);
    expect(isSameMonth(a, b)).toBe(true);
  });

  it("should return false for different months", () => {
    const a = new Date(2024, 5, 15);
    const b = new Date(2024, 6, 15);
    expect(isSameMonth(a, b)).toBe(false);
  });

  it("should return false for same month different year", () => {
    const a = new Date(2024, 5, 15);
    const b = new Date(2025, 5, 15);
    expect(isSameMonth(a, b)).toBe(false);
  });
});

describe("isSameYear", () => {
  it("should return true for same year", () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 11, 31);
    expect(isSameYear(a, b)).toBe(true);
  });

  it("should return false for different years", () => {
    const a = new Date(2024, 6, 15);
    const b = new Date(2025, 6, 15);
    expect(isSameYear(a, b)).toBe(false);
  });
});

describe("isToday and isYesterday", () => {
  it("tomorrow at 12am should not be today or yesterday", () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(0, 0, 0, 0);
    expect(isToday(date)).toBe(false);
    expect(isYesterday(date)).toBe(false);
  });

  it("now should be today", () => {
    const date = new Date();
    expect(isToday(date)).toBe(true);
    expect(isYesterday(date)).toBe(false);
  });

  it("today at 12am should be today", () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    expect(isToday(date)).toBe(true);
    expect(isYesterday(date)).toBe(false);
  });

  it("today at 11:59pm should be today", () => {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    expect(isToday(date)).toBe(true);
    expect(isYesterday(date)).toBe(false);
  });

  it("yesterday at 11:59pm should be yesterday", () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    date.setHours(23, 59, 59, 999);
    expect(isToday(date)).toBe(false);
    expect(isYesterday(date)).toBe(true);
  });

  it("yesterday at 12am should be yesterday", () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    date.setHours(0, 0, 0, 0);
    expect(isToday(date)).toBe(false);
    expect(isYesterday(date)).toBe(true);
  });

  it("two days ago should not be today or yesterday", () => {
    const date = new Date();
    date.setDate(date.getDate() - 2);
    expect(isToday(date)).toBe(false);
    expect(isYesterday(date)).toBe(false);
  });
});

describe("toUTCUnixSeconds", () => {
  it("should convert date to unix seconds", () => {
    const date = new Date("2024-01-15T12:00:00.000Z");
    expect(toUTCUnixSeconds(date)).toBe(1705320000);
  });

  it("should round to nearest second", () => {
    const date = new Date("2024-01-15T12:00:00.500Z");
    expect(toUTCUnixSeconds(date)).toBe(1705320001);
  });

  it("should handle epoch", () => {
    const date = new Date(0);
    expect(toUTCUnixSeconds(date)).toBe(0);
  });

  it("should accept timestamp input", () => {
    const timestamp = 1704067200000; // 2024-01-01T00:00:00Z in ms
    expect(toUTCUnixSeconds(timestamp)).toBe(1704067200);
  });

  it("should accept string input", () => {
    expect(toUTCUnixSeconds("2024-01-01T00:00:00Z")).toBe(1704067200);
  });
});

//#region New Function Tests

describe("isTomorrow", () => {
  it("returns true for tomorrow", () => {
    const tomorrow = createRelativeDate(1);
    expect(isTomorrow(tomorrow)).toBe(true);
  });

  it("returns false for today", () => {
    expect(isTomorrow(new Date())).toBe(false);
  });

  it("returns false for day after tomorrow", () => {
    const twoDaysFromNow = createRelativeDate(2);
    expect(isTomorrow(twoDaysFromNow)).toBe(false);
  });

  it("returns false for yesterday", () => {
    const yesterday = createRelativeDate(-1);
    expect(isTomorrow(yesterday)).toBe(false);
  });

  it("accepts number input (timestamp)", () => {
    const tomorrow = createRelativeDate(1);
    expect(isTomorrow(tomorrow.getTime())).toBe(true);
  });

  it("tomorrow at 12am should be tomorrow", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    expect(isTomorrow(tomorrow)).toBe(true);
  });

  it("tomorrow at 11:59pm should be tomorrow", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);
    expect(isTomorrow(tomorrow)).toBe(true);
  });
});

describe("isWithinLastWeek", () => {
  it("returns true for today", () => {
    expect(isWithinLastWeek(new Date())).toBe(true);
  });

  it("returns true for 3 days ago", () => {
    const threeDaysAgo = createRelativeDate(-3);
    expect(isWithinLastWeek(threeDaysAgo)).toBe(true);
  });

  it("returns true for 6 days ago at noon", () => {
    const sixDaysAgo = createRelativeDate(-6);
    sixDaysAgo.setHours(12, 0, 0, 0);
    expect(isWithinLastWeek(sixDaysAgo)).toBe(true);
  });

  it("returns false for 10 days ago", () => {
    const tenDaysAgo = createRelativeDate(-10);
    expect(isWithinLastWeek(tenDaysAgo)).toBe(false);
  });

  it("returns false for future dates", () => {
    const tomorrow = createRelativeDate(1);
    expect(isWithinLastWeek(tomorrow)).toBe(false);
  });

  it("accepts timestamp input", () => {
    expect(isWithinLastWeek(Date.now())).toBe(true);
  });

  it("accepts string input", () => {
    expect(isWithinLastWeek(new Date().toISOString())).toBe(true);
  });
});

describe("fromUnixSeconds", () => {
  it("converts Unix timestamp in seconds to Date", () => {
    const result = fromUnixSeconds(1704067200);
    expect(result.getTime()).toBe(1704067200000);
  });

  it("creates valid Date object", () => {
    const result = fromUnixSeconds(1704067200);
    expect(result instanceof Date).toBe(true);
    expect(result.toISOString()).toBe("2024-01-01T00:00:00.000Z");
  });

  it("handles zero timestamp (epoch)", () => {
    const result = fromUnixSeconds(0);
    expect(result.toISOString()).toBe("1970-01-01T00:00:00.000Z");
  });

  it("handles negative timestamps (before epoch)", () => {
    const result = fromUnixSeconds(-86400);
    expect(result.toISOString()).toBe("1969-12-31T00:00:00.000Z");
  });
});

describe("getDiff", () => {
  it("calculates day difference", () => {
    const a = createFixedDate(2024, 1, 15);
    const b = createFixedDate(2024, 1, 1);
    expect(getDiff(a, b, "day")).toBe(14);
  });

  it("returns negative value when a < b", () => {
    const a = createFixedDate(2024, 1, 1);
    const b = createFixedDate(2024, 1, 15);
    expect(getDiff(a, b, "day")).toBe(-14);
  });

  it("calculates week difference", () => {
    const a = createFixedDate(2024, 1, 15);
    const b = createFixedDate(2024, 1, 1);
    expect(getDiff(a, b, "week")).toBe(2);
  });

  it("calculates hour difference", () => {
    const a = createFixedDate(2024, 1, 1, 15, 0);
    const b = createFixedDate(2024, 1, 1, 10, 0);
    expect(getDiff(a, b, "hour")).toBe(5);
  });

  it("calculates minute difference", () => {
    const a = createFixedDate(2024, 1, 1, 10, 45);
    const b = createFixedDate(2024, 1, 1, 10, 0);
    expect(getDiff(a, b, "minute")).toBe(45);
  });

  it("calculates second difference", () => {
    const a = createFixedDate(2024, 1, 1, 10, 0, 30);
    const b = createFixedDate(2024, 1, 1, 10, 0, 0);
    expect(getDiff(a, b, "second")).toBe(30);
  });

  it("truncates when specified", () => {
    const a = createFixedDate(2024, 1, 1, 10, 30);
    const b = createFixedDate(2024, 1, 1, 10, 0);
    // 30 minutes = 0.5 hours
    expect(getDiff(a, b, "hour", false)).toBeCloseTo(0.5, 2);
    expect(getDiff(a, b, "hour", true)).toBe(0);
  });

  it("accepts mixed input types", () => {
    const date = createFixedDate(2024, 1, 15);
    const timestamp = createFixedDate(2024, 1, 1).getTime();
    expect(getDiff(date, timestamp, "day")).toBe(14);
  });

  it("accepts string input", () => {
    const a = "2024-01-15T00:00:00Z";
    const b = "2024-01-01T00:00:00Z";
    expect(getDiff(a, b, "day")).toBe(14);
  });
});

describe("isWithin", () => {
  it("returns true when within threshold", () => {
    const a = createFixedDate(2024, 1, 1, 10, 0);
    const b = createFixedDate(2024, 1, 1, 10, 30);
    expect(isWithin(a, b, "hour", 1)).toBe(true);
  });

  it("returns false when outside threshold", () => {
    const a = createFixedDate(2024, 1, 1, 10, 0);
    const b = createFixedDate(2024, 1, 1, 12, 30);
    expect(isWithin(a, b, "hour", 1)).toBe(false);
  });

  it("works with default threshold of 1", () => {
    const a = createFixedDate(2024, 1, 1);
    const b = createFixedDate(2024, 1, 2);
    expect(isWithin(a, b, "day")).toBe(true);
    expect(isWithin(a, createFixedDate(2024, 1, 3), "day")).toBe(false);
  });

  it("works with minute precision", () => {
    const a = createFixedDate(2024, 1, 1, 10, 0);
    const b = createFixedDate(2024, 1, 1, 10, 5);
    expect(isWithin(a, b, "minute", 5)).toBe(true);
    expect(isWithin(a, b, "minute", 4)).toBe(false);
  });

  it("accepts mixed input types", () => {
    const date = createFixedDate(2024, 1, 1, 10, 0);
    const timestamp = createFixedDate(2024, 1, 1, 10, 30).getTime();
    expect(isWithin(date, timestamp, "hour", 1)).toBe(true);
  });

  it("is symmetric (order of arguments does not matter)", () => {
    const a = createFixedDate(2024, 1, 1, 10, 0);
    const b = createFixedDate(2024, 1, 1, 10, 30);
    expect(isWithin(a, b, "hour", 1)).toBe(isWithin(b, a, "hour", 1));
  });
});

describe("formatDate", () => {
  it("formats date in long format", () => {
    const date = createFixedDate(2024, 1, 15);
    const result = formatDate(date, { locale: "en-US" });
    expect(result).toContain("January");
    expect(result).toContain("15");
    expect(result).toContain("2024");
  });

  it("respects locale", () => {
    const date = createFixedDate(2024, 1, 15);
    const result = formatDate(date, { locale: "de-DE" });
    expect(result).toContain("Januar");
  });

  it("accepts timestamp input", () => {
    const timestamp = createFixedDate(2024, 1, 15).getTime();
    const result = formatDate(timestamp, { locale: "en-US" });
    expect(result).toContain("January");
  });

  it("accepts string input", () => {
    const result = formatDate("2024-01-15", { locale: "en-US" });
    expect(result).toContain("January");
  });

  it("works without options", () => {
    const date = createFixedDate(2024, 1, 15);
    const result = formatDate(date);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("formatDateShort", () => {
  it("formats date in short format", () => {
    const date = createFixedDate(2024, 1, 15);
    const result = formatDateShort(date, { locale: "en-US" });
    expect(result.length).toBeLessThan(20);
    expect(result).toMatch(/\d/);
  });

  it("respects locale", () => {
    const date = createFixedDate(2024, 1, 15);
    const usResult = formatDateShort(date, { locale: "en-US" });
    const deResult = formatDateShort(date, { locale: "de-DE" });
    expect(usResult).not.toBe(deResult);
  });

  it("accepts timestamp input", () => {
    const timestamp = createFixedDate(2024, 1, 15).getTime();
    const result = formatDateShort(timestamp, { locale: "en-US" });
    expect(result).toMatch(/\d/);
  });
});

describe("formatTime", () => {
  it("formats time without seconds by default", () => {
    const date = createFixedDate(2024, 1, 1, 14, 30, 45);
    const result = formatTime(date, { locale: "en-US" });
    expect(result).toMatch(/2:30|14:30/);
  });

  it("includes seconds when showSeconds is true", () => {
    const date = createFixedDate(2024, 1, 1, 14, 30, 45);
    const result = formatTime(date, { locale: "en-US", showSeconds: true });
    expect(result).toMatch(/45/);
  });

  it("respects hour12 option (12-hour format)", () => {
    const date = createFixedDate(2024, 1, 1, 14, 30);
    const result = formatTime(date, { locale: "en-US", hour12: true });
    expect(result).toMatch(/2:30|PM/i);
  });

  it("respects hour12 option (24-hour format)", () => {
    const date = createFixedDate(2024, 1, 1, 14, 30);
    const result = formatTime(date, { locale: "en-US", hour12: false });
    expect(result).toMatch(/14:30/);
  });

  it("accepts timestamp input", () => {
    const timestamp = createFixedDate(2024, 1, 1, 14, 30).getTime();
    const result = formatTime(timestamp, { locale: "en-US" });
    expect(result).toMatch(/\d/);
  });
});

describe("formatDateTime", () => {
  it("formats date and time together", () => {
    const date = createFixedDate(2024, 1, 15, 14, 30);
    const result = formatDateTime(date, { locale: "en-US" });
    expect(result).toContain("January");
    expect(result).toContain("15");
    expect(result).toContain("2024");
    expect(result).toMatch(/2:30|14:30/);
  });

  it("includes seconds when showSeconds is true", () => {
    const date = createFixedDate(2024, 1, 15, 14, 30, 45);
    const result = formatDateTime(date, { locale: "en-US", showSeconds: true });
    expect(result).toMatch(/45/);
  });

  it("respects hour12 option", () => {
    const date = createFixedDate(2024, 1, 15, 14, 30);
    const result = formatDateTime(date, { locale: "en-US", hour12: false });
    expect(result).toMatch(/14:30/);
  });

  it("accepts timestamp input", () => {
    const timestamp = createFixedDate(2024, 1, 15, 14, 30).getTime();
    const result = formatDateTime(timestamp, { locale: "en-US" });
    expect(result).toContain("January");
  });
});

describe("formatDateTimeShort", () => {
  it("formats date and time in short format", () => {
    const date = createFixedDate(2024, 1, 15, 14, 30);
    const result = formatDateTimeShort(date, { locale: "en-US" });
    expect(result.length).toBeLessThan(40);
    expect(result).toMatch(/\d/);
  });

  it("respects hour12 option", () => {
    const date = createFixedDate(2024, 1, 15, 14, 30);
    const result = formatDateTimeShort(date, {
      locale: "en-US",
      hour12: false,
    });
    expect(result).toMatch(/14:30/);
  });

  it("includes seconds when showSeconds is true", () => {
    const date = createFixedDate(2024, 1, 15, 14, 30, 45);
    const result = formatDateTimeShort(date, {
      locale: "en-US",
      showSeconds: true,
    });
    expect(result).toMatch(/45/);
  });

  it("accepts timestamp input", () => {
    const timestamp = createFixedDate(2024, 1, 15, 14, 30).getTime();
    const result = formatDateTimeShort(timestamp, { locale: "en-US" });
    expect(result).toMatch(/\d/);
  });
});

describe("getRelativeTime", () => {
  it("returns relative time for past dates in days", () => {
    const twoDaysAgo = createRelativeDate(-2);
    const result = getRelativeTime(twoDaysAgo, { locale: "en-US" });
    expect(result).toMatch(/2 days ago/i);
  });

  it("returns relative time for future dates in days", () => {
    const inTwoDays = createRelativeDate(2);
    const result = getRelativeTime(inTwoDays, { locale: "en-US" });
    expect(result).toMatch(/in 2 days/i);
  });

  it("uses hours for recent times", () => {
    const twoHoursAgo = createRelativeDate(0, -2);
    const result = getRelativeTime(twoHoursAgo, { locale: "en-US" });
    expect(result).toMatch(/2 hours ago/i);
  });

  it("uses minutes for very recent times", () => {
    const fiveMinutesAgo = createRelativeDate(0, 0, -5);
    const result = getRelativeTime(fiveMinutesAgo, { locale: "en-US" });
    expect(result).toMatch(/5 minutes ago/i);
  });

  it("supports short style", () => {
    const twoDaysAgo = createRelativeDate(-2);
    const result = getRelativeTime(twoDaysAgo, {
      locale: "en-US",
      style: "short",
    });
    expect(result.length).toBeLessThan(15);
  });

  it("supports narrow style", () => {
    const twoDaysAgo = createRelativeDate(-2);
    const result = getRelativeTime(twoDaysAgo, {
      locale: "en-US",
      style: "narrow",
    });
    expect(result.length).toBeLessThan(10);
  });

  it("accepts timestamp input", () => {
    const twoDaysAgo = createRelativeDate(-2);
    const result = getRelativeTime(twoDaysAgo.getTime(), { locale: "en-US" });
    expect(result).toMatch(/2 days ago/i);
  });

  it("handles weeks", () => {
    const twoWeeksAgo = createRelativeDate(-14);
    const result = getRelativeTime(twoWeeksAgo, { locale: "en-US" });
    expect(result).toMatch(/2 weeks ago/i);
  });
});

describe("formatRelativeDate", () => {
  it("returns today label for today", () => {
    const result = formatRelativeDate(
      new Date(),
      { locale: "en-US" },
      { today: "Today" },
    );
    expect(result).toBe("Today");
  });

  it("returns yesterday label for yesterday", () => {
    const yesterday = createRelativeDate(-1);
    const result = formatRelativeDate(
      yesterday,
      { locale: "en-US" },
      { yesterday: "Yesterday" },
    );
    expect(result).toBe("Yesterday");
  });

  it("returns tomorrow label for tomorrow", () => {
    const tomorrow = createRelativeDate(1);
    const result = formatRelativeDate(
      tomorrow,
      { locale: "en-US" },
      { tomorrow: "Tomorrow" },
    );
    expect(result).toBe("Tomorrow");
  });

  it("returns formatted date for other dates", () => {
    const oldDate = createFixedDate(2024, 1, 1);
    const result = formatRelativeDate(
      oldDate,
      { locale: "en-US" },
      { today: "Today", yesterday: "Yesterday" },
    );
    expect(result).toContain("January");
    expect(result).toContain("1");
    expect(result).toContain("2024");
  });

  it("returns formatted date when no labels provided", () => {
    const result = formatRelativeDate(new Date(), { locale: "en-US" });
    expect(result).toMatch(/\d{4}/);
  });

  it("accepts mixed input types", () => {
    const timestamp = Date.now();
    const result = formatRelativeDate(
      timestamp,
      { locale: "en-US" },
      { today: "Today" },
    );
    expect(result).toBe("Today");
  });

  it("respects locale for fallback date format", () => {
    const oldDate = createFixedDate(2024, 1, 15);
    const result = formatRelativeDate(oldDate, { locale: "de-DE" }, {});
    expect(result).toContain("Januar");
  });
});

//#endregion
