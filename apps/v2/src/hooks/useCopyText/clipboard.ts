/**
 * Platform-specific clipboard implementation.
 * Separated for testability - this module can be mocked in tests.
 */

import { Platform } from "react-native";

//#region Platform-specific copy

async function copyToClipboardNative(text: string): Promise<void> {
  // Dynamic import to avoid bundling expo-clipboard on web
  const { setStringAsync } = await import("expo-clipboard");
  await setStringAsync(text);
}

async function copyToClipboardWeb(text: string): Promise<void> {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // Fallback for older browsers (legacy support)
  return new Promise((resolve, reject) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Prevent scrolling to bottom
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = "0";
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      if (successful) {
        resolve();
      } else {
        reject(new Error("Copy command failed"));
      }
    } catch (err) {
      document.body.removeChild(textArea);
      reject(err instanceof Error ? err : new Error("Copy failed"));
    }
  });
}

/**
 * Copy text to clipboard (platform-specific implementation).
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (Platform.OS === "web") {
    return copyToClipboardWeb(text);
  }
  return copyToClipboardNative(text);
}

//#endregion Platform-specific copy
