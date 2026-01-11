// apps/v2/src/hooks/useLocalStorage/useLocalStorage.ts

/**
 * AsyncStorage persistence hook with SSR safety and cross-hook sync.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";

//#region Types

export type IUseLocalStorageOptions<T> = {
  defaultValue?: T;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
};

export type IUseLocalStorageReturn<T> = {
  value: T | null;
  setValue: (value: T | ((prev: T | null) => T)) => Promise<void>;
  removeValue: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
};

type IListener<T> = (value: T | null) => void;

//#endregion Types

//#region Storage Key Helpers

/**
 * Creates a namespaced storage key.
 *
 * @param namespace - The namespace prefix
 * @param key - The key within the namespace
 * @returns Namespaced key string
 *
 * @example
 * ```typescript
 * const key = createStorageKey("settings", "theme");
 * // "settings:theme"
 * ```
 */
export function createStorageKey(namespace: string, key: string): string {
  return `${namespace}:${key}`;
}

/**
 * Creates a user-scoped storage key.
 *
 * @param userId - The user ID
 * @param key - The key for the user
 * @returns User-scoped key string
 *
 * @example
 * ```typescript
 * const key = createUserStorageKey("user123", "preferences");
 * // "user:user123:preferences"
 * ```
 */
export function createUserStorageKey(userId: string, key: string): string {
  return `user:${userId}:${key}`;
}

//#endregion Storage Key Helpers

//#region Cross-Hook Sync

const listeners = new Map<string, Set<IListener<unknown>>>();

function subscribe<T>(key: string, listener: IListener<T>): () => void {
  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }
  const keyListeners = listeners.get(key)!;
  keyListeners.add(listener as IListener<unknown>);

  return () => {
    keyListeners.delete(listener as IListener<unknown>);
    if (keyListeners.size === 0) {
      listeners.delete(key);
    }
  };
}

function emit<T>(key: string, value: T | null): void {
  const keyListeners = listeners.get(key);
  if (keyListeners) {
    keyListeners.forEach((listener) => listener(value));
  }
}

//#endregion Cross-Hook Sync

//#region SSR Safety

/**
 * Checks if we're in a browser/native environment (not SSR).
 */
function isClientSide(): boolean {
  return typeof window !== "undefined" || typeof global !== "undefined";
}

//#endregion SSR Safety

//#region Serialization

function defaultSerialize<T>(value: T): string {
  if (typeof value === "string") {
    return value;
  }
  return JSON.stringify(value);
}

function defaultDeserialize<T>(value: string): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    // If JSON parsing fails, return the raw string value
    return value as T;
  }
}

//#endregion Serialization

//#region Utility Functions

/**
 * Get a single item from AsyncStorage.
 *
 * @param key - Storage key
 * @returns Promise resolving to the value or null
 */
export async function getStorageItem(key: string): Promise<string | null> {
  if (!isClientSide()) {
    return null;
  }
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error(`Failed to get storage item "${key}":`, error);
    return null;
  }
}

/**
 * Set a single item in AsyncStorage.
 *
 * @param key - Storage key
 * @param value - Value to store
 */
export async function setStorageItem(
  key: string,
  value: string,
): Promise<void> {
  if (!isClientSide()) {
    return;
  }
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error(`Failed to set storage item "${key}":`, error);
    throw error;
  }
}

/**
 * Remove a single item from AsyncStorage.
 *
 * @param key - Storage key
 */
