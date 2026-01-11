// apps/v2/src/stores/ephemeral/usePresenceStore.ts

import { createStore } from "../setup";

//#region Types

type IUserPresence = "online" | "away" | "dnd" | "offline";

type IPresenceState = {
  presences: Record<string, IUserPresence>; // userId -> presence
  lastActivity: Record<string, number>; // userId -> timestamp

  // Actions
  setPresence: (userId: string, status: IUserPresence) => void;
  setPresences: (presences: Record<string, IUserPresence>) => void;
  updateLastActivity: (userId: string) => void;
  getPresence: (userId: string) => IUserPresence;
  clearPresences: () => void;
};

//#endregion Types

//#region Store

/**
 * Ephemeral store for user presence status.
 * Tracks online/away/dnd/offline status and last activity timestamps.
 * Not persisted - resets on app restart.
 */
export const usePresenceStore = createStore<IPresenceState>(
  (set, get) => ({
    presences: {},
    lastActivity: {},

    setPresence: (userId, status) =>
      set((state) => ({
        presences: { ...state.presences, [userId]: status },
        lastActivity: { ...state.lastActivity, [userId]: Date.now() },
      })),

    setPresences: (presences) =>
      set((state) => {
        const timestamp = Date.now();
        const newLastActivity = { ...state.lastActivity };
        for (const userId of Object.keys(presences)) {
          newLastActivity[userId] = timestamp;
        }
        return {
          presences: { ...state.presences, ...presences },
          lastActivity: newLastActivity,
        };
      }),

    updateLastActivity: (userId) =>
      set((state) => ({
        lastActivity: { ...state.lastActivity, [userId]: Date.now() },
      })),

    getPresence: (userId) => {
      const state = get();
      return state.presences[userId] ?? "offline";
    },

    clearPresences: () => set({ presences: {}, lastActivity: {} }),
  }),
  { name: "presence-store" },
);

//#endregion Store

//#region Exports

export type { IUserPresence, IPresenceState };

//#endregion Exports
