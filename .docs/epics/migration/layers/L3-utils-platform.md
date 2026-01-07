# L3: Platform Utils

## Overview

Platform detection and device capability utilities. Replaces web-based `user_agent.tsx`.

## Source Location

`vendor/desktop/webapp/channels/src/utils/user_agent.tsx`

## Target Location

`apps/v2/src/utils/platform.ts`

## Dependencies

- L2: Pure Utils

## Tasks

| ID                                                  | Name                | Status  | Parallel | Est. | Assignee |
| --------------------------------------------------- | ------------------- | ------- | -------- | ---- | -------- |
| [T3.01](../tasks/T3.01-utils-platform-detection.md) | Platform detection  | pending | ✓        | 2h   | -        |
| [T3.02](../tasks/T3.02-utils-keyboard.md)           | Keyboard utils      | pending | ✓        | 1h   | -        |
| [T3.03](../tasks/T3.03-utils-device.md)             | Device capabilities | pending | ✓        | 1h   | -        |
| [T3.04](../tasks/T3.04-utils-clipboard.md)          | Clipboard utils     | pending | ✓        | 0.5h | -        |
| [T3.05](../tasks/T3.05-utils-notifications.md)      | Notification utils  | pending | ✓        | 1h   | -        |
| [T3.06](../tasks/T3.06-utils-storage.md)            | Storage utils       | pending | ✓        | 1h   | -        |
| [T3.07](../tasks/T3.07-utils-haptics.md)            | Haptic feedback     | pending | ✓        | 0.5h | -        |

## Progress

- Total: 7
- Done: 0
- In Progress: 0
- Pending: 7

## File Structure

```
apps/v2/src/utils/
├── platform.ts      # T3.01 - Platform detection
├── keyboard.ts      # T3.02 - Keyboard utils
├── device.ts        # T3.03 - Device capabilities
├── clipboard.ts     # T3.04 - Clipboard (moved from L2)
├── notifications.ts # T3.05 - Push/local notifications
├── storage.ts       # T3.06 - Async storage
├── haptics.ts       # T3.07 - Haptic feedback
└── index.ts         # Updated exports
```

## Platform Detection (T3.01)

Replace user agent detection with React Native Platform API:

```typescript
// Source (web)
export function isIos(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

// Target (React Native)
import { Platform } from "react-native";

export function isIos(): boolean {
  return Platform.OS === "ios";
}

export function isAndroid(): boolean {
  return Platform.OS === "android";
}

export function isWeb(): boolean {
  return Platform.OS === "web";
}

export function isDesktop(): boolean {
  // Tauri detection
  return typeof window !== "undefined" && "__TAURI__" in window;
}

export function isMobile(): boolean {
  return isIos() || isAndroid();
}

export const platformSelect = Platform.select;
```

## Keyboard Utils (T3.02)

Adapt keyboard handling for React Native:

```typescript
import { Platform } from "react-native";

// Command key on Mac, Ctrl on others
export function isModifierKey(event: {
  metaKey?: boolean;
  ctrlKey?: boolean;
}): boolean {
  if (Platform.OS === "ios" || Platform.OS === "macos") {
    return event.metaKey === true;
  }
  return event.ctrlKey === true;
}

// Key code constants (may not be needed for mobile)
export const KeyCodes = {
  ENTER: "Enter",
  ESCAPE: "Escape",
  TAB: "Tab",
  BACKSPACE: "Backspace",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
} as const;
```

## Device Capabilities (T3.03)

```typescript
import { Dimensions, PixelRatio, Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";

export function getScreenDimensions() {
  const { width, height } = Dimensions.get("window");
  return { width, height };
}

export function getPixelRatio(): number {
  return PixelRatio.get();
}

export function isTablet(): boolean {
  if (Platform.OS === "ios") {
    return Device.deviceType === Device.DeviceType.TABLET;
  }
  // Android: use screen size heuristic
  const { width, height } = getScreenDimensions();
  const aspectRatio = height / width;
  return Math.min(width, height) >= 600 && aspectRatio < 1.6;
}

export function getDeviceInfo() {
  return {
    brand: Device.brand,
    modelName: Device.modelName,
    osName: Device.osName,
    osVersion: Device.osVersion,
    appVersion: Constants.expoConfig?.version,
  };
}
```

## Migration Mapping

| Web Function     | React Native Replacement    |
| ---------------- | --------------------------- |
| `isChrome()`     | Remove (not needed)         |
| `isSafari()`     | Remove (not needed)         |
| `isIos()`        | `Platform.OS === 'ios'`     |
| `isAndroid()`    | `Platform.OS === 'android'` |
| `isMobile()`     | `Platform.OS !== 'web'`     |
| `isDesktopApp()` | Check for Tauri             |
| `isWindows()`    | `Platform.OS === 'windows'` |
| `isMac()`        | `Platform.OS === 'macos'`   |

## Notes

- Many web-specific functions can be removed
- Focus on capabilities that affect UI/UX on mobile
- Use Expo packages for device info where available

## Consolidation Notes

### Platform Detection Overlap (T3.01 ↔ T3.03)

T3.01 (`platform.ts`) and T3.03 (`device.ts`) both define platform detection functions:

- `isIos()`, `isAndroid()`, `isWeb()`

**Resolution:** Keep these in T3.01 (`platform.ts`) only. T3.03 (`device.ts`) should import from `@/utils/platform`:

```typescript
// device.ts - DO NOT redefine platform detection
import { isIos, isAndroid, isWeb } from "@/utils/platform";

// Use imported functions for conditional logic
export function isTablet(): boolean {
  if (isIos()) {
    return Device.deviceType === Device.DeviceType.TABLET;
  }
  // Android logic...
}
```

This avoids duplicate exports and ensures consistent behavior across the codebase.

## Clipboard Utils (T3.04)

> **Note:** Moved from L2 — clipboard operations are platform-specific.

```typescript
import * as Clipboard from "expo-clipboard";

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await Clipboard.setStringAsync(text);
    return true;
  } catch {
    return false;
  }
}

export async function getClipboardText(): Promise<string | null> {
  try {
    return await Clipboard.getStringAsync();
  } catch {
    return null;
  }
}
```

## Notification Utils (T3.05)

```typescript
import * as Notifications from "expo-notifications";

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleLocalNotification(
  title: string,
  body: string,
  trigger?: Notifications.NotificationTriggerInput,
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: trigger ?? null,
  });
}
```

## Storage Utils (T3.06)

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getItem<T>(key: string): Promise<T | null> {
  const value = await AsyncStorage.getItem(key);
  return value ? JSON.parse(value) : null;
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}
```

## Haptic Feedback (T3.07)

```typescript
import * as Haptics from "expo-haptics";

export function triggerLightFeedback(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function triggerMediumFeedback(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export function triggerSelectionFeedback(): void {
  Haptics.selectionAsync();
}
```
