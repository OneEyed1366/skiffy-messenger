# AGENTS.md

Instructions for AI coding agents working in this repository.

## Commands

```bash
pnpm install                 # Install all deps
pnpm lint                    # Lint all packages
pnpm --filter @retrievly/app lint  # Lint only v2 app

# Testing
pnpm --filter @retrievly/app test:unit           # Run all tests
pnpm --filter @retrievly/app test:unit -- Button # Run tests matching "Button"
pnpm --filter @retrievly/app test:unit -- --testPathPattern=Button.spec  # By file
pnpm --filter @retrievly/app test:unit -- --watch  # Watch mode

# Dev
pnpm dev:mobile              # Start Expo dev server
pnpm dev:desktop             # Start Tauri desktop dev
pnpm build:mobile            # Build mobile (Expo export)
pnpm build:desktop           # Build desktop (Tauri)

# Storybook
pnpm --filter @retrievly/app sb:web     # Web Storybook (port 6006)
```

## Project Structure

```
apps/v2/src/
  app/           # Expo Router pages (default exports only)
  components/    # Shared components (named exports)
  locales/       # i18n translation files (flat JSON)
  theme.ts       # Unistyles theme config
apps/v2/src-tauri/   # Rust backend (Tauri)
```

## TypeScript Standards

> **Skills:** `ts-strict-config` | `ts-declarations-modules` | `ts-type-guards-narrowing` | `ts-type-assertions`

- **Strict mode**: Enabled, no `any` types allowed → see `ts-strict-config`
- **Type keyword**: Use `type` (not `interface`) for all definitions → see `ts-declarations-modules`
- **Naming**: Prefix types w/ `I`: `IProps`, `IUser`, `IButtonVariant`
- **Path alias**: Use `@/*`: `import { theme } from "@/theme"` → see `ts-strict-config`
- **External data**: Always use `unknown`, never `any` → see `ts-type-guards-narrowing`
- **Assertions**: Prefer `as const satisfies` over `as` → see `ts-type-assertions`

## Component Standards

### File Structure (Component-Per-Folder)

```
ComponentName/
  ComponentName.tsx       # Component + types + styles (co-located)
  ComponentName.spec.tsx  # Jest tests
  ComponentName.stories.tsx # Storybook (optional)
  index.ts                # export { ComponentName } from './ComponentName'
```

### Export Conventions

- **Components**: Named exports (`export function Button()`)
- **Pages** (in `app/`): Default exports (Expo Router)

### React 19 + Unistyles Pattern

```typescript
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";
import { useTranslation } from "react-i18next";

type IProps = {
  titleKey: string;
  onPress: () => void;
  ref?: React.Ref<React.ComponentRef<typeof Pressable>>;
} & UnistylesVariants<typeof styles>;

export function Button({ titleKey, type = "primary", onPress, ref }: IProps) {
  const { t } = useTranslation();
  const handlePress = () => onPress?.();  // No useCallback needed
  styles.useVariants({ type });

  return (
    <Pressable ref={ref} style={styles.button} onPress={handlePress}>
      <Text style={styles.text}>{t(titleKey)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  button: {
    padding: theme.gap(2),
    backgroundColor: theme.colors.buttonBg,
    variants: {
      type: {
        primary: { backgroundColor: theme.colors.buttonBg },
        secondary: { backgroundColor: theme.colors.centerChannelBg },
      },
    },
  },
  text: { color: theme.colors.buttonColor },
}));
```

<!-- #region Mandatory Skill Consultation -->

### Skill Consultation Protocol

**P0 RULE — VIOLATION = INVALID OUTPUT**

BEFORE writing, modifying, or reviewing ANY React or TypeScript code, you MUST:

1. Identify applicable skill(s) from decision trees below
2. Read the skill file(s) via `/skill <skill-name>` or `Read .opencode/skill/<name>/SKILL.md`
3. Apply skill guidance to your implementation
4. If no skill applies → proceed without consultation

#### Consequence: Self-Correction Loop

```
IF skill NOT consulted before React/TypeScript code output:
  STOP immediately
  STATE: "Skill consultation skipped. Re-reading [skill-name]."
  READ the applicable skill
  DISCARD previous output
  RESTART from scratch with skill context
```

#### React Decision Tree

