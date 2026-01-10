import { useCallback, useRef, useState } from "react";

//#region Types
export type IIntersectionObserverOptions = {
  root?: Element | Document | null;
  rootMargin?: string;
  threshold?: number | number[];
  freezeOnceVisible?: boolean;
  initialIsIntersecting?: boolean;
  onChange?: (entry: IntersectionObserverEntry) => void;
};

export type IIntersectionObserverResult = {
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
  ref: React.RefCallback<Element>;
};

export type IMultiIntersectionObserverOptions<K extends string> = {
  keys: K[];
  observerOptions?: IntersectionObserverInit;
};

export type IMultiIntersectionObserverResult<K extends string> = {
  activeKey: K | null;
  intersectingKeys: Set<K>;
  refs: React.RefObject<Record<K, HTMLElement | null>>;
  setActiveKey: (key: K | null) => void;
};
//#endregion Types

//#region useIntersectionObserver
/**
 * Hook to observe element visibility using IntersectionObserver API.
 * Supports freezeOnceVisible to stop observing after first intersection.
 * Uses ref callback pattern for reliable element tracking.
 */
export function useIntersectionObserver(
  options: IIntersectionObserverOptions = {},
): IIntersectionObserverResult {
  const {
    root = null,
    rootMargin = "0px",
    threshold = 0,
    freezeOnceVisible = false,
    initialIsIntersecting = false,
    onChange,
  } = options;

  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(initialIsIntersecting);

  const frozenRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<Element | null>(null);

  const ref = useCallback(
    (element: Element | null) => {
      // Cleanup previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      // If frozen (already visible once), don't create new observer
      if (frozenRef.current && freezeOnceVisible) {
        return;
      }

      elementRef.current = element;

      if (!element) {
        return;
      }

      // Check for IntersectionObserver support
      if (typeof IntersectionObserver === "undefined") {
        // Fallback: assume visible
        setIsIntersecting(true);
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          const [observerEntry] = entries;
          if (!observerEntry) return;

          const isNowIntersecting = observerEntry.isIntersecting;

          setEntry(observerEntry);
          setIsIntersecting(isNowIntersecting);
          onChange?.(observerEntry);

          // Freeze observation if visible and freezeOnceVisible is enabled
          if (isNowIntersecting && freezeOnceVisible) {
            frozenRef.current = true;
            observer.disconnect();
            observerRef.current = null;
          }
        },
        { root, rootMargin, threshold },
      );

      observer.observe(element);
      observerRef.current = observer;
    },
    [root, rootMargin, threshold, freezeOnceVisible, onChange],
  );

  return { isIntersecting, entry, ref };
}
//#endregion useIntersectionObserver

//#region useMultiIntersectionObserver
/**
 * Hook for scroll-spy functionality - observes multiple elements and tracks
 * which ones are intersecting. Useful for navigation highlighting.
 */
export function useMultiIntersectionObserver<K extends string>(
  options: IMultiIntersectionObserverOptions<K>,
): IMultiIntersectionObserverResult<K> {
  const { keys, observerOptions = {} } = options;

  const [activeKey, setActiveKey] = useState<K | null>(null);
  const [intersectingKeys, setIntersectingKeys] = useState<Set<K>>(new Set());

  const refs = useRef<Record<K, HTMLElement | null>>(
    {} as Record<K, HTMLElement | null>,
  );
  const observerRef = useRef<IntersectionObserver | null>(null);
  const intersectingMapRef = useRef<Map<K, boolean>>(new Map());

  // Initialize refs for all keys
  keys.forEach((key) => {
    if (!(key in refs.current)) {
      refs.current[key] = null;
    }
  });

  // Setup observer on mount and when keys/options change
  const setupObserver = useCallback(() => {
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const element = entry.target as HTMLElement;
        const key = keys.find((k) => refs.current[k] === element);
        if (key) {
          intersectingMapRef.current.set(key, entry.isIntersecting);
        }
      });

      // Update intersecting keys set
      const newIntersecting = new Set<K>();
      intersectingMapRef.current.forEach((isIntersecting, key) => {
        if (isIntersecting) {
          newIntersecting.add(key);
        }
      });

      setIntersectingKeys(newIntersecting);

      // Update active key to the first intersecting key based on keys order
      const firstIntersecting = keys.find((key) => newIntersecting.has(key));
      if (firstIntersecting !== undefined) {
        setActiveKey(firstIntersecting);
      }
    }, observerOptions);

    // Observe all registered elements
    keys.forEach((key) => {
      const element = refs.current[key];
      if (element) {
        observer.observe(element);
      }
    });

    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [keys, observerOptions]);

  // Effect to setup observer when component mounts
  // Using a ref to track if we need to setup
  const setupRef = useRef(false);
  if (!setupRef.current && typeof window !== "undefined") {
    setupRef.current = true;
    // Schedule setup after refs are populated
    queueMicrotask(setupObserver);
  }

  return {
    activeKey,
    intersectingKeys,
    refs,
    setActiveKey,
  };
}
//#endregion useMultiIntersectionObserver
