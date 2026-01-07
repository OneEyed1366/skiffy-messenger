import {
  isSameDay,
  isSameMonth,
  isSameYear,
  isToday,
  isYesterday,
  toUTCUnixSeconds,
} from "./date";

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
});
