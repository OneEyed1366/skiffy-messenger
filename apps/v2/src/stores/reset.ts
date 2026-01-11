// apps/v2/src/stores/reset.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import { queryClient } from "@/queries";

//#region Store Imports

import { useConnectionStore } from "./connection";
import { useBrowserStore } from "./ephemeral/useBrowserStore";
import { useDraftsStore } from "./ephemeral/useDraftsStore";
import { usePresenceStore } from "./ephemeral/usePresenceStore";
import { useTypingStore } from "./ephemeral/useTypingStore";
import { useEmojiStore } from "./ui/useEmojiStore";
import { useLhsStore } from "./ui/useLhsStore";
import { useModalsStore } from "./ui/useModalsStore";
import { useRhsStore } from "./ui/useRhsStore";
import { useSettingsStore } from "./ui/useSettingsStore";
import { useChannelSidebarStore } from "./views/useChannelSidebarStore";
import { useChannelViewStore } from "./views/useChannelViewStore";
import { useSearchStore } from "./views/useSearchStore";
import { useThreadsViewStore } from "./views/useThreadsViewStore";

//#endregion Store Imports

//#region Types

type IResetOptions = {
  /** Clear persisted storage (AsyncStorage/localStorage). Default: true */
  clearStorage?: boolean;
};

//#endregion Types

//#region Constants

const DEFAULT_LHS_WIDTH = 240;
const DEFAULT_SKIN_TONE = 1;

/**
 * Store names that have persistence enabled.
 * Must match the `name` option in createStore({ persist: true }).
 */
const PERSISTED_STORE_KEYS = [
  "drafts-store",
  "emoji-store",
  "search-store",
] as const;

//#endregion Constants

//#region Initial States

/**
 * Initial state definitions for all stores.
 * These must match the initial states defined in each store.
 */

const CONNECTION_INITIAL_STATE = {
  status: "disconnected" as const,
  lastConnected: null,
  reconnectAttempts: 0,
  error: null,
};

const BROWSER_INITIAL_STATE = {
  windowFocused: true,
  windowWidth: 0,
  windowHeight: 0,
  isOnline: true,
  isMobile: false,
};

const PRESENCE_INITIAL_STATE = {
  presences: {},
  lastActivity: {},
};

const TYPING_INITIAL_STATE = {
  typingByChannel: {},
  timeoutIds: {},
};

const DRAFTS_INITIAL_STATE = {
  drafts: {},
};

const MODALS_INITIAL_STATE = {
  stack: [],
};

const RHS_INITIAL_STATE = {
  isOpen: false,
  view: "none" as const,
  channelId: null,
  threadId: null,
  userId: null,
  searchTerms: null,
  isExpanded: false,
  previousView: null,
  previousState: null,
};

const LHS_INITIAL_STATE = {
  isOpen: true,
  width: DEFAULT_LHS_WIDTH,
  activeTeamId: null,
  activeChannelId: null,
  collapsedCategories: new Set<string>(),
};

const SETTINGS_INITIAL_STATE = {
  isOpen: false,
  activeTab: "general" as const,
  hasUnsavedChanges: false,
};

const EMOJI_INITIAL_STATE = {
  isPickerOpen: false,
  searchQuery: "",
  activeCategory: "recent" as const,
  recentEmojis: [],
  skinTone: DEFAULT_SKIN_TONE,
};

const CHANNEL_VIEW_INITIAL_STATE = {
  scrollPosition: {},
  highlightedPostId: null,
  isAtBottom: true,
  unreadBannerVisible: false,
  jumpToPostId: null,
};

const THREADS_VIEW_INITIAL_STATE = {
  filter: "all" as const,
  selectedThreadId: null,
  isLoading: false,
  searchQuery: "",
};

const SEARCH_INITIAL_STATE = {
  query: "",
  isSearching: false,
  filters: {
    from: undefined,
    in: undefined,
    before: undefined,
    after: undefined,
    on: undefined,
  },
  recentSearches: [],
};

const CHANNEL_SIDEBAR_INITIAL_STATE = {
  filterText: "",
  showUnreadOnly: false,
  draggingChannelId: null,
  dropTargetCategoryId: null,
};

//#endregion Initial States

//#region Storage Helpers

