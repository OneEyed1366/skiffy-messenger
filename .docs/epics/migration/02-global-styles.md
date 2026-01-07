# Global Styles Migration

## Overview

Before migrating components, ensure the global theme is complete with all tokens from Mattermost CSS.

## Current State

Theme file exists at `apps/v2/src/theme.ts` with basic Mattermost colors already mapped.

## Tasks

| ID                                         | Name                   | Status  | Est. |
| ------------------------------------------ | ---------------------- | ------- | ---- |
| [G.01](./tasks/G.01-audit-theme.md)        | Audit current theme.ts | pending | 1h   |
| [G.02](./tasks/G.02-add-missing-colors.md) | Add missing colors     | pending | 1h   |
| [G.03](./tasks/G.03-typography-scale.md)   | Add typography scale   | pending | 1h   |
| [G.04](./tasks/G.04-spacing-scale.md)      | Add spacing scale      | pending | 1h   |
| [G.05](./tasks/G.05-shadows.md)            | Add shadow/elevation   | pending | 1h   |
| [G.06](./tasks/G.06-animations.md)         | Add animation tokens   | pending | 1h   |

## Source Reference

Key Mattermost CSS files:

- `vendor/desktop/webapp/channels/src/sass/base/_css_variables.scss`
- `vendor/desktop/webapp/channels/src/sass/base/_variables.scss`
- `vendor/desktop/webapp/channels/src/sass/base/_typography.scss`
- `vendor/desktop/webapp/channels/src/sass/utils/_mixins.scss`

## Target Theme Structure

```typescript
// apps/v2/src/theme.ts

const lightTheme = {
  colors: {
    // Primary
    primary: string;
    primaryHover: string;

    // Button
    buttonBg: string;
    buttonColor: string;

    // Backgrounds
    centerChannelBg: string;
    centerChannelColor: string;

    // Sidebar (9 colors)
    sidebarBg: string;
    sidebarText: string;
    // ... etc

    // Status indicators
    onlineIndicator: string;
    awayIndicator: string;
    dndIndicator: string;

    // Semantic
    errorText: string;
    linkColor: string;
    mentionBg: string;
    // ... etc
  },

  // Typography
  typography: {
    fontFamily: {
      primary: string;
      heading: string;
      mono: string;
    },
    fontSize: {
      xs: number;   // 11
      sm: number;   // 12
      md: number;   // 14
      lg: number;   // 16
      xl: number;   // 18
      '2xl': number; // 20
      '3xl': number; // 24
      '4xl': number; // 28
    },
    lineHeight: {
      tight: number;   // 1.2
      normal: number;  // 1.5
      relaxed: number; // 1.75
    },
    fontWeight: {
      light: number;    // 300
      normal: number;   // 400
      semiBold: number; // 600
      bold: number;     // 700
    },
  },

  // Spacing (gap multiplier = 8)
  gap: (v: number) => number;

  // Specific spacing tokens
  spacing: {
    xs: number;  // 4
    sm: number;  // 8
    md: number;  // 16
    lg: number;  // 24
    xl: number;  // 32
    '2xl': number; // 48
  },

  // Border radius
  radius: {
    xs: number;  // 2
    s: number;   // 4
    m: number;   // 8
    l: number;   // 12
    xl: number;  // 16
    full: string; // 50%
  },

  // Shadows (React Native format)
  shadow: {
    sm: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    md: { ... };
    lg: { ... };
  },

  // Animation
  animation: {
    duration: {
      fast: number;    // 150
      normal: number;  // 250
      slow: number;    // 400
    },
    easing: {
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    },
  },
} as const;
```

## Color Mapping Reference

### From Mattermost CSS Variables

```scss
// vendor/desktop/webapp/channels/src/sass/base/_css_variables.scss

:root {
  // Primary (Denim theme)
  --button-bg: #1c58d9;
  --button-color: #ffffff;

  // Backgrounds
  --center-channel-bg: #ffffff;
  --center-channel-color: #3f4350;

  // Sidebar
  --sidebar-bg: #1e325c;
  --sidebar-text: #ffffff;
  --sidebar-unread-text: #ffffff;
  --sidebar-text-hover-bg: #28427b;
  --sidebar-text-active-border: #5d89ea;
  --sidebar-text-active-color: #ffffff;
  --sidebar-header-bg: #192a4d;
  --sidebar-teambar-bg: #162545;
  --sidebar-header-text-color: #ffffff;

  // Status
  --online-indicator: #3db887;
  --away-indicator: #ffbc1f;
  --dnd-indicator: #d24b4e;

  // Mentions
  --mention-bg: #ffffff;
  --mention-color: #1e325c;
  --mention-highlight-bg: #ffd470;

  // Links & Errors
  --link-color: #386fe5;
  --error-text: #d24b4e;

  // Radius
  --radius-xs: 2px;
  --radius-s: 4px;
  --radius-m: 8px;
  --radius-l: 12px;
  --radius-xl: 16px;
  --radius-full: 50%;

  // Elevation
  --elevation-1: 0 2px 3px 0 rgba(0, 0, 0, 0.08);
  --elevation-2: 0 4px 6px 0 rgba(0, 0, 0, 0.12);
  --elevation-3: 0 6px 14px 0 rgba(0, 0, 0, 0.12);
  --elevation-4: 0 8px 24px 0 rgba(0, 0, 0, 0.12);
  --elevation-5: 0 12px 32px 0 rgba(0, 0, 0, 0.12);
  --elevation-6: 0 20px 32px 0 rgba(0, 0, 0, 0.12);
}
```

### Missing Colors to Add

Check current `theme.ts` and add if missing:

```typescript
// Text variants
textPrimary: string; // Main text color
textSecondary: string; // Muted text
textDisabled: string; // Disabled state
textInverse: string; // Text on dark bg

// Backgrounds
bgPrimary: string; // Main bg
bgSecondary: string; // Secondary bg (cards)
bgTertiary: string; // Input bg
bgOverlay: string; // Modal overlay

// Borders
borderDefault: string;
borderLight: string;
borderDark: string;
borderFocus: string;

// Interactive states
hoverBg: string;
activeBg: string;
selectedBg: string;
focusRing: string;

// Semantic
success: string;
warning: string;
error: string;
info: string;
```

## Shadow Conversion

CSS box-shadow to React Native:

```typescript
// CSS: 0 4px 6px 0 rgba(0, 0, 0, 0.12)
// RN:
{
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.12,
  shadowRadius: 6,
  elevation: 4, // Android
}
```

## Acceptance Criteria

- [ ] All Mattermost CSS variables mapped to theme
- [ ] Typography scale complete
- [ ] Spacing scale complete
- [ ] Shadow tokens in RN format
- [ ] Animation tokens defined
- [ ] Dark theme has all same keys as light
- [ ] TypeScript types are strict (no `any`)
