/**
 * Username and user display name utilities
 * Migrated from: vendor/desktop/webapp/channels/src/utils/utils.tsx
 */

import type { IUserProfile } from "@/types";

//#region Types

type IUsernameStatus = {
  valid: boolean;
  error?: string;
};

type IDisplayNameOptions = {
  /**
   * Fallback when user is null/undefined
   */
  fallback?: string;
  /**
   * Show username as fallback if no display name
   */
  showUsername?: boolean;
};

//#endregion

//#region Constants

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 22;
const USERNAME_REGEX = /^[a-z][a-z0-9._-]*[a-z0-9]$|^[a-z]$/;
const CONSECUTIVE_PERIODS_REGEX = /\.\./;

const USERNAME_ERRORS = {
  TOO_SHORT: `Username must be at least ${USERNAME_MIN_LENGTH} characters`,
  TOO_LONG: `Username must be at most ${USERNAME_MAX_LENGTH} characters`,
  INVALID_START: "Username must start with a letter",
  INVALID_END: "Username cannot end with a period",
  INVALID_CHARS:
    "Username can only contain lowercase letters, numbers, underscores, hyphens, and periods",
  CONSECUTIVE_PERIODS: "Username cannot contain consecutive periods",
} as const;

//#endregion

//#region Display Name Functions

/**
 * Gets user's full name (firstName lastName).
 * Returns empty string if neither is set.
 *
 * @param user - User profile
 * @returns Full name or empty string
 *
 * @example
 * ```typescript
 * getFullName({ first_name: 'John', last_name: 'Doe' }) // => 'John Doe'
 * getFullName({ first_name: 'John' }) // => 'John'
 * getFullName(null) // => ''
 * ```
 */
export function getFullName(user: IUserProfile | null | undefined): string {
  if (user == null) {
    return "";
  }

  const firstName = user.first_name?.trim() ?? "";
  const lastName = user.last_name?.trim() ?? "";

  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }

  if (firstName) {
    return firstName;
  }

  if (lastName) {
    return lastName;
  }

  return "";
}

/**
 * Gets user's display name.
 * Priority: nickname > firstName + lastName > username.
 *
 * @param user - User profile
 * @param options - Display options
 * @returns Display name or fallback
 *
 * @example
 * ```typescript
 * getDisplayName({ nickname: 'Johnny', first_name: 'John', username: 'john.doe' })
 * // => 'Johnny'
 *
 * getDisplayName({ first_name: 'John', last_name: 'Doe', username: 'john.doe' })
 * // => 'John Doe'
 *
 * getDisplayName(null, { fallback: 'Unknown User' })
 * // => 'Unknown User'
 * ```
 */
export function getDisplayName(
  user: IUserProfile | null | undefined,
  options?: IDisplayNameOptions,
): string {
  const { fallback = "", showUsername = true } = options ?? {};

  if (user == null) {
    return fallback;
  }

  // Priority 1: Nickname
  const nickname = user.nickname?.trim() ?? "";
  if (nickname.length > 0) {
    return nickname;
  }

  // Priority 2: Full name
  const fullName = getFullName(user);
  if (fullName) {
    return fullName;
  }

  // Priority 3: Username (if showUsername is enabled)
  if (showUsername && user.username) {
    return user.username;
  }

  return fallback;
}

/**
 * Gets user's initials (first letter of first and last name).
 * Falls back to first two letters of username.
 *
 * @param user - User profile
 * @returns Initials (uppercase) or empty string
 *
 * @example
 * ```typescript
 * getInitials({ first_name: 'John', last_name: 'Doe' }) // => 'JD'
 * getInitials({ first_name: 'John' }) // => 'J'
 * getInitials({ username: 'john.doe' }) // => 'JO'
 * getInitials(null) // => ''
 * ```
 */
export function getInitials(user: IUserProfile | null | undefined): string {
  if (user == null) {
    return "";
  }

  const firstName = user.first_name?.trim() ?? "";
  const lastName = user.last_name?.trim() ?? "";

  // If we have both first and last name
  if (firstName && lastName) {
    return (firstName[0] + lastName[0]).toUpperCase();
  }

  // If we have only first name
  if (firstName) {
    return firstName[0].toUpperCase();
  }

  // If we have only last name
  if (lastName) {
    return lastName[0].toUpperCase();
  }

  // Fall back to first two letters of username
  const username = user.username?.trim() ?? "";
  if (username.length >= 2) {
    return username.slice(0, 2).toUpperCase();
  }

  if (username.length === 1) {
    return username[0].toUpperCase();
  }

  return "";
}

//#endregion

//#region Username Validation

/**
 * Validates username format.
 *
 * Rules:
 * - 3-22 characters
 * - Lowercase letters, numbers, underscores, hyphens, periods
 * - Must start with a letter
 * - Cannot end with period
 * - No consecutive periods
 *
 * @param username - Username to validate
 * @returns true if valid
 *
 * @example
 * ```typescript
 * isValidUsername('john.doe') // => true
 * isValidUsername('a') // => false (too short)
 * isValidUsername('John') // => false (uppercase)
 * isValidUsername('.john') // => false (starts with period)
 * ```
 */
export function isValidUsername(username: string): boolean {
  return getUsernameStatus(username).valid;
}

