// apps/v2/src/stores/ephemeral/index.ts

export { useBrowserStore } from "./useBrowserStore";
export type { IBrowserState } from "./useBrowserStore";

export { usePresenceStore } from "./usePresenceStore";
export type { IUserPresence, IPresenceState } from "./usePresenceStore";

export { useTypingStore } from "./useTypingStore";
export type {
  ITypingUser,
  ITypingState,
  ITypingActions,
  ITypingStore,
} from "./useTypingStore";

export { useDraftsStore } from "./useDraftsStore";
export type {
  IDraftData,
  IDraftsState,
  IDraftsActions,
  IDraftsStore,
} from "./useDraftsStore";
