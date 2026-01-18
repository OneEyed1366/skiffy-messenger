// apps/v2/src/services/websocket/streams/cloud$.ts

import { filter, map, share } from "rxjs";
import { websocketService, IWebSocketEvent } from "../socket";

//#region Types

const CLOUD_EVENTS = [
  "cloud_payment_status_updated",
  "cloud_subscription_changed",
  "hosted_customer_signup_progress_updated",
] as const;

type ICloudEventType = (typeof CLOUD_EVENTS)[number];

type ICloudEventData = {
  subscription?: string;
  limits?: string;
  progress?: string;
};

export type ICloudEventPayload = {
  type: ICloudEventType;
  subscription: ICloudSubscription | null;
  limits: ICloudLimits | null;
  progress: ISignupProgress | null;
};

type ICloudSubscription = {
  id: string;
  customer_id: string;
  product_id: string;
  start_at: number;
  end_at: number;
  create_at: number;
  seats: number;
  is_paid_tier: string;
  last_invoice: unknown;
};

type ICloudLimits = {
  messages: { history: number };
  files: { total_storage: number };
  teams: { active: number };
  boards: { cards: number; views: number };
  integrations: { enabled: number };
};

type ISignupProgress = {
  step: string;
  completed: boolean;
};

//#endregion Types

//#region Stream

export const cloud$ = websocketService.events$.pipe(
  filter((msg): msg is IWebSocketEvent<ICloudEventData> =>
    CLOUD_EVENTS.includes(msg.event as ICloudEventType),
  ),
  map((msg): ICloudEventPayload => {
    let subscription: ICloudSubscription | null = null;
    let limits: ICloudLimits | null = null;
    let progress: ISignupProgress | null = null;

    try {
      if (msg.data.subscription) {
        subscription = JSON.parse(msg.data.subscription) as ICloudSubscription;
      }
      if (msg.data.limits) {
        limits = JSON.parse(msg.data.limits) as ICloudLimits;
      }
      if (msg.data.progress) {
        progress = JSON.parse(msg.data.progress) as ISignupProgress;
      }
    } catch {
      console.warn("[cloud$] Failed to parse cloud data");
    }

    return {
      type: msg.event as ICloudEventType,
      subscription,
      limits,
      progress,
    };
  }),
  share(),
);

//#endregion Stream
