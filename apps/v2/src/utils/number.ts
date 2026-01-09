/**
 * Number formatting utilities
 * Uses Intl.NumberFormat for locale-aware formatting
 */

//#region Types

type IFormatNumberOptions = {
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

type IFormatCompactOptions = IFormatNumberOptions & {
  /** Don't compact below this value (default: 1000) */
  threshold?: number;
};

type IFormatCurrencyOptions = {
  locale?: string;
  display?: "symbol" | "code" | "name";
};

type IFormatPercentOptions = {
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

//#endregion

//#region Type Guards

/**
 * Checks if value is a finite number (not NaN, not Infinity)
 *
 * @param value - Value to check
 * @returns Type predicate indicating value is a finite number
 *
 * @example
 * ```typescript
 * isFiniteNumber(42)        // true
 * isFiniteNumber(NaN)       // false
 * isFiniteNumber(Infinity)  // false
 * isFiniteNumber("42")      // false
 * ```
 */
export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

//#endregion

//#region Basic Formatting

/**
 * Formats number with locale-aware separators
 *
 * @param num - Number to format
 * @param options - Formatting options
 * @returns Formatted number string
 *
 * @example
 * ```typescript
 * formatNumber(1234567.89)                      // "1,234,567.89"
 * formatNumber(1234567.89, { locale: 'de-DE' }) // "1.234.567,89"
 * formatNumber(3.14159, { maximumFractionDigits: 2 }) // "3.14"
 * ```
 */
export function formatNumber(
  num: number,
  options: IFormatNumberOptions = {},
): string {
  const {
    locale = "en-US",
    minimumFractionDigits,
    maximumFractionDigits,
  } = options;

  if (!isFiniteNumber(num)) {
    return String(num);
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(num);
}

//#endregion

//#region Compact Formatting

/**
 * Formats number in compact notation (1.2K, 3.4M, 5.6B)
 *
 * @param num - Number to format
 * @param options - Formatting options including threshold
 * @returns Compact formatted string
 *
 * @example
 * ```typescript
 * formatCompactNumber(1500)          // "1.5K"
 * formatCompactNumber(1500000)       // "1.5M"
 * formatCompactNumber(1500000000)    // "1.5B"
 * formatCompactNumber(500)           // "500" (below threshold)
 * formatCompactNumber(500, { threshold: 100 }) // "500" (still not compact at 500)
 * ```
 */
export function formatCompactNumber(
  num: number,
  options: IFormatCompactOptions = {},
): string {
  const {
    locale = "en-US",
    threshold = 1000,
    minimumFractionDigits,
    maximumFractionDigits,
  } = options;

  if (!isFiniteNumber(num)) {
    return String(num);
  }

  const absNum = Math.abs(num);

  // Don't compact below threshold
  if (absNum < threshold) {
    return formatNumber(num, {
      locale,
      minimumFractionDigits,
      maximumFractionDigits,
    });
  }

  return new Intl.NumberFormat(locale, {
    notation: "compact",
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(num);
}

//#endregion

//#region Percent Formatting

/**
 * Formats number as percentage
 *
 * @param num - Number to format (0.5 = 50%)
 * @param options - Formatting options
 * @returns Formatted percentage string
 *
 * @example
 * ```typescript
 * formatPercent(0.1234)  // "12.34%"
 * formatPercent(0.5)     // "50%"
 * formatPercent(1.5)     // "150%"
 * formatPercent(0.1234, { maximumFractionDigits: 1 }) // "12.3%"
 * ```
 */
export function formatPercent(
  num: number,
  options: IFormatPercentOptions = {},
): string {
  const {
    locale = "en-US",
    minimumFractionDigits,
    maximumFractionDigits,
  } = options;

  if (!isFiniteNumber(num)) {
    return String(num);
  }

  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(num);
}

//#endregion

//#region Currency Formatting

/**
 * Formats number as currency
 *
 * @param num - Amount to format
 * @param currency - ISO 4217 currency code (USD, EUR, GBP, etc.)
 * @param options - Formatting options
 * @returns Formatted currency string
 *
 * @example
 * ```typescript
 * formatCurrency(1234.56, 'USD')                          // "$1,234.56"
 * formatCurrency(1234.56, 'EUR', { locale: 'de-DE' })     // "1.234,56 €"
 * formatCurrency(1234.56, 'USD', { display: 'code' })     // "USD 1,234.56"
 * formatCurrency(1234.56, 'USD', { display: 'name' })     // "1,234.56 US dollars"
 * ```
 */
export function formatCurrency(
  num: number,
  currency: string,
  options: IFormatCurrencyOptions = {},
): string {
  const { locale = "en-US", display = "symbol" } = options;

  if (!isFiniteNumber(num)) {
    return String(num);
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: display,
  }).format(num);
}

//#endregion

//#region Ordinal

/**
 * Gets ordinal suffix for number (1st, 2nd, 3rd, 4th, etc.)
 * English support only.
 *
 * @param num - Number to convert to ordinal
 * @returns Number with ordinal suffix
 *
 * @example
 * ```typescript
 * ordinal(1)   // "1st"
 * ordinal(2)   // "2nd"
 * ordinal(3)   // "3rd"
 * ordinal(4)   // "4th"
 * ordinal(11)  // "11th"
 * ordinal(12)  // "12th"
 * ordinal(13)  // "13th"
 * ordinal(21)  // "21st"
 * ordinal(22)  // "22nd"
 * ordinal(23)  // "23rd"
 * ordinal(33)  // "33rd"
 * ordinal(101) // "101st"
 * ordinal(111) // "111th"
 * ```
 */
export function ordinal(num: number): string {
  if (!isFiniteNumber(num)) {
    return String(num);
  }

  const absNum = Math.abs(num);
  const lastTwo = absNum % 100;

  // Special case: 11th, 12th, 13th (not 11st, 12nd, 13rd)
  if (lastTwo >= 11 && lastTwo <= 13) {
    return `${num}th`;
  }

  const lastDigit = absNum % 10;

  switch (lastDigit) {
    case 1:
      return `${num}st`;
    case 2:
      return `${num}nd`;
    case 3:
      return `${num}rd`;
    default:
      return `${num}th`;
  }
}

//#endregion

//#region Mathematical Operations

/**
 * Clamps number between min and max
 *
 * @param num - Number to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 *
 * @example
 * ```typescript
 * clamp(5, 0, 10)   // 5
 * clamp(-5, 0, 10)  // 0
 * clamp(15, 0, 10)  // 10
 * clamp(5, 10, 0)   // 5 (handles inverted min/max)
 * ```
 */
export function clamp(num: number, min: number, max: number): number {
  // Handle inverted min/max
  const actualMin = Math.min(min, max);
  const actualMax = Math.max(min, max);

  return Math.min(Math.max(num, actualMin), actualMax);
}

/**
 * Rounds number to specified decimal places
 *
 * @param num - Number to round
 * @param decimals - Number of decimal places
 * @returns Rounded number
 *
 * @example
 * ```typescript
 * roundTo(1.2345, 2)  // 1.23
 * roundTo(1.2355, 2)  // 1.24
 * roundTo(1234, -2)   // 1200 (negative decimals rounds to tens, hundreds, etc.)
 * ```
 */
export function roundTo(num: number, decimals: number): number {
  if (!isFiniteNumber(num)) {
    return num;
  }

  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

//#endregion

//#region Type Exports

export type {
  IFormatNumberOptions,
  IFormatCompactOptions,
  IFormatCurrencyOptions,
  IFormatPercentOptions,
};

//#endregion
