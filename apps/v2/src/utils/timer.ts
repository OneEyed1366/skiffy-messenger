/**
 * Timer/countdown utilities for burn-on-read functionality
 * Migrated from: vendor/desktop/webapp/channels/src/utils/burn_on_read_timer_utils.ts
 */

//#region Types

/**
 * i18n announcement result with key and interpolation values
 */
export type IAriaAnnouncement = {
  key: string;
  values?: Record<string, number>;
};

//#endregion Types

//#region Constants

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const WARNING_THRESHOLD_MS = 60000; // 60 seconds
const SECONDS_TIMESTAMP_THRESHOLD = 10000000000; // ~year 2286 in seconds

//#endregion Constants

//#region Time Formatting

/**
 * Formats milliseconds as a countdown string (MM:SS or H:MM:SS).
 * Rounds up partial seconds.
 */
export function formatTimeRemaining(ms: number): string {
  const remaining = Math.max(0, ms);
  const totalSeconds = Math.ceil(remaining / MS_PER_SECOND);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

//#endregion Time Formatting

//#region Time Calculation

/**
 * Calculates remaining time until expiration.
 * Auto-detects if expireAt is in seconds or milliseconds.
 *
 * @param expireAt - Expiration timestamp (seconds or milliseconds)
 * @returns Remaining time in milliseconds (can be negative if expired)
 */
export function calculateRemainingTime(expireAt: number): number {
  // Auto-detect seconds vs milliseconds
  const expireAtMs =
    expireAt < SECONDS_TIMESTAMP_THRESHOLD
      ? expireAt * MS_PER_SECOND
      : expireAt;
  return expireAtMs - Date.now();
}

//#endregion Time Calculation

//#region Timer State Checks

/**
 * Checks if timer is in warning state (less than 60 seconds remaining).
 */
export function isTimerInWarningState(remainingMs: number): boolean {
  return remainingMs <= WARNING_THRESHOLD_MS;
}

/**
 * Checks if timer has expired.
 */
export function isTimerExpired(remainingMs: number): boolean {
  return remainingMs <= 0;
}

//#endregion Timer State Checks

//#region Accessibility

/**
 * Returns the interval for accessibility announcements.
 * More frequent (10s) in final minute, otherwise 60s.
 */
export function getAriaAnnouncementInterval(remainingMs: number): number {
  if (remainingMs <= WARNING_THRESHOLD_MS) {
    return 10000; // 10 seconds
  }
  return MS_PER_MINUTE; // 60 seconds
}

/**
 * Formats remaining time as an i18n-compatible announcement object.
 * Returns a key and values for interpolation.
 */
export function formatAriaAnnouncement(ms: number): IAriaAnnouncement {
  const remaining = Math.max(0, ms);
  const totalSeconds = Math.ceil(remaining / MS_PER_SECOND);

  if (totalSeconds === 0) {
    return { key: "timer.messageDeleting" };
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // Minutes and seconds
  if (minutes > 0 && seconds > 0) {
    return {
      key: "timer.announcement",
      values: { minutes, seconds },
    };
  }

  // Only minutes
  if (minutes > 0) {
    return {
      key: minutes === 1 ? "timer.minuteRemaining" : "timer.minutesRemaining",
      values: { count: minutes },
    };
  }

  // Only seconds
  return {
    key: seconds === 1 ? "timer.secondRemaining" : "timer.secondsRemaining",
    values: { count: seconds },
  };
}

//#endregion Accessibility
