/**
 * Timezone utilities
 * Migrated from: vendor/desktop/webapp/channels/src/utils/timezone.ts
 *
 * Uses native Intl API + @date-fns/tz instead of moment-timezone.
 */

import { tzOffset } from "@date-fns/tz";

//#region Browser Timezone

/**
 * Gets the browser's current timezone as an IANA timezone name.
 *
 * @returns IANA timezone name (e.g., 'America/New_York')
 */
export function getBrowserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

//#endregion

//#region Timezone Validation

/**
 * Checks if a timezone string is a valid IANA timezone.
 *
 * @param timezone - Timezone string to validate
 * @returns true if valid IANA timezone
 */
export function isValidTimezone(timezone: string): boolean {
  if (!timezone) {
    return false;
  }

  try {
    // This will throw if timezone is invalid
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

//#endregion

//#region UTC Offset

/**
 * Gets the UTC offset in minutes for a given timezone.
 * Positive values are east of UTC, negative are west.
 *
 * Note: This returns the CURRENT offset, which accounts for DST.
 *
 * @param timezone - IANA timezone name
 * @returns Offset in minutes (e.g., -300 for EST, 540 for JST)
 * @throws Error if timezone is invalid
 */
export function getUtcOffsetForTimezone(timezone: string): number {
  if (!isValidTimezone(timezone)) {
    throw new Error(`Invalid timezone: ${timezone}`);
  }

  // tzOffset returns offset in minutes, positive east of UTC
  return tzOffset(timezone, new Date());
}

//#endregion

//#region Timezone Parsing

/**
 * Extracts the region (first part) from an IANA timezone name.
 *
 * @param timezone - IANA timezone name (e.g., 'America/New_York')
 * @returns Region part (e.g., 'America') or the input if no '/' present
 */
export function getTimezoneRegion(timezone: string): string {
  if (!timezone) {
    return "";
  }

  const slashIndex = timezone.indexOf("/");
  if (slashIndex === -1) {
    return timezone;
  }

  return timezone.substring(0, slashIndex);
}

//#endregion

//#region Types

/**
 * Information about a timezone including offset and labels.
 */
export type ITimezoneInfo = {
  /** IANA timezone identifier */
  id: string;
  /** Human-readable label for the timezone */
  label: string;
  /** UTC offset in minutes */
  offset: number;
  /** Formatted offset string (e.g., "+05:30", "-08:00") */
  offsetLabel: string;
};

/**
 * Options for formatting a date in a specific timezone.
 */
export type IFormatInTimezoneOptions = {
  /** Date formatting style */
  dateStyle?: "full" | "long" | "medium" | "short";
  /** Time formatting style */
  timeStyle?: "full" | "long" | "medium" | "short";
  /** Use 12-hour format (true) or 24-hour format (false) */
  hour12?: boolean;
};

//#endregion

//#region User Timezone

/**
 * Gets the user's timezone with fallback to UTC.
 * Alias for getBrowserTimezone() with safe fallback.
 *
 * @returns IANA timezone name, defaults to 'UTC' if detection fails
 *
 * @example
 * ```typescript
 * const tz = getUserTimezone();
 * // Returns 'America/New_York' or 'UTC' if browser detection fails
 * ```
 */
export function getUserTimezone(): string {
  try {
    const tz = getBrowserTimezone();
    return tz || "UTC";
  } catch {
    return "UTC";
  }
}

//#endregion

//#region Format in Timezone

/**
 * Formats a date in a specific timezone.
 * Invalid timezones fall back to UTC.
 *
 * @param date - Date to format (Date object, timestamp, or ISO string)
 * @param timezone - IANA timezone name
 * @param options - Formatting options
 * @returns Formatted date string
 *
 * @example
 * ```typescript
 * const formatted = formatInTimezone(new Date(), 'Asia/Tokyo', {
 *   dateStyle: 'long',
 *   timeStyle: 'short'
 * });
 * // Returns "January 7, 2026 at 10:30 AM"
 * ```
 */
export function formatInTimezone(
  date: Date | number | string,
  timezone: string,
  options?: IFormatInTimezoneOptions,
): string {
  const dateObj = date instanceof Date ? date : new Date(date);

  // Validate date
  if (Number.isNaN(dateObj.getTime())) {
    return "Invalid Date";
  }

  // Fallback to UTC for invalid timezone
  const safeTimezone = isValidTimezone(timezone) ? timezone : "UTC";

  const formatOptions: Intl.DateTimeFormatOptions = {
    timeZone: safeTimezone,
  };

  if (options?.dateStyle) {
    formatOptions.dateStyle = options.dateStyle;
  }
  if (options?.timeStyle) {
    formatOptions.timeStyle = options.timeStyle;
  }
  if (options?.hour12 !== undefined) {
    formatOptions.hour12 = options.hour12;
  }

  // If no style options provided, use default medium format
  if (!options?.dateStyle && !options?.timeStyle) {
    formatOptions.dateStyle = "medium";
    formatOptions.timeStyle = "medium";
  }

  return new Intl.DateTimeFormat(undefined, formatOptions).format(dateObj);
}

//#endregion

//#region List Timezones

/**
 * Formats an offset in minutes to a string like "+05:30" or "-08:00".
 *
 * @param offsetMinutes - Offset in minutes (positive = east of UTC)
 * @returns Formatted offset string
 */
function formatOffsetLabel(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absMinutes = Math.abs(offsetMinutes);
  const hours = Math.floor(absMinutes / 60);
  const minutes = absMinutes % 60;
  return `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Lists all available IANA timezones with their info.
 * Sorted by offset (ascending), then by name (alphabetically).
 *
 * @returns Array of timezone info objects
 *
 * @example
 * ```typescript
 * const timezones = listTimezones();
 * // Returns [
 * //   { id: 'Pacific/Niue', label: 'Pacific/Niue', offset: -660, offsetLabel: '-11:00' },
 * //   ...
 * // ]
 * ```
 */
export function listTimezones(): ITimezoneInfo[] {
  // ES2022: Intl.supportedValuesOf('timeZone')
  const timezoneIds = Intl.supportedValuesOf("timeZone");

  const timezones: ITimezoneInfo[] = timezoneIds.map((id) => {
    const offset = tzOffset(id, new Date());
    return {
      id,
      label: id.replace(/_/g, " "),
      offset,
      offsetLabel: formatOffsetLabel(offset),
    };
  });

  // Sort by offset first (ascending), then by name
  return timezones.sort((a, b) => {
    if (a.offset !== b.offset) {
      return a.offset - b.offset;
    }
    return a.id.localeCompare(b.id);
  });
}

//#endregion

//#region Current Date/Time for Timezone

/**
 * Gets the current date (date only, no time) for a specific timezone.
 * Time components are set to midnight (00:00:00) in local time.
 *
 * @param timezone - IANA timezone name
 * @returns Date object representing the current date in that timezone
 *
 * @example
 * ```typescript
 * const tokyoDate = getCurrentDateForTimezone('Asia/Tokyo');
 * // Returns Date set to current date in Tokyo (time is midnight local)
 * ```
 */
export function getCurrentDateForTimezone(timezone: string): Date {
  const safeTimezone = isValidTimezone(timezone) ? timezone : "UTC";

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: safeTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(new Date());
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value) - 1; // 0-indexed
  const day = Number(parts.find((p) => p.type === "day")?.value);

  return new Date(year, month, day);
}

/**
 * Gets the current date and time for a specific timezone.
 *
 * @param timezone - IANA timezone name
 * @returns Date object representing the current datetime in that timezone
 *
 * @example
 * ```typescript
 * const tokyoNow = getCurrentDateTimeForTimezone('Asia/Tokyo');
 * // Returns Date set to current date/time in Tokyo
 * ```
 */
export function getCurrentDateTimeForTimezone(timezone: string): Date {
  const safeTimezone = isValidTimezone(timezone) ? timezone : "UTC";

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: safeTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value) - 1; // 0-indexed
  const day = Number(parts.find((p) => p.type === "day")?.value);
  const hour = Number(parts.find((p) => p.type === "hour")?.value);
  const minute = Number(parts.find((p) => p.type === "minute")?.value);
  const second = Number(parts.find((p) => p.type === "second")?.value);

  return new Date(year, month, day, hour, minute, second);
}

//#endregion
