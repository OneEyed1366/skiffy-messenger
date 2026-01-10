import { useEffect, useRef, useState } from "react";

//#region Types
type IUseElementAvailableOptions = {
  intervalMs?: number;
};
//#endregion Types

//#region Constants
const DEFAULT_INTERVAL_MS = 250;
//#endregion Constants

//#region useElementAvailable
/**
 * Web-only hook that polls for DOM elements by ID using setInterval.
 * Returns true when ALL specified elements exist in the document.
 *
 * - Checks immediately before starting interval
 * - Stops polling when all elements found
 * - Cleans up interval on unmount
 */
export function useElementAvailable(
  elementIds: string[],
  options: IUseElementAvailableOptions = {},
): boolean {
  const { intervalMs = DEFAULT_INTERVAL_MS } = options;

  const [available, setAvailable] = useState(() =>
    checkAllElementsExist(elementIds),
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Check immediately
    const allExist = checkAllElementsExist(elementIds);
    if (allExist) {
      setAvailable(true);
      return;
    }

    setAvailable(false);

    // Start polling
    intervalRef.current = setInterval(() => {
      const nowExist = checkAllElementsExist(elementIds);
      if (nowExist) {
        setAvailable(true);
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, intervalMs);

    // Cleanup on unmount or deps change
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [elementIds, intervalMs]);

  return available;
}
//#endregion useElementAvailable

//#region Helpers
function checkAllElementsExist(elementIds: string[]): boolean {
  if (elementIds.length === 0) {
    return true;
  }

  for (const id of elementIds) {
    if (document.getElementById(id) === null) {
      return false;
    }
  }

  return true;
}
//#endregion Helpers

//#region Exports
export type { IUseElementAvailableOptions };
//#endregion Exports
