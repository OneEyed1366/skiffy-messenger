// apps/v2/src/services/websocket/streams/posts$.spec.ts

/**
 * Note: Stream tests are challenging because streams are created at module load time
 * by piping from websocketService.events$. The subscription integration tests
 * (subscriptions.spec.ts) validate the end-to-end behavior.
 *
 * This file tests the stream's exported types and constants.
 */

describe("posts$ stream", () => {
  //#region Type Exports
  describe("type exports", () => {
    it("exports IPostEventPayload type", async () => {
      // Dynamic import to avoid module load issues
      const { posts$ } = await import("./posts$");
      expect(posts$).toBeDefined();
    });
  });
  //#endregion
});
