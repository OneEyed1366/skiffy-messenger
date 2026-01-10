import { useCallback, useRef, useState } from "react";
import type { LayoutChangeEvent, View, ViewToken } from "react-native";

//#region Types
export type IBoundingClientRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type IIntersectionEntry = {
  isIntersecting: boolean;
  intersectionRatio: number;
  boundingClientRect: IBoundingClientRect;
};

export type IIntersectionObserverOptions = {
  threshold?: number;
  initialIsIntersecting?: boolean;
  freezeOnceVisible?: boolean;
  onChange?: (entry: IIntersectionEntry) => void;
};

export type IIntersectionObserverResult = {
  ref: React.RefObject<React.ComponentRef<typeof View> | null>;
  isIntersecting: boolean;
  entry: IIntersectionEntry | null;
  onLayout: (event: LayoutChangeEvent) => void;
  checkVisibility: (viewportHeight: number, scrollY: number) => void;
};

export type IViewabilityConfig = {
  itemVisiblePercentThreshold: number;
  minimumViewTime?: number;
  waitForInteraction?: boolean;
};

export type IViewableItemsHandler<T> = (info: {
  viewableItems: ViewToken<T>[];
  changed: ViewToken<T>[];
}) => void;

export type IKeyExtractor<T> = (item: T, index: number) => string;
//#endregion Types

//#region Constants
const DEFAULT_THRESHOLD = 0;
const DEFAULT_VIEWABILITY_THRESHOLD = 50;
const INITIAL_RECT: IBoundingClientRect = { x: 0, y: 0, width: 0, height: 0 };
//#endregion Constants

//#region useIntersectionObserver
/**
 * Hook to detect element visibility in React Native using layout + scroll position.
 * Unlike web's IntersectionObserver, RN requires manual calculation based on
 * element position and scroll offset.
 *
 * Usage:
 * 1. Attach `ref` to the View you want to observe
 * 2. Attach `onLayout` to the same View
 * 3. Call `checkVisibility(viewportHeight, scrollY)` on scroll events
 */
export function useIntersectionObserver(
  options: IIntersectionObserverOptions = {},
): IIntersectionObserverResult {
  const {
    threshold = DEFAULT_THRESHOLD,
    initialIsIntersecting = false,
    freezeOnceVisible = false,
    onChange,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(initialIsIntersecting);
  const [entry, setEntry] = useState<IIntersectionEntry | null>(null);

  const ref = useRef<React.ComponentRef<typeof View>>(null);
  const layoutRef = useRef<IBoundingClientRect>(INITIAL_RECT);
  const frozenRef = useRef(false);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    layoutRef.current = { x, y, width, height };
  }, []);

  const checkVisibility = useCallback(
    (viewportHeight: number, scrollY: number) => {
      // If frozen, skip check
      if (frozenRef.current && freezeOnceVisible) {
        return;
      }

      const { y, height } = layoutRef.current;

      // Element boundaries relative to scroll
      const elementTop = y - scrollY;
      const elementBottom = elementTop + height;

      // Viewport boundaries (0 to viewportHeight)
      const viewportTop = 0;
      const viewportBottom = viewportHeight;

      // Calculate intersection
      const intersectionTop = Math.max(elementTop, viewportTop);
      const intersectionBottom = Math.min(elementBottom, viewportBottom);
      const intersectionHeight = Math.max(
        0,
        intersectionBottom - intersectionTop,
      );

      // Calculate intersection ratio
      const intersectionRatio = height > 0 ? intersectionHeight / height : 0;

      // Check if intersecting based on threshold
      const isNowIntersecting = intersectionRatio > threshold;

      const newEntry: IIntersectionEntry = {
        isIntersecting: isNowIntersecting,
        intersectionRatio,
        boundingClientRect: layoutRef.current,
      };

      setEntry(newEntry);
      setIsIntersecting(isNowIntersecting);
      onChange?.(newEntry);

      // Freeze if visible and freezeOnceVisible enabled
      if (isNowIntersecting && freezeOnceVisible) {
        frozenRef.current = true;
      }
    },
    [threshold, freezeOnceVisible, onChange],
  );

  return {
    ref,
    isIntersecting,
    entry,
    onLayout,
    checkVisibility,
  };
}
//#endregion useIntersectionObserver