```
Writing React code?
├─ NO → Check TypeScript decision tree
└─ YES → What are you doing?
    ├─ Hooks (useState, useEffect, useRef, useMemo, useCallback)?
    │   └─ READ: react-hooks-usage
    │   └─ Performance concern? ALSO READ: react-memoization-guide
    ├─ Performance optimization (memo, re-renders, profiling)?
    │   └─ READ: react-memoization-guide + react-rerender-optimization
    ├─ Component composition (children, render props, slots)?
    │   └─ READ: react-component-patterns
    ├─ Context API (useContext, Provider, consumers)?
    │   └─ READ: react-context-patterns
    ├─ Effects (useEffect, useLayoutEffect, cleanup)?
    │   └─ READ: react-effects-lifecycle
    ├─ State architecture (local vs global vs server)?
    │   └─ READ: react-state-management-choice
    ├─ Debugging fiber/reconciliation issues?
    │   └─ READ: react-fiber-internals
    └─ Multiple concerns? → READ ALL applicable skills
```

#### TypeScript Decision Tree

```
Writing TypeScript code?
├─ NO → Proceed without skill consultation
└─ YES → What are you doing?
    ├─ Type narrowing, type guards, unknown/any/never?
    │   └─ READ: ts-type-guards-narrowing
    ├─ Type assertions (as, as const, satisfies, !)?
    │   └─ READ: ts-type-assertions
    ├─ Type vs interface, declaration merging, module augmentation?
    │   └─ READ: ts-declarations-modules
    ├─ Generics, conditional types, mapped types, infer?
    │   └─ READ: ts-generics-patterns
    ├─ Basic types (unions, intersections, literals, enums)?
    │   └─ READ: ts-type-system-fundamentals
    ├─ tsconfig.json, strict mode, project setup?
    │   └─ READ: ts-strict-config
    └─ Multiple concerns? → READ ALL applicable skills
```

#### Quick Reference Table — React

| Trigger Keywords                                     | Skill                           |
| ---------------------------------------------------- | ------------------------------- |
| `useState`, `useReducer`, `setState`                 | `react-hooks-usage`             |
| `useEffect`, `useLayoutEffect`, cleanup              | `react-effects-lifecycle`       |
| `useMemo`, `useCallback`, `React.memo`, optimization | `react-memoization-guide`       |
| re-render, performance, Profiler, "why re-renders"   | `react-rerender-optimization`   |
| `useContext`, Provider, Context, global state        | `react-context-patterns`        |
| children prop, render props, composition, slots      | `react-component-patterns`      |
| Zustand, TanStack Query, "where to put state"        | `react-state-management-choice` |
| fiber, reconciliation, lanes, work loop              | `react-fiber-internals`         |

#### Quick Reference Table — TypeScript

| Trigger Keywords                                               | Skill                         |
| -------------------------------------------------------------- | ----------------------------- |
| type guard, `is`, narrowing, `unknown`, `any`, `never`         | `ts-type-guards-narrowing`    |
| `as`, `as const`, `satisfies`, `!`, assertion                  | `ts-type-assertions`          |
| `type` vs `interface`, declaration merging, `declare module`   | `ts-declarations-modules`     |
| generics, `<T>`, `extends`, `infer`, mapped types, conditional | `ts-generics-patterns`        |
| union, intersection, literal types, enums, tuples              | `ts-type-system-fundamentals` |
| tsconfig, `strict`, compiler options, path alias               | `ts-strict-config`            |

#### When Each TypeScript Skill Triggers — Examples

| Scenario                                   | Skill to Consult              |
| ------------------------------------------ | ----------------------------- |
| "Object is possibly undefined" error       | `ts-type-guards-narrowing`    |
| Choosing between `type` and `interface`    | `ts-declarations-modules`     |
| Writing `as const` for config objects      | `ts-type-assertions`          |
| Creating reusable generic component        | `ts-generics-patterns`        |
| Setting up tsconfig.json for new project   | `ts-strict-config`            |
| Defining union type for API status         | `ts-type-system-fundamentals` |
| Extending Window or third-party types      | `ts-declarations-modules`     |
| Using `satisfies` vs type annotation       | `ts-type-assertions`          |
| Writing type predicate (`param is Type`)   | `ts-type-guards-narrowing`    |
| "Type X not assignable to Y" with generics | `ts-generics-patterns`        |
| Handling external API response data        | `ts-type-guards-narrowing`    |
| Creating discriminated union for state     | `ts-type-system-fundamentals` |

