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
