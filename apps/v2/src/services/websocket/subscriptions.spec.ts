// apps/v2/src/services/websocket/subscriptions.spec.ts

import { Subject } from "rxjs";
import { QueryClient } from "@tanstack/react-query";
import { useConnectionStore } from "@/stores/connection";
import { useTypingStore } from "@/stores/ephemeral/useTypingStore";
import { usePresenceStore } from "@/stores/ephemeral/usePresenceStore";
import { useDraftsStore } from "@/stores/ephemeral/useDraftsStore";
import { queryKeys } from "@/queries/keys";

//#region Mocks

// Create mock subjects - accessible via getter functions
const createMockStreams = () => ({
  posts$: new Subject(),
  typing$: new Subject(),
  channels$: new Subject(),
  users$: new Subject(),
  teams$: new Subject(),
  reactions$: new Subject(),
  threads$: new Subject(),
  preferences$: new Subject(),
  drafts$: new Subject(),
  sidebar$: new Subject(),
  system$: new Subject(),
});

let mockStreams = createMockStreams();

// Mock the streams module - factory returns current mockStreams
jest.mock("./streams", () => {
  return {
    get posts$() {
      return mockStreams.posts$;
    },
    get typing$() {
      return mockStreams.typing$;
    },
    get channels$() {
      return mockStreams.channels$;
    },
    get users$() {
      return mockStreams.users$;
    },
    get teams$() {
      return mockStreams.teams$;
    },
    get reactions$() {
      return mockStreams.reactions$;
    },
    get threads$() {
      return mockStreams.threads$;
    },
    get preferences$() {
      return mockStreams.preferences$;
    },
    get drafts$() {
      return mockStreams.drafts$;
    },
    get sidebar$() {
      return mockStreams.sidebar$;
    },
    get system$() {
      return mockStreams.system$;
    },
  };
});

// Import after mock setup
import { initWebSocketSubscriptions } from "./subscriptions";

//#endregion Mocks

//#region Setup

