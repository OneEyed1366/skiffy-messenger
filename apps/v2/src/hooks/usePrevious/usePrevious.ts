import { useEffect, useRef } from "react";

//#region Types
type ICompareFn<T> = (prev: T | undefined, curr: T) => boolean;
type IDistinctCompareFn<T> = (a: T, b: T) => boolean;
//#endregion Types

//#region usePrevious
/**
 * Returns the previous value of the given value.
 * Returns undefined on first render.
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
//#endregion usePrevious

//#region usePreviousWithInitial
/**
 * Returns the previous value of the given value.
 * Returns initialValue on first render instead of undefined.
 */
export function usePreviousWithInitial<T>(value: T, initialValue: T): T {
  const ref = useRef<T>(initialValue);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
//#endregion usePreviousWithInitial

//#region useHasChanged
/**
 * Returns true if the value has changed since the last render.
 * Uses Object.is comparison by default, or a custom compareFn.
 */
export function useHasChanged<T>(
  value: T,
  compareFn: ICompareFn<T> = (prev, curr) => !Object.is(prev, curr),
): boolean {
  const prevValue = usePrevious(value);
  return compareFn(prevValue, value);
}
//#endregion useHasChanged

//#region useFirstRender
/**
 * Returns true only on the first render, false on subsequent renders.
 */
export function useFirstRender(): boolean {
  const isFirst = useRef(true);
  useEffect(() => {
    isFirst.current = false;
  }, []);
  return isFirst.current;
}
//#endregion useFirstRender

//#region usePreviousDistinct
/**
 * Returns the previous distinct value, ignoring duplicate consecutive values.
 * Uses Object.is comparison by default, or a custom compareFn.
 */
export function usePreviousDistinct<T>(
  value: T,
  compareFn: IDistinctCompareFn<T> = Object.is,
): T | undefined {
  const prevRef = useRef<T | undefined>(undefined);
  const currentRef = useRef<T>(value);

  if (!compareFn(currentRef.current, value)) {
    prevRef.current = currentRef.current;
    currentRef.current = value;
  }

  return prevRef.current;
}
//#endregion usePreviousDistinct
