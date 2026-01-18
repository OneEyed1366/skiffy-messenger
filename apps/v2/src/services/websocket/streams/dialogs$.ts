// apps/v2/src/services/websocket/streams/dialogs$.ts

import { filter, map, share } from "rxjs";
import { websocketService, IWebSocketEvent } from "../socket";

//#region Types

const DIALOG_EVENTS = ["open_dialog"] as const;

type IDialogEventType = (typeof DIALOG_EVENTS)[number];

type IDialogEventData = {
  dialog?: string;
  trigger_id?: string;
};

export type IDialogEventPayload = {
  type: IDialogEventType;
  dialog: IInteractiveDialog | null;
  triggerId: string;
};

type IInteractiveDialog = {
  url: string;
  trigger_id: string;
  callback_id: string;
  title: string;
  introduction_text?: string;
  submit_label?: string;
  notify_on_cancel?: boolean;
  state?: string;
  elements: IDialogElement[];
};

type IDialogElement = {
  display_name: string;
  name: string;
  type: "text" | "textarea" | "select" | "bool" | "radio";
  subtype?: string;
  default?: string;
  placeholder?: string;
  help_text?: string;
  optional?: boolean;
  min_length?: number;
  max_length?: number;
  options?: { text: string; value: string }[];
};

//#endregion Types

//#region Stream

export const dialogs$ = websocketService.events$.pipe(
  filter((msg): msg is IWebSocketEvent<IDialogEventData> =>
    DIALOG_EVENTS.includes(msg.event as IDialogEventType),
  ),
  map((msg): IDialogEventPayload => {
    let dialog: IInteractiveDialog | null = null;
    try {
      if (msg.data.dialog) {
        dialog = JSON.parse(msg.data.dialog) as IInteractiveDialog;
      }
    } catch {
      console.warn("[dialogs$] Failed to parse dialog data");
    }
    return {
      type: msg.event as IDialogEventType,
      dialog,
      triggerId: msg.data.trigger_id || dialog?.trigger_id || "",
    };
  }),
  share(),
);

//#endregion Stream
