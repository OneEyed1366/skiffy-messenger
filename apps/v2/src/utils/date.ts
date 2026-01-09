/**
 * Date manipulation utilities
 * Migrated from: vendor/desktop/webapp/channels/src/utils/datetime.ts
 *
 * Uses native Date API for simple operations.
 * Uses Intl.DateTimeFormat and Intl.RelativeTimeFormat for formatting.
 */

//#region Types

/**
 * Input that can be converted to a Date.
 * - Date: used directly
 * - number: treated as milliseconds since epoch
 * - string: parsed by Date constructor
 */
type IDateInput = Date | number | string;

/**
 * Units for relative time calculations.
 */
type IRelativeTimeUnit =
  | "year"
  | "quarter"
  | "month"
  | "week"
  | "day"
  | "hour"
  | "minute"
  | "second";

/**
 * Options for date formatting functions.
 */
type IFormatDateOptions = {
  locale?: string;
  timeZone?: string;
};

/**
 * Options for time formatting functions.
 */
type IFormatTimeOptions = IFormatDateOptions & {
  hour12?: boolean;
  showSeconds?: boolean;
};

/**
 * Options for relative time formatting.
 */
type IRelativeTimeOptions = {
  locale?: string;
  style?: "long" | "short" | "narrow";
};

/**
 * Labels for relative date formatting.
 */
type IRelativeDateLabels = {
  today?: string;
  yesterday?: string;
  tomorrow?: string;
};

//#endregion

//#region Constants

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = MS_PER_SECOND * 60;
const MS_PER_HOUR = MS_PER_MINUTE * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;
const MS_PER_WEEK = MS_PER_DAY * 7;

/**
 * Approximate milliseconds per unit for relative time calculations.
 * Month and year use average values.
 */
const MS_PER_UNIT = {
  second: MS_PER_SECOND,
  minute: MS_PER_MINUTE,
  hour: MS_PER_HOUR,
  day: MS_PER_DAY,
  week: MS_PER_WEEK,
  month: MS_PER_DAY * 30.44, // Average days per month
  quarter: MS_PER_DAY * 91.31, // Average days per quarter
  year: MS_PER_DAY * 365.25, // Average days per year (accounts for leap years)
} as const satisfies Record<IRelativeTimeUnit, number>;

//#endregion

//#region Internal Helpers

/**
 * Converts various input types to a Date object.
 * @param input - Date, timestamp (ms), or date string
 * @returns Date object
 * @example
 * toDate(new Date()) // Date
 * toDate(1704067200000) // Date from timestamp
 * toDate('2024-01-01') // Date from string
 */
function toDate(input: IDateInput): Date {
  if (input instanceof Date) {
    return input;
  }
  if (typeof input === "number") {
    return new Date(input);
  }
  return new Date(input);
}

//#endregion

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
 * @param date - Date to check
 * @returns true if date is today
 * @example
 * isToday(new Date()) // true
 * isToday(1704067200000) // depends on current date
 */
export function isToday(date: IDateInput): boolean {
  return isSameDay(toDate(date), new Date());
}

/**
 * Checks if a date is yesterday (in local timezone).
 * @param date - Date to check
 * @returns true if date is yesterday
 * @example
 * const yesterday = new Date();
 * yesterday.setDate(yesterday.getDate() - 1);
 * isYesterday(yesterday) // true
 */
export function isYesterday(date: IDateInput): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(toDate(date), yesterday);
}

/**
 * Checks if a date is tomorrow (in local timezone).
 * @param date - Date to check
 * @returns true if date is tomorrow
 * @example
 * const tomorrow = new Date();
 * tomorrow.setDate(tomorrow.getDate() + 1);
 * isTomorrow(tomorrow) // true
 */
export function isTomorrow(date: IDateInput): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameDay(toDate(date), tomorrow);
}

/**
 * Checks if a date is within the last 7 days (including today).
 * @param date - Date to check
 * @returns true if date is within the last week
 * @example
 * isWithinLastWeek(new Date()) // true
 * const oldDate = new Date();
 * oldDate.setDate(oldDate.getDate() - 10);
 * isWithinLastWeek(oldDate) // false
 */
export function isWithinLastWeek(date: IDateInput): boolean {
  const d = toDate(date);
  const now = new Date();
  const sixDaysAgo = new Date();
  sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
  sixDaysAgo.setHours(0, 0, 0, 0);

  return d.getTime() >= sixDaysAgo.getTime() && d.getTime() <= now.getTime();
}

//#endregion

//#region Unix Timestamp Conversion

