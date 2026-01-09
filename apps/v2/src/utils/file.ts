/**
 * File-related utilities
 * Migrated from: vendor/desktop/webapp/channels/src/utils/utils.tsx
 */

//#region Types

/**
 * Valid file size units
 */
type IFileSizeUnit = "B" | "KB" | "MB" | "GB" | "TB";

/**
 * Options for formatting file sizes
 */
type IFormatFileSizeOptions = {
  /** Locale for number formatting (e.g., 'en-US', 'de-DE') */
  locale?: string;
  /** Maximum fraction digits to display (default: 1) */
  maximumFractionDigits?: number;
};

//#endregion

//#region Constants

/**
 * Ordered list of file size units from smallest to largest
 *
 * @example
 * ```typescript
 * FILE_SIZE_UNITS[0] // => 'B'
 * FILE_SIZE_UNITS.includes('KB') // => true
 * ```
 */
export const FILE_SIZE_UNITS = [
  "B",
  "KB",
  "MB",
  "GB",
  "TB",
] as const satisfies readonly IFileSizeUnit[];

/**
 * Number of bytes per unit
 *
 * @example
 * ```typescript
 * BYTES_PER_UNIT.KB // => 1024
 * BYTES_PER_UNIT.MB // => 1048576
 * ```
 */
export const BYTES_PER_UNIT = {
  B: 1,
  KB: 1024,
  MB: 1024 ** 2,
  GB: 1024 ** 3,
  TB: 1024 ** 4,
} as const satisfies Record<IFileSizeUnit, number>;

//#endregion

//#region File Size Formatting

/**
 * Converts a file size in bytes into a human-readable string.
 * Shows one decimal place for values < 10 in MB/GB/TB ranges.
 *
 * @param bytes - File size in bytes
 * @param options - Formatting options
 * @returns Human-readable string with space before unit (e.g., '1.5 MB', '100 KB', '500 B')
 *
 * @example
 * ```typescript
 * formatFileSize(1536) // => '2 KB'
 * formatFileSize(1.5 * 1024 ** 2) // => '1.5 MB'
 * formatFileSize(10 * 1024 ** 3) // => '10 GB'
 * formatFileSize(1500, { locale: 'de-DE' }) // => '1,5 KB'
 * formatFileSize(1572864, { maximumFractionDigits: 2 }) // => '1.5 MB'
 * ```
 */
export function formatFileSize(
  bytes: number,
  options?: IFormatFileSizeOptions,
): string {
  // Handle edge cases
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "0 B";
  }

  const { locale, maximumFractionDigits = 1 } = options ?? {};

  const formatNumber = (value: number, showDecimals: boolean): string => {
    if (!showDecimals) {
      return locale
        ? Math.round(value).toLocaleString(locale)
        : String(Math.round(value));
    }
    if (locale) {
      return value.toLocaleString(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits,
      });
    }
    // Manual rounding for non-locale formatting
    const factor = 10 ** maximumFractionDigits;
    return String(Math.round(value * factor) / factor);
  };

  // Terabytes
  if (bytes >= BYTES_PER_UNIT.TB) {
    const value = bytes / BYTES_PER_UNIT.TB;
    const showDecimals = value < 10;
    return `${formatNumber(value, showDecimals)} TB`;
  }

  // Gigabytes
  if (bytes >= BYTES_PER_UNIT.GB) {
    const value = bytes / BYTES_PER_UNIT.GB;
    const showDecimals = value < 10;
    return `${formatNumber(value, showDecimals)} GB`;
  }

  // Megabytes
  if (bytes >= BYTES_PER_UNIT.MB) {
    const value = bytes / BYTES_PER_UNIT.MB;
    const showDecimals = value < 10;
    return `${formatNumber(value, showDecimals)} MB`;
  }

  // Kilobytes
  if (bytes >= BYTES_PER_UNIT.KB) {
    const value = bytes / BYTES_PER_UNIT.KB;
    return `${formatNumber(value, false)} KB`;
  }

  // Bytes
  return `${bytes} B`;
}

/**
 * @deprecated Use formatFileSize instead
 */
export const fileSizeToString = formatFileSize;

//#endregion

//#region File Size Parsing

/**
 * Parses a human-readable file size string into bytes.
 * Handles both dot and comma as decimal separators.
 *
 * @param sizeString - Human-readable size string (e.g., '1.5 MB', '100KB', '1,5 GB')
 * @returns Number of bytes, or null if parsing fails
 *
 * @example
 * ```typescript
 * parseFileSize('1.5 MB') // => 1572864
 * parseFileSize('100 KB') // => 102400
 * parseFileSize('1,5 GB') // => 1610612736 (European decimal)
 * parseFileSize('invalid') // => null
 * ```
 */
export function parseFileSize(sizeString: string): number | null {
  if (!sizeString || typeof sizeString !== "string") {
    return null;
  }

  // Trim and normalize whitespace
  const normalized = sizeString.trim();

  // Match number (with optional decimal using . or ,) and unit
  // Pattern: optional whitespace between number and unit, case-insensitive unit
  const match = normalized.match(
    /^([0-9]+(?:[.,][0-9]+)?)\s*(B|KB|MB|GB|TB)$/i,
  );

  if (!match) {
    return null;
  }

  const [, numStr, unitStr] = match;

  // Replace comma with dot for parsing (European decimal separator)
  const num = parseFloat(numStr.replace(",", "."));

  if (!Number.isFinite(num) || num < 0) {
    return null;
  }

  // Normalize unit to uppercase and lookup bytes
  const unit = unitStr.toUpperCase() as IFileSizeUnit;
  const multiplier = BYTES_PER_UNIT[unit];

  if (multiplier === undefined) {
    return null;
  }

  return Math.round(num * multiplier);
}

//#endregion
