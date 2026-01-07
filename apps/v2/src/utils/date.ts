/**
 * Date manipulation utilities
 * Migrated from: vendor/desktop/webapp/channels/src/utils/datetime.ts
 *
 * Uses native Date API for simple operations.
 * Uses date-fns + @date-fns/tz for timezone-aware operations.
 */

//#region Same Day/Month/Year Comparisons

/**
 * Checks if two dates are on the same calendar day.
 */
export function isSameDay(a: Date, b: Date = new Date()): boolean {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

/**
 * Checks if two dates are in the same calendar month and year.
 */
export function isSameMonth(a: Date, b: Date = new Date()): boolean {
  return a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

/**
 * Checks if two dates are in the same calendar year.
 */
export function isSameYear(a: Date, b: Date = new Date()): boolean {
  return a.getFullYear() === b.getFullYear();
}

//#endregion

//#region Relative Date Checks

/**
 * Checks if a date is today (in local timezone).
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Checks if a date is yesterday (in local timezone).
 */
export function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
}

//#endregion

//#region Unix Timestamp Conversion

/**
 * Converts a Date to UTC Unix timestamp in seconds.
 * Rounds to nearest second.
 */
export function toUTCUnixSeconds(date: Date): number {
  return Math.round(date.getTime() / 1000);
}

//#endregion
