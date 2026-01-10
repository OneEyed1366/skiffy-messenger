// apps/v2/src/hooks/index.ts

//#region Lifecycle & State
export { useDidUpdate } from "./useDidUpdate";
export {
  usePrevious,
  usePreviousWithInitial,
  useHasChanged,
  useFirstRender,
  usePreviousDistinct,
} from "./usePrevious";
export { useControlledState } from "./useControlledState";
export type { IControllableProps } from "./useControlledState";
//#endregion Lifecycle & State

//#region Timing
export {
  useDebounce,
  useDebouncedCallback,
  useThrottle,
  useThrottledCallback,
} from "./useDebounce";
export type {
  IDebounceOptions,
  IThrottleOptions,
  IDebouncedFunction,
  IThrottledFunction,
} from "./useDebounce";
//#endregion Timing

//#region Storage
export {
  useLocalStorage,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  getMultipleStorageItems,
  setMultipleStorageItems,
  removeMultipleStorageItems,
  clearStorage,
  getAllStorageKeys,
  createStorageKey,
  createUserStorageKey,
} from "./useLocalStorage";
export type {
  IUseLocalStorageOptions,
  IUseLocalStorageReturn,
} from "./useLocalStorage";
//#endregion Storage

//#region DOM Measurement
export { useElementDimensions } from "./useElementDimensions";
export type {
  IDimensions,
  IUseElementDimensionsResult,
} from "./useElementDimensions";
export {
  useResizeObserver,
  useElementDimensionsById,
} from "./useResizeObserver";
export type {
  IDimensions as IResizeObserverDimensions,
  IResizeObserverOptions,
  IResizeObserverResult,
} from "./useResizeObserver";
export { useIsOverflow, useIsVerticalOverflow } from "./useIsOverflow";
export type {
  IOverflowConfig,
  IOverflowDirection,
  ISize,
  IUseIsOverflowResult,
  IUseIsVerticalOverflowResult,
} from "./useIsOverflow";
//#endregion DOM Measurement

//#region Visibility
export {
  useIntersectionObserver,
  useMultiIntersectionObserver,
} from "./useIntersectionObserver";
export type {
  IIntersectionObserverOptions,
  IIntersectionObserverResult,
  IMultiIntersectionObserverOptions,
  IMultiIntersectionObserverResult,
} from "./useIntersectionObserver";
export { useElementAvailable } from "./useElementAvailable";
export type { IUseElementAvailableOptions } from "./useElementAvailable";
//#endregion Visibility

//#region Interaction
export { useClickOutside } from "./useClickOutside";
export type { IClickOutsideOptions } from "./useClickOutside";
export { useScrollPosition } from "./useScrollPosition";
export type {
  IScrollDirection,
  IScrollPosition,
  IScrollPositionOptions,
  IScrollPositionResult,
} from "./useScrollPosition";
export { useFocusTrap } from "./useFocusTrap";
//#endregion Interaction

//#region Utilities
export {
  usePrefixedIds,
  joinIds,
  generateUniqueId,
  resetIdCounter,
} from "./usePrefixedIds";
export { useCopyText } from "./useCopyText";
//#endregion Utilities
