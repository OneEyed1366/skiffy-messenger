// apps/v2/src/stores/ephemeral/useDraftsStore.ts

import { createStore } from "../setup";

//#region Types

type IDraftData = {
  message: string;
  files?: string[];
  updatedAt: number;
};

type IDraftsState = {
  /** Map of draft key -> draft data. Key format: "channel:{channelId}" or "thread:{channelId}:{rootId}" */
  drafts: Record<string, IDraftData>;
};

type IDraftsActions = {
  /**
   * Set or update a draft for a given key.
   * Creates new draft or updates existing one.
   */
  setDraft: (key: string, message: string, files?: string[]) => void;

  /**
   * Get a draft by key.
   * Returns null if no draft exists.
   */
  getDraft: (key: string) => IDraftData | null;

  /**
   * Remove a draft by key.
   */
  removeDraft: (key: string) => void;

  /**
   * Clear all drafts.
   */
  clearAllDrafts: () => void;

  /**
   * Generate a channel draft key.
   */
  getChannelDraftKey: (channelId: string) => string;

  /**
   * Generate a thread draft key.
   */
  getThreadDraftKey: (channelId: string, rootId: string) => string;
};

type IDraftsStore = IDraftsState & IDraftsActions;

//#endregion Types

//#region Constants

const CHANNEL_KEY_PREFIX = "channel:";
const THREAD_KEY_PREFIX = "thread:";

//#endregion Constants

//#region Store

export const useDraftsStore = createStore<IDraftsStore>(
  (set, get) => ({
    //#region State

    drafts: {},

    //#endregion State

    //#region Actions

    setDraft: (key: string, message: string, files?: string[]) => {
      const now = Date.now();

      set((state) => ({
        drafts: {
          ...state.drafts,
          [key]: {
            message,
            files,
            updatedAt: now,
          },
        },
      }));
    },

    getDraft: (key: string) => {
      const state = get();
      return state.drafts[key] ?? null;
    },

    removeDraft: (key: string) => {
      set((state) => {
        const { [key]: _removed, ...remainingDrafts } = state.drafts;
        return { drafts: remainingDrafts };
      });
    },

    clearAllDrafts: () => {
      set({ drafts: {} });
    },

    getChannelDraftKey: (channelId: string) => {
      return `${CHANNEL_KEY_PREFIX}${channelId}`;
    },

    getThreadDraftKey: (channelId: string, rootId: string) => {
      return `${THREAD_KEY_PREFIX}${channelId}:${rootId}`;
    },

    //#endregion Actions
  }),
  { name: "drafts-store", persist: true },
);

//#endregion Store

//#region Exports

export type { IDraftData, IDraftsState, IDraftsActions, IDraftsStore };

//#endregion Exports
