/**
 * Mathematical utilities
 * Migrated from: vendor/desktop/webapp/channels/src/utils/utils.tsx
 */

//#region Modulo

/**
 * Euclidean modulo operation that always returns a non-negative result
 * when the divisor is positive (unlike JavaScript's % operator).
 *
 * Useful for circular array indexing where negative indices should wrap around.
 *
 * @param a - Dividend
 * @param b - Divisor
 * @returns Euclidean modulo result
 *
 * @example
 * ```typescript
 * mod(-1, 5) // => 4 (not -1 like % operator)
 * mod(7, 5)  // => 2
 * ```
 */
export function mod(a: number, b: number): number {
  return ((a % b) + b) % b;
}

//#endregion

//#region String to Number

/**
 * Parses a string to an integer, returning 0 for empty/null/undefined values.
 *
 * @param s - String to parse
 * @returns Parsed integer or 0 for empty input
 */
export function stringToNumber(s: string | undefined | null): number {
  if (!s) {
    return 0;
  }
  return parseInt(s, 10);
}

//#endregion

//#region Number Formatting

/**
 * Formats a number to a fixed number of decimal places,
 * removing unnecessary trailing zeros.
 *
 * @param num - Number to format
 * @param places - Maximum decimal places
 * @returns Formatted string with trailing zeros removed
 *
 * @example
 * ```typescript
 * numberToFixedDynamic(3.12345, 4) // => '3.1235'
 * numberToFixedDynamic(3.01000, 4) // => '3.01'
 * numberToFixedDynamic(3.00000, 4) // => '3'
 * ```
 */
export function numberToFixedDynamic(num: number, places: number): string {
  const str = num.toFixed(Math.max(places, 0));

  if (!str.includes(".")) {
    return str;
  }

  let indexToExclude = -1;
  let i = str.length - 1;

  // Find trailing zeros
  while (str[i] === "0") {
    indexToExclude = i;
    i -= 1;
  }

  // If we hit the decimal point, exclude it too
  if (str[i] === ".") {
    indexToExclude = i;
  }

  if (indexToExclude === -1) {
    return str;
  }

  return str.slice(0, indexToExclude);
}

//#endregion