#### DO / DO NOT

| DO                                                          | DO NOT                                                                    |
| ----------------------------------------------------------- | ------------------------------------------------------------------------- |
| Read skill BEFORE writing code                              | Write hooks code without reading `react-hooks-usage`                      |
| Cite skill guidance in output                               | Assume you know React/TS patterns without verification                    |
| Re-read skill if uncertain                                  | Skip skill for "simple" changes — ALL React/TS code requires consultation |
| Combine multiple skills for complex tasks                   | Guess at type narrowing without `ts-type-guards-narrowing`                |
| Consult `ts-type-assertions` before using `as`              | Use `as` to silence type errors without understanding why                 |
| Use `ts-declarations-modules` for type organization         | Mix `type` and `interface` randomly                                       |
| Check `ts-generics-patterns` before writing custom generics | Reinvent `Partial`, `Pick`, `Omit` — use built-ins                        |
| Reference `ts-strict-config` for tsconfig changes           | Disable strict flags to "fix" errors                                      |

#### TypeScript Skill Summary

| Skill                         | One-Liner                                                          |
| ----------------------------- | ------------------------------------------------------------------ |
| `ts-type-guards-narrowing`    | Runtime type checks, `unknown`/`any`/`never`, discriminated unions |
| `ts-type-assertions`          | `as`, `as const`, `satisfies`, non-null `!`, when to use each      |
| `ts-declarations-modules`     | `type` vs `interface`, declaration merging, module augmentation    |
| `ts-generics-patterns`        | Generics, constraints, conditional/mapped types, utility types     |
| `ts-type-system-fundamentals` | Primitives, unions, intersections, literals, enums, tuples         |
| `ts-strict-config`            | tsconfig.json, strict mode flags, migration patterns               |

<!-- #endregion Mandatory Skill Consultation -->

### Key Rules

1. **No `useMemo`/`useCallback`**: React Compiler handles memoization
2. **No `forwardRef`**: Use `ref` as regular prop (React 19)
3. **No `useUnistyles()` hook**: Access theme via `StyleSheet.create((theme) => ...)`
4. **Variants**: Use Unistyles variants, not conditional styles

## Styling (react-native-unistyles)

```typescript
const styles = StyleSheet.create((theme) => ({
  container: {
    padding: theme.gap(2), // 16px (gap multiplier = 8)
    borderRadius: theme.radius.m, // Tokens: xs, s, m, l, xl
    backgroundColor: theme.colors.centerChannelBg,
    variants: {
      disabled: { true: { opacity: 0.6 }, false: { opacity: 1.0 } },
    },
  },
}));
```

## Internationalization (i18next)

- **Hook**: `useTranslation()` in components
- **Key format**: Flat dot notation (no nested objects)
- **Files**: `apps/v2/src/locales/*.json`

```typescript
const { t } = useTranslation();
<Text>{t('renderer.components.settingsPage.header')}</Text>
```

Translation format: `{ "label.save": "Save", "label.cancel": "Cancel" }`

## Testing

- **Framework**: Jest w/ `jest-expo` preset
- **Library**: `@testing-library/react-native`
- **Location**: Co-located `*.spec.tsx`
- **Router tests**: Must be in `__tests__/` (not `app/`)

```typescript
import { render, fireEvent } from '@testing-library/react-native';

describe('<Button />', () => {
  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button titleKey="label.save" onPress={onPress} />);
    fireEvent.press(getByText('Save'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

## Validation (valibot)

```typescript
import * as v from "valibot";
const UserSchema = v.object({
  name: v.pipe(v.string(), v.minLength(2)),
  email: v.pipe(v.string(), v.email()),
});
type IUser = v.InferInput<typeof UserSchema>;
```

## Quick Reference

| Item        | Convention                                     |
| ----------- | ---------------------------------------------- |
| Types       | `type IProps = { ... }` (I prefix, use `type`) |
| Imports     | `@/*` path alias                               |
| Components  | Named exports, functional                      |
| Pages       | Default exports (Expo Router)                  |
| Styling     | `StyleSheet.create((theme) => ...)`            |
| i18n keys   | `renderer.components.componentName.key`        |
| Tests       | Co-located `*.spec.tsx`                        |
| Memoization | None (React Compiler)                          |
| Refs        | Regular prop (no forwardRef)                   |
