/**
 * File-related utilities
 * Migrated from: vendor/desktop/webapp/channels/src/utils/utils.tsx
 */

//#region Constants

const KB = 1024;
const MB = KB ** 2;
const GB = KB ** 3;
const TB = KB ** 4;

//#endregion

//#region File Size Formatting

/**
 * Converts a file size in bytes into a human-readable string.
 * Shows one decimal place for values < 10 in MB/GB/TB ranges.
 *
 * @param bytes - File size in bytes
 * @returns Human-readable string (e.g., '1.5MB', '100KB', '500B')
 *
 * @example
 * ```typescript
 * fileSizeToString(1536) // => '2KB'
 * fileSizeToString(1.5 * 1024 ** 2) // => '1.5MB'
 * fileSizeToString(10 * 1024 ** 3) // => '10GB'
 * ```
 */
export function fileSizeToString(bytes: number): string {
  // Handle edge cases
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "0B";
  }

  // Terabytes
  if (bytes >= TB) {
    if (bytes < TB * 10) {
      return `${Math.round((bytes / TB) * 10) / 10}TB`;
    }
    return `${Math.round(bytes / TB)}TB`;
  }

  // Gigabytes
  if (bytes >= GB) {
    if (bytes < GB * 10) {
      return `${Math.round((bytes / GB) * 10) / 10}GB`;
    }
    return `${Math.round(bytes / GB)}GB`;
  }

  // Megabytes
  if (bytes >= MB) {
    if (bytes < MB * 10) {
      return `${Math.round((bytes / MB) * 10) / 10}MB`;
    }
    return `${Math.round(bytes / MB)}MB`;
  }

  // Kilobytes
  if (bytes >= KB) {
    return `${Math.round(bytes / KB)}KB`;
  }

  // Bytes
  return `${bytes}B`;
}

//#endregion
