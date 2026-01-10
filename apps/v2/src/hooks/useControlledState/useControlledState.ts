import { useCallback, useRef, useState } from "react";

//#region Types
type IUseControlledStateOptions<T> = {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
};

type IUseControlledStateReturn<T> = readonly [
  value: T,
  setValue: (value: T | ((prev: T) => T)) => void,
  isControlled: boolean,
];

/**
 * Utility type for component props that support controlled/uncontrolled patterns.
 * Use this to type your component props for consistent API.
 */
export type IControllableProps<T> = {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
};
//#endregion Types

//#region useControlledState
/**
 * Hook for controlled/uncontrolled component pattern.
 *
 * - When `value` is provided (not undefined), component is controlled
 * - When only `defaultValue` is provided, component is uncontrolled
 * - Warns in __DEV__ when switching between controlled/uncontrolled
 * - Supports updater functions in setValue
 * - Always calls onChange when setValue is called
 *
 * @example
 * ```typescript
 * // Uncontrolled with default
 * const [value, setValue] = useControlledState({ defaultValue: '' });
 *
 * // Controlled
 * const [value, setValue] = useControlledState({ value: props.value, onChange: props.onChange });
 * ```
 */
export function useControlledState<T>(
  options: IUseControlledStateOptions<T>,
): IUseControlledStateReturn<T> {
  const { value: controlledValue, defaultValue, onChange } = options;

  // Determine if controlled — value !== undefined means controlled
  // Important: empty string, 0, false are valid controlled values
  const isControlled = controlledValue !== undefined;

  // Track initial controlled state for dev warnings
  const wasControlledRef = useRef(isControlled);

  // Warn in dev mode when switching controlled/uncontrolled
  if (__DEV__) {
    if (wasControlledRef.current && !isControlled) {
      console.warn(
        "useControlledState: Component is changing from controlled to uncontrolled. " +
          "This is likely a bug. Decide between controlled or uncontrolled for the lifetime of the component.",
      );
    }
    if (!wasControlledRef.current && isControlled) {
      console.warn(
        "useControlledState: Component is changing from uncontrolled to controlled. " +
          "This is likely a bug. Decide between controlled or uncontrolled for the lifetime of the component.",
      );
    }
  }

  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState<T | undefined>(
    defaultValue,
  );

  // The actual value to use
  const value = isControlled ? controlledValue : (internalValue as T);

  // setValue handler that works for both modes
  const setValue = useCallback(
    (nextValue: T | ((prev: T) => T)) => {
      // Resolve updater function if provided
      const resolvedValue =
        typeof nextValue === "function"
          ? (nextValue as (prev: T) => T)(value)
          : nextValue;

      // Update internal state if uncontrolled
      if (!isControlled) {
        setInternalValue(resolvedValue);
      }

      // Always call onChange
      onChange?.(resolvedValue);
    },
    [isControlled, onChange, value],
  );

  return [value, setValue, isControlled] as const;
}
//#endregion useControlledState