/**
 * Gets detailed validation status for username.
 * Returns object with valid flag and error message if invalid.
 *
 * @param username - Username to validate
 * @returns Validation status with error message
 *
 * @example
 * ```typescript
 * getUsernameStatus('john.doe')
 * // => { valid: true }
 *
 * getUsernameStatus('ab')
 * // => { valid: false, error: 'Username must be at least 3 characters' }
 * ```
 */
export function getUsernameStatus(username: string): IUsernameStatus {
  // Length checks
  if (username.length < USERNAME_MIN_LENGTH) {
    return { valid: false, error: USERNAME_ERRORS.TOO_SHORT };
  }

  if (username.length > USERNAME_MAX_LENGTH) {
    return { valid: false, error: USERNAME_ERRORS.TOO_LONG };
  }

  // Must start with a letter
  if (!/^[a-z]/.test(username)) {
    return { valid: false, error: USERNAME_ERRORS.INVALID_START };
  }

  // Cannot end with a period
  if (username.endsWith(".")) {
    return { valid: false, error: USERNAME_ERRORS.INVALID_END };
  }

  // No consecutive periods
  if (CONSECUTIVE_PERIODS_REGEX.test(username)) {
    return { valid: false, error: USERNAME_ERRORS.CONSECUTIVE_PERIODS };
  }

  // Overall format validation (lowercase letters, numbers, underscores, hyphens, periods)
  if (!USERNAME_REGEX.test(username)) {
    return { valid: false, error: USERNAME_ERRORS.INVALID_CHARS };
  }

  return { valid: true };
}

/**
 * Sanitizes username input (lowercase, trim).
 *
 * @param username - Raw username input
 * @returns Sanitized username
 *
 * @example
 * ```typescript
 * sanitizeUsername('  JohnDoe  ') // => 'johndoe'
 * sanitizeUsername('JOHN.DOE') // => 'john.doe'
 * ```
 */
export function sanitizeUsername(username: string): string {
  return username.toLowerCase().trim();
}

//#endregion

//#region Mention Functions

/**
 * Formats username as @mention.
 *
 * @param username - Username to format
 * @returns Mention string
 *
 * @example
 * ```typescript
 * formatMention('john.doe') // => '@john.doe'
 * ```
 */
export function formatMention(username: string): string {
  return `@${username}`;
}

/**
 * Extracts username from @mention string.
 *
 * @param mention - Mention string (with or without @)
 * @returns Username without @
 *
 * @example
 * ```typescript
 * extractUsernameFromMention('@john.doe') // => 'john.doe'
 * extractUsernameFromMention('john.doe') // => 'john.doe'
 * ```
 */
export function extractUsernameFromMention(mention: string): string {
  if (mention.startsWith("@")) {
    return mention.slice(1);
  }
  return mention;
}

/**
 * Checks if string is a valid @mention format.
 *
 * @param text - Text to check
 * @returns true if valid mention format
 *
 * @example
 * ```typescript
 * isMention('@john.doe') // => true
 * isMention('john.doe') // => false
 * isMention('@') // => false
 * ```
 */
export function isMention(text: string): boolean {
  if (!text.startsWith("@")) {
    return false;
  }
  const username = text.slice(1);
  return username.length > 0 && isValidUsername(username);
}

//#endregion

//#region User Status Functions

/**
 * Checks if user is a bot.
 *
 * @param user - User profile
 * @returns true if user is a bot
 *
 * @example
 * ```typescript
 * isBotUser({ is_bot: true }) // => true
 * isBotUser({ is_bot: false }) // => false
 * isBotUser(null) // => false
 * ```
 */
export function isBotUser(user: IUserProfile | null | undefined): boolean {
  return user?.is_bot === true;
}

/**
 * Checks if user is a system admin.
 * Looks for 'system_admin' in roles.
 *
 * @param user - User profile
 * @returns true if user is system admin
 *
 * @example
 * ```typescript
 * isSystemAdmin({ roles: 'system_admin system_user' }) // => true
 * isSystemAdmin({ roles: 'system_user' }) // => false
 * isSystemAdmin(null) // => false
 * ```
 */
export function isSystemAdmin(user: IUserProfile | null | undefined): boolean {
  if (user == null) {
    return false;
  }
  return user.roles?.includes("system_admin") === true;
}

/**
 * Gets user's position/title.
 * Returns empty string if not set.
 *
 * @param user - User profile
 * @returns Position or empty string
 *
 * @example
 * ```typescript
 * getUserPosition({ position: 'Developer' }) // => 'Developer'
 * getUserPosition({ position: '' }) // => ''
 * getUserPosition(null) // => ''
 * ```
 */
export function getUserPosition(user: IUserProfile | null | undefined): string {
  if (user == null) {
    return "";
  }
  return user.position?.trim() ?? "";
}

/**
 * Gets user's locale preference.
 * Falls back to 'en' if not set.
 *
 * @param user - User profile
 * @returns Locale string
 *
 * @example
 * ```typescript
 * getUserLocale({ locale: 'es' }) // => 'es'
 * getUserLocale({ locale: '' }) // => 'en'
 * getUserLocale(null) // => 'en'
 * ```
 */
export function getUserLocale(user: IUserProfile | null | undefined): string {
  if (user == null) {
    return "en";
  }
  const locale = user.locale?.trim() ?? "";
  return locale || "en";
}

//#endregion

//#region Exports

export type { IUsernameStatus, IDisplayNameOptions };

//#endregion
