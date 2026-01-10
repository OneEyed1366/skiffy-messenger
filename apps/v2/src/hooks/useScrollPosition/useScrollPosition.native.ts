import { useCallback, useRef, useState } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

//#region Types
export type IScrollPosition = {
  x: number;
  y: number;
};

export type IScrollDirection = "up" | "down" | "left" | "right" | null;

export type IScrollPositionResult = {
  position: IScrollPosition;
  direction: IScrollDirection;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollEventThrottle: number;
};

export type IScrollPositionOptions = {
  throttleMs?: number;
};
//#endregion Types

//#region Constants
const DEFAULT_THROTTLE_MS = 16; // ~60fps for smooth scrolling on mobile
//#endregion Constants

//#region useScrollPosition
/**
 * Hook to track scroll position with direction detection for React Native.
 * Returns an onScroll handler to be attached to ScrollView/FlatList.
 * Uses scrollEventThrottle for native-level throttling.
 */
export function useScrollPosition(
  options: IScrollPositionOptions = {},
): IScrollPositionResult {
  const { throttleMs = DEFAULT_THROTTLE_MS } = options;

  const [position, setPosition] = useState<IScrollPosition>({ x: 0, y: 0 });
  const [direction, setDirection] = useState<IScrollDirection>(null);

  const previousPositionRef = useRef<IScrollPosition>({ x: 0, y: 0 });

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

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset } = event.nativeEvent;
      const currentPosition: IScrollPosition = {
        x: contentOffset.x,
        y: contentOffset.y,
      };

      const newDirection = calculateDirection(
        currentPosition,
        previousPositionRef.current,
      );

      previousPositionRef.current = currentPosition;

      setPosition(currentPosition);
      setDirection(newDirection);
    },
    [calculateDirection],
  );

  return {
    position,
    direction,
    onScroll,
    scrollEventThrottle: throttleMs,
  };
}
//#endregion useScrollPosition
