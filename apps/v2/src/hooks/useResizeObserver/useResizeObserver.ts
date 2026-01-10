// apps/v2/src/hooks/useResizeObserver/useResizeObserver.ts

import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

//#region Types

export type IDimensions = {
  width: number;
  height: number;
  x: number;
  y: number;
};

export type IResizeObserverOptions = {
  debounceMs?: number;
  box?: ResizeObserverBoxOptions;
};

export type IResizeObserverResult<T extends Element> = {
  ref: React.RefObject<T | null>;
  dimensions: IDimensions;
};

//#endregion Types

//#region Constants

const INITIAL_DIMENSIONS: IDimensions = { width: 0, height: 0, x: 0, y: 0 };

//#endregion Constants

//#region useResizeObserver

/**
 * Hook to track element dimensions using native ResizeObserver API.
 * Web/Desktop only — returns no-op defaults on native platforms.
 *
 * @param options - Configuration options
 * @param options.debounceMs - Optional debounce delay in milliseconds
 * @param options.box - ResizeObserver box model option
 * @returns Object with ref to attach to element and current dimensions
 */
export function useResizeObserver<T extends Element>(
  options: IResizeObserverOptions = {},
): IResizeObserverResult<T> {
  const { debounceMs, box } = options;
  const ref = useRef<T | null>(null);
  const [dimensions, setDimensions] = useState<IDimensions>(INITIAL_DIMENSIONS);
  const [element, setElement] = useState<T | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  // Track element changes via a custom ref setter
  const setRef = useCallback((node: T | null) => {
    ref.current = node;
    setElement(node);
  }, []);

  // Create a mutable ref object that calls our setter
  const callbackRef = useRef<T | null>(null);
  Object.defineProperty(callbackRef, "current", {
    get: () => ref.current,
    set: (node: T | null) => {
      setRef(node);
    },
    configurable: true,
  });

  useEffect(() => {
    // No-op on native platforms
    if (Platform.OS !== "web") {
      return;
    }

    if (!element) {
      return;
    }

    const updateDimensions = (entry: ResizeObserverEntry) => {
      const { width, height } = entry.contentRect;
      const rect = element.getBoundingClientRect();

      setDimensions((prev) => {
        if (
          prev.width === width &&
          prev.height === height &&
          prev.x === rect.x &&
          prev.y === rect.y
        ) {
          return prev; // Avoid re-render when dimensions unchanged
        }
        return { width, height, x: rect.x, y: rect.y };
      });
    };

    const handleResize = (entries: ResizeObserverEntry[]) => {
      const entry = entries[0];
      if (!entry) return;

      if (debounceMs !== undefined && debounceMs > 0) {
        if (timeoutRef.current !== null) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          updateDimensions(entry);
          timeoutRef.current = null;
        }, debounceMs);
      } else {
        updateDimensions(entry);
      }
    };

    const observer = new ResizeObserver(handleResize);
    observerRef.current = observer;
    observer.observe(element, box ? { box } : undefined);

    return () => {
      observer.disconnect();
      observerRef.current = null;
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [element, debounceMs, box]);

  return { ref: callbackRef, dimensions };
}

//#endregion useResizeObserver

//#region useElementDimensionsById

/**
 * Hook to track element dimensions by DOM ID using native ResizeObserver API.
 * Web/Desktop only — returns default dimensions on native platforms.
 *
 * @param elementId - The DOM element ID to observe
 * @param options - Configuration options
 * @returns Current dimensions of the element
 */
export function useElementDimensionsById(
  elementId: string,
  options: IResizeObserverOptions = {},
): IDimensions {
  const { debounceMs, box } = options;
  const [dimensions, setDimensions] = useState<IDimensions>(INITIAL_DIMENSIONS);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // No-op on native platforms
    if (Platform.OS !== "web") {
      return;
    }

    const element = document.getElementById(elementId);
    if (!element) {
      return;
    }

    const updateDimensions = (entry: ResizeObserverEntry) => {
      const { width, height } = entry.contentRect;
      const rect = element.getBoundingClientRect();

      setDimensions((prev) => {
        if (
          prev.width === width &&
          prev.height === height &&
          prev.x === rect.x &&
          prev.y === rect.y
        ) {
          return prev; // Avoid re-render when dimensions unchanged
        }
        return { width, height, x: rect.x, y: rect.y };
      });
    };

    const handleResize = (entries: ResizeObserverEntry[]) => {
      const entry = entries[0];
      if (!entry) return;

      if (debounceMs !== undefined && debounceMs > 0) {
        if (timeoutRef.current !== null) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          updateDimensions(entry);
          timeoutRef.current = null;
        }, debounceMs);
      } else {
        updateDimensions(entry);
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(element, box ? { box } : undefined);

    return () => {
      observer.disconnect();
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [elementId, debounceMs, box]);

  return dimensions;
}

//#endregion useElementDimensionsById