describe("WebSocket Subscriptions", () => {
  let queryClient: QueryClient;
  let cleanup: (() => void) | undefined;

  beforeEach(() => {
    // Create fresh mock streams for each test
    mockStreams = createMockStreams();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    // Reset stores
    useConnectionStore.getState().reset();
    useTypingStore.getState().clearAll();
    usePresenceStore.getState().clearPresences();
    useDraftsStore.getState().clearAllDrafts();

    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup?.();
    cleanup = undefined;
    queryClient.clear();
  });

  //#endregion Setup

  //#region initWebSocketSubscriptions

  describe("initWebSocketSubscriptions", () => {
    it("returns cleanup function", () => {
      cleanup = initWebSocketSubscriptions(queryClient);

      expect(typeof cleanup).toBe("function");
    });

    it("logs initialization message", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      cleanup = initWebSocketSubscriptions(queryClient);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[WS Subscriptions] Initialized"),
      );

      consoleSpy.mockRestore();
    });

    it("logs cleanup message on cleanup", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      cleanup = initWebSocketSubscriptions(queryClient);
      cleanup();
      cleanup = undefined;

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[WS Subscriptions] Cleaned up"),
      );

      consoleSpy.mockRestore();
    });

    it("accepts optional user context", () => {
      expect(() => {
        cleanup = initWebSocketSubscriptions(queryClient, {
          currentUserId: "user-123",
          currentTeamId: "team-456",
        });
      }).not.toThrow();
    });
  });

  //#endregion initWebSocketSubscriptions

  //#region Typing Subscription

  describe("typing subscription", () => {
    it("adds typing indicator when isTyping is true", () => {
      cleanup = initWebSocketSubscriptions(queryClient);

      mockStreams.typing$.next({
        channelId: "channel-1",
        userId: "user-1",
        parentId: "",
        isTyping: true,
      });

      expect(useTypingStore.getState().isUserTyping("channel-1", "user-1")).toBe(
        true,
      );
    });

    it("removes typing indicator when isTyping is false", () => {
      cleanup = initWebSocketSubscriptions(queryClient);

      // First add typing
      mockStreams.typing$.next({
        channelId: "channel-1",
        userId: "user-1",
        parentId: "",
        isTyping: true,
      });

      // Then remove
      mockStreams.typing$.next({
        channelId: "channel-1",
        userId: "user-1",
        parentId: "",
        isTyping: false,
      });

      expect(useTypingStore.getState().isUserTyping("channel-1", "user-1")).toBe(
        false,
      );
    });
  });

  //#endregion Typing Subscription

  //#region System Subscription

  describe("system subscription", () => {
    it("sets connection ID on hello event", () => {
      cleanup = initWebSocketSubscriptions(queryClient);

      mockStreams.system$.next({
        type: "hello",
        connectionId: "conn-123",
        serverVersion: "1.0.0",
        data: {},
      });

      expect(useConnectionStore.getState().connectionId).toBe("conn-123");
    });
  });

  //#endregion System Subscription

  //#region Presence Subscription

  describe("presence subscription (via users$)", () => {
    it("updates presence on status_change event", () => {
      cleanup = initWebSocketSubscriptions(queryClient);

      mockStreams.users$.next({
        type: "status_change",
        user: null,
        userId: "user-1",
        status: "online",
      });

      expect(usePresenceStore.getState().getPresence("user-1")).toBe("online");
    });

    it("maps away status correctly", () => {
      cleanup = initWebSocketSubscriptions(queryClient);

      mockStreams.users$.next({
        type: "status_change",
        user: null,
        userId: "user-2",
        status: "away",
      });

      expect(usePresenceStore.getState().getPresence("user-2")).toBe("away");
    });

    it("maps dnd status correctly", () => {
      cleanup = initWebSocketSubscriptions(queryClient);

      mockStreams.users$.next({
        type: "status_change",
        user: null,
        userId: "user-3",
        status: "dnd",
      });

      expect(usePresenceStore.getState().getPresence("user-3")).toBe("dnd");
    });
  });

  //#endregion Presence Subscription

  //#region Drafts Subscription

  describe("drafts subscription", () => {
    it("sets draft on draft_created event", () => {
      cleanup = initWebSocketSubscriptions(queryClient);

      mockStreams.drafts$.next({
        type: "draft_created",
        draft: { message: "Hello world", root_id: "" },
        channelId: "channel-1",
      });

      const key = useDraftsStore.getState().getChannelDraftKey("channel-1");
      const draft = useDraftsStore.getState().getDraft(key);

      expect(draft?.message).toBe("Hello world");
    });

    it("removes draft on draft_deleted event", () => {
      const store = useDraftsStore.getState();
      const key = store.getChannelDraftKey("channel-1");
      store.setDraft(key, "Test draft");

      cleanup = initWebSocketSubscriptions(queryClient);

      mockStreams.drafts$.next({
        type: "draft_deleted",
        draft: { message: "", root_id: "" },
        channelId: "channel-1",
      });

      expect(store.getDraft(key)).toBeNull();
    });
  });

  //#endregion Drafts Subscription

  //#region Reconnection Recovery

  describe("reconnection recovery", () => {
    it("invalidates queries after reconnection", () => {
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      cleanup = initWebSocketSubscriptions(queryClient);

      // Simulate reconnection sequence
      useConnectionStore.getState().setReconnecting();
      useConnectionStore.getState().setConnected();

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.posts.all,
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.channels.all,
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.threads.all,
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[WS Recovery]"),
      );

      consoleSpy.mockRestore();
    });

    it("does not invalidate on initial connection", () => {
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      cleanup = initWebSocketSubscriptions(queryClient);

      // Initial connection without prior reconnecting state
      useConnectionStore.getState().setConnected();

      expect(invalidateSpy).not.toHaveBeenCalled();
    });
  });

  //#endregion Reconnection Recovery
});
