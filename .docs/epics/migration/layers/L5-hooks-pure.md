# L5: Pure Hooks

## Overview

Reusable React hooks with no external dependencies on state management or API. These are utility hooks for common patterns.

## Source Locations

- `vendor/desktop/webapp/platform/components/src/hooks/`
- `vendor/desktop/webapp/channels/src/components/common/hooks/`

## Target Location

`apps/v2/src/hooks/`

## Dependencies

| Layer | Dependency            |
| ----- | --------------------- |
| L0    | Types (utility types) |

## Tasks

| ID                                                    | Name                    | Status  | Parallel | Est. | Platform      |
| ----------------------------------------------------- | ----------------------- | ------- | -------- | ---- | ------------- |
| [T5.01](../tasks/T5.01-hook-did-update.md)            | useDidUpdate            | pending | ✓        | 0.5h | All           |
| [T5.02](../tasks/T5.02-hook-element-dimensions.md)    | useElementDimensions    | pending | ✓        | 2h   | All           |
| [T5.03](../tasks/T5.03-hook-overflow.md)              | useOverflow             | pending | ✓        | 2h   | Web           |
| [T5.04](../tasks/T5.04-hook-resize-observer.md)       | useResizeObserver       | pending | ✓        | 2h   | Web           |
| [T5.05](../tasks/T5.05-hook-intersection-observer.md) | useIntersectionObserver | pending | ✓        | 4h   | All (.native) |
| [T5.06](../tasks/T5.06-hook-element-available.md)     | useElementAvailable     | pending | ✓        | 1h   | Web           |
| [T5.07](../tasks/T5.07-hook-copy-text.md)             | useCopyText             | pending | ✓        | 2h   | All           |
| [T5.08](../tasks/T5.08-hook-controlled-state.md)      | useControlledState      | pending | ✓        | 2h   | All           |
| [T5.09](../tasks/T5.09-hook-local-storage.md)         | useLocalStorage         | pending | ✓        | 3h   | All           |
| [T5.10](../tasks/T5.10-hook-debounce.md)              | useDebounce/useThrottle | pending | ✓        | 2h   | All           |
| [T5.11](../tasks/T5.11-hook-focus-trap.md)            | useFocusTrap            | pending | ✓        | 2h   | Web           |
| [T5.12](../tasks/T5.12-hook-click-outside.md)         | useClickOutside         | pending | ✓        | 1h   | All (.native) |
| [T5.13](../tasks/T5.13-hook-prefixed-ids.md)          | usePrefixedIds          | pending | ✓        | 0.5h | All           |
| [T5.14](../tasks/T5.14-hook-scroll-position.md)       | useScrollPosition       | pending | ✓        | 1.5h | All (.native) |
| [T5.15](../tasks/T5.15-hook-previous.md)              | usePrevious             | pending | ✓        | 0.5h | All           |

## Progress

- Total: 15
- Done: 0
- In Progress: 0
- Pending: 15
- **Estimated Hours: 26h**

## File Structure

```
apps/v2/src/hooks/
├── useDidUpdate/
│   ├── useDidUpdate.ts
│   └── index.ts
├── useElementDimensions/
│   ├── useElementDimensions.ts
│   └── index.ts
├── useOverflow/
│   ├── useOverflow.ts           # Web only
│   └── index.ts
├── useResizeObserver/
│   ├── useResizeObserver.ts     # Web only
│   └── index.ts
├── useIntersectionObserver/
│   ├── useIntersectionObserver.ts
│   ├── useIntersectionObserver.native.ts
│   └── index.ts
├── useElementAvailable/
│   ├── useElementAvailable.ts   # Web only
│   └── index.ts
├── useCopyText/
│   ├── useCopyText.ts
│   └── index.ts
├── useControlledState/
│   ├── useControlledState.ts
│   └── index.ts
├── useLocalStorage/
│   ├── useLocalStorage.ts
│   └── index.ts
├── useDebounce/
│   ├── useDebounce.ts           # Includes useThrottle
│   └── index.ts
├── useFocusTrap/
│   ├── useFocusTrap.ts          # Web only
│   └── index.ts
├── useClickOutside/
│   ├── useClickOutside.ts
│   ├── useClickOutside.native.ts
│   └── index.ts
├── usePrefixedIds/
│   ├── usePrefixedIds.ts
│   └── index.ts
├── useScrollPosition/
│   ├── useScrollPosition.ts
│   ├── useScrollPosition.native.ts
│   └── index.ts
├── usePrevious/
│   ├── usePrevious.ts
│   └── index.ts
└── index.ts                     # Barrel exports
```

## Platform Notes

| Suffix          | Meaning                                       |
| --------------- | --------------------------------------------- |
| `.ts` only      | Works on all platforms                        |
| `.native.ts`    | Has React Native-specific implementation      |
| `Web` in column | Web/Tauri only, not available in React Native |

## Hooks by Category

### Lifecycle

- **T5.01: useDidUpdate** — useEffect that skips first render
- **T5.15: usePrevious** — get previous value of state/prop

### DOM Measurement

- **T5.02: useElementDimensions** — track element size
- **T5.03: useOverflow** — detect overflow state (web)
- **T5.04: useResizeObserver** — observe size changes (web)

### Visibility

- **T5.05: useIntersectionObserver** — viewport intersection
- **T5.06: useElementAvailable** — poll for DOM element (web)

### Interaction

- **T5.07: useCopyText** — clipboard with success state
- **T5.08: useControlledState** — controlled/uncontrolled pattern
- **T5.11: useFocusTrap** — modal focus trapping (web)
- **T5.12: useClickOutside** — detect outside clicks

### Performance

- **T5.10: useDebounce/useThrottle** — rate limiting values and callbacks

### Storage

- **T5.09: useLocalStorage** — AsyncStorage persistence with sync

### Utilities

- **T5.13: usePrefixedIds** — accessibility ID generation
- **T5.14: useScrollPosition** — scroll tracking with direction

## Key Implementations

### useControlledState (T5.08)

```typescript
// Manages controlled/uncontrolled component pattern
const [value, setValue, isControlled] = useControlledState({
  value: props.value,
  defaultValue: "",
  onChange: props.onChange,
});
```

### useDebounce (T5.10)

```typescript
// Debounce a value
const debouncedSearch = useDebounce(searchTerm, 500);

// Debounce a callback with cancel/flush
const debouncedFn = useDebouncedCallback((term) => fetchResults(term), {
  delay: 500,
  maxWait: 2000,
});
```

### usePrevious (T5.15)

```typescript
const prevCount = usePrevious(count);
const hasChanged = useHasChanged(user, (a, b) => a?.id !== b?.id);
const isFirst = useFirstRender();
```

### useFocusTrap (T5.11) — Web Only

```typescript
// Trap focus within modal
useFocusTrap(isOpen, containerRef, {
  initialFocus: true,
  restoreFocus: true,
});
```

### useClickOutside (T5.12)

```typescript
// Web: use ref and document listener
useClickOutside(ref, onClose);

// Native: use backdrop props
const { backdropProps } = useClickOutside(onClose);
<Pressable style={StyleSheet.absoluteFill} {...backdropProps} />
```

## Notes

- Hooks should not use any state management (Zustand, TanStack Query)
- React 19 Compiler optimizes - avoid manual useMemo/useCallback
- Web-only hooks use DOM APIs not available in React Native
- `.native.ts` files provide RN-specific implementations
- Test each hook in isolation before integration
