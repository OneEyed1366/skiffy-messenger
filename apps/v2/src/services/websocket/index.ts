// apps/v2/src/services/websocket/index.ts

// Core WebSocket service (T8.01)
export { websocketService } from "./socket";
export type { IWebSocketConfig, IWebSocketEvent } from "./socket";

// Subscriptions integration layer
export { initWebSocketSubscriptions } from "./subscriptions";

// Constants and types
export * from "./constants";
export * from "./types";

// Operators (T8.03)
export * from "./operators";

// Event streams (T8.02)
export * from "./streams";
