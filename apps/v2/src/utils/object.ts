/**
 * Object manipulation utilities
 * Migrated from: vendor/desktop/webapp/channels/src/utils/utils.tsx
 *                vendor/desktop/webapp/channels/src/packages/mattermost-redux/src/utils/key_mirror.ts
 */

//#region Type Guards

/**
 * Checks if a value is an empty object or nullish.
 * Returns true for null, undefined, {}, and [].
 *
 * @param value - Value to check
 * @returns true if empty or nullish
 */
export function isEmptyObject(value: unknown): boolean {
  if (value == null) {
    return true;
  }

  if (typeof value !== "object") {
    return false;
  }

  return Object.keys(value).length === 0;
}

//#endregion

//#region Shallow Comparison

/**
 * Performs a shallow equality comparison between two values.
 * For objects, compares keys and values at the first level only.
 *
 * @param a - First value
 * @param b - Second value
 * @returns true if shallowly equal
 */
export function shallowEqual(a: unknown, b: unknown): boolean {
  // Same reference or identical primitives
  if (a === b) {
    return true;
  }

  // Handle null/undefined
  if (a == null || b == null) {
    return false;
  }

  // Must be same type
  if (typeof a !== typeof b) {
    return false;
  }

  // For non-objects, already compared above
  if (typeof a !== "object") {
    return false;
  }

  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  // Different number of keys
  if (keysA.length !== keysB.length) {
    return false;
  }

  // Check each key's value
  for (const key of keysA) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, key) ||
      objA[key] !== objB[key]
    ) {
      return false;
    }
  }

  return true;
}

//#endregion

//#region Key Mirror

/**
 * Creates an object where each key's value equals the key itself.
 * Useful for creating enum-like objects from arrays.
 *
 * @param obj - Object with keys to mirror
 * @returns Object with keys equal to their values
 * @throws Error if input is not a plain object
 *
 * @example
 * ```typescript
 * keyMirror({ A: null, B: null }) // => { A: 'A', B: 'B' }
 * ```
 */
export function keyMirror<T extends Record<string, unknown>>(
  obj: T,
): { [K in keyof T]: K } {
  if (!(obj instanceof Object && !Array.isArray(obj))) {
    throw new Error("keyMirror(...): Argument must be an object.");
  }

  const result = {} as { [K in keyof T]: K };

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key as keyof T] = key as { [K in keyof T]: K }[keyof T];
    }
  }

  return result;
}

//#endregion

//#region Object Manipulation (Immutable)

/**
 * Returns a new object with specified keys removed.
 * Does not modify the original object.
 *
 * @param obj - Source object
 * @param keys - Keys to remove
 * @returns New object without specified keys
 */
export function deleteKeysFromObject<T extends Record<string, unknown>>(
  obj: T,
  keys: string[],
): Partial<T> {
  const result = { ...obj };

  for (const key of keys) {
    delete result[key as keyof T];
  }

  return result;
}

/**
 * Returns a new object with only specified keys.
 * Does not modify the original object.
 *
 * @param obj - Source object
 * @param keys - Keys to keep
 * @returns New object with only specified keys
 */
export function pickKeysFromObject<T extends Record<string, unknown>>(
  obj: T,
  keys: string[],
): Partial<T> {
  const result: Partial<T> = {};

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key as keyof T] = obj[key as keyof T];
    }
  }

  return result;
}

//#endregion
