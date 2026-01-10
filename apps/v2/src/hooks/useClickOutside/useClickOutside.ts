// apps/v2/src/hooks/useClickOutside/useClickOutside.ts

import { useEffect, useRef } from "react";
import { Platform } from "react-native";

//#region Types

export type IClickOutsideEventType = "mousedown" | "mouseup" | "click";

export type IClickOutsideOptions = {
  /** Event type to listen for. Default: "mousedown" */
  eventType?: IClickOutsideEventType;
  /** Whether the listener is active. Default: true */
  enabled?: boolean;
};

//#endregion Types

//#region Constants

const DEFAULT_EVENT_TYPE: IClickOutsideEventType = "mousedown";

//#endregion Constants

//#region useClickOutside

/**
 * Hook to detect clicks outside a referenced element.
 * Web only - attaches document event listener.
 *
 * @param ref - RefObject pointing to the element to monitor
 * @param handler - Callback fired when click occurs outside the element
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * function Dropdown() {
 *   const ref = useRef<HTMLDivElement>(null);
 *   const [isOpen, setIsOpen] = useState(true);
 *
 *   useClickOutside(ref, () => setIsOpen(false), { enabled: isOpen });
 *
 *   return isOpen ? <div ref={ref}>Dropdown content</div> : null;
 * }
 * ```
 */
export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: (event: MouseEvent) => void,
  options: IClickOutsideOptions = {},
): void {
  const { eventType = DEFAULT_EVENT_TYPE, enabled = true } = options;

  // Store handler in ref to avoid re-attaching listener when handler changes
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    // No-op on native platforms
    if (Platform.OS !== "web") {
      return;
    }

    if (!enabled) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const element = ref.current;

      // If element doesn't exist or click is inside, do nothing
      if (!element || element.contains(event.target as Node)) {
        return;
      }

      handlerRef.current(event);
    };

    document.addEventListener(eventType, handleClickOutside);

    return () => {
      document.removeEventListener(eventType, handleClickOutside);
    };
  }, [ref, eventType, enabled]);
}

//#endregion useClickOutside
