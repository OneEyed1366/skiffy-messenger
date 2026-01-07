// apps/v2/src/utils/haptics.ts

/**
 * Haptic feedback utilities
 *
 * Provides tactile feedback for user interactions.
 * Uses expo-haptics for cross-platform support.
 *
 * Note: Haptics are no-op on web and gracefully degrade on unsupported devices.
 */

import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

//#region Types

export type IImpactStyle = "light" | "medium" | "heavy";

export type INotificationStyle = "success" | "warning" | "error";

export type IHapticOptions = {
  /** Skip haptic if conditions aren't met */
  enabled?: boolean;
};

//#endregion

//#region Impact Feedback

/**
 * Trigger light impact haptic feedback.
 *
 * Use for subtle UI interactions like toggling switches,
 * tapping lightweight buttons, or hover states.
 *
 * @example
 * ```typescript
 * // On switch toggle
 * const handleToggle = async () => {
 *   await impactLight();
 *   setEnabled(!enabled);
 * };
 * ```
 */
export async function impactLight(): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    // Silently fail - haptics are enhancement, not critical
    console.debug("Haptic feedback not available:", error);
  }
}

/**
 * Trigger medium impact haptic feedback.
 *
 * Use for standard button taps, confirming selections,
 * or moderate UI interactions.
 *
 * @example
 * ```typescript
 * // On button press
 * const handlePress = async () => {
 *   await impactMedium();
 *   submitForm();
 * };
 * ```
 */
export async function impactMedium(): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    console.debug("Haptic feedback not available:", error);
  }
}

/**
 * Trigger heavy impact haptic feedback.
 *
 * Use for significant actions like completing a task,
 * major confirmations, or dropping items in drag-and-drop.
 *
 * @example
 * ```typescript
 * // On drag-and-drop release
 * const handleDrop = async () => {
 *   await impactHeavy();
 *   reorderItems(dragIndex, dropIndex);
 * };
 * ```
 */
export async function impactHeavy(): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    console.debug("Haptic feedback not available:", error);
  }
}

/**
 * Trigger impact haptic with specified style.
 *
 * @param style - Impact intensity: "light" | "medium" | "heavy"
 *
 * @example
 * ```typescript
 * await impact("medium");
 * ```
 */
export async function impact(style: IImpactStyle): Promise<void> {
  switch (style) {
    case "light":
      return impactLight();
    case "medium":
      return impactMedium();
    case "heavy":
      return impactHeavy();
  }
}

//#endregion

//#region Notification Feedback

/**
 * Trigger success notification haptic.
 *
 * Use when an operation completes successfully,
 * like saving data, sending a message, or completing a task.
 *
 * @example
 * ```typescript
 * const handleSave = async () => {
 *   await saveData();
 *   await notificationSuccess();
 *   showToast("Saved!");
 * };
 * ```
 */
export async function notificationSuccess(): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    console.debug("Haptic feedback not available:", error);
  }
}

/**
 * Trigger warning notification haptic.
 *
 * Use when alerting the user to a potential issue,
 * like unsaved changes, approaching limits, or caution states.
 *
 * @example
 * ```typescript
 * const handleNavigateAway = async () => {
 *   if (hasUnsavedChanges) {
 *     await notificationWarning();
 *     showConfirmDialog();
 *   }
 * };
 * ```
 */
export async function notificationWarning(): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (error) {
    console.debug("Haptic feedback not available:", error);
  }
}

/**
 * Trigger error notification haptic.
 *
 * Use when an operation fails or an error occurs,
 * like validation failure, network error, or invalid input.
 *
 * @example
 * ```typescript
 * const handleSubmit = async () => {
 *   const errors = validate(form);
 *   if (errors.length > 0) {
 *     await notificationError();
 *     showErrors(errors);
 *     return;
 *   }
 *   submit();
 * };
 * ```
 */
export async function notificationError(): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    console.debug("Haptic feedback not available:", error);
  }
}

/**
 * Trigger notification haptic with specified type.
 *
 * @param type - Notification type: "success" | "warning" | "error"
 *
 * @example
 * ```typescript
 * await notification("success");
 * ```
 */
export async function notification(type: INotificationStyle): Promise<void> {
  switch (type) {
    case "success":
      return notificationSuccess();
    case "warning":
      return notificationWarning();
    case "error":
      return notificationError();
  }
}

//#endregion

//#region Selection Feedback

/**
 * Trigger selection change haptic.
 *
 * Use when the user changes a selection, like moving through
 * a picker, scrolling a carousel, or highlighting items.
 *
 * This is the subtlest haptic, appropriate for frequent interactions.
 *
 * @example
 * ```typescript
 * // In a picker
 * const handleValueChange = async (value: string) => {
 *   await selectionChanged();
 *   setSelectedValue(value);
 * };
 *
 * // In a carousel
 * const handleSlideChange = async (index: number) => {
 *   await selectionChanged();
 *   setCurrentSlide(index);
 * };
 * ```
 */
export async function selectionChanged(): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  try {
    await Haptics.selectionAsync();
  } catch (error) {
    console.debug("Haptic feedback not available:", error);
  }
}

//#endregion

//#region Utility Functions

/**
 * Check if haptic feedback is supported on this device.
 *
 * Note: This is a best-effort check. Some Android devices
 * report support but have weak/no vibration motors.
 *
 * @returns true if haptics are likely supported
 */
export function isHapticsSupported(): boolean {
  // Web never supports haptics
  if (Platform.OS === "web") {
    return false;
  }

  // iOS and Android support haptics on most devices
  return Platform.OS === "ios" || Platform.OS === "android";
}

/**
 * Create a haptic-enabled press handler.
 *
 * Wraps a function to add haptic feedback before execution.
 * Useful for creating consistent button handlers.
 *
 * @param handler - Function to call after haptic
 * @param style - Impact style (default: "light")
 * @returns Wrapped function with haptic feedback
 *
 * @example
 * ```typescript
 * const handlePress = withHaptic(() => {
 *   navigation.navigate("Settings");
 * });
 *
 * const handleImportantPress = withHaptic(() => {
 *   submitOrder();
 * }, "medium");
 *
 * <Pressable onPress={handlePress}>
 *   <Text>Settings</Text>
 * </Pressable>
 * ```
 */
export function withHaptic<T extends (...args: unknown[]) => unknown>(
  handler: T,
  style: IImpactStyle = "light",
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    await impact(style);
    return handler(...args) as ReturnType<T>;
  };
}

//#endregion
