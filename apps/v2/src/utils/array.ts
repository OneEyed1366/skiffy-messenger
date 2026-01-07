/**
 * Array manipulation utilities
 * All functions are immutable - they return new arrays without modifying inputs.
 */

//#region Deduplication

/**
 * Returns a new array with duplicate primitive values removed.
 * Preserves the order of first occurrences.
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Returns a new array with duplicates removed based on a key extractor.
 * Preserves the order of first occurrences.
 */
export function uniqueBy<T, K>(array: T[], keyFn: (item: T) => K): T[] {
  const seen = new Set<K>();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

//#endregion

//#region Chunking

/**
 * Splits an array into chunks of the specified size.
 * @throws Error if size is less than 1
 */
export function chunk<T>(array: T[], size: number): T[][] {
  if (size < 1) {
    throw new Error("Chunk size must be at least 1");
  }

  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

//#endregion

//#region Grouping

/**
 * Groups array elements by a key extracted from each element.
 */
export function groupBy<T, K extends string | number | symbol>(
  array: T[],
  keyFn: (item: T) => K,
): Record<K, T[]> {
  return array.reduce(
    (acc, item) => {
      const key = keyFn(item);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    },
    {} as Record<K, T[]>,
  );
}

//#endregion

//#region Insertion/Removal

/**
 * Returns a new array with the item inserted at the end if not already present.
 */
export function insertWithoutDuplicates<T>(array: T[], item: T): T[] {
  if (array.includes(item)) {
    return [...array];
  }
  return [...array, item];
}

/**
 * Returns a new array with the first occurrence of the item removed.
 */
export function removeItem<T>(array: T[], item: T): T[] {
  const index = array.indexOf(item);
  if (index === -1) {
    return [...array];
  }
  const result = [...array];
  result.splice(index, 1);
  return result;
}

//#endregion
