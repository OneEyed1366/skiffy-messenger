// apps/v2/src/utils/clipboard.ts

/**
 * Clipboard utilities
 * Provides cross-platform clipboard access for copy/paste operations.
 *
 * Uses expo-clipboard for native clipboard integration.
 */

import * as Clipboard from "expo-clipboard";

//#region Types

export type IClipboardContent = {
  text: string;
  hasText: boolean;
};

//#endregion

//#region Clipboard Operations

/**
 * Copy text to the system clipboard.
 *
 * @param text - Text to copy to clipboard
 * @returns Promise resolving to true if copy succeeded, false otherwise
 *
 * @example
 * ```typescript
 * const success = await copyToClipboard("Hello, World!");
 * if (success) {
 *   showToast("Copied to clipboard");
 * }
 * ```
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await Clipboard.setStringAsync(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

/**
 * Read text from the system clipboard.
 *
 * Note: On Android 10+, clipboard read may be restricted when app is in background.
 * On web, requires secure context and may require user gesture.
 *
 * @returns Promise resolving to clipboard text, or empty string if unavailable
 *
 * @example
 * ```typescript
 * const text = await getClipboardText();
 * if (text) {
 *   handlePastedContent(text);
 * }
 * ```
 */
export async function getClipboardText(): Promise<string> {
  try {
    const text = await Clipboard.getStringAsync();
    return text ?? "";
  } catch (error) {
    console.error("Failed to read clipboard:", error);
    return "";
  }
}

/**
 * Check if the clipboard contains text content.
 *
 * More efficient than getClipboardText() when you only need to check availability.
 *
 * @returns Promise resolving to true if clipboard has text, false otherwise
 *
 * @example
 * ```typescript
 * const canPaste = await hasClipboardText();
 * setPasteButtonEnabled(canPaste);
 * ```
 */
export async function hasClipboardText(): Promise<boolean> {
  try {
    const hasString = await Clipboard.hasStringAsync();
    return hasString;
  } catch (error) {
    console.error("Failed to check clipboard:", error);
    return false;
  }
}

//#endregion

//#region Clipboard Content

/**
 * Get clipboard content with metadata.
 *
 * Convenience function that returns both text and availability status.
 *
 * @returns Promise resolving to clipboard content object
 *
 * @example
 * ```typescript
 * const content = await getClipboardContent();
 * if (content.hasText) {
 *   console.log("Clipboard contains:", content.text);
 * }
 * ```
 */
export async function getClipboardContent(): Promise<IClipboardContent> {
  try {
    const [text, hasText] = await Promise.all([
      Clipboard.getStringAsync(),
      Clipboard.hasStringAsync(),
    ]);

    return {
      text: text ?? "",
      hasText,
    };
  } catch (error) {
    console.error("Failed to get clipboard content:", error);
    return {
      text: "",
      hasText: false,
    };
  }
}

//#endregion
