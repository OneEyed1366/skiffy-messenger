// apps/v2/src/utils/color.ts

/**
 * Color manipulation utilities
 * Migrated from: vendor/desktop/webapp/channels/src/packages/mattermost-redux/src/utils/theme_utils.ts
 *                vendor/desktop/webapp/channels/src/utils/utils.tsx
 */

//#region Types

/**
 * RGB color components with alpha channel
 */
export type IColorComponents = {
  red: number;
  green: number;
  blue: number;
  alpha: number;
};

//#endregion

//#region Constants

const RGB_PATTERN = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/;

//#endregion

//#region Color Parsing

/**
 * Extracts RGBA components from a color string (hex or rgb/rgba).
 *
 * @param inColor - Color string in hex (#fff, #ffffff) or rgb/rgba format
 * @returns Object with red, green, blue (0-255) and alpha (0-1) values
 */
export function getComponents(inColor: string): IColorComponents {
  let color = inColor;

  // Try RGB/RGBA pattern first
  const match = RGB_PATTERN.exec(color);
  if (match) {
    return {
      red: parseInt(match[1], 10),
      green: parseInt(match[2], 10),
      blue: parseInt(match[3], 10),
      alpha: match[4] ? parseFloat(match[4]) : 1,
    };
  }

  // Handle hex color
  if (color[0] === "#") {
    color = color.slice(1);
  }

  // Expand 3-digit hex to 6-digit
  if (color.length === 3) {
    color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
  }

  return {
    red: parseInt(color.substring(0, 2), 16),
    green: parseInt(color.substring(2, 4), 16),
    blue: parseInt(color.substring(4, 6), 16),
    alpha: 1,
  };
}

//#endregion

//#region Opacity

/**
 * Changes the opacity of a color by multiplying its alpha channel.
 *
 * @param oldColor - Original color (hex or rgba)
 * @param opacity - Opacity multiplier (0-1)
 * @returns RGBA color string with adjusted opacity
 */
export function changeOpacity(oldColor: string, opacity: number): string {
  const { red, green, blue, alpha } = getComponents(oldColor);
  return `rgba(${red},${green},${blue},${alpha * opacity})`;
}

//#endregion

//#region Color Blending

/**
 * Blends a single color component.
 */
function blendComponent(
  background: number,
  foreground: number,
  opacity: number,
): number {
  return (1 - opacity) * background + opacity * foreground;
}

/**
 * Blends two colors together based on opacity.
 *
 * @param background - Background color
 * @param foreground - Foreground color to blend
 * @param opacity - Blend opacity (0 = all background, 1 = all foreground)
 * @param hex - If true, return hex format instead of rgba
 * @returns Blended color as rgba or hex string
 */
export function blendColors(
  background: string,
  foreground: string,
  opacity: number,
  hex = false,
): string {
  const bg = getComponents(background);
  const fg = getComponents(foreground);

  const red = Math.floor(blendComponent(bg.red, fg.red, opacity));
  const green = Math.floor(blendComponent(bg.green, fg.green, opacity));
  const blue = Math.floor(blendComponent(bg.blue, fg.blue, opacity));
  const alpha = blendComponent(bg.alpha, fg.alpha, opacity);

  if (hex) {
    const r = red.toString(16).padStart(2, "0");
    const g = green.toString(16).padStart(2, "0");
    const b = blue.toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }

  return `rgba(${red},${green},${blue},${alpha})`;
}

//#endregion

//#region Color Conversion

/**
 * Converts a 6-digit hex color to RGB values string.
 *
 * @param hexStr - Hex color string (e.g., '#ffffff')
 * @returns RGB values as string (e.g., '255, 255, 255')
 */
export function toRgbValues(hexStr: string): string {
  const r = parseInt(hexStr.substring(1, 3), 16);
  const g = parseInt(hexStr.substring(3, 5), 16);
  const b = parseInt(hexStr.substring(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

//#endregion

//#region Contrast

/**
 * Returns black or white based on WCAG 2.1 luminance calculation.
 * Use for determining text color on a given background.
 *
 * @param colorHexCode - 6-digit hex color (with or without #)
 * @returns '#000000' for light backgrounds, '#FFFFFF' for dark backgrounds
 */
export function getContrastingSimpleColor(colorHexCode: string): string {
  const color = colorHexCode.startsWith("#")
    ? colorHexCode.slice(1)
    : colorHexCode;

  if (color.length !== 6) {
    return "";
  }

  const red = parseInt(color.substring(0, 2), 16);
  const green = parseInt(color.substring(2, 4), 16);
  const blue = parseInt(color.substring(4, 6), 16);

  // Convert to sRGB
  const srgb = [red / 255, green / 255, blue / 255];

  // Calculate relative luminance
  const [rL, gL, bL] = srgb.map((c) => {
    if (c <= 0.04045) {
      return c / 12.92;
    }
    return Math.pow((c + 0.055) / 1.055, 2.4);
  });

  const luminance = 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;

  return luminance > 0.179 ? "#000000" : "#FFFFFF";
}

//#endregion
