import { StyleSheet } from "react-native-unistyles";

type AppBreakpoints = typeof breakpoints;
type AppThemes = typeof appThemes;

declare module "react-native-unistyles" {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

/**
 * Unistyles Theme Configuration
 *
 * Migrated from: @vendor/desktop/src/renderer/css/base/
 * Source files: _css_variables.scss, _variables.scss, _typography.scss, _buttons.scss, _mixins.scss
 *
 * Contains:
 * - Light theme (Denim) with comprehensive color palette from desktop CSS
 * - Dark theme (Onyx) with matching dark mode variants
 * - Elevation shadows (6 levels)
 * - Border radius values (xs to full)
 * - Typography configuration (Open Sans, Metropolis, FontAwesome)
 * - Spacing utility function
 *
 * Usage: Themes are auto-configured with Unistyles and available throughout the app
 */
const lightTheme = {
  colors: {
    // Primary colors from CSS variables (Denim theme)
    primary: "#166de0",
    primaryHover: "#1458c8",
    secondary: "#1ff4ff",

    // Static colors
    indigo400: "#28427B",
    indigo300: "#32539A",
    sand: "#CCC4AE",
    neutral0: "#FFFFFF",
    neutral1200: "#090A0B",
    yellow400: "#FFBC1F",

    // Button colors
    buttonBg: "#1c58d9",
    buttonColor: "#ffffff",

    // Background and text
    centerChannelBg: "#ffffff",
    centerChannelColor: "#3f4350",

    // Sidebar colors
    sidebarBg: "#1e325c",
    sidebarText: "#ffffff",
    sidebarUnreadText: "#ffffff",
    sidebarTextHoverBg: "#28427b",
    sidebarTextActiveBorder: "#5d89ea",
    sidebarTextActiveColor: "#ffffff",
    sidebarHeaderBg: "#192a4d",
    sidebarTeambarBg: "#162545",
    sidebarHeaderTextColor: "#ffffff",

    // Status indicators
    onlineIndicator: "#3db887",
    awayIndicator: "#ffbc1f",
    dndIndicator: "#d24b4e",

    // Mentions and highlights
    mentionBg: "#ffffff",
    mentionColor: "#1e325c",
    mentionHighlightBg: "#ffd470",
    mentionHighlightLink: "#1b1d22",
    mentionHighlightBgMixed: "#ffe9b7",
    pinnedHighlightBgMixed: "#fff4dc",
    ownHighlightBg: "#f5cc6e",

    // Messages and links
    newMessageSeparator: "#cc8f00",
    linkColor: "#386fe5",
    errorText: "#d24b4e",

    // Border colors (using rgba approximations)
    borderDefault: "rgba(63, 67, 80, 0.12)",
    borderLight: "rgba(63, 67, 80, 0.08)",
    borderDark: "rgba(63, 67, 80, 0.16)",
  },

  // Elevation shadows from CSS variables
  elevation: {
    1: "0 2px 3px 0 rgba(0, 0, 0, 0.08)",
    2: "0 4px 6px 0 rgba(0, 0, 0, 0.12)",
    3: "0 6px 14px 0 rgba(0, 0, 0, 0.12)",
    4: "0 8px 24px 0 rgba(0, 0, 0, 0.12)",
    5: "0 12px 32px 0 rgba(0, 0, 0, 0.12)",
    6: "0 20px 32px 0 rgba(0, 0, 0, 0.12)",
  },

  // Border radius from CSS variables
  radius: {
    xs: 2,
    s: 4,
    m: 8,
    l: 12,
    xl: 16,
    full: "50%",
  },

  // Typography
  fonts: {
    primary: "'Open Sans', sans-serif",
    heading: "Metropolis, sans-serif",
    fontAwesome: "FontAwesome",
  },

  fontWeights: {
    light: 300,
    normal: 400,
    semiBold: 600,
  },

  // Spacing utility
  gap: (v: number) => v * 8,
};

const darkTheme = {
  colors: {
    // Primary colors (same as light for consistency)
    primary: "#166de0",
    primaryHover: "#1458c8",
    secondary: "#1ff4ff",

    // Static colors (same as light)
    indigo400: "#28427B",
    indigo300: "#32539A",
    sand: "#CCC4AE",
    neutral0: "#FFFFFF",
    neutral1200: "#090A0B",
    yellow400: "#FFBC1F",

    // Button colors - dark theme (Onyx)
    buttonBg: "#4a7ce8",
    buttonColor: "#ffffff",

    // Background and text - dark theme
    centerChannelBg: "#191b1f",
    centerChannelColor: "#e3e4e8",

    // Sidebar colors - dark theme
    sidebarBg: "#202228",
    sidebarText: "#ffffff",
    sidebarUnreadText: "#ffffff",
    sidebarTextHoverBg: "#25262a",
    sidebarTextActiveBorder: "#4a7ce8",
    sidebarTextActiveColor: "#ffffff",
    sidebarHeaderBg: "#24272d",
    sidebarTeambarBg: "#292c33",
    sidebarHeaderTextColor: "#ffffff",

    // Status indicators - dark theme variations
    onlineIndicator: "#3db887",
    awayIndicator: "#f5ab00",
    dndIndicator: "#d24b4e",

    // Mentions and highlights - dark theme
    mentionBg: "#4b7ce7",
    mentionColor: "#ffffff",
    mentionHighlightBg: "#0d6e6e",
    mentionHighlightLink: "#a4f4f4",
    mentionHighlightBgMixed: "#134446",
    pinnedHighlightBgMixed: "#162e31",
    ownHighlightBg: "#177374",

    // Messages and links - dark theme
    newMessageSeparator: "#1adbdb",
    linkColor: "#5d89ea",
    errorText: "#da6c6e",

    // Border colors - dark theme (using rgba approximations)
    borderDefault: "rgba(227, 228, 232, 0.12)",
    borderLight: "rgba(227, 228, 232, 0.08)",
    borderDark: "rgba(227, 228, 232, 0.16)",
  },

  // Same elevation, radius, fonts, and utilities as light theme
  elevation: lightTheme.elevation,
  radius: lightTheme.radius,
  fonts: lightTheme.fonts,
  fontWeights: lightTheme.fontWeights,
  gap: lightTheme.gap,
};

const appThemes = {
  light: lightTheme,
  dark: darkTheme,
};

const breakpoints = {
  xs: 0,
  sm: 300,
  md: 500,
  lg: 800,
  xl: 1200,
};

StyleSheet.configure({
  settings: {
    initialTheme: "light",
  },
  breakpoints,
  themes: appThemes,
});

// Export themes for use in other parts of the app
export { appThemes, darkTheme, lightTheme };
