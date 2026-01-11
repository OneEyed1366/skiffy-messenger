// apps/v2/src/stores/index.ts

export { createStore } from "./setup";

// Connection store
export {
  useConnectionStore,
  type IConnectionStatus,
  type IConnectionState,
} from "./connection";

// Ephemeral stores
export {
  useBrowserStore,
  type IBrowserState,
  usePresenceStore,
  type IUserPresence,
  type IPresenceState,
  useTypingStore,
  type ITypingUser,
  type ITypingState,
  type ITypingActions,
  type ITypingStore,
} from "./ephemeral";

// View stores
export {
  useChannelSidebarStore,
  type IChannelSidebarState,
  useChannelViewStore,
  useThreadsViewStore,
  type IThreadsFilter,
  type IThreadsViewState,
  useSearchStore,
  type ISearchState,
  type ISearchFilters,
  type ISearchFilterKey,
} from "./views";

// UI stores
export {
  useLhsStore,
  type ILhsState,
  useModalsStore,
  type IModalType,
  type IModalData,
  type IModalsState,
  useRhsStore,
  type IRhsView,
  type IRhsState,
  useSettingsStore,
  type ISettingsTab,
  type ISettingsState,
} from "./ui";

// Reset utilities
export {
  resetAllState,
  resetUIState,
  PERSISTED_STORE_KEYS,
  type IResetOptions,
} from "./reset";
