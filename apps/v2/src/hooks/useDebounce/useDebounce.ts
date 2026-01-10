import { useEffect, useRef, useState } from "react";

//#region Types
type IDebounceOptions = {
  delay?: number;
  leading?: boolean;
  maxWait?: number;
};

type IThrottleOptions = {
  interval?: number;
  leading?: boolean;
  trailing?: boolean;
};

type IDebouncedFunction<T extends (...args: never[]) => void> = {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
  pending: () => boolean;
};

type IThrottledFunction<T extends (...args: never[]) => void> = {
  (...args: Parameters<T>): void;
  cancel: () => void;
};
//#endregion Types

//#region Constants
const DEFAULT_DEBOUNCE_DELAY = 300;
const DEFAULT_THROTTLE_INTERVAL = 300;
//#endregion Constants

//#region useDebounce
/**
 * Returns a debounced version of the value.
 * Updates only after the specified delay has passed without changes.
 */
export function useDebounce<T>(
  value: T,
  delay: number = DEFAULT_DEBOUNCE_DELAY,
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}
//#endregion useDebounce

//#region useDebouncedCallback
/**
 * Returns a debounced version of the callback with cancel, flush, and pending methods.
 * Supports leading edge execution and maxWait.
 */
export function useDebouncedCallback<T extends (...args: never[]) => void>(
  callback: T,
  options: IDebounceOptions = {},
): IDebouncedFunction<T> {
  const { delay = DEFAULT_DEBOUNCE_DELAY, leading = false, maxWait } = options;

  const callbackRef = useRef<T>(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxWaitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);
  const leadingCalledRef = useRef(false);
  const maxWaitStartRef = useRef<number | null>(null);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
      if (maxWaitTimeoutRef.current !== null) {
        clearTimeout(maxWaitTimeoutRef.current);
      }
    };
  }, []);

  const flush = () => {
    if (lastArgsRef.current !== null && !leadingCalledRef.current) {
      callbackRef.current(...lastArgsRef.current);
    }
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxWaitTimeoutRef.current !== null) {
      clearTimeout(maxWaitTimeoutRef.current);
      maxWaitTimeoutRef.current = null;
    }
    lastArgsRef.current = null;
    leadingCalledRef.current = false;
    maxWaitStartRef.current = null;
  };

  const cancel = () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxWaitTimeoutRef.current !== null) {
      clearTimeout(maxWaitTimeoutRef.current);
      maxWaitTimeoutRef.current = null;
    }
    lastArgsRef.current = null;
    leadingCalledRef.current = false;
    maxWaitStartRef.current = null;
  };

  const pending = () => {
    return timeoutRef.current !== null;
  };

  const debouncedFn = ((...args: Parameters<T>) => {
    lastArgsRef.current = args;

    // Clear existing timeout
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    // Leading edge execution
    if (leading && !leadingCalledRef.current) {
      leadingCalledRef.current = true;
      callbackRef.current(...args);
    }

    // Start maxWait timer on first call
    if (maxWait !== undefined && maxWaitStartRef.current === null) {
      maxWaitStartRef.current = Date.now();
      maxWaitTimeoutRef.current = setTimeout(() => {
        if (lastArgsRef.current !== null && !leadingCalledRef.current) {
          callbackRef.current(...lastArgsRef.current);
        }
        timeoutRef.current = null;
        maxWaitTimeoutRef.current = null;
        lastArgsRef.current = null;
        leadingCalledRef.current = false;
        maxWaitStartRef.current = null;
      }, maxWait);
    }

    // Schedule trailing edge execution
    timeoutRef.current = setTimeout(() => {
      if (!leading || (leading && lastArgsRef.current !== null)) {
        if (!leadingCalledRef.current && lastArgsRef.current !== null) {
          callbackRef.current(...lastArgsRef.current);
        }
      }
      timeoutRef.current = null;
      if (maxWaitTimeoutRef.current !== null) {
        clearTimeout(maxWaitTimeoutRef.current);
        maxWaitTimeoutRef.current = null;
      }
      lastArgsRef.current = null;
      leadingCalledRef.current = false;
      maxWaitStartRef.current = null;
    }, delay);
  }) as IDebouncedFunction<T>;

  debouncedFn.cancel = cancel;
  debouncedFn.flush = flush;
  debouncedFn.pending = pending;

  return debouncedFn;
}
//#endregion useDebouncedCallback

//#region useThrottle
/**
 * Returns a throttled version of the value.
 * Updates at most once per interval.
 */
export function useThrottle<T>(
  value: T,
  interval: number = DEFAULT_THROTTLE_INTERVAL,
): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingValueRef = useRef<T>(value);
  const isThrottledRef = useRef(false);
  const lastValueRef = useRef<T>(value);

  // Update pending value ref whenever value changes
  pendingValueRef.current = value;

  useEffect(() => {
    // Skip if value hasn't actually changed from initial
    if (Object.is(value, lastValueRef.current)) {
      return;
    }

    // If not currently throttled, update immediately and start throttle window
    if (!isThrottledRef.current) {
      lastValueRef.current = value;
      setThrottledValue(value);
      isThrottledRef.current = true;

      // Start throttle cooldown
      timeoutRef.current = setTimeout(() => {
        isThrottledRef.current = false;
        timeoutRef.current = null;
        // If there's a newer pending value, apply it
        if (!Object.is(pendingValueRef.current, lastValueRef.current)) {
          lastValueRef.current = pendingValueRef.current;
          setThrottledValue(pendingValueRef.current);
        }
      }, interval);
    }
    // If throttled, value is queued in pendingValueRef for when timeout fires
  }, [value, interval]);

  // Cleanup only on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledValue;
}
//#endregion useThrottle

//#region useThrottledCallback
/**
 * Returns a throttled version of the callback with cancel method.
 * Supports leading and trailing edge execution.
 */
export function useThrottledCallback<T extends (...args: never[]) => void>(
  callback: T,
  options: IThrottleOptions = {},
): IThrottledFunction<T> {
  const {
    interval = DEFAULT_THROTTLE_INTERVAL,
    leading = true,
    trailing = true,
  } = options;

  const callbackRef = useRef<T>(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);
  const lastCallTimeRef = useRef<number>(0);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const cancel = () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    lastArgsRef.current = null;
  };

  const throttledFn = ((...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTimeRef.current;
    const isFirstCall = lastCallTimeRef.current === 0;

    lastArgsRef.current = args;

    // Leading edge execution
    if (leading && (isFirstCall || timeSinceLastCall >= interval)) {
      callbackRef.current(...args);
      lastCallTimeRef.current = now;
      lastArgsRef.current = null;
      return;
    }

    // Schedule trailing edge execution
    if (trailing && timeoutRef.current === null) {
      const remainingTime = interval - timeSinceLastCall;
      timeoutRef.current = setTimeout(
        () => {
          if (lastArgsRef.current !== null) {
            callbackRef.current(...lastArgsRef.current);
            lastCallTimeRef.current = Date.now();
            lastArgsRef.current = null;
          }
          timeoutRef.current = null;
        },
        remainingTime > 0 ? remainingTime : 0,
      );
    }
  }) as IThrottledFunction<T>;

  throttledFn.cancel = cancel;

  return throttledFn;
}
//#endregion useThrottledCallback

//#region Exports
export type {
  IDebounceOptions,
  IThrottleOptions,
  IDebouncedFunction,
  IThrottledFunction,
};
//#endregion Exports
