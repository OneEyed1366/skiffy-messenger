# G.02: Add Missing Colors

## Metadata

| Field        | Value         |
| ------------ | ------------- |
| **ID**       | G.02          |
| **Layer**    | Global Styles |
| **Status**   | pending       |
| **Priority** | high          |
| **Estimate** | 1h            |
| **Parallel** | false         |
| **Assignee** | -             |
| **Created**  | 2026-01-04    |
| **Updated**  | 2026-01-04    |

## Dependencies

| Task ID | Name        | Status  |
| ------- | ----------- | ------- |
| G.01    | Audit theme | pending |

## Blocks

| Task ID | Name                |
| ------- | ------------------- |
| All L6+ | All component tasks |

## Description

Add any missing semantic colors identified in G.01 audit.

## Expected Additions

Based on Mattermost CSS analysis, these colors may be missing:

```typescript
// Text variants
textPrimary: string; // Main text color (alias for centerChannelColor)
textSecondary: string; // Muted text (60% opacity)
textDisabled: string; // Disabled state (40% opacity)
textInverse: string; // Text on dark backgrounds

// Background variants
bgPrimary: string; // Main bg (alias for centerChannelBg)
bgSecondary: string; // Secondary bg (cards, inputs)
bgTertiary: string; // Tertiary bg (hover states)
bgOverlay: string; // Modal overlay (rgba black)

// Interactive states
hoverBg: string; // Default hover background
activeBg: string; // Active/pressed state
selectedBg: string; // Selected item background
focusRing: string; // Focus outline color

// Semantic colors
success: string; // Success state (green)
warning: string; // Warning state (yellow)
error: string; // Error state (alias for errorText)
info: string; // Info state (blue)

// Specific UI elements
codeBlockBg: string; // Code block background
quoteBorder: string; // Blockquote border
tableBorder: string; // Table border
inputBg: string; // Input background
inputBorder: string; // Input border
inputFocusBorder: string; // Input focus border
```

## Implementation

```typescript
// apps/v2/src/theme.ts

const lightTheme = {
  colors: {
    // ... existing colors ...

    // Text variants
    textPrimary: "#3f4350", // Same as centerChannelColor
    textSecondary: "rgba(63, 67, 80, 0.64)",
    textDisabled: "rgba(63, 67, 80, 0.40)",
    textInverse: "#ffffff",

    // Background variants
    bgPrimary: "#ffffff",
    bgSecondary: "#f7f7f7",
    bgTertiary: "#eeeeee",
    bgOverlay: "rgba(0, 0, 0, 0.5)",

    // Interactive states
    hoverBg: "rgba(63, 67, 80, 0.08)",
    activeBg: "rgba(63, 67, 80, 0.12)",
    selectedBg: "rgba(28, 88, 217, 0.08)",
    focusRing: "#1c58d9",

    // Semantic colors
    success: "#3db887",
    warning: "#ffbc1f",
    error: "#d24b4e",
    info: "#1c58d9",

    // Specific UI elements
    codeBlockBg: "#f4f4f4",
    quoteBorder: "#dddddd",
    tableBorder: "#e0e0e0",
    inputBg: "#ffffff",
    inputBorder: "rgba(63, 67, 80, 0.16)",
    inputFocusBorder: "#1c58d9",
  },
  // ... rest of theme
};

const darkTheme = {
  colors: {
    // ... existing colors ...

    // Text variants (dark mode)
    textPrimary: "#e3e4e8",
    textSecondary: "rgba(227, 228, 232, 0.64)",
    textDisabled: "rgba(227, 228, 232, 0.40)",
    textInverse: "#1b1d22",

    // Background variants (dark mode)
    bgPrimary: "#1b1d22",
    bgSecondary: "#24272d",
    bgTertiary: "#2d3039",
    bgOverlay: "rgba(0, 0, 0, 0.7)",

    // Interactive states (dark mode)
    hoverBg: "rgba(227, 228, 232, 0.08)",
    activeBg: "rgba(227, 228, 232, 0.12)",
    selectedBg: "rgba(93, 137, 234, 0.16)",
    focusRing: "#5d89ea",

    // Semantic colors (dark mode - slightly adjusted)
    success: "#3db887",
    warning: "#f5ab00",
    error: "#da6c6e",
    info: "#5d89ea",

    // Specific UI elements (dark mode)
    codeBlockBg: "#24272d",
    quoteBorder: "#3d3f45",
    tableBorder: "#3d3f45",
    inputBg: "#24272d",
    inputBorder: "rgba(227, 228, 232, 0.16)",
    inputFocusBorder: "#5d89ea",
  },
  // ... rest of theme
};
```

## Acceptance Criteria

- [ ] All missing colors added to lightTheme
- [ ] All missing colors added to darkTheme
- [ ] Colors are semantically correct for each theme
- [ ] TypeScript compiles without errors
- [ ] Theme type is updated if needed

## Testing

```bash
# Type check
pnpm --filter @retrievly/app tsc --noEmit
```