export async function removeStorageItem(key: string): Promise<void> {
  if (!isClientSide()) {
    return;
  }
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove storage item "${key}":`, error);
    throw error;
  }
}

/**
 * Get multiple items from AsyncStorage.
 *
 * @param keys - Array of storage keys
 * @returns Promise resolving to object with key-value pairs
 */
export async function getMultipleStorageItems(
  keys: string[],
): Promise<Record<string, string | null>> {
  if (!isClientSide()) {
    return {};
  }
  try {
    const pairs = await AsyncStorage.multiGet(keys);
    const result: Record<string, string | null> = {};
    pairs.forEach(([key, value]) => {
      result[key] = value;
    });
    return result;
  } catch (error) {
    console.error("Failed to get multiple storage items:", error);
    return {};
  }
}

/**
 * Set multiple items in AsyncStorage.
 *
 * @param items - Object with key-value pairs to store
 */
export async function setMultipleStorageItems(
  items: Record<string, string>,
): Promise<void> {
  if (!isClientSide()) {
    return;
  }
  try {
    const pairs: [string, string][] = Object.entries(items);
    await AsyncStorage.multiSet(pairs);
  } catch (error) {
    console.error("Failed to set multiple storage items:", error);
    throw error;
  }
}

/**
 * Remove multiple items from AsyncStorage.
 *
 * @param keys - Array of storage keys to remove
 */
export async function removeMultipleStorageItems(
  keys: string[],
): Promise<void> {
  if (!isClientSide()) {
    return;
  }
  try {
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error("Failed to remove multiple storage items:", error);
    throw error;
  }
}

/**
 * Clear all items from AsyncStorage.
 */
export async function clearStorage(): Promise<void> {
  if (!isClientSide()) {
    return;
  }
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error("Failed to clear storage:", error);
    throw error;
  }
}

/**
 * Get all storage keys.
 *
 * @returns Promise resolving to array of all keys
 */
export async function getAllStorageKeys(): Promise<string[]> {
  if (!isClientSide()) {
    return [];
  }
  try {
    const keys = await AsyncStorage.getAllKeys();
    return [...keys];
  } catch (error) {
    console.error("Failed to get all storage keys:", error);
    return [];
  }
}

//#endregion Utility Functions

//#region useLocalStorage Hook

/**
 * AsyncStorage persistence hook with SSR safety and cross-hook sync.
 *
 * @param key - Storage key
 * @param options - Options for default value and serialization
 * @returns Object with value, setValue, removeValue, isLoading, error, and refresh
 *
 * @example
 * ```typescript
 * const { value, setValue, removeValue, isLoading, error } = useLocalStorage<IUser>(
 *   "user",
 *   { defaultValue: { name: "Guest", id: "" } }
 * );
 *
 * // Set value
 * await setValue({ name: "John", id: "123" });
 *
 * // Update with function
 * await setValue((prev) => ({ ...prev, name: "Jane" }));
 *
 * // Remove value
 * await removeValue();
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  options: IUseLocalStorageOptions<T> = {},
): IUseLocalStorageReturn<T> {
  const {
    defaultValue,
    serialize = defaultSerialize,
    deserialize = defaultDeserialize,
  } = options;

  const [value, setValueState] = useState<T | null>(defaultValue ?? null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use refs to avoid recreating callbacks when options change
  const keyRef = useRef(key);
  const defaultValueRef = useRef(defaultValue);
  const serializeRef = useRef(serialize);
  const deserializeRef = useRef(deserialize);

  // Update refs synchronously (not in useEffect) to avoid stale values
  keyRef.current = key;
  defaultValueRef.current = defaultValue;
  serializeRef.current = serialize;
  deserializeRef.current = deserialize;

  // Load value from storage
  const loadValue = useCallback(async () => {
    if (!isClientSide()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const storedValue = await AsyncStorage.getItem(keyRef.current);
      if (storedValue !== null) {
        const deserialized = deserializeRef.current(storedValue);
        setValueState(deserialized);
      } else if (defaultValueRef.current !== undefined) {
        setValueState(defaultValueRef.current);
      } else {
        setValueState(null);
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      console.error(
        `Failed to load storage item "${keyRef.current}":`,
        errorObj,
      );
      setError(errorObj);
      setValueState(defaultValueRef.current ?? null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load and reload when key changes
  useEffect(() => {
    loadValue();
  }, [key, loadValue]);

  // Subscribe to cross-hook updates
  useEffect(() => {
    const unsubscribe = subscribe<T>(key, (newValue) => {
      setValueState(newValue);
    });

    return unsubscribe;
  }, [key]);

  // Set value
  const setValue = useCallback(
    async (newValue: T | ((prev: T | null) => T)): Promise<void> => {
      if (!isClientSide()) {
        return;
      }

      setError(null);

      try {
        const valueToStore =
          typeof newValue === "function"
            ? (newValue as (prev: T | null) => T)(value)
            : newValue;

        const serialized = serializeRef.current(valueToStore);
        await AsyncStorage.setItem(keyRef.current, serialized);

        setValueState(valueToStore);
        emit(keyRef.current, valueToStore);
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        console.error(
          `Failed to set storage item "${keyRef.current}":`,
          errorObj,
        );
        setError(errorObj);
        throw errorObj;
      }
    },
    [value],
  );

  // Remove value
  const removeValue = useCallback(async (): Promise<void> => {
    if (!isClientSide()) {
      return;
    }

    setError(null);

    try {
      await AsyncStorage.removeItem(keyRef.current);
      const resetValue = defaultValueRef.current ?? null;
      setValueState(resetValue);
      emit(keyRef.current, resetValue);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      console.error(
        `Failed to remove storage item "${keyRef.current}":`,
        errorObj,
      );
      setError(errorObj);
      throw errorObj;
    }
  }, []);

  // Refresh from storage
  const refresh = useCallback(async (): Promise<void> => {
    await loadValue();
  }, [loadValue]);

  return {
    value,
    setValue,
    removeValue,
    isLoading,
    error,
    refresh,
  };
}

//#endregion useLocalStorage Hook
