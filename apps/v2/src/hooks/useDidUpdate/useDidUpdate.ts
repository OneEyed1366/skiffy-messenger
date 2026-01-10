import { useEffect, useRef } from "react";

//#region Types
type IEffectCallback = () => void | (() => void);
//#endregion Types

//#region Hook
/**
 * A hook that works like useEffect but skips the initial mount.
 * Only runs the effect callback when dependencies change after the first render.
 */
export function useDidUpdate(
  effect: IEffectCallback,
  deps?: React.DependencyList,
): void {
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) {
      return effect();
    }

    isMounted.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
//#endregion Hook
