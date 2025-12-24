# AGENTS.md

## Commands

```bash
pnpm lint                    # Lint all packages
pnpm test:unit               # Run all tests (from apps/v2)
pnpm test:unit -- Button     # Run single test by name pattern
pnpm test:unit -- --testPathPattern=Button.spec  # Run by file pattern
```

## Code Style

- **TypeScript**: Strict mode, no `any`. Use `type` (not `interface`) with `I` prefix: `IProps`, `IUser`
- **Imports**: Use path alias `@/*` for imports (e.g., `import { theme } from "@/theme"`)
- **Components**: Named exports, functional components. Default exports only for Expo Router pages
- **React 19**: No `useMemo`/`useCallback` (React Compiler handles it). Use `ref` as regular prop (no `forwardRef`)
- **Styling**: Use `react-native-unistyles` with `StyleSheet.create((theme) => ({...}))`. Co-locate styles at bottom of component file
- **i18n**: Use `useTranslation()` hook. Flat translation keys: `renderer.components.settingsPage.header`
- **Structure**: Component-per-folder with `ComponentName.tsx`, `ComponentName.spec.tsx`, `index.ts`
- **Errors**: Use `valibot` for validation. Proper error boundaries for React components

## Testing

- Jest preset: `jest-expo`. Tests co-located as `*.spec.tsx`
- Router tests must be in `__tests__/` directory (not in `app/`)