/**
 * Converts a Date to UTC Unix timestamp in seconds.
 * Rounds to nearest second.
 * @param date - Date to convert
 * @returns Unix timestamp in seconds
 * @example
 * toUTCUnixSeconds(new Date('2024-01-01T00:00:00Z')) // 1704067200
 */
export function toUTCUnixSeconds(date: IDateInput): number {
  return Math.round(toDate(date).getTime() / 1000);
}

/**
 * Converts a Unix timestamp in seconds to a Date.
 * @param timestamp - Unix timestamp in seconds
 * @returns Date object
 * @example
 * fromUnixSeconds(1704067200) // Date('2024-01-01T00:00:00Z')
 */
export function fromUnixSeconds(timestamp: number): Date {
  return new Date(timestamp * 1000);
}

//#endregion

//#region Difference Functions

/**
 * Calculates the difference between two dates in the specified unit.
 * @param a - First date
 * @param b - Second date
 * @param unit - Unit of time to calculate difference in
 * @param truncate - If true, truncates to whole units (default: false)
 * @returns Difference in specified units (a - b). Positive if a > b.
 * @example
 * const a = new Date('2024-01-15');
 * const b = new Date('2024-01-01');
 * getDiff(a, b, 'day') // 14
 * getDiff(a, b, 'week') // 2
 */
export function getDiff(
  a: IDateInput,
  b: IDateInput,
  unit: IRelativeTimeUnit,
  truncate = false,
): number {
  const dateA = toDate(a);
  const dateB = toDate(b);
  const diffMs = dateA.getTime() - dateB.getTime();
  const msPerUnit = MS_PER_UNIT[unit];

  const diff = diffMs / msPerUnit;
  return truncate ? Math.trunc(diff) : diff;
}

/**
 * Checks if date `a` is within `threshold` units of date `b`.
 * @param a - First date
 * @param b - Second date (reference point)
 * @param unit - Unit of time
 * @param threshold - Maximum difference to be considered "within" (default: 1)
 * @returns true if dates are within threshold units of each other
 * @example
 * const a = new Date('2024-01-01T10:00:00');
 * const b = new Date('2024-01-01T10:30:00');
 * isWithin(a, b, 'hour', 1) // true
 * isWithin(a, b, 'minute', 15) // false (30 min apart)
 */
export function isWithin(
  a: IDateInput,
  b: IDateInput,
  unit: IRelativeTimeUnit,
  threshold = 1,
): boolean {
  const diff = Math.abs(getDiff(a, b, unit, true));
  return diff <= threshold;
}

//#endregion

//#region Formatting Functions

/**
 * Formats a date in a localized long date format.
 * @param date - Date to format
 * @param options - Formatting options
 * @returns Formatted date string (e.g., "January 1, 2024")
 * @example
 * formatDate(new Date('2024-01-01')) // "January 1, 2024"
 * formatDate(new Date('2024-01-01'), { locale: 'de-DE' }) // "1. Januar 2024"
 */
export function formatDate(
  date: IDateInput,
  options: IFormatDateOptions = {},
): string {
  const { locale, timeZone } = options;
  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone,
  });
  return formatter.format(toDate(date));
}

/**
 * Formats a date in a localized short date format.
 * @param date - Date to format
 * @param options - Formatting options
 * @returns Formatted date string (e.g., "1/1/24")
 * @example
 * formatDateShort(new Date('2024-01-01')) // "1/1/24"
 * formatDateShort(new Date('2024-01-01'), { locale: 'de-DE' }) // "01.01.24"
 */
export function formatDateShort(
  date: IDateInput,
  options: IFormatDateOptions = {},
): string {
  const { locale, timeZone } = options;
  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeZone,
  });
  return formatter.format(toDate(date));
}

/**
 * Formats a time in a localized format.
 * @param date - Date to format time from
 * @param options - Formatting options
 * @returns Formatted time string (e.g., "10:30 AM" or "10:30:45 AM")
 * @example
 * formatTime(new Date('2024-01-01T10:30:00')) // "10:30 AM"
 * formatTime(new Date('2024-01-01T10:30:45'), { showSeconds: true }) // "10:30:45 AM"
 * formatTime(new Date('2024-01-01T14:30:00'), { hour12: false }) // "14:30"
 */
export function formatTime(
  date: IDateInput,
  options: IFormatTimeOptions = {},
): string {
  const { locale, timeZone, hour12, showSeconds = false } = options;
  const formatter = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    second: showSeconds ? "2-digit" : undefined,
    hour12,
    timeZone,
  });
  return formatter.format(toDate(date));
}

