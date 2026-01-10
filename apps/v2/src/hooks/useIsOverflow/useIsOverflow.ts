import { useState } from "react";
import type { LayoutChangeEvent } from "react-native";

//#region Types
export type IOverflowDirection = "vertical" | "horizontal" | "both";

export type IOverflowConfig = {
  direction?: IOverflowDirection;
  maxHeight?: number;
  maxWidth?: number;
};

export type ISize = {
  width: number;
  height: number;
};

export type IUseIsOverflowResult = {
  isOverflow: boolean;
  isVerticalOverflow: boolean;
  isHorizontalOverflow: boolean;
  onContainerLayout: (event: LayoutChangeEvent) => void;
  onContentLayout: (event: LayoutChangeEvent) => void;
  containerSize: ISize;
  contentSize: ISize;
};

export type IUseIsVerticalOverflowResult = {
  isOverflow: boolean;
  contentHeight: number;
  onLayout: (event: LayoutChangeEvent) => void;
};
//#endregion Types

//#region Constants
const INITIAL_SIZE: ISize = { width: 0, height: 0 };
const DEFAULT_DIRECTION: IOverflowDirection = "vertical";
//#endregion Constants

//#region Helpers
function sizesEqual(a: ISize, b: ISize): boolean {
  return a.width === b.width && a.height === b.height;
}
//#endregion Helpers

//#region useIsOverflow
/**
 * Hook to detect overflow by comparing content size to container size.
 * Uses onLayout events to track dimensions and calculates overflow
 * based on the specified direction.
 *
 * @param config - Optional configuration for overflow direction and max dimensions
 * @returns Overflow state and layout handlers
 */
export function useIsOverflow(config?: IOverflowConfig): IUseIsOverflowResult {
  const { direction = DEFAULT_DIRECTION, maxHeight, maxWidth } = config ?? {};

  const [containerSize, setContainerSize] = useState<ISize>(INITIAL_SIZE);
  const [contentSize, setContentSize] = useState<ISize>(INITIAL_SIZE);

  const onContainerLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize((prev) => {
      const next = { width, height };
      if (sizesEqual(prev, next)) {
        return prev;
      }
      return next;
    });
  };

  const onContentLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContentSize((prev) => {
      const next = { width, height };
      if (sizesEqual(prev, next)) {
        return prev;
      }
      return next;
    });
  };

  // Calculate effective max dimensions (use maxHeight/maxWidth if provided, otherwise container size)
  const effectiveMaxHeight = maxHeight ?? containerSize.height;
  const effectiveMaxWidth = maxWidth ?? containerSize.width;

  // Calculate overflow in each direction
  const isVerticalOverflow =
    contentSize.height > effectiveMaxHeight && effectiveMaxHeight > 0;
  const isHorizontalOverflow =
    contentSize.width > effectiveMaxWidth && effectiveMaxWidth > 0;

  // Calculate combined overflow based on direction config
  let isOverflow = false;
  switch (direction) {
    case "vertical":
      isOverflow = isVerticalOverflow;
      break;
    case "horizontal":
      isOverflow = isHorizontalOverflow;
      break;
    case "both":
      isOverflow = isVerticalOverflow || isHorizontalOverflow;
      break;
  }

  return {
    isOverflow,
    isVerticalOverflow,
    isHorizontalOverflow,
    onContainerLayout,
    onContentLayout,
    containerSize,
    contentSize,
  };
}
//#endregion useIsOverflow

//#region useIsVerticalOverflow
/**
 * Simplified hook for common vertical overflow detection case.
 * Only tracks content height against a fixed maxHeight.
 *
 * @param maxHeight - Maximum height before overflow
 * @returns Overflow state, content height, and layout handler
 */
export function useIsVerticalOverflow(
  maxHeight: number,
): IUseIsVerticalOverflowResult {
  const [contentHeight, setContentHeight] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setContentHeight((prev) => {
      if (prev === height) {
        return prev;
      }
      return height;
    });
  };

  const isOverflow = contentHeight > maxHeight && maxHeight > 0;

  return {
    isOverflow,
    contentHeight,
    onLayout,
  };
}
//#endregion useIsVerticalOverflow
