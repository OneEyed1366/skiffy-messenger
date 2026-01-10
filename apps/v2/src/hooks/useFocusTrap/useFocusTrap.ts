// apps/v2/src/hooks/useFocusTrap/useFocusTrap.ts

/**
 * Focus trap hook for modal accessibility
 * Migrated from: vendor/desktop/webapp/platform/components/src/hooks/useFocusTrap.ts
 *
 * @platform web - Uses DOM APIs not available in React Native
 */

import { useEffect, useRef } from "react";

//#region Types

type IFocusTrapOptions = {
  /** Focus first focusable element on mount (default: false) */
  initialFocus?: boolean;
  /** Restore focus to previously focused element on unmount (default: false) */
  restoreFocus?: boolean;
  /** Delay before initializing trap in ms (default: 0) */
  delayMs?: number;
};

//#endregion Types

//#region Constants

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

//#endregion Constants

//#region Global Stack

// Stack for nested focus traps - only topmost trap handles events
const activeFocusTraps: HTMLElement[] = [];

//#endregion Global Stack

//#region Helper Functions

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
  return Array.from(elements).filter(isElementVisible);
}

function isElementVisible(element: HTMLElement): boolean {
  if (element.offsetParent === null) return false;
  const style = window.getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden";
}

//#endregion Helper Functions

//#region Hook

/**
 * Trap keyboard focus within a container element
 *
 * @param isActive - Whether the trap is active
 * @param containerRef - Ref to the container element
 * @param options - Configuration options
 *
 * @example
 * function Modal({ isOpen, onClose, children }) {
 *   const containerRef = useRef<HTMLDivElement>(null);
 *   useFocusTrap(isOpen, containerRef, { initialFocus: true, restoreFocus: true });
 *
 *   return isOpen ? (
 *     <div ref={containerRef} role="dialog" aria-modal="true">
 *       {children}
 *       <button onClick={onClose}>Close</button>
 *     </div>
 *   ) : null;
 * }
 */
export function useFocusTrap(
  isActive: boolean,
  containerRef: React.RefObject<HTMLElement | null>,
  options: IFocusTrapOptions = {},
): void {
  const { initialFocus = false, restoreFocus = false, delayMs = 0 } = options;
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const focusableElementsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;

    // Save currently focused element for restoration
    if (restoreFocus) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement;
    }

    const initializeTrap = () => {
      // Add to stack
      activeFocusTraps.push(container);

      // Get focusable elements
      focusableElementsRef.current = getFocusableElements(container);

      // Focus first element if requested
      if (initialFocus && focusableElementsRef.current.length > 0) {
        focusableElementsRef.current[0].focus();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle if we're the topmost trap
      if (activeFocusTraps[activeFocusTraps.length - 1] !== container) return;
      if (event.key !== "Tab") return;

      // Refresh focusable elements (DOM may have changed)
      focusableElementsRef.current = getFocusableElements(container);
      const focusable = focusableElementsRef.current;

      if (focusable.length === 0) return;

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (event.shiftKey) {
        // Shift+Tab: if on first element, wrap to last
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: if on last element, wrap to first
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Initialize with optional delay
    const timeoutId = setTimeout(initializeTrap, delayMs);
    document.addEventListener("keydown", handleKeyDown);

    // Set up MutationObserver to refresh focusable elements
    const observer = new MutationObserver(() => {
      focusableElementsRef.current = getFocusableElements(container);
    });
    observer.observe(container, { childList: true, subtree: true });

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("keydown", handleKeyDown);
      observer.disconnect();

      // Remove from stack
      const index = activeFocusTraps.indexOf(container);
      if (index !== -1) {
        activeFocusTraps.splice(index, 1);
      }

      // Restore focus
      if (restoreFocus && previouslyFocusedRef.current) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [isActive, containerRef, initialFocus, restoreFocus, delayMs]);
}

//#endregion Hook
