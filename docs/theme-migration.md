# Theme Migration from Desktop CSS to Unistyles

## Overview

Successfully migrated the theme from `@vendor/desktop/src/renderer/css/base/` to `@apps/v2/src/theme.ts` using React Native Unistyles 3.0.

## Source Files Migrated

- `_css_variables.scss` - Main color variables for light and dark themes
- `_variables.scss` - Additional color and z-index variables
- `_typography.scss` - Font families and weights
- `_buttons.scss` - Button styling variables
- `_mixins.scss` - Elevation and utility mixins

## Theme Structure

### Light Theme (Denim)

- **Colors**: 40+ color definitions including primary, secondary, sidebar, status indicators
- **Elevation**: 6 levels of box shadows (elevation-1 through elevation-6)
- **Border Radius**: xs (2px) to full (50%)
- **Typography**: Open Sans (primary), Metropolis (headings), FontAwesome (icons)

### Dark Theme (Onyx)

- Complete dark mode variant with appropriate color adjustments
- Maintains same structure as light theme for consistency
- Uses darker backgrounds and lighter text colors

## Key Features

✅ **Complete Color Palette**: All CSS variables converted to theme colors
✅ **Responsive Breakpoints**: xs, sm, md, lg, xl configured
✅ **Typography System**: Font families and weights included
✅ **Elevation System**: Box shadow levels for depth
✅ **Spacing Utility**: `gap()` function for consistent spacing
✅ **Theme Switching**: Runtime theme switching supported
✅ **TypeScript Support**: Full type safety with theme autocomplete

## Usage Examples

### Basic Component Styling

```typescript
import { StyleSheet } from "react-native-unistyles";

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.centerChannelBg,
    padding: theme.gap(2), // 16px
    borderRadius: theme.radius.m, // 8px
  },

  text: {
    color: theme.colors.centerChannelColor,
    fontFamily: theme.fonts.primary,
    fontSize: 14,
  },

  button: {
    backgroundColor: theme.colors.buttonBg,
    color: theme.colors.buttonColor,
    paddingHorizontal: theme.gap(2.5), // 20px
    paddingVertical: theme.gap(1.5), // 12px
    borderRadius: theme.radius.s, // 4px
    // Use elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
}));
```

### Theme Switching

```typescript
import { UnistylesRuntime } from "react-native-unistyles";

// Switch between light and dark themes
const toggleTheme = () => {
  UnistylesRuntime.setTheme(
    UnistylesRuntime.themeName === "light" ? "dark" : "light",
  );
};
```

### Available Theme Properties

#### Colors

- **Primary**: `primary`, `primaryHover`, `secondary`
- **Backgrounds**: `centerChannelBg`, `sidebarBg`, `sidebarHeaderBg`
- **Text**: `centerChannelColor`, `sidebarText`, `sidebarHeaderTextColor`
- **Status**: `onlineIndicator`, `awayIndicator`, `dndIndicator`
- **Buttons**: `buttonBg`, `buttonColor`
- **Borders**: `borderDefault`, `borderLight`, `borderDark`
- **Highlights**: `mentionBg`, `mentionHighlightBg`, `ownHighlightBg`

#### Utilities

- **Spacing**: `theme.gap(multiplier)` - 8px base unit
- **Elevation**: `theme.elevation[1-6]` - Box shadow strings
- **Radius**: `theme.radius.{xs|s|m|l|xl|full}` - Border radius values
- **Fonts**: `theme.fonts.{primary|heading|fontAwesome}` - Font families
- **Weights**: `theme.fontWeights.{light|normal|semiBold}` - Font weights

## Migration Benefits

1. **Performance**: No re-renders on theme changes (C++ Shadow Tree updates)
2. **Type Safety**: Full TypeScript autocomplete for all theme properties
3. **Consistency**: Same color palette across desktop and mobile
4. **Maintainability**: Single source of truth for theme configuration
5. **Flexibility**: Easy to add new themes or modify existing ones
6. **Cross-platform**: Works on iOS, Android, and Web

## Configuration

The theme is automatically configured in `theme.ts` with:

- Initial theme set to "light"
- Breakpoints for responsive design
- Type declarations for TypeScript support
- Both light and dark themes registered

To use the theme in your components, simply import `StyleSheet` from `react-native-unistyles` instead of React Native's built-in StyleSheet.
