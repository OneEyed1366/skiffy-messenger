// apps/v2/src/utils/keyboard.ts

/**
 * Keyboard utilities
 * Migrated from: vendor/desktop/webapp/channels/src/utils/keyboard.ts
 *
 * Provides cross-platform keyboard handling for desktop (Tauri) and mobile.
 * Mobile support is limited to TextInput onKeyPress events.
 */

import { Platform } from "react-native";

import { isMac } from "@/utils/platform";

//#region Types

/**
 * Key definition tuple: [key string, keyCode number]
 * - key[0]: Used for KeyboardEvent.key (modern browsers)
 * - key[1]: Used for KeyboardEvent.keyCode (legacy fallback)
 */
export type IKeyCode = readonly [string, number];

/**
 * Keyboard event interface compatible with both web KeyboardEvent
 * and React Native TextInput onKeyPress event.
 */
export type IKeyboardEvent = {
  key?: string;
  keyCode?: number;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
};

//#endregion

//#region Key Codes

/**
 * Key code constants for keyboard event handling.
 * Each entry is [key, keyCode] tuple.
 *
 * @example
 * ```typescript
 * if (isKeyPressed(event, KEY_CODES.ENTER)) {
 *   handleSubmit();
 * }
 * ```
 */
export const KEY_CODES = {
  BACKSPACE: ["Backspace", 8],
  TAB: ["Tab", 9],
  ENTER: ["Enter", 13],
  SHIFT: ["Shift", 16],
  CTRL: ["Control", 17],
  ALT: ["Alt", 18],
  CAPS_LOCK: ["CapsLock", 20],
  ESCAPE: ["Escape", 27],
  SPACE: [" ", 32],
  PAGE_UP: ["PageUp", 33],
  PAGE_DOWN: ["PageDown", 34],
  END: ["End", 35],
  HOME: ["Home", 36],
  LEFT: ["ArrowLeft", 37],
  UP: ["ArrowUp", 38],
  RIGHT: ["ArrowRight", 39],
  DOWN: ["ArrowDown", 40],
  DELETE: ["Delete", 46],
  ZERO: ["0", 48],
  ONE: ["1", 49],
  TWO: ["2", 50],
  THREE: ["3", 51],
  FOUR: ["4", 52],
  FIVE: ["5", 53],
  SIX: ["6", 54],
  SEVEN: ["7", 55],
  EIGHT: ["8", 56],
  NINE: ["9", 57],
  A: ["a", 65],
  B: ["b", 66],
  C: ["c", 67],
  D: ["d", 68],
  E: ["e", 69],
  F: ["f", 70],
  G: ["g", 71],
  H: ["h", 72],
  I: ["i", 73],
  J: ["j", 74],
  K: ["k", 75],
  L: ["l", 76],
  M: ["m", 77],
  N: ["n", 78],
  O: ["o", 79],
  P: ["p", 80],
  Q: ["q", 81],
  R: ["r", 82],
  S: ["s", 83],
  T: ["t", 84],
  U: ["u", 85],
  V: ["v", 86],
  W: ["w", 87],
  X: ["x", 88],
  Y: ["y", 89],
  Z: ["z", 90],
  CMD: ["Meta", 91],
  SEMICOLON: [";", 186],
  EQUAL: ["=", 187],
  COMMA: [",", 188],
  DASH: ["-", 189],
  PERIOD: [".", 190],
  FORWARD_SLASH: ["/", 191],
  OPEN_BRACKET: ["[", 219],
  BACK_SLASH: ["\\", 220],
  CLOSE_BRACKET: ["]", 221],
  COMPOSING: ["Composing", 229],
} as const satisfies Record<string, IKeyCode>;

//#endregion

//#region Keyboard Utilities

/**
 * Checks if the platform-specific command key is pressed.
 * - Mac: Meta key (Cmd)
 * - Windows/Linux: Ctrl key
 *
 * On mobile platforms without modifier key support, returns false.
 *
 * @param event - Keyboard event to check
 * @param allowAlt - If true, allows Alt key to be pressed alongside Ctrl (Windows/Linux only)
 * @returns True if Cmd (Mac) or Ctrl (others) is pressed
 *
 * @example
 * ```typescript
 * // Handle Cmd+S / Ctrl+S
 * if (cmdOrCtrlPressed(event) && isKeyPressed(event, KEY_CODES.S)) {
 *   handleSave();
 * }
 * ```
 */
export function cmdOrCtrlPressed(
  event: IKeyboardEvent,
  allowAlt = false,
): boolean {
  // Mobile platforms don't reliably report modifier keys
  if (Platform.OS === "ios" || Platform.OS === "android") {
    // Only available with external keyboard, check if properties exist
    if (event.metaKey === undefined && event.ctrlKey === undefined) {
      return false;
    }
  }

  const isMacPlatform = isMac();

  if (allowAlt) {
    return (
      (isMacPlatform && !!event.metaKey) || (!isMacPlatform && !!event.ctrlKey)
    );
  }

  return (
    (isMacPlatform && !!event.metaKey) ||
    (!isMacPlatform && !!event.ctrlKey && !event.altKey)
  );
}

/**
 * Checks if a specific key was pressed.
 * Handles different keyboard layouts by checking both key and keyCode.
 *
 * @param event - Keyboard event to check
 * @param key - Key code tuple to match against [key, keyCode]
 * @returns True if the specified key was pressed
 *
 * @example
 * ```typescript
 * if (isKeyPressed(event, KEY_CODES.ENTER)) {
 *   handleSubmit();
 * }
 *
 * // With modifier
 * if (cmdOrCtrlPressed(event) && isKeyPressed(event, KEY_CODES.V)) {
 *   handlePaste();
 * }
 * ```
 */
export function isKeyPressed(event: IKeyboardEvent, key: IKeyCode): boolean {
  // Skip if composing (IME input in progress)
  if (event.keyCode === KEY_CODES.COMPOSING[1]) {
    return false;
  }

  // Primary check: event.key (modern browsers, handles different layouts)
  if (
    typeof event.key !== "undefined" &&
    event.key !== "Unidentified" &&
    event.key !== "Dead"
  ) {
    const isPressedByKey =
      event.key === key[0] || event.key === key[0].toUpperCase();
    if (isPressedByKey) {
      return true;
    }
  }

  // Fallback: keyCode for different language keyboards
  return event.keyCode === key[1];
}

/**
 * Checks if Enter key was pressed without Shift modifier.
 * Useful for form submission vs. newline handling.
 *
 * @param event - Keyboard event to check
 * @returns True if Enter pressed without Shift
 */
export function isEnterPressed(event: IKeyboardEvent): boolean {
  return isKeyPressed(event, KEY_CODES.ENTER) && !event.shiftKey;
}

/**
 * Checks if Escape key was pressed.
 *
 * @param event - Keyboard event to check
 * @returns True if Escape was pressed
 */
export function isEscapePressed(event: IKeyboardEvent): boolean {
  return isKeyPressed(event, KEY_CODES.ESCAPE);
}

//#endregion
