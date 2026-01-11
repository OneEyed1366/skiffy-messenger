// apps/v2/src/stores/ephemeral/useTypingStore.spec.ts

import { act } from "@testing-library/react-native";

import { useTypingStore } from "./useTypingStore";

//#region Mocks

jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
  },
}));

jest.mock("zustand/middleware", () => ({
  devtools: (fn: unknown) => fn,
  persist: (fn: unknown) => fn,
  createJSONStorage: () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }),
}));

//#endregion Mocks

//#region Test Setup

const resetStore = () => {
  act(() => {
    useTypingStore.getState().clearAll();
  });
};

//#endregion Test Setup

describe("useTypingStore", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetStore();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  //#region Initial State

  describe("initial state", () => {
    it("starts with empty typingByChannel", () => {
      const state = useTypingStore.getState();
      expect(state.typingByChannel).toEqual({});
    });

    it("starts with empty timeoutIds", () => {
      const state = useTypingStore.getState();
      expect(state.timeoutIds).toEqual({});
    });
  });

  //#endregion Initial State

  //#region addTyping

  describe("addTyping", () => {
    it("adds a typing user to a channel", () => {
      act(() => {
        useTypingStore.getState().addTyping("channel-1", "user-1", "Alice");
      });

      const users = useTypingStore.getState().getTypingUsers("channel-1");
      expect(users).toHaveLength(1);
      expect(users[0].odUserId).toBe("user-1");
      expect(users[0].odUsername).toBe("Alice");
    });

    it("adds multiple users to the same channel", () => {
      act(() => {
        useTypingStore.getState().addTyping("channel-1", "user-1", "Alice");
        useTypingStore.getState().addTyping("channel-1", "user-2", "Bob");
      });

      const users = useTypingStore.getState().getTypingUsers("channel-1");
      expect(users).toHaveLength(2);
      expect(users.map((u) => u.odUsername)).toEqual(["Alice", "Bob"]);
    });

    it("adds users to different channels", () => {
      act(() => {
        useTypingStore.getState().addTyping("channel-1", "user-1", "Alice");
        useTypingStore.getState().addTyping("channel-2", "user-2", "Bob");
      });

      const channel1Users = useTypingStore
        .getState()
        .getTypingUsers("channel-1");
      const channel2Users = useTypingStore
        .getState()
        .getTypingUsers("channel-2");

      expect(channel1Users).toHaveLength(1);
      expect(channel2Users).toHaveLength(1);
      expect(channel1Users[0].odUsername).toBe("Alice");
      expect(channel2Users[0].odUsername).toBe("Bob");
    });

    it("updates existing user instead of duplicating", () => {
      act(() => {
        useTypingStore.getState().addTyping("channel-1", "user-1", "Alice");
      });

      const firstAdd = useTypingStore.getState().getTypingUsers("channel-1")[0];
      const originalStartedAt = firstAdd.startedAt;

      jest.advanceTimersByTime(1000);

      act(() => {
        useTypingStore.getState().addTyping("channel-1", "user-1", "Alice");
      });

      const users = useTypingStore.getState().getTypingUsers("channel-1");
      expect(users).toHaveLength(1);
      expect(users[0].startedAt).toBe(originalStartedAt);
      expect(users[0].expiresAt).toBeGreaterThan(firstAdd.expiresAt);
    });

    it("sets correct expiresAt timestamp", () => {
      const now = Date.now();

      act(() => {
        useTypingStore
          .getState()
          .addTyping("channel-1", "user-1", "Alice", 3000);
      });

      const users = useTypingStore.getState().getTypingUsers("channel-1");
      expect(users[0].expiresAt).toBeGreaterThanOrEqual(now + 3000);
    });

    it("uses default timeout when not specified", () => {
      const now = Date.now();
      const DEFAULT_TIMEOUT = 5000;

      act(() => {
        useTypingStore.getState().addTyping("channel-1", "user-1", "Alice");
      });

      const users = useTypingStore.getState().getTypingUsers("channel-1");
      expect(users[0].expiresAt).toBeGreaterThanOrEqual(now + DEFAULT_TIMEOUT);
    });

    it("auto-removes typing after timeout expires", () => {
      act(() => {
        useTypingStore
          .getState()
          .addTyping("channel-1", "user-1", "Alice", 3000);
      });

      expect(
        useTypingStore.getState().getTypingUsers("channel-1"),
      ).toHaveLength(1);

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(
        useTypingStore.getState().getTypingUsers("channel-1"),
      ).toHaveLength(0);
    });

    it("resets timeout when same user types again", () => {
      act(() => {
        useTypingStore
          .getState()
          .addTyping("channel-1", "user-1", "Alice", 3000);
      });

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // User types again, resetting timeout
      act(() => {
        useTypingStore
          .getState()
          .addTyping("channel-1", "user-1", "Alice", 3000);
      });

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Should still be typing (2000ms after reset, not 4000ms total)
      expect(
        useTypingStore.getState().getTypingUsers("channel-1"),
      ).toHaveLength(1);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Now 3000ms after reset, should be removed
      expect(
        useTypingStore.getState().getTypingUsers("channel-1"),
      ).toHaveLength(0);
    });
  });

  //#endregion addTyping

  //#region removeTyping

  describe("removeTyping", () => {
    it("removes a specific user from a channel", () => {
      act(() => {
        useTypingStore.getState().addTyping("channel-1", "user-1", "Alice");
        useTypingStore.getState().addTyping("channel-1", "user-2", "Bob");
      });

      act(() => {
        useTypingStore.getState().removeTyping("channel-1", "user-1");
      });

      const users = useTypingStore.getState().getTypingUsers("channel-1");
      expect(users).toHaveLength(1);
      expect(users[0].odUserId).toBe("user-2");
    });

    it("removes channel entry when last user is removed", () => {
      act(() => {
        useTypingStore.getState().addTyping("channel-1", "user-1", "Alice");
      });

      act(() => {
        useTypingStore.getState().removeTyping("channel-1", "user-1");
      });

      const state = useTypingStore.getState();
      expect(state.typingByChannel["channel-1"]).toBeUndefined();
    });

    it("does nothing when removing non-existent user", () => {
      act(() => {
        useTypingStore.getState().addTyping("channel-1", "user-1", "Alice");
      });

      act(() => {
        useTypingStore.getState().removeTyping("channel-1", "user-999");
      });

      const users = useTypingStore.getState().getTypingUsers("channel-1");
      expect(users).toHaveLength(1);
    });

    it("does nothing when removing from non-existent channel", () => {
      act(() => {
        useTypingStore.getState().removeTyping("non-existent", "user-1");
      });

      const state = useTypingStore.getState();
      expect(state.typingByChannel).toEqual({});
    });

    it("clears the associated timeout", () => {
      act(() => {
        useTypingStore
          .getState()
          .addTyping("channel-1", "user-1", "Alice", 5000);
      });

      act(() => {
        useTypingStore.getState().removeTyping("channel-1", "user-1");
      });

      const state = useTypingStore.getState();
      expect(state.timeoutIds["channel-1:user-1"]).toBeUndefined();
    });
  });

  //#endregion removeTyping

  //#region getTypingUsers

  describe("getTypingUsers", () => {
    it("returns empty array for non-existent channel", () => {
      const users = useTypingStore.getState().getTypingUsers("non-existent");
      expect(users).toEqual([]);
    });

    it("returns all typing users for a channel", () => {
      act(() => {
        useTypingStore.getState().addTyping("channel-1", "user-1", "Alice");
        useTypingStore.getState().addTyping("channel-1", "user-2", "Bob");
        useTypingStore.getState().addTyping("channel-1", "user-3", "Charlie");
      });

      const users = useTypingStore.getState().getTypingUsers("channel-1");
      expect(users).toHaveLength(3);
    });
  });

  //#endregion getTypingUsers

  //#region isUserTyping

  describe("isUserTyping", () => {
    it("returns true when user is typing", () => {
      act(() => {
        useTypingStore.getState().addTyping("channel-1", "user-1", "Alice");
      });

      expect(
        useTypingStore.getState().isUserTyping("channel-1", "user-1"),
      ).toBe(true);
    });

    it("returns false when user is not typing", () => {
      act(() => {
        useTypingStore.getState().addTyping("channel-1", "user-1", "Alice");
      });

      expect(
        useTypingStore.getState().isUserTyping("channel-1", "user-2"),
      ).toBe(false);
    });

    it("returns false for non-existent channel", () => {
      expect(
        useTypingStore.getState().isUserTyping("non-existent", "user-1"),
      ).toBe(false);
    });

    it("returns false after user stops typing", () => {
      act(() => {
        useTypingStore.getState().addTyping("channel-1", "user-1", "Alice");
      });

      act(() => {
        useTypingStore.getState().removeTyping("channel-1", "user-1");
      });

      expect(
        useTypingStore.getState().isUserTyping("channel-1", "user-1"),
      ).toBe(false);
    });
  });

  //#endregion isUserTyping

  //#region clearChannel

  describe("clearChannel", () => {
    it("removes all typing users from a channel", () => {
      act(() => {
        useTypingStore.getState().addTyping("channel-1", "user-1", "Alice");
        useTypingStore.getState().addTyping("channel-1", "user-2", "Bob");
      });

      act(() => {
        useTypingStore.getState().clearChannel("channel-1");
      });

      const users = useTypingStore.getState().getTypingUsers("channel-1");
      expect(users).toHaveLength(0);
    });

    it("does not affect other channels", () => {
      act(() => {
        useTypingStore.getState().addTyping("channel-1", "user-1", "Alice");
        useTypingStore.getState().addTyping("channel-2", "user-2", "Bob");
      });

      act(() => {
        useTypingStore.getState().clearChannel("channel-1");
      });

      const channel1Users = useTypingStore
        .getState()
        .getTypingUsers("channel-1");
      const channel2Users = useTypingStore
        .getState()
        .getTypingUsers("channel-2");

      expect(channel1Users).toHaveLength(0);
      expect(channel2Users).toHaveLength(1);
    });

    it("clears all timeouts for the channel", () => {
      act(() => {
        useTypingStore.getState().addTyping("channel-1", "user-1", "Alice");
        useTypingStore.getState().addTyping("channel-1", "user-2", "Bob");
      });

      act(() => {
        useTypingStore.getState().clearChannel("channel-1");
      });

      const state = useTypingStore.getState();
      expect(state.timeoutIds["channel-1:user-1"]).toBeUndefined();
      expect(state.timeoutIds["channel-1:user-2"]).toBeUndefined();
    });

    it("does nothing for non-existent channel", () => {
      act(() => {
        useTypingStore.getState().addTyping("channel-1", "user-1", "Alice");
      });

      act(() => {
        useTypingStore.getState().clearChannel("non-existent");
      });

      const users = useTypingStore.getState().getTypingUsers("channel-1");
      expect(users).toHaveLength(1);
    });
  });

  //#endregion clearChannel

  //#region clearAll

  describe("clearAll", () => {
    it("removes all typing indicators across all channels", () => {
      act(() => {
        useTypingStore.getState().addTyping("channel-1", "user-1", "Alice");
        useTypingStore.getState().addTyping("channel-2", "user-2", "Bob");
        useTypingStore.getState().addTyping("channel-3", "user-3", "Charlie");
      });

      act(() => {
        useTypingStore.getState().clearAll();
      });

      const state = useTypingStore.getState();
      expect(state.typingByChannel).toEqual({});
      expect(state.timeoutIds).toEqual({});
    });

    it("clears all timeouts", () => {
      act(() => {
        useTypingStore
          .getState()
          .addTyping("channel-1", "user-1", "Alice", 10000);
        useTypingStore
          .getState()
          .addTyping("channel-2", "user-2", "Bob", 10000);
      });

      act(() => {
        useTypingStore.getState().clearAll();
      });

      // Advance time past the original timeout
      act(() => {
        jest.advanceTimersByTime(15000);
      });

      // State should remain empty (timeouts were cleared)
      const state = useTypingStore.getState();
      expect(state.typingByChannel).toEqual({});
    });
  });

  //#endregion clearAll

  //#region removeExpired

  describe("removeExpired", () => {
    it("removes expired typing indicators", () => {
      act(() => {
        useTypingStore
          .getState()
          .addTyping("channel-1", "user-1", "Alice", 2000);
        useTypingStore.getState().addTyping("channel-1", "user-2", "Bob", 5000);
      });

      // Advance time past first expiry
      jest.advanceTimersByTime(3000);

      act(() => {
        useTypingStore.getState().removeExpired();
      });

      const users = useTypingStore.getState().getTypingUsers("channel-1");
      expect(users).toHaveLength(1);
      expect(users[0].odUserId).toBe("user-2");
    });

    it("removes empty channel entries after cleanup", () => {
      act(() => {
        useTypingStore
          .getState()
          .addTyping("channel-1", "user-1", "Alice", 1000);
      });

      jest.advanceTimersByTime(2000);

      act(() => {
        useTypingStore.getState().removeExpired();
      });

      const state = useTypingStore.getState();
      expect(state.typingByChannel["channel-1"]).toBeUndefined();
    });

    it("does nothing when no entries are expired", () => {
      act(() => {
        useTypingStore
          .getState()
          .addTyping("channel-1", "user-1", "Alice", 10000);
      });

      act(() => {
        useTypingStore.getState().removeExpired();
      });

      const users = useTypingStore.getState().getTypingUsers("channel-1");
      expect(users).toHaveLength(1);
    });
  });

  //#endregion removeExpired

  //#region Edge Cases

  describe("edge cases", () => {
    it("handles rapid add/remove cycles", () => {
      for (let i = 0; i < 10; i++) {
        act(() => {
          useTypingStore.getState().addTyping("channel-1", "user-1", "Alice");
          useTypingStore.getState().removeTyping("channel-1", "user-1");
        });
      }

      const users = useTypingStore.getState().getTypingUsers("channel-1");
      expect(users).toHaveLength(0);
    });

    it("handles concurrent typing in many channels", () => {
      act(() => {
        for (let i = 0; i < 50; i++) {
          useTypingStore
            .getState()
            .addTyping(`channel-${i}`, `user-${i}`, `User${i}`);
        }
      });

      const state = useTypingStore.getState();
      expect(Object.keys(state.typingByChannel)).toHaveLength(50);
    });

    it("handles very short timeout", () => {
      act(() => {
        useTypingStore.getState().addTyping("channel-1", "user-1", "Alice", 1);
      });

      act(() => {
        jest.advanceTimersByTime(1);
      });

      const users = useTypingStore.getState().getTypingUsers("channel-1");
      expect(users).toHaveLength(0);
    });
  });

  //#endregion Edge Cases
});
