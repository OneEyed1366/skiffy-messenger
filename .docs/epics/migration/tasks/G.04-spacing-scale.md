# G.04: Add Spacing Scale

## Metadata

| Field        | Value         |
| ------------ | ------------- |
| **ID**       | G.04          |
| **Layer**    | Global Styles |
| **Status**   | pending       |
| **Priority** | high          |
| **Estimate** | 1h            |
| **Parallel** | true          |
| **Assignee** | -             |
| **Created**  | 2026-01-04    |
| **Updated**  | 2026-01-04    |

## Dependencies

None

## Blocks

| Task ID | Name                |
| ------- | ------------------- |
| All L6+ | All component tasks |

## Description

Add comprehensive spacing scale to theme. Currently has `gap(v)` function - add named spacing tokens for common values.

## Current State

```typescript
// Current theme.ts
gap: (v: number) => v * 8,
```

## Implementation

```typescript
// apps/v2/src/theme.ts

const spacing = {
  // Named spacing values (base unit = 4px for finer control)
  0: 0,
  px: 1,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
} as const;

// Semantic spacing aliases
const spacingAliases = {
  // Component internal spacing
  componentPaddingXs: spacing[2], // 8px
  componentPaddingSm: spacing[3], // 12px
  componentPaddingMd: spacing[4], // 16px
  componentPaddingLg: spacing[6], // 24px
  componentPaddingXl: spacing[8], // 32px

  // Component gaps (between elements)
  gapXs: spacing[1], // 4px
  gapSm: spacing[2], // 8px
  gapMd: spacing[4], // 16px
  gapLg: spacing[6], // 24px
  gapXl: spacing[8], // 32px

  // Section spacing
  sectionPaddingSm: spacing[4], // 16px
  sectionPaddingMd: spacing[6], // 24px
  sectionPaddingLg: spacing[8], // 32px

  // Screen padding (safe area aware)
  screenPaddingHorizontal: spacing[4], // 16px
  screenPaddingVertical: spacing[4], // 16px

  // Specific UI elements
  inputHeight: spacing[10], // 40px
  inputHeightSm: spacing[8], // 32px
  inputHeightLg: spacing[12], // 48px
  buttonHeight: spacing[10], // 40px
  buttonHeightSm: spacing[8], // 32px
  buttonHeightLg: spacing[12], // 48px
  avatarSizeSm: spacing[6], // 24px
  avatarSizeMd: spacing[8], // 32px
  avatarSizeLg: spacing[10], // 40px
  avatarSizeXl: spacing[16], // 64px
  iconSizeSm: spacing[4], // 16px
  iconSizeMd: spacing[5], // 20px
  iconSizeLg: spacing[6], // 24px
  sidebarWidth: 240,
  sidebarWidthCollapsed: spacing[16], // 64px
  headerHeight: spacing[11], // 44px
  tabBarHeight: spacing[14], // 56px
} as const;

// Add to theme
const lightTheme = {
  // ... existing
  spacing,
  ...spacingAliases,

  // Keep gap function for flexibility
  gap: (v: number) => v * 8,
};
```

## Usage Examples

```typescript
// Using named spacing
const styles = StyleSheet.create((theme) => ({
  container: {
    padding: theme.spacing[4], // 16px
    gap: theme.spacing[2], // 8px
  },

  // Using semantic aliases
  card: {
    padding: theme.componentPaddingMd, // 16px
    marginBottom: theme.gapMd, // 16px
  },

  // Using gap function
  flexible: {
    padding: theme.gap(2), // 16px
    margin: theme.gap(0.5), // 4px
  },
}));
```

## Acceptance Criteria

- [ ] Named spacing scale added (0-32)
- [ ] Semantic spacing aliases defined
- [ ] Component size tokens defined (input, button, avatar heights)
- [ ] UI element dimensions defined (sidebar, header, tab bar)
- [ ] TypeScript types correct
- [ ] gap() function still works

## Notes

- Base unit is 4px (not 8px) for finer control
- Use named values for consistency
- Use gap() for custom/flexible values
- Mobile may need different values than web for touch targets
