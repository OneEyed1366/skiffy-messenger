# G.03: Add Typography Scale

## Metadata

| Field        | Value         |
| ------------ | ------------- |
| **ID**       | G.03          |
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

| Task ID | Name           |
| ------- | -------------- |
| T6.01   | Text component |

## Description

Add comprehensive typography scale to theme based on Mattermost typography.

## Source Reference

```scss
// vendor/desktop/webapp/channels/src/sass/base/_typography.scss

$font-family-sans-serif: "Open Sans", sans-serif;
$font-size-base: 14px;
$font-size-small: 12px;
$font-size-large: 16px;
$line-height-base: 1.42857143;
```

## Implementation

```typescript
// apps/v2/src/theme.ts

const typography = {
  // Font families
  fontFamily: {
    primary: "Open Sans", // System font on mobile
    heading: "Metropolis", // May need to load or use system
    mono: "monospace", // Code blocks
  },

  // Font sizes (in pixels, will be scaled)
  fontSize: {
    xs: 11, // Small labels
    sm: 12, // Secondary text
    md: 14, // Body text (base)
    lg: 16, // Large body
    xl: 18, // Small headings
    "2xl": 20, // H3
    "3xl": 24, // H2
    "4xl": 28, // H1
    "5xl": 32, // Display
  },

  // Line heights (multipliers)
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Font weights
  fontWeight: {
    light: "300",
    normal: "400",
    medium: "500",
    semiBold: "600",
    bold: "700",
  },

  // Letter spacing
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
  },
} as const;

// Text style presets for common use cases
const textStyles = {
  // Headings
  h1: {
    fontSize: typography.fontSize["4xl"],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
  },
  h2: {
    fontSize: typography.fontSize["3xl"],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
  },
  h3: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.semiBold,
    lineHeight: typography.lineHeight.snug,
  },
  h4: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semiBold,
    lineHeight: typography.lineHeight.snug,
  },

  // Body
  bodyLg: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
  },
  body: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
  },
  bodySm: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
  },

  // Labels
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    lineHeight: typography.lineHeight.tight,
  },
  labelSm: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    lineHeight: typography.lineHeight.tight,
  },

  // Caption
  caption: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
  },

  // Code
  code: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.mono,
    lineHeight: typography.lineHeight.relaxed,
  },
} as const;

// Add to theme
const lightTheme = {
  // ... existing
  typography,
  textStyles,
};
```

## Usage Example

```typescript
// In a component
const styles = StyleSheet.create((theme) => ({
  title: {
    ...theme.textStyles.h2,
    color: theme.colors.textPrimary,
  },
  body: {
    ...theme.textStyles.body,
    color: theme.colors.textSecondary,
  },
}));
```

## Acceptance Criteria

- [ ] Typography object added to theme
- [ ] textStyles presets defined
- [ ] Both light and dark themes have typography
- [ ] Font sizes work well on mobile (not too small)
- [ ] TypeScript types are correct

## Notes

- React Native uses unitless numbers for fontSize
- Consider using PixelRatio.getFontScale() for accessibility
- May need to load custom fonts via expo-font