//#region FlashList Helpers
/**
 * Creates a viewability config for FlashList/FlatList.
 * @param threshold - Percentage of item that must be visible (0-100). Default: 50
 */
export function createViewabilityConfig(
  threshold: number = DEFAULT_VIEWABILITY_THRESHOLD,
): IViewabilityConfig {
  return {
    itemVisiblePercentThreshold: threshold,
    minimumViewTime: 0,
    waitForInteraction: false,
  };
}

/**
 * Creates a handler for FlashList/FlatList onViewableItemsChanged.
 * Extracts visible item IDs and calls the provided callback.
 *
 * @param onVisibleIdsChange - Callback receiving Set of visible item IDs
 * @param keyExtractor - Function to extract unique key from item
 */
export function createViewableItemsHandler<T>(
  onVisibleIdsChange: (visibleIds: Set<string>) => void,
  keyExtractor: IKeyExtractor<T>,
): IViewableItemsHandler<T> {
  return ({ viewableItems }) => {
    const visibleIds = new Set<string>();

    viewableItems.forEach((viewToken) => {
      if (viewToken.isViewable && viewToken.item !== null) {
        const key = keyExtractor(viewToken.item as T, viewToken.index ?? 0);
        visibleIds.add(key);
      }
    });

    onVisibleIdsChange(visibleIds);
  };
}
//#endregion FlashList Helpers

//#region Multi-element observer (RN version)
export type IMultiIntersectionObserverOptions = {
  threshold?: number;
};

export type IMultiIntersectionObserverResult<K extends string> = {
  activeKey: K | null;
  intersectingKeys: Set<K>;
  layouts: React.RefObject<Record<K, IBoundingClientRect>>;
  setActiveKey: (key: K | null) => void;
  handleLayout: (key: K) => (event: LayoutChangeEvent) => void;
  checkAllVisibility: (viewportHeight: number, scrollY: number) => void;
};

/**
 * Hook for tracking multiple elements' visibility in React Native.
 * Useful for scroll-spy navigation patterns.
 */
export function useMultiIntersectionObserver<K extends string>(
  keys: K[],
  options: IMultiIntersectionObserverOptions = {},
): IMultiIntersectionObserverResult<K> {
  const { threshold = DEFAULT_THRESHOLD } = options;

  const [activeKey, setActiveKey] = useState<K | null>(null);
  const [intersectingKeys, setIntersectingKeys] = useState<Set<K>>(new Set());

  const layouts = useRef<Record<K, IBoundingClientRect>>(
    {} as Record<K, IBoundingClientRect>,
  );

  // Initialize layouts for all keys
  keys.forEach((key) => {
    if (!(key in layouts.current)) {
      layouts.current[key] = { ...INITIAL_RECT };
    }
  });

  const handleLayout = useCallback(
    (key: K) => (event: LayoutChangeEvent) => {
      const { x, y, width, height } = event.nativeEvent.layout;
      layouts.current[key] = { x, y, width, height };
    },
    [],
  );

  const checkAllVisibility = useCallback(
    (viewportHeight: number, scrollY: number) => {
      const newIntersecting = new Set<K>();

      keys.forEach((key) => {
        const layout = layouts.current[key];
        if (!layout || layout.height === 0) return;

        const { y, height } = layout;

        // Element boundaries relative to scroll
        const elementTop = y - scrollY;
        const elementBottom = elementTop + height;

        // Calculate intersection
        const intersectionTop = Math.max(elementTop, 0);
        const intersectionBottom = Math.min(elementBottom, viewportHeight);
        const intersectionHeight = Math.max(
          0,
          intersectionBottom - intersectionTop,
        );

        // Calculate intersection ratio
        const intersectionRatio = height > 0 ? intersectionHeight / height : 0;

        if (intersectionRatio > threshold) {
          newIntersecting.add(key);
        }
      });

      setIntersectingKeys(newIntersecting);

      // Update active key to the first intersecting key based on keys order
      const firstIntersecting = keys.find((key) => newIntersecting.has(key));
      if (firstIntersecting !== undefined) {
        setActiveKey(firstIntersecting);
      }
    },
    [keys, threshold],
  );

  return {
    activeKey,
    intersectingKeys,
    layouts,
    setActiveKey,
    handleLayout,
    checkAllVisibility,
  };
}
//#endregion Multi-element observer
