import { useCallback, useState } from "react";
import type { LayoutChangeEvent } from "react-native";

//#region Types
export type IDimensions = {
  width: number;
  height: number;
  x: number;
  y: number;
};

export type IUseElementDimensionsResult = {
  dimensions: IDimensions;
  onLayout: (event: LayoutChangeEvent) => void;
};
//#endregion Types

//#region Constants
const INITIAL_DIMENSIONS: IDimensions = { width: 0, height: 0, x: 0, y: 0 };
//#endregion Constants

//#region useElementDimensions
/**
 * Hook to track element dimensions using React Native's onLayout.
 * Returns dimensions (width, height, x, y) and a stable onLayout callback.
 * Avoids unnecessary re-renders when dimensions haven't changed.
 */
export function useElementDimensions(): IUseElementDimensionsResult {
  const [dimensions, setDimensions] = useState<IDimensions>(INITIAL_DIMENSIONS);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height, x, y } = event.nativeEvent.layout;
    setDimensions((prev) => {
      if (
        prev.width === width &&
        prev.height === height &&
        prev.x === x &&
        prev.y === y
      ) {
        return prev; // Avoid re-render when dimensions unchanged
      }
      return { width, height, x, y };
    });
  }, []);

  return { dimensions, onLayout };
}
//#endregion useElementDimensions
