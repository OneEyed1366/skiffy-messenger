# G.05: Add Shadow/Elevation Tokens

## Metadata

| Field        | Value         |
| ------------ | ------------- |
| **ID**       | G.05          |
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

| Task ID | Name   |
| ------- | ------ |
| T9.01   | Modal  |
| T9.04   | Menu   |
| T6.02   | Button |

## Description

Convert CSS box-shadow values to React Native shadow format.

## Current State

```typescript
// Current theme.ts - CSS format (doesn't work in RN)
elevation: {
  1: "0 2px 3px 0 rgba(0, 0, 0, 0.08)",
  2: "0 4px 6px 0 rgba(0, 0, 0, 0.12)",
  // ...
}
```

## React Native Shadow Format

```typescript
// iOS uses these properties
{
  shadowColor: string;
  shadowOffset: {
    width: number;
    height: number;
  }
  shadowOpacity: number;
  shadowRadius: number;
}

// Android uses elevation
{
  elevation: number;
}
```

## Implementation

```typescript
// apps/v2/src/theme.ts

import { Platform } from "react-native";

// Shadow definitions for iOS
type ShadowStyle = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number; // For Android
};

const shadows: Record<string, ShadowStyle> = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  "2xl": {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  inner: {
    // Inner shadows not directly supported in RN
    // Use background color trick or SVG
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

// Mapping from CSS elevation numbers to named shadows
const elevationToShadow = {
  1: shadows.sm,
  2: shadows.md,
  3: shadows.lg,
  4: shadows.xl,
  5: shadows["2xl"],
  6: shadows["2xl"], // Max elevation
} as const;

// Helper function to get shadow styles
function getShadow(level: keyof typeof elevationToShadow): ShadowStyle {
  return elevationToShadow[level];
}

// Add to theme
const lightTheme = {
  // ... existing
  shadows,
  getShadow,

  // Keep old elevation for reference, but mark deprecated
  /** @deprecated Use shadows instead */
  elevation: {
    1: shadows.sm,
    2: shadows.md,
    3: shadows.lg,
    4: shadows.xl,
    5: shadows["2xl"],
    6: shadows["2xl"],
  },
};
```

## Usage Examples

```typescript
// Using named shadows
const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.colors.bgPrimary,
    borderRadius: theme.radius.m,
    ...theme.shadows.md,
  },

  modal: {
    backgroundColor: theme.colors.bgPrimary,
    ...theme.shadows["2xl"],
  },

  button: {
    ...theme.shadows.sm,
  },
}));

// Using getShadow helper
const dynamicStyle = {
  ...theme.getShadow(2),
};
```

## Dark Theme Considerations

```typescript
// Dark theme may need lighter/different shadows
const darkShadows: Record<string, ShadowStyle> = {
  // Could use slightly different opacities or colors
  sm: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15, // Slightly more visible in dark mode
    shadowRadius: 2,
    elevation: 1,
  },
  // ... etc
};
```

## Acceptance Criteria

- [ ] shadows object with RN-compatible shadow styles
- [ ] Named levels: none, sm, md, lg, xl, 2xl
- [ ] Works on both iOS and Android
- [ ] getShadow helper function
- [ ] Old elevation object marked deprecated
- [ ] Dark theme shadows if needed

## Notes

- iOS and Android render shadows differently
- Android elevation can affect z-order
- Test on both platforms
- Inner shadows not supported - use alternative approaches