/**
 * Formats a date and time in a localized long format.
 * @param date - Date to format
 * @param options - Formatting options
 * @returns Formatted date and time string (e.g., "January 1, 2024 at 10:30 AM")
 * @example
 * formatDateTime(new Date('2024-01-01T10:30:00')) // "January 1, 2024 at 10:30 AM"
 */
export function formatDateTime(
  date: IDateInput,
  options: IFormatTimeOptions = {},
): string {
  const { locale, timeZone, hour12, showSeconds = false } = options;
  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeStyle: showSeconds ? "medium" : "short",
    hour12,
    timeZone,
  });
  return formatter.format(toDate(date));
}

/**
 * Formats a date and time in a localized short format.
 * @param date - Date to format
 * @param options - Formatting options
 * @returns Formatted date and time string (e.g., "1/1/24, 10:30 AM")
 * @example
 * formatDateTimeShort(new Date('2024-01-01T10:30:00')) // "1/1/24, 10:30 AM"
 */
export function formatDateTimeShort(
  date: IDateInput,
  options: IFormatTimeOptions = {},
): string {
  const { locale, timeZone, hour12, showSeconds = false } = options;
  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: showSeconds ? "medium" : "short",
    hour12,
    timeZone,
  });
  return formatter.format(toDate(date));
}

//#endregion

//#region Relative Time Functions

/**
 * Gets a relative time string for a date (e.g., "2 days ago", "in 3 hours").
 * @param date - Date to get relative time for
 * @param options - Formatting options
 * @returns Relative time string
 * @example
 * // If now is 2024-01-15
 * getRelativeTime(new Date('2024-01-13')) // "2 days ago"
 * getRelativeTime(new Date('2024-01-17')) // "in 2 days"
 * getRelativeTime(new Date('2024-01-15T09:00:00')) // "3 hours ago" (if it's noon)
 */
export function getRelativeTime(
  date: IDateInput,
  options: IRelativeTimeOptions = {},
): string {
  const { locale, style = "long" } = options;
  const d = toDate(date);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const absDiffMs = Math.abs(diffMs);

  // Determine the best unit to use
  let unit: Intl.RelativeTimeFormatUnit;
  let value: number;

  if (absDiffMs < MS_PER_MINUTE) {
    unit = "second";
    value = Math.round(diffMs / MS_PER_SECOND);
  } else if (absDiffMs < MS_PER_HOUR) {
    unit = "minute";
    value = Math.round(diffMs / MS_PER_MINUTE);
  } else if (absDiffMs < MS_PER_DAY) {
    unit = "hour";
    value = Math.round(diffMs / MS_PER_HOUR);
  } else if (absDiffMs < MS_PER_WEEK) {
    unit = "day";
    value = Math.round(diffMs / MS_PER_DAY);
  } else if (absDiffMs < MS_PER_UNIT.month) {
    unit = "week";
    value = Math.round(diffMs / MS_PER_WEEK);
  } else if (absDiffMs < MS_PER_UNIT.year) {
    unit = "month";
    value = Math.round(diffMs / MS_PER_UNIT.month);
  } else {
    unit = "year";
    value = Math.round(diffMs / MS_PER_UNIT.year);
  }

  const formatter = new Intl.RelativeTimeFormat(locale, { style });
  return formatter.format(value, unit);
}

/**
 * Formats a date as a relative date string with custom labels for today/yesterday/tomorrow.
 * Falls back to a formatted date for other dates.
 * @param date - Date to format
 * @param options - Date formatting options
 * @param labels - Custom labels for today, yesterday, tomorrow
 * @returns Relative date string or formatted date
 * @example
 * // If today is 2024-01-15
 * formatRelativeDate(new Date('2024-01-15'), {}, { today: 'Today' }) // "Today"
 * formatRelativeDate(new Date('2024-01-14'), {}, { yesterday: 'Yesterday' }) // "Yesterday"
 * formatRelativeDate(new Date('2024-01-01')) // "January 1, 2024"
 */
export function formatRelativeDate(
  date: IDateInput,
  options: IFormatDateOptions = {},
  labels: IRelativeDateLabels = {},
): string {
  const d = toDate(date);

  if (labels.today !== undefined && isToday(d)) {
    return labels.today;
  }

  if (labels.yesterday !== undefined && isYesterday(d)) {
    return labels.yesterday;
  }

  if (labels.tomorrow !== undefined && isTomorrow(d)) {
    return labels.tomorrow;
  }

  return formatDate(d, options);
}

//#endregion
