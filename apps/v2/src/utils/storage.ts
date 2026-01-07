// apps/v2/src/utils/storage.ts

/**
 * Storage utilities
 * Migrated from: vendor/desktop/webapp/channels/src/stores/local_storage_store.ts
 *
 * Provides cross-platform storage using AsyncStorage for general data
 * and SecureStore for sensitive data (tokens, credentials).
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import * as v from "valibot";

//#region Types

export type IStorageKey = string;

export type IStorageOptions = {
  /** Prefix for all keys (useful for namespacing) */
  prefix?: string;
};

export type ISecureStoreOptions = {
  /** iOS: Keychain access group for sharing between apps */
  keychainAccessGroup?: string;
  /** iOS: Keychain accessibility level */
  keychainAccessible?: SecureStore.KeychainAccessibilityConstant;
  /** Android: Require device authentication to access */
  requireAuthentication?: boolean;
};

//#endregion

//#region Constants

/** Storage key prefix for app data */
export const STORAGE_PREFIX = "@retrievly:";

/** Secure storage key prefix */
export const SECURE_STORAGE_PREFIX = "@retrievly:secure:";

//#endregion

//#region General Storage (AsyncStorage)

/**
 * Get a value from general storage.
 *
 * @param key - Storage key
 * @returns Promise resolving to stored value or null if not found
 *
 * @example
 * ```typescript
 * const theme = await getItem("user_theme");
 * if (theme) {
 *   applyTheme(theme);
 * }
 * ```
 */
export async function getItem(key: IStorageKey): Promise<string | null> {
  try {
    const value = await AsyncStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return value;
  } catch (error) {
    console.error(`Failed to get item "${key}":`, error);
    return null;
  }
}

/**
 * Store a value in general storage.
 *
 * @param key - Storage key
 * @param value - Value to store
 *
 * @example
 * ```typescript
 * await setItem("user_theme", "dark");
 * await setItem("last_channel_id", channelId);
 * ```
 */
export async function setItem(key: IStorageKey, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(`${STORAGE_PREFIX}${key}`, value);
  } catch (error) {
    console.error(`Failed to set item "${key}":`, error);
    throw error;
  }
}

/**
 * Remove a value from general storage.
 *
 * @param key - Storage key to remove
 *
 * @example
 * ```typescript
 * await removeItem("cached_data");
 * ```
 */
export async function removeItem(key: IStorageKey): Promise<void> {
  try {
    await AsyncStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (error) {
    console.error(`Failed to remove item "${key}":`, error);
    throw error;
  }
}

/**
 * Get multiple values from general storage.
 *
 * @param keys - Array of storage keys
 * @returns Promise resolving to object with key-value pairs
 *
 * @example
 * ```typescript
 * const values = await getMultipleItems(["theme", "language", "notifications"]);
 * console.log(values.theme, values.language);
 * ```
 */
export async function getMultipleItems(
  keys: IStorageKey[],
): Promise<Record<string, string | null>> {
  try {
    const prefixedKeys = keys.map((key) => `${STORAGE_PREFIX}${key}`);
    const pairs = await AsyncStorage.multiGet(prefixedKeys);

    const result: Record<string, string | null> = {};
    pairs.forEach(([prefixedKey, value]) => {
      const key = prefixedKey.replace(STORAGE_PREFIX, "");
      result[key] = value;
    });

    return result;
  } catch (error) {
    console.error("Failed to get multiple items:", error);
    return {};
  }
}

/**
 * Store multiple values in general storage.
 *
 * @param items - Object with key-value pairs to store
 *
 * @example
 * ```typescript
 * await setMultipleItems({
 *   theme: "dark",
 *   language: "en",
 *   notifications: "true",
 * });
 * ```
 */
export async function setMultipleItems(
  items: Record<string, string>,
): Promise<void> {
  try {
    const pairs: [string, string][] = Object.entries(items).map(
      ([key, value]) => [`${STORAGE_PREFIX}${key}`, value],
    );
    await AsyncStorage.multiSet(pairs);
  } catch (error) {
    console.error("Failed to set multiple items:", error);
    throw error;
  }
}

/**
 * Clear all app data from general storage.
 *
 * Only removes keys with the app prefix, not all AsyncStorage data.
 *
 * @example
 * ```typescript
 * // On logout
 * await clearStorage();
 * ```
 */
export async function clearStorage(): Promise<void> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const appKeys = allKeys.filter((key) => key.startsWith(STORAGE_PREFIX));
    if (appKeys.length > 0) {
      await AsyncStorage.multiRemove(appKeys);
    }
  } catch (error) {
    console.error("Failed to clear storage:", error);
    throw error;
  }
}

/**
 * Get all keys stored by the app.
 *
 * @returns Promise resolving to array of storage keys (without prefix)
 */
