import { useCallback, useEffect, useRef, useState } from "react";

//#region Types
export type IScrollPosition = {
  x: number;
  y: number;
};

export type IScrollDirection = "up" | "down" | "left" | "right" | null;

export type IScrollPositionResult = {
  position: IScrollPosition;
  direction: IScrollDirection;
  isScrolling: boolean;
};

export type IScrollPositionOptions = {
  throttleMs?: number;
  elementRef?: React.RefObject<HTMLElement>;
};
//#endregion Types

//#region Constants
const DEFAULT_THROTTLE_MS = 100;
const SCROLL_STOP_DELAY = 150;
//#endregion Constants

//#region useScrollPosition
/**
 * Hook to track scroll position with direction detection for web.
 * Tracks window scroll by default, or a specific element if elementRef is provided.
 * Uses throttling to limit event handler frequency.
 */
export function useScrollPosition(
  options: IScrollPositionOptions = {},
): IScrollPositionResult {
  const { throttleMs = DEFAULT_THROTTLE_MS, elementRef } = options;

  const [position, setPosition] = useState<IScrollPosition>({ x: 0, y: 0 });
  const [direction, setDirection] = useState<IScrollDirection>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const previousPositionRef = useRef<IScrollPosition>({ x: 0, y: 0 });
  const lastUpdateTimeRef = useRef<number>(0);
  const scrollStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const rafIdRef = useRef<number | null>(null);

  const getScrollPosition = useCallback((): IScrollPosition => {
    if (elementRef?.current) {
      return {
        x: elementRef.current.scrollLeft,
        y: elementRef.current.scrollTop,
      };
    }

    if (typeof window === "undefined") {
      return { x: 0, y: 0 };
    }

    return {
      x: window.scrollX ?? window.pageXOffset ?? 0,
      y: window.scrollY ?? window.pageYOffset ?? 0,
    };
  }, [elementRef]);

  const calculateDirection = useCallback(
    (current: IScrollPosition, previous: IScrollPosition): IScrollDirection => {
      const deltaX = current.x - previous.x;
      const deltaY = current.y - previous.y;

      // Prioritize vertical scroll over horizontal
      if (Math.abs(deltaY) >= Math.abs(deltaX)) {
        if (deltaY > 0) return "down";
        if (deltaY < 0) return "up";
      } else {
        if (deltaX > 0) return "right";
        if (deltaX < 0) return "left";
      }

      return null;
    },
    [],
  );

  const handleScroll = useCallback(() => {
    const now = Date.now();

    // Throttle check
    if (now - lastUpdateTimeRef.current < throttleMs) {
      // Schedule RAF for smooth updates
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          rafIdRef.current = null;
          handleScroll();
        });
      }
      return;
    }

    lastUpdateTimeRef.current = now;

    const currentPosition = getScrollPosition();
    const newDirection = calculateDirection(
      currentPosition,
      previousPositionRef.current,
    );

    previousPositionRef.current = currentPosition;

    setPosition(currentPosition);
    setDirection(newDirection);
    setIsScrolling(true);

    // Reset scroll stop timeout
    if (scrollStopTimeoutRef.current !== null) {
      clearTimeout(scrollStopTimeoutRef.current);
    }

    scrollStopTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
      scrollStopTimeoutRef.current = null;
    }, SCROLL_STOP_DELAY);
  }, [throttleMs, getScrollPosition, calculateDirection]);

  // Initialize position on mount
  useEffect(() => {
    const initialPosition = getScrollPosition();
    setPosition(initialPosition);
    previousPositionRef.current = initialPosition;
  }, [getScrollPosition]);

  // Setup scroll event listener
  useEffect(() => {
    const target = elementRef?.current ?? window;

    if (!target || typeof window === "undefined") {
      return;
    }

    target.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      target.removeEventListener("scroll", handleScroll);

      if (scrollStopTimeoutRef.current !== null) {
        clearTimeout(scrollStopTimeoutRef.current);
      }

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [elementRef, handleScroll]);

  return {
    position,
    direction,
    isScrolling,
  };
}
//#endregion useScrollPosition
