# Mattermost to Expo/Unistyles Migration

## Overview

Full migration of Mattermost web app (260+ components) to React Native with Expo and Unistyles.

**Source:** `vendor/desktop/webapp/`
**Target:** `apps/v2/`

## Key Decisions

| Decision          | Choice                    | Rationale                                           |
| ----------------- | ------------------------- | --------------------------------------------------- |
| State Management  | Zustand                   | Simpler than Redux, better DX, smaller bundle       |
| Data Fetching     | TanStack Query            | Caching, deduping, retries, devtools; NOT in stores |
| WebSocket Streams | RxJS                      | 90+ event types, debounce/buffer/retry built-in     |
| Styling           | Unistyles v3              | Native performance, theme variants, breakpoints     |
| i18n              | i18next (keep key format) | Already configured in target app                    |
| API Client        | Keep Client4              | Minimize initial scope, investigate later           |
| Component Pattern | Functional + hooks        | React 19, no forwardRef needed                      |

## WebSocket Architecture

The vendor Mattermost implementation handles **90+ WebSocket event types** with complex patterns:

- Custom debouncing (posts batched at 100ms)
- Typing indicators with auto-expiry (3s)
- Exponential backoff reconnection with jitter
- Cross-entity fan-out (single event → multiple state updates)

**Decision:** Use RxJS for stream processing, Zustand for state storage.

| Layer             | Library                    | Responsibility                            |
| ----------------- | -------------------------- | ----------------------------------------- |
| Stream Processing | RxJS (~8-12kb tree-shaken) | Event routing, operators, reconnect logic |
| State Storage     | Zustand (~3kb)             | React bindings, persistence, devtools     |

See [L8: WebSocket RxJS](./layers/L8-websocket-rxjs.md) for implementation details.

## Migration Order

1. **Global Styles** - Theme tokens, colors, typography
2. **Types (L0)** - TypeScript interfaces
3. **Constants (L1)** - Enums, config values
4. **Utils (L2-L4)** - Pure functions, formatters
5. **Hooks (L5)** - Pure hooks (no state)
6. **Base Components (L6)** - Button, Input, Avatar
7. **State (L7)** - Zustand stores
8. **WebSocket (L8)** - RxJS event streams + store subscriptions
9. **State Hooks (L9)** - Hooks using stores
10. **Layout Components (L10)** - Modal, Menu, Sidebar
11. **Feature Components (L11)** - Full app features

## Conventions

### File Naming

- Types: `src/types/{domain}.ts` (e.g., `user.ts`, `channel.ts`)
- Utils: `src/utils/{name}.ts`
- Hooks: `src/hooks/{useName}.ts`
- Components: `src/components/{Name}/{Name}.tsx`

### Type Naming

- Prefix with `I`: `IUser`, `IChannel`, `IPost`
- Use `type` keyword, not `interface`

### Component Structure

```
ComponentName/
├── ComponentName.tsx
├── ComponentName.spec.tsx
├── ComponentName.stories.tsx
└── index.ts
```

### Export Conventions

- **Components**: Named exports (`export function Button()`)
- **Pages** (in `app/`): Default exports (Expo Router)
- **Types**: Named exports from `types/index.ts`

### Styling Pattern

```typescript
import { StyleSheet, UnistylesVariants } from 'react-native-unistyles';

type IProps = {
  // ... props
} & UnistylesVariants<typeof styles>;

export function Component({ variant = 'primary', size = 'md' }: IProps) {
  styles.useVariants({ variant, size });

  return <View style={styles.container}>...</View>;
}

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: theme.gap(2),
    backgroundColor: theme.colors.centerChannelBg,
    variants: {
      variant: {
        primary: { backgroundColor: theme.colors.buttonBg },
        secondary: { backgroundColor: 'transparent' },
      },
      size: {
        sm: { padding: theme.gap(1) },
        md: { padding: theme.gap(2) },
        lg: { padding: theme.gap(3) },
      },
    },
  },
}));
```

### React 19 Patterns

```typescript
// No forwardRef needed - ref is a regular prop
type IProps = {
  ref?: React.Ref<React.ComponentRef<typeof Pressable>>;
};

// No useCallback/useMemo needed - React Compiler handles it
export function Component({ onPress, ref }: IProps) {
  const handlePress = () => onPress?.(); // React Compiler optimizes this
  return <Pressable ref={ref} onPress={handlePress} />;
}
```

### i18n Pattern

```typescript
import { useTranslation } from 'react-i18next';

export function Component({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation();
  return <Text>{t(titleKey)}</Text>;
}
```

## Data Fetching

**IMPORTANT:** Use TanStack Query for all data fetching. Do NOT use:

- Async functions inside `useEffect`
- Async actions inside Zustand stores
- Direct `fetch`/`axios` calls in components

### Pattern

```typescript
// queries/useConfigQuery.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useConfigStore } from "@/stores/useConfigStore";

export function useConfigQuery() {
  const setConfig = useConfigStore((s) => s.setConfig);

  return useQuery({
    queryKey: ["config", "client"],
    queryFn: () => api.general.getClientConfig(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    onSuccess: (data) => {
      setConfig(data); // Sync to Zustand for non-React access
    },
  });
}
```

### Rationale

| Approach            | Problem                                         |
| ------------------- | ----------------------------------------------- |
| useEffect + async   | No caching, no deduping, no loading states      |
| Store async actions | Mixes concerns, hard to test, no cache control  |
| TanStack Query      | Caching, deduping, retries, devtools, SSR-ready |

### When to Sync to Zustand

Sync TanStack Query data to Zustand stores when:

1. **Non-React access needed** — RxJS streams, utility functions
2. **Cross-component state** — Data needed by unrelated components
3. **Offline/persistence** — Combined with Zustand `persist` middleware

Use `onSuccess` callback to sync:

```typescript
onSuccess: (data) => {
  useConfigStore.getState().setConfig(data);
};
```

## Status Legend

| Status        | Meaning                   |
| ------------- | ------------------------- |
| `pending`     | Not started               |
| `in_progress` | Currently being worked on |
| `blocked`     | Waiting on dependency     |
| `review`      | Ready for code review     |
| `done`        | Completed and merged      |

## Parallel Work

Tasks marked with `parallel: true` can be worked on simultaneously.
Check `depends_on` field to ensure dependencies are `done`.

## Estimated Effort

| Layer                   | Tasks   | Hours     |
| ----------------------- | ------- | --------- |
| Global Styles           | 6       | 6h        |
| L0: Types               | 15      | 17h       |
| L1: Constants           | 5       | 3h        |
| L2: Pure Utils          | 10      | 5h        |
| L3: Platform Utils      | 3       | 4h        |
| L4: Formatting Utils    | 8       | 12h       |
| L5: Pure Hooks          | 10      | 10h       |
| L6: Base Components     | 15      | 26h       |
| L7: Zustand Stores      | 12      | 35h       |
| L8: WebSocket RxJS      | 3       | 11.5h     |
| L9: State Hooks         | 20      | 35h       |
| L10: Layout Components  | 15      | 27h       |
| L11: Feature Components | 63      | ~150h     |
| **Total**               | **185** | **~341h** |

## Quick Links

- [Dependency Graph](./01-dependency-graph.md)
- [Global Styles Migration](./02-global-styles.md)
- [Layer Specifications](./layers/)
- [All Tasks](./tasks/)
