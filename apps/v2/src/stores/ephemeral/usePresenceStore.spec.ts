// apps/v2/src/stores/ephemeral/usePresenceStore.spec.ts

import { act } from "@testing-library/react-native";

import { usePresenceStore } from "./usePresenceStore";

// Mock Platform
jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
  },
}));

// Mock zustand middleware
jest.mock("zustand/middleware", () => ({
  devtools: (fn: unknown) => fn,
  persist: (fn: unknown) => fn,
  createJSONStorage: () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }),
}));

describe("usePresenceStore", () => {
  beforeEach(() => {
    act(() => {
      usePresenceStore.setState({
        presences: {},
        lastActivity: {},
      });
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  //#region Initial State

  describe("initial state", () => {
    it("has empty presences by default", () => {
      const state = usePresenceStore.getState();
      expect(state.presences).toEqual({});
    });

    it("has empty lastActivity by default", () => {
      const state = usePresenceStore.getState();
      expect(state.lastActivity).toEqual({});
    });
  });

  //#endregion Initial State

  //#region setPresence

  describe("setPresence", () => {
    it("sets presence for a user", () => {
      const now = Date.now();
      jest.setSystemTime(now);

      act(() => {
        usePresenceStore.getState().setPresence("user-1", "online");
      });

      const state = usePresenceStore.getState();
      expect(state.presences["user-1"]).toBe("online");
    });

    it("updates lastActivity when setting presence", () => {
      const now = Date.now();
      jest.setSystemTime(now);

      act(() => {
        usePresenceStore.getState().setPresence("user-1", "online");
      });

      const state = usePresenceStore.getState();
      expect(state.lastActivity["user-1"]).toBe(now);
    });

    it("can set different presence statuses", () => {
      act(() => {
        usePresenceStore.getState().setPresence("user-1", "online");
        usePresenceStore.getState().setPresence("user-2", "away");
        usePresenceStore.getState().setPresence("user-3", "dnd");
        usePresenceStore.getState().setPresence("user-4", "offline");
      });

      const state = usePresenceStore.getState();
      expect(state.presences["user-1"]).toBe("online");
      expect(state.presences["user-2"]).toBe("away");
      expect(state.presences["user-3"]).toBe("dnd");
      expect(state.presences["user-4"]).toBe("offline");
    });

    it("overwrites existing presence for same user", () => {
      act(() => {
        usePresenceStore.getState().setPresence("user-1", "online");
      });

      expect(usePresenceStore.getState().presences["user-1"]).toBe("online");

      act(() => {
        usePresenceStore.getState().setPresence("user-1", "away");
      });

      expect(usePresenceStore.getState().presences["user-1"]).toBe("away");
    });

    it("preserves other users presences when updating one user", () => {
      act(() => {
        usePresenceStore.getState().setPresence("user-1", "online");
        usePresenceStore.getState().setPresence("user-2", "away");
      });

      act(() => {
        usePresenceStore.getState().setPresence("user-1", "dnd");
      });

      const state = usePresenceStore.getState();
      expect(state.presences["user-1"]).toBe("dnd");
      expect(state.presences["user-2"]).toBe("away");
    });
  });

  //#endregion setPresence

  //#region setPresences

  describe("setPresences", () => {
    it("sets multiple presences at once", () => {
      const now = Date.now();
      jest.setSystemTime(now);

      act(() => {
        usePresenceStore.getState().setPresences({
          "user-1": "online",
          "user-2": "away",
          "user-3": "dnd",
        });
      });

      const state = usePresenceStore.getState();
      expect(state.presences["user-1"]).toBe("online");
      expect(state.presences["user-2"]).toBe("away");
      expect(state.presences["user-3"]).toBe("dnd");
    });

    it("updates lastActivity for all users in batch", () => {
      const now = Date.now();
      jest.setSystemTime(now);

      act(() => {
        usePresenceStore.getState().setPresences({
          "user-1": "online",
          "user-2": "away",
        });
      });

      const state = usePresenceStore.getState();
      expect(state.lastActivity["user-1"]).toBe(now);
      expect(state.lastActivity["user-2"]).toBe(now);
    });

    it("merges with existing presences", () => {
      act(() => {
        usePresenceStore.getState().setPresence("user-1", "online");
      });

      act(() => {
        usePresenceStore.getState().setPresences({
          "user-2": "away",
        });
      });

      const state = usePresenceStore.getState();
      expect(state.presences["user-1"]).toBe("online");
      expect(state.presences["user-2"]).toBe("away");
    });

    it("overwrites existing presences for same users", () => {
      act(() => {
        usePresenceStore.getState().setPresence("user-1", "online");
      });

      act(() => {
        usePresenceStore.getState().setPresences({
          "user-1": "dnd",
          "user-2": "away",
        });
      });

      const state = usePresenceStore.getState();
      expect(state.presences["user-1"]).toBe("dnd");
      expect(state.presences["user-2"]).toBe("away");
    });

    it("handles empty object", () => {
      act(() => {
        usePresenceStore.getState().setPresence("user-1", "online");
      });

      act(() => {
        usePresenceStore.getState().setPresences({});
      });

      const state = usePresenceStore.getState();
      expect(state.presences["user-1"]).toBe("online");
    });
  });

  //#endregion setPresences

  //#region updateLastActivity

  describe("updateLastActivity", () => {
    it("updates lastActivity timestamp", () => {
      const initialTime = Date.now();
      jest.setSystemTime(initialTime);

      act(() => {
        usePresenceStore.getState().setPresence("user-1", "online");
      });

      const laterTime = initialTime + 60000;
      jest.setSystemTime(laterTime);

      act(() => {
        usePresenceStore.getState().updateLastActivity("user-1");
      });

      const state = usePresenceStore.getState();
      expect(state.lastActivity["user-1"]).toBe(laterTime);
    });

    it("can update activity for user without presence", () => {
      const now = Date.now();
      jest.setSystemTime(now);

      act(() => {
        usePresenceStore.getState().updateLastActivity("user-1");
      });

      const state = usePresenceStore.getState();
      expect(state.lastActivity["user-1"]).toBe(now);
      expect(state.presences["user-1"]).toBeUndefined();
    });

    it("does not affect other users lastActivity", () => {
      const initialTime = Date.now();
      jest.setSystemTime(initialTime);

      act(() => {
        usePresenceStore.getState().setPresence("user-1", "online");
        usePresenceStore.getState().setPresence("user-2", "online");
      });

      const laterTime = initialTime + 60000;
      jest.setSystemTime(laterTime);

      act(() => {
        usePresenceStore.getState().updateLastActivity("user-1");
      });

      const state = usePresenceStore.getState();
      expect(state.lastActivity["user-1"]).toBe(laterTime);
      expect(state.lastActivity["user-2"]).toBe(initialTime);
    });
  });

  //#endregion updateLastActivity

  //#region getPresence

  describe("getPresence", () => {
    it("returns presence for existing user", () => {
      act(() => {
        usePresenceStore.getState().setPresence("user-1", "online");
      });

      const presence = usePresenceStore.getState().getPresence("user-1");
      expect(presence).toBe("online");
    });

    it("returns offline for unknown user", () => {
      const presence = usePresenceStore.getState().getPresence("unknown-user");
      expect(presence).toBe("offline");
    });

    it("returns correct presence after update", () => {
      act(() => {
        usePresenceStore.getState().setPresence("user-1", "online");
      });

      expect(usePresenceStore.getState().getPresence("user-1")).toBe("online");

      act(() => {
        usePresenceStore.getState().setPresence("user-1", "away");
      });

      expect(usePresenceStore.getState().getPresence("user-1")).toBe("away");
    });
  });

  //#endregion getPresence

  //#region clearPresences

  describe("clearPresences", () => {
    it("clears all presences", () => {
      act(() => {
        usePresenceStore.getState().setPresence("user-1", "online");
        usePresenceStore.getState().setPresence("user-2", "away");
      });

      expect(Object.keys(usePresenceStore.getState().presences).length).toBe(2);

      act(() => {
        usePresenceStore.getState().clearPresences();
      });

      expect(usePresenceStore.getState().presences).toEqual({});
    });

    it("clears all lastActivity", () => {
      act(() => {
        usePresenceStore.getState().setPresence("user-1", "online");
        usePresenceStore.getState().setPresence("user-2", "away");
      });

      expect(
        Object.keys(usePresenceStore.getState().lastActivity).length,
      ).toBe(2);

      act(() => {
        usePresenceStore.getState().clearPresences();
      });

      expect(usePresenceStore.getState().lastActivity).toEqual({});
    });

    it("allows setting new presences after clear", () => {
      act(() => {
        usePresenceStore.getState().setPresence("user-1", "online");
      });

      act(() => {
        usePresenceStore.getState().clearPresences();
      });

      act(() => {
        usePresenceStore.getState().setPresence("user-2", "dnd");
      });

      const state = usePresenceStore.getState();
      expect(state.presences["user-1"]).toBeUndefined();
      expect(state.presences["user-2"]).toBe("dnd");
    });
  });

  //#endregion clearPresences

  //#region Subscription

  describe("subscription", () => {
    it("notifies subscribers on presence change", () => {
      const listener = jest.fn();
      const unsubscribe = usePresenceStore.subscribe(listener);

      act(() => {
        usePresenceStore.getState().setPresence("user-1", "online");
      });

      expect(listener).toHaveBeenCalled();

      unsubscribe();
    });

    it("notifies subscribers on batch presence change", () => {
      const listener = jest.fn();
      const unsubscribe = usePresenceStore.subscribe(listener);

      act(() => {
        usePresenceStore.getState().setPresences({
          "user-1": "online",
          "user-2": "away",
        });
      });

      expect(listener).toHaveBeenCalled();

      unsubscribe();
    });

    it("notifies subscribers on clear", () => {
      act(() => {
        usePresenceStore.getState().setPresence("user-1", "online");
      });

      const listener = jest.fn();
      const unsubscribe = usePresenceStore.subscribe(listener);

      act(() => {
        usePresenceStore.getState().clearPresences();
      });

      expect(listener).toHaveBeenCalled();

      unsubscribe();
    });
  });

  //#endregion Subscription
});
