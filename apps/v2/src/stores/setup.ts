// apps/v2/src/stores/setup.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { create, StateCreator } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";

//#region Types

type IStoreOptions = {
  name: string;
  persist?: boolean;
};

//#endregion Types

//#region Storage Adapter

/**
 * Cross-platform storage adapter for Zustand persist middleware.
 * Uses localStorage on web, AsyncStorage on native.
 */
const getStorage = () => {
  if (Platform.OS === "web") {
    return createJSONStorage(() => localStorage);
  }
  return createJSONStorage(() => AsyncStorage);
};

//#endregion Storage Adapter

//#region Store Factory

/**
 * Factory function for creating Zustand stores with optional persistence and devtools.
 *
 * @param initializer - Zustand state creator function
 * @param options - Store configuration options
 * @param options.name - Store name (used for devtools and persistence key)
 * @param options.persist - Enable persistence middleware (default: false)
 * @returns Zustand store hook
 *
 * @example
 * ```typescript
 * type ICounterState = {
 *   count: number;
 *   increment: () => void;
 * };
 *
 * export const useCounterStore = createStore<ICounterState>(
 *   (set) => ({
 *     count: 0,
 *     increment: () => set((state) => ({ count: state.count + 1 })),
 *   }),
 *   { name: "counter", persist: true }
 * );
 * ```
 */
export function createStore<T>(
  initializer: StateCreator<T, [], []>,
  options: IStoreOptions,
) {
  if (options.persist) {
    return create<T>()(
      devtools(
        persist(initializer, {
          name: options.name,
          storage: getStorage(),
        }),
        { name: options.name },
      ),
    );
  }
  return create<T>()(devtools(initializer, { name: options.name }));
}

//#endregion Store Factory