export async function getAllKeys(): Promise<string[]> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    return allKeys
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .map((key) => key.replace(STORAGE_PREFIX, ""));
  } catch (error) {
    console.error("Failed to get all keys:", error);
    return [];
  }
}

//#endregion

//#region Secure Storage (SecureStore)

/**
 * Check if SecureStore is available on this device.
 *
 * @returns Promise resolving to true if secure storage is available
 */
export async function isSecureStoreAvailable(): Promise<boolean> {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

/**
 * Get a value from secure storage.
 *
 * Use for sensitive data like tokens, passwords, API keys.
 *
 * @param key - Storage key
 * @param options - SecureStore options
 * @returns Promise resolving to stored value or null if not found
 *
 * @example
 * ```typescript
 * const token = await getSecureItem("auth_token");
 * if (token) {
 *   setAuthHeader(token);
 * }
 * ```
 */
export async function getSecureItem(
  key: IStorageKey,
  options?: ISecureStoreOptions,
): Promise<string | null> {
  try {
    // Web fallback - use localStorage (not truly secure)
    if (Platform.OS === "web") {
      console.warn("SecureStore not available on web, using localStorage");
      return localStorage.getItem(`${SECURE_STORAGE_PREFIX}${key}`);
    }

    const value = await SecureStore.getItemAsync(
      `${SECURE_STORAGE_PREFIX}${key}`,
      options,
    );
    return value;
  } catch (error) {
    console.error(`Failed to get secure item "${key}":`, error);
    return null;
  }
}

/**
 * Store a value in secure storage.
 *
 * Use for sensitive data like tokens, passwords, API keys.
 * Note: iOS Keychain has 2048 byte limit per item.
 *
 * @param key - Storage key
 * @param value - Value to store (max ~2KB on iOS)
 * @param options - SecureStore options
 *
 * @example
 * ```typescript
 * await setSecureItem("auth_token", response.token);
 * await setSecureItem("refresh_token", response.refreshToken);
 * ```
 */
export async function setSecureItem(
  key: IStorageKey,
  value: string,
  options?: ISecureStoreOptions,
): Promise<void> {
  try {
    // Web fallback - use localStorage (not truly secure)
    if (Platform.OS === "web") {
      console.warn("SecureStore not available on web, using localStorage");
      localStorage.setItem(`${SECURE_STORAGE_PREFIX}${key}`, value);
      return;
    }

    await SecureStore.setItemAsync(
      `${SECURE_STORAGE_PREFIX}${key}`,
      value,
      options,
    );
  } catch (error) {
    console.error(`Failed to set secure item "${key}":`, error);
    throw error;
  }
}

/**
 * Remove a value from secure storage.
 *
 * @param key - Storage key to remove
 * @param options - SecureStore options
 *
 * @example
 * ```typescript
 * // On logout
 * await removeSecureItem("auth_token");
 * await removeSecureItem("refresh_token");
 * ```
 */
export async function removeSecureItem(
  key: IStorageKey,
  options?: ISecureStoreOptions,
): Promise<void> {
  try {
    // Web fallback
    if (Platform.OS === "web") {
      localStorage.removeItem(`${SECURE_STORAGE_PREFIX}${key}`);
      return;
    }

    await SecureStore.deleteItemAsync(
      `${SECURE_STORAGE_PREFIX}${key}`,
      options,
    );
  } catch (error) {
    console.error(`Failed to remove secure item "${key}":`, error);
    throw error;
  }
}

//#endregion

//#region JSON Helpers

/**
 * Get and parse JSON from storage.
 * Returns unknown - caller must validate/narrow the type.
 */
export async function getJsonItem(key: IStorageKey): Promise<unknown> {
  try {
    const value = await getItem(key);
    if (value === null) {
      return null;
    }
    return JSON.parse(value) as unknown;
  } catch (error) {
    console.error(`Failed to parse JSON for "${key}":`, error);
    return null;
  }
}

/**
 * Get and validate JSON from storage using valibot schema.
 * Returns null if missing, invalid JSON, or fails schema validation.
 */
export async function getValidatedJsonItem<T>(
  key: IStorageKey,
  schema: v.BaseSchema<unknown, T, v.BaseIssue<unknown>>,
): Promise<T | null> {
  try {
    const value = await getItem(key);
    if (value === null) {
      return null;
    }
    const parsed: unknown = JSON.parse(value);
    return v.parse(schema, parsed);
  } catch (error) {
    console.error(`Failed to get/validate JSON for "${key}":`, error);
    return null;
  }
}

/**
 * Stringify and store JSON in general storage.
 */
export async function setJsonItem<T>(
  key: IStorageKey,
  value: T,
): Promise<void> {
  try {
    const jsonString = JSON.stringify(value);
    await setItem(key, jsonString);
  } catch (error) {
    console.error(`Failed to stringify JSON for "${key}":`, error);
    throw error;
  }
}

//#endregion