/**
 * Clears persisted store data from storage.
 * Uses localStorage on web, AsyncStorage on native.
 */
async function clearPersistedStorage(): Promise<void> {
  if (Platform.OS === "web") {
    PERSISTED_STORE_KEYS.forEach((key) => {
      localStorage.removeItem(key);
    });
  } else {
    await AsyncStorage.multiRemove([...PERSISTED_STORE_KEYS]);
  }
}

//#endregion Storage Helpers

//#region Reset Functions

/**
 * Clears all typing timeouts to prevent memory leaks.
 * Must be called before resetting the typing store.
 */
function clearTypingTimeouts(): void {
  const timeoutIds = useTypingStore.getState().timeoutIds;
  Object.values(timeoutIds).forEach((timeoutId) => {
    clearTimeout(timeoutId);
  });
}

/**
 * Resets all Zustand stores to their initial state.
 */
function resetAllStores(): void {
  // Clear typing timeouts first to prevent memory leaks
  clearTypingTimeouts();

  // Connection store
  useConnectionStore.setState(CONNECTION_INITIAL_STATE);

  // Ephemeral stores
  useBrowserStore.setState(BROWSER_INITIAL_STATE);
  usePresenceStore.setState(PRESENCE_INITIAL_STATE);
  useTypingStore.setState(TYPING_INITIAL_STATE);
  useDraftsStore.setState(DRAFTS_INITIAL_STATE);

  // UI stores
  useModalsStore.setState(MODALS_INITIAL_STATE);
  useRhsStore.setState(RHS_INITIAL_STATE);
  useLhsStore.setState(LHS_INITIAL_STATE);
  useSettingsStore.setState(SETTINGS_INITIAL_STATE);
  useEmojiStore.setState(EMOJI_INITIAL_STATE);

  // View stores
  useChannelViewStore.setState(CHANNEL_VIEW_INITIAL_STATE);
  useThreadsViewStore.setState(THREADS_VIEW_INITIAL_STATE);
  useSearchStore.setState(SEARCH_INITIAL_STATE);
  useChannelSidebarStore.setState(CHANNEL_SIDEBAR_INITIAL_STATE);
}

/**
 * Resets all application state on logout.
 *
 * - Clears TanStack Query cache (all cached server data)
 * - Resets all Zustand stores to initial state
 * - Optionally clears persisted storage (AsyncStorage/localStorage)
 *
 * @param options - Reset options
 * @param options.clearStorage - Clear persisted storage. Default: true
 *
 * @example
 * ```typescript
 * // On logout - clear everything
 * await resetAllState();
 *
 * // On logout - keep persisted preferences
 * await resetAllState({ clearStorage: false });
 * ```
 */
export async function resetAllState(
  options: IResetOptions = {},
): Promise<void> {
  const { clearStorage = true } = options;

  // Clear TanStack Query cache
  queryClient.clear();

  // Reset all Zustand stores
  resetAllStores();

  // Optionally clear persisted storage
  if (clearStorage) {
    await clearPersistedStorage();
  }
}

/**
 * Resets only UI state (keeps drafts and preferences).
 *
 * Useful for navigating to a fresh state without losing user data.
 * - Closes modals, RHS, settings
 * - Clears search
 * - Does NOT clear drafts, recent emojis, or persisted preferences
 *
 * @example
 * ```typescript
 * // When switching teams or navigating away
 * resetUIState();
 * ```
 */
export function resetUIState(): void {
  // Close all modals
  useModalsStore.setState(MODALS_INITIAL_STATE);

  // Close RHS
  useRhsStore.setState(RHS_INITIAL_STATE);

  // Reset LHS state (but keep it open)
  useLhsStore.setState(LHS_INITIAL_STATE);

  // Close settings
  useSettingsStore.setState(SETTINGS_INITIAL_STATE);

  // Clear search state (but keep recent searches)
  useSearchStore.setState({
    query: "",
    isSearching: false,
    filters: {
      from: undefined,
      in: undefined,
      before: undefined,
      after: undefined,
      on: undefined,
    },
    // Preserve recentSearches
    recentSearches: useSearchStore.getState().recentSearches,
  });
}

//#endregion Reset Functions

//#region Exports

export type { IResetOptions };
export { PERSISTED_STORE_KEYS };

//#endregion Exports
