// apps/v2/src/stores/ephemeral/useTypingStore.ts

import { createStore } from "../setup";

//#region Types

type ITypingUser = {
  odUserId: string;
  odUsername: string;
  startedAt: number;
  expiresAt: number;
};

type ITypingState = {
  /** Map of channelId -> array of typing users */
  typingByChannel: Record<string, ITypingUser[]>;
  /** Map of timeoutId tracking keys for cleanup */
  timeoutIds: Record<string, ReturnType<typeof setTimeout>>;
};

type ITypingActions = {
  /**
   * Add a typing indicator for a user in a channel.
   * Automatically expires after the specified timeout.
   */
  addTyping: (
    channelId: string,
    userId: string,
    username: string,
    timeout?: number,
  ) => void;

  /**
   * Remove a typing indicator for a user in a channel.
   */
  removeTyping: (channelId: string, userId: string) => void;

  /**
   * Get all typing users for a channel.
   */
  getTypingUsers: (channelId: string) => ITypingUser[];

  /**
   * Check if a specific user is typing in a channel.
   */
  isUserTyping: (channelId: string, userId: string) => boolean;

  /**
   * Clear all typing indicators for a channel.
   */
  clearChannel: (channelId: string) => void;

  /**
   * Clear all typing indicators across all channels.
   */
  clearAll: () => void;

  /**
   * Remove expired typing indicators (cleanup utility).
   */
  removeExpired: () => void;
};

type ITypingStore = ITypingState & ITypingActions;

//#endregion Types

//#region Constants

const DEFAULT_TYPING_TIMEOUT_MS = 5000;

//#endregion Constants

//#region Store

export const useTypingStore = createStore<ITypingStore>(
  (set, get) => ({
    //#region State

    typingByChannel: {},
    timeoutIds: {},

    //#endregion State

    //#region Actions

    addTyping: (
      channelId: string,
      userId: string,
      username: string,
      timeout = DEFAULT_TYPING_TIMEOUT_MS,
    ) => {
      const now = Date.now();
      const expiresAt = now + timeout;
      const timeoutKey = `${channelId}:${userId}`;

      // Clear existing timeout for this user if any
      const existingTimeout = get().timeoutIds[timeoutKey];
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set new timeout for auto-expiry
      const newTimeoutId = setTimeout(() => {
        get().removeTyping(channelId, userId);
      }, timeout);

      set((state) => {
        const channelTyping = state.typingByChannel[channelId] ?? [];
        const existingIndex = channelTyping.findIndex(
          (u) => u.odUserId === userId,
        );

        const newUser: ITypingUser = {
          odUserId: userId,
          odUsername: username,
          startedAt:
            existingIndex >= 0 ? channelTyping[existingIndex].startedAt : now,
          expiresAt,
        };

        const updatedTyping =
          existingIndex >= 0
            ? channelTyping.map((u, i) => (i === existingIndex ? newUser : u))
            : [...channelTyping, newUser];

        return {
          typingByChannel: {
            ...state.typingByChannel,
            [channelId]: updatedTyping,
          },
          timeoutIds: {
            ...state.timeoutIds,
            [timeoutKey]: newTimeoutId,
          },
        };
      });
    },

    removeTyping: (channelId: string, userId: string) => {
      const timeoutKey = `${channelId}:${userId}`;

      // Clear timeout
      const existingTimeout = get().timeoutIds[timeoutKey];
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      set((state) => {
        const channelTyping = state.typingByChannel[channelId] ?? [];
        const filteredTyping = channelTyping.filter(
          (u) => u.odUserId !== userId,
        );

        // Create new timeoutIds without this key
        const { [timeoutKey]: _removed, ...remainingTimeouts } =
          state.timeoutIds;

        // Remove channel entry if empty
        if (filteredTyping.length === 0) {
          const { [channelId]: _removedChannel, ...remainingChannels } =
            state.typingByChannel;
          return {
            typingByChannel: remainingChannels,
            timeoutIds: remainingTimeouts,
          };
        }

        return {
          typingByChannel: {
            ...state.typingByChannel,
            [channelId]: filteredTyping,
          },
          timeoutIds: remainingTimeouts,
        };
      });
    },

    getTypingUsers: (channelId: string) => {
      const state = get();
      return state.typingByChannel[channelId] ?? [];
    },

    isUserTyping: (channelId: string, userId: string) => {
      const state = get();
      const channelTyping = state.typingByChannel[channelId] ?? [];
      return channelTyping.some((u) => u.odUserId === userId);
    },

    clearChannel: (channelId: string) => {
      const state = get();
      const channelTyping = state.typingByChannel[channelId] ?? [];

      // Clear all timeouts for this channel
      channelTyping.forEach((user) => {
        const timeoutKey = `${channelId}:${user.odUserId}`;
        const timeout = state.timeoutIds[timeoutKey];
        if (timeout) {
          clearTimeout(timeout);
        }
      });

      set((prevState) => {
        const { [channelId]: _removed, ...remainingChannels } =
          prevState.typingByChannel;

        // Remove all timeouts for this channel
        const remainingTimeouts = Object.fromEntries(
          Object.entries(prevState.timeoutIds).filter(
            ([key]) => !key.startsWith(`${channelId}:`),
          ),
        );

        return {
          typingByChannel: remainingChannels,
          timeoutIds: remainingTimeouts,
        };
      });
    },

    clearAll: () => {
      const state = get();

      // Clear all timeouts
      Object.values(state.timeoutIds).forEach((timeout) => {
        clearTimeout(timeout);
      });

      set({
        typingByChannel: {},
        timeoutIds: {},
      });
    },

    removeExpired: () => {
      const now = Date.now();

      set((state) => {
        const newTypingByChannel: Record<string, ITypingUser[]> = {};
        const expiredKeys: string[] = [];

        Object.entries(state.typingByChannel).forEach(([channelId, users]) => {
          const activeUsers = users.filter((user) => {
            if (user.expiresAt <= now) {
              expiredKeys.push(`${channelId}:${user.odUserId}`);
              return false;
            }
            return true;
          });

          if (activeUsers.length > 0) {
            newTypingByChannel[channelId] = activeUsers;
          }
        });

        // Clear expired timeouts
        expiredKeys.forEach((key) => {
          const timeout = state.timeoutIds[key];
          if (timeout) {
            clearTimeout(timeout);
          }
        });

        const remainingTimeouts = Object.fromEntries(
          Object.entries(state.timeoutIds).filter(
            ([key]) => !expiredKeys.includes(key),
          ),
        );

        return {
          typingByChannel: newTypingByChannel,
          timeoutIds: remainingTimeouts,
        };
      });
    },

    //#endregion Actions
  }),
  { name: "typing-store" },
);

//#endregion Store

//#region Exports

export type { ITypingUser, ITypingState, ITypingActions, ITypingStore };

//#endregion Exports
