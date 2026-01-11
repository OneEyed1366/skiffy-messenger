// apps/v2/src/stores/ephemeral/useDraftsStore.spec.ts

import { act } from "@testing-library/react-native";

import { useDraftsStore } from "./useDraftsStore";

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
    useDraftsStore.getState().clearAllDrafts();
  });
};

//#endregion Test Setup

describe("useDraftsStore", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetStore();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  //#region Initial State

  describe("initial state", () => {
    it("starts with empty drafts", () => {
      const state = useDraftsStore.getState();
      expect(state.drafts).toEqual({});
    });
  });

  //#endregion Initial State

  //#region Key Helpers

  describe("key helpers", () => {
    describe("getChannelDraftKey", () => {
      it("generates correct channel key format", () => {
        const key = useDraftsStore.getState().getChannelDraftKey("channel-123");
        expect(key).toBe("channel:channel-123");
      });

      it("handles various channel IDs", () => {
        const key = useDraftsStore.getState().getChannelDraftKey("abc-def-ghi");
        expect(key).toBe("channel:abc-def-ghi");
      });
    });

    describe("getThreadDraftKey", () => {
      it("generates correct thread key format", () => {
        const key = useDraftsStore
          .getState()
          .getThreadDraftKey("channel-123", "root-456");
        expect(key).toBe("thread:channel-123:root-456");
      });

      it("handles various IDs", () => {
        const key = useDraftsStore
          .getState()
          .getThreadDraftKey("abc-def", "xyz-uvw");
        expect(key).toBe("thread:abc-def:xyz-uvw");
      });
    });
  });

  //#endregion Key Helpers

  //#region setDraft

  describe("setDraft", () => {
    it("creates a new draft with message only", () => {
      act(() => {
        useDraftsStore.getState().setDraft("channel:ch1", "Hello world");
      });

      const draft = useDraftsStore.getState().getDraft("channel:ch1");
      expect(draft).not.toBeNull();
      expect(draft?.message).toBe("Hello world");
      expect(draft?.files).toBeUndefined();
    });

    it("creates a new draft with message and files", () => {
      act(() => {
        useDraftsStore
          .getState()
          .setDraft("channel:ch1", "Check these files", [
            "file-1",
            "file-2",
            "file-3",
          ]);
      });

      const draft = useDraftsStore.getState().getDraft("channel:ch1");
      expect(draft?.message).toBe("Check these files");
      expect(draft?.files).toEqual(["file-1", "file-2", "file-3"]);
    });

    it("sets updatedAt timestamp", () => {
      const beforeTime = Date.now();

      act(() => {
        useDraftsStore.getState().setDraft("channel:ch1", "Test message");
      });

      const afterTime = Date.now();
      const draft = useDraftsStore.getState().getDraft("channel:ch1");

      expect(draft?.updatedAt).toBeGreaterThanOrEqual(beforeTime);
      expect(draft?.updatedAt).toBeLessThanOrEqual(afterTime);
    });

    it("updates existing draft", () => {
      act(() => {
        useDraftsStore.getState().setDraft("channel:ch1", "Original message");
      });

      const originalDraft = useDraftsStore.getState().getDraft("channel:ch1");
      const originalTime = originalDraft?.updatedAt;

      // Small delay to ensure different timestamp
      jest.advanceTimersByTime?.(10) ?? new Promise((r) => setTimeout(r, 10));

      act(() => {
        useDraftsStore
          .getState()
          .setDraft("channel:ch1", "Updated message", ["new-file"]);
      });

      const updatedDraft = useDraftsStore.getState().getDraft("channel:ch1");
      expect(updatedDraft?.message).toBe("Updated message");
      expect(updatedDraft?.files).toEqual(["new-file"]);
      expect(updatedDraft?.updatedAt).toBeGreaterThanOrEqual(originalTime ?? 0);
    });

    it("handles multiple drafts independently", () => {
      act(() => {
        useDraftsStore.getState().setDraft("channel:ch1", "Channel 1 draft");
        useDraftsStore.getState().setDraft("channel:ch2", "Channel 2 draft");
        useDraftsStore
          .getState()
          .setDraft("thread:ch1:root1", "Thread 1 draft");
      });

      expect(useDraftsStore.getState().getDraft("channel:ch1")?.message).toBe(
        "Channel 1 draft",
      );
      expect(useDraftsStore.getState().getDraft("channel:ch2")?.message).toBe(
        "Channel 2 draft",
      );
      expect(
        useDraftsStore.getState().getDraft("thread:ch1:root1")?.message,
      ).toBe("Thread 1 draft");
    });

    it("handles empty message", () => {
      act(() => {
        useDraftsStore.getState().setDraft("channel:ch1", "");
      });

      const draft = useDraftsStore.getState().getDraft("channel:ch1");
      expect(draft?.message).toBe("");
    });

    it("handles empty files array", () => {
      act(() => {
        useDraftsStore.getState().setDraft("channel:ch1", "Message", []);
      });

      const draft = useDraftsStore.getState().getDraft("channel:ch1");
      expect(draft?.files).toEqual([]);
    });
  });

  //#endregion setDraft

  //#region getDraft

  describe("getDraft", () => {
    it("returns null for non-existent draft", () => {
      const draft = useDraftsStore.getState().getDraft("non-existent");
      expect(draft).toBeNull();
    });

    it("returns draft data for existing draft", () => {
      act(() => {
        useDraftsStore.getState().setDraft("channel:ch1", "Test", ["file-1"]);
      });

      const draft = useDraftsStore.getState().getDraft("channel:ch1");
      expect(draft).toEqual({
        message: "Test",
        files: ["file-1"],
        updatedAt: expect.any(Number),
      });
    });

    it("returns null after draft is removed", () => {
      act(() => {
        useDraftsStore.getState().setDraft("channel:ch1", "Test");
      });

      act(() => {
        useDraftsStore.getState().removeDraft("channel:ch1");
      });

      const draft = useDraftsStore.getState().getDraft("channel:ch1");
      expect(draft).toBeNull();
    });
  });

  //#endregion getDraft

  //#region removeDraft

  describe("removeDraft", () => {
    it("removes existing draft", () => {
      act(() => {
        useDraftsStore.getState().setDraft("channel:ch1", "Test");
      });

      act(() => {
        useDraftsStore.getState().removeDraft("channel:ch1");
      });

      expect(useDraftsStore.getState().getDraft("channel:ch1")).toBeNull();
    });

    it("does not affect other drafts", () => {
      act(() => {
        useDraftsStore.getState().setDraft("channel:ch1", "Draft 1");
        useDraftsStore.getState().setDraft("channel:ch2", "Draft 2");
      });

      act(() => {
        useDraftsStore.getState().removeDraft("channel:ch1");
      });

      expect(useDraftsStore.getState().getDraft("channel:ch1")).toBeNull();
      expect(useDraftsStore.getState().getDraft("channel:ch2")?.message).toBe(
        "Draft 2",
      );
    });

    it("does nothing when removing non-existent draft", () => {
      act(() => {
        useDraftsStore.getState().setDraft("channel:ch1", "Test");
      });

      act(() => {
        useDraftsStore.getState().removeDraft("non-existent");
      });

      expect(useDraftsStore.getState().getDraft("channel:ch1")?.message).toBe(
        "Test",
      );
    });

    it("handles removing from empty store", () => {
      act(() => {
        useDraftsStore.getState().removeDraft("any-key");
      });

      expect(useDraftsStore.getState().drafts).toEqual({});
    });
  });

  //#endregion removeDraft

  //#region clearAllDrafts

  describe("clearAllDrafts", () => {
    it("removes all drafts", () => {
      act(() => {
        useDraftsStore.getState().setDraft("channel:ch1", "Draft 1");
        useDraftsStore.getState().setDraft("channel:ch2", "Draft 2");
        useDraftsStore.getState().setDraft("thread:ch1:root1", "Draft 3");
      });

      act(() => {
        useDraftsStore.getState().clearAllDrafts();
      });

      expect(useDraftsStore.getState().drafts).toEqual({});
      expect(useDraftsStore.getState().getDraft("channel:ch1")).toBeNull();
      expect(useDraftsStore.getState().getDraft("channel:ch2")).toBeNull();
      expect(useDraftsStore.getState().getDraft("thread:ch1:root1")).toBeNull();
    });

    it("does nothing on already empty store", () => {
      act(() => {
        useDraftsStore.getState().clearAllDrafts();
      });

      expect(useDraftsStore.getState().drafts).toEqual({});
    });
  });

  //#endregion clearAllDrafts

  //#region Integration

  describe("integration", () => {
    it("uses key helpers with actions correctly", () => {
      const channelKey = useDraftsStore.getState().getChannelDraftKey("ch123");
      const threadKey = useDraftsStore
        .getState()
        .getThreadDraftKey("ch123", "root456");

      act(() => {
        useDraftsStore.getState().setDraft(channelKey, "Channel draft");
        useDraftsStore.getState().setDraft(threadKey, "Thread draft");
      });

      expect(useDraftsStore.getState().getDraft(channelKey)?.message).toBe(
        "Channel draft",
      );
      expect(useDraftsStore.getState().getDraft(threadKey)?.message).toBe(
        "Thread draft",
      );

      act(() => {
        useDraftsStore.getState().removeDraft(channelKey);
      });

      expect(useDraftsStore.getState().getDraft(channelKey)).toBeNull();
      expect(useDraftsStore.getState().getDraft(threadKey)?.message).toBe(
        "Thread draft",
      );
    });

    it("handles rapid updates correctly", () => {
      act(() => {
        for (let i = 0; i < 100; i++) {
          useDraftsStore.getState().setDraft("channel:ch1", `Message ${i}`);
        }
      });

      expect(useDraftsStore.getState().getDraft("channel:ch1")?.message).toBe(
        "Message 99",
      );
    });

    it("handles many drafts", () => {
      act(() => {
        for (let i = 0; i < 50; i++) {
          useDraftsStore.getState().setDraft(`channel:ch${i}`, `Draft ${i}`);
        }
      });

      expect(Object.keys(useDraftsStore.getState().drafts)).toHaveLength(50);

      for (let i = 0; i < 50; i++) {
        expect(
          useDraftsStore.getState().getDraft(`channel:ch${i}`)?.message,
        ).toBe(`Draft ${i}`);
      }
    });
  });

  //#endregion Integration

  //#region Edge Cases

  describe("edge cases", () => {
    it("handles special characters in keys", () => {
      const key = "channel:with-special_chars.and:colons";

      act(() => {
        useDraftsStore.getState().setDraft(key, "Special key draft");
      });

      expect(useDraftsStore.getState().getDraft(key)?.message).toBe(
        "Special key draft",
      );
    });

    it("handles very long messages", () => {
      const longMessage = "A".repeat(10000);

      act(() => {
        useDraftsStore.getState().setDraft("channel:ch1", longMessage);
      });

      expect(useDraftsStore.getState().getDraft("channel:ch1")?.message).toBe(
        longMessage,
      );
    });

    it("handles unicode in messages", () => {
      const unicodeMessage = "Hello 世界 🌍 مرحبا";

      act(() => {
        useDraftsStore.getState().setDraft("channel:ch1", unicodeMessage);
      });

      expect(useDraftsStore.getState().getDraft("channel:ch1")?.message).toBe(
        unicodeMessage,
      );
    });

    it("handles clearing and re-adding drafts", () => {
      act(() => {
        useDraftsStore.getState().setDraft("channel:ch1", "First draft");
      });

      act(() => {
        useDraftsStore.getState().clearAllDrafts();
      });

      act(() => {
        useDraftsStore.getState().setDraft("channel:ch1", "Second draft");
      });

      expect(useDraftsStore.getState().getDraft("channel:ch1")?.message).toBe(
        "Second draft",
      );
    });
  });

  //#endregion Edge Cases
});
