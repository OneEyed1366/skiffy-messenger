/**
 * Clipboard copy hook with success state
 * Migrated from: vendor/desktop/webapp/channels/src/utils/utils.tsx
 *
 * Uses expo-clipboard for React Native, navigator.clipboard for web
 */

import { useCallback, useRef, useState } from "react";

import { copyToClipboard } from "./clipboard";

//#region Types

type ICopyTextOptions = {
  /**
   * Duration in ms to show success state (default: 2000)
   */
  successDuration?: number;
  /**
   * Callback fired on successful copy
   */
  onSuccess?: () => void;
  /**
   * Callback fired on copy error
   */
  onError?: (error: Error) => void;
};

type ICopyTextResult = {
  /**
   * Copy text to clipboard
   */
  copy: (text: string) => Promise<void>;
  /**
   * Whether copy was recently successful (resets after successDuration)
   */
  copied: boolean;
  /**
   * Whether copy operation is in progress
   */
  copying: boolean;
  /**
   * Error from last copy attempt, if any
   */
  error: Error | null;
  /**
   * Reset copied state manually
   */
  reset: () => void;
};

//#endregion Types

//#region Hook

const DEFAULT_SUCCESS_DURATION = 2000;

/**
 * Hook for copying text to clipboard with success state tracking.
 *
 * @param options - Configuration options
 * @returns Object with copy function and state
 *
 * @example
 * function CopyButton({ text }: { text: string }) {
 *   const { copy, copied, copying } = useCopyText();
 *
 *   return (
 *     <Pressable onPress={() => copy(text)} disabled={copying}>
 *       <Text>{copied ? 'Copied!' : 'Copy'}</Text>
 *     </Pressable>
 *   );
 * }
 *
 * @example
 * // With custom duration and callbacks
 * const { copy, copied } = useCopyText({
 *   successDuration: 3000,
 *   onSuccess: () => console.log('Copied!'),
 *   onError: (err) => console.error('Failed:', err),
 * });
 */
export function useCopyText(options: ICopyTextOptions = {}): ICopyTextResult {
  const {
    successDuration = DEFAULT_SUCCESS_DURATION,
    onSuccess,
    onError,
  } = options;

  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setCopied(false);
    setError(null);
  }, []);

  const copy = useCallback(
    async (text: string): Promise<void> => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      setCopying(true);
      setError(null);

      try {
        await copyToClipboard(text);
        setCopied(true);
        setCopying(false);
        onSuccess?.();

        // Reset copied state after duration
        timeoutRef.current = setTimeout(() => {
          setCopied(false);
          timeoutRef.current = null;
        }, successDuration);
      } catch (err) {
        const copyError =
          err instanceof Error ? err : new Error("Failed to copy to clipboard");
        setError(copyError);
        setCopied(false);
        setCopying(false);
        onError?.(copyError);
      }
    },
    [successDuration, onSuccess, onError],
  );

  return {
    copy,
    copied,
    copying,
    error,
    reset,
  };
}

//#endregion Hook
