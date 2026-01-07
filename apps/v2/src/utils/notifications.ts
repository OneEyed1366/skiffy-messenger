// apps/v2/src/utils/notifications.ts

/**
 * Notification utilities
 * Migrated from: vendor/desktop/webapp/channels/src/utils/notifications.ts
 *
 * Provides cross-platform notification handling using expo-notifications.
 */

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

//#region Types

export type INotificationPermissionStatus =
  | "granted"
  | "denied"
  | "undetermined";

export type INotificationOptions = {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: boolean;
  badge?: number;
  categoryIdentifier?: string;
  /** iOS: subtitle displayed below title */
  subtitle?: string;
  /** Android: channel ID (defaults to 'default') */
  channelId?: string;
  /** Trigger delay in seconds (0 for immediate) */
  delaySeconds?: number;
};

export type INotificationChannel = {
  id: string;
  name: string;
  description?: string;
  importance?: "default" | "high" | "low" | "min" | "max";
  sound?: boolean;
  vibration?: boolean;
  badge?: boolean;
};

//#endregion

//#region Constants

/** Permission status when notifications are allowed */
export const NOTIFICATION_PERMISSION_GRANTED: INotificationPermissionStatus =
  "granted";

/** Permission status when notifications are denied */
export const NOTIFICATION_PERMISSION_DENIED: INotificationPermissionStatus =
  "denied";

/** Permission status when user hasn't been asked yet */
export const NOTIFICATION_PERMISSION_UNDETERMINED: INotificationPermissionStatus =
  "undetermined";

/** Default notification channel for Android */
export const DEFAULT_CHANNEL_ID = "default";

//#endregion

//#region Permission Management

/**
 * Request notification permission from the user.
 *
 * On iOS, shows the system permission dialog.
 * On Android 13+, requests POST_NOTIFICATIONS permission.
 * On Android <13, returns true (no permission needed).
 *
 * @returns Promise resolving to true if permission granted, false otherwise
 *
 * @example
 * ```typescript
 * const granted = await requestNotificationPermission();
 * if (granted) {
 *   await showLocalNotification({ title: "Welcome!", body: "Notifications enabled" });
 * } else {
 *   showPermissionDeniedMessage();
 * }
 * ```
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    if (existingStatus === "granted") {
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Failed to request notification permission:", error);
    return false;
  }
}

/**
 * Get current notification permission status.
 *
 * @returns Promise resolving to permission status
 *
 * @example
 * ```typescript
 * const status = await getNotificationPermissionStatus();
 * if (status === NOTIFICATION_PERMISSION_DENIED) {
 *   showSettingsPrompt();
 * }
 * ```
 */
export async function getNotificationPermissionStatus(): Promise<INotificationPermissionStatus> {
  try {
    const { status } = await Notifications.getPermissionsAsync();

    switch (status) {
      case "granted":
        return NOTIFICATION_PERMISSION_GRANTED;
      case "denied":
        return NOTIFICATION_PERMISSION_DENIED;
      default:
        return NOTIFICATION_PERMISSION_UNDETERMINED;
    }
  } catch (error) {
    console.error("Failed to get notification permission status:", error);
    return NOTIFICATION_PERMISSION_UNDETERMINED;
  }
}

//#endregion

//#region Local Notifications

/**
 * Show a local notification.
 *
 * @param options - Notification configuration
 * @returns Promise resolving to notification ID for later cancellation
 *
 * @example
 * ```typescript
 * // Immediate notification
 * const id = await showLocalNotification({
 *   title: "New Message",
 *   body: "You have a new message from John",
 *   data: { channelId: "channel-123" },
 * });
 *
 * // Delayed notification
 * const reminderId = await showLocalNotification({
 *   title: "Reminder",
 *   body: "Meeting in 5 minutes",
 *   delaySeconds: 300,
 * });
 * ```
 */
export async function showLocalNotification(
  options: INotificationOptions,
): Promise<string> {
  try {
    const {
      title,
      body,
      data,
      sound = true,
      badge,
      subtitle,
      channelId,
      delaySeconds = 0,
    } = options;

    // Build notification content
    const content: Notifications.NotificationContentInput = {
      title,
      body,
      data,
      sound: sound ? "default" : undefined,
      badge,
    };

    // iOS-specific: subtitle
    if (Platform.OS === "ios" && subtitle) {
      content.subtitle = subtitle;
    }

    // Android-specific: channel
    if (Platform.OS === "android") {
      (content as { channelId?: string }).channelId =
        channelId ?? DEFAULT_CHANNEL_ID;
    }

    // Build trigger (immediate or delayed)
    const trigger: Notifications.NotificationTriggerInput =
      delaySeconds > 0
        ? {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: delaySeconds,
            repeats: false,
          }
        : null;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content,
      trigger,
    });

    return notificationId;
  } catch (error) {
    console.error("Failed to show local notification:", error);
    throw error;
  }
}

//#endregion

//#region Notification Management

/**
 * Cancel a scheduled or displayed notification by ID.
 *
 * @param id - Notification ID returned from showLocalNotification
 *
 * @example
 * ```typescript
 * const id = await showLocalNotification({ title: "Test", body: "..." });
 * // Later...
 * await cancelNotification(id);
 * ```
 */
export async function cancelNotification(id: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (error) {
    console.error("Failed to cancel notification:", error);
    // Don't throw - canceling a non-existent notification shouldn't be fatal
  }
}

/**
 * Cancel all scheduled and displayed notifications.
 *
 * @example
 * ```typescript
 * // On logout
 * await cancelAllNotifications();
 * ```
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.dismissAllNotificationsAsync();
  } catch (error) {
    console.error("Failed to cancel all notifications:", error);
  }
}

/**
 * Get all pending scheduled notifications.
 *
 * @returns Promise resolving to array of scheduled notification IDs
 */
export async function getScheduledNotifications(): Promise<string[]> {
  try {
    const notifications =
      await Notifications.getAllScheduledNotificationsAsync();
    return notifications.map((n) => n.identifier);
  } catch (error) {
    console.error("Failed to get scheduled notifications:", error);
    return [];
  }
}

//#endregion

//#region Android Channels

/**
 * Create a notification channel (Android 8+ only).
 *
 * Channels allow users to customize notification behavior per category.
 * On iOS, this function does nothing.
 *
 * @param channel - Channel configuration
 *
 * @example
 * ```typescript
 * // Create channels on app startup
 * await createNotificationChannel({
 *   id: "messages",
 *   name: "Messages",
 *   description: "New message notifications",
 *   importance: "high",
 *   sound: true,
 * });
 *
 * await createNotificationChannel({
 *   id: "updates",
 *   name: "Updates",
 *   description: "App updates and announcements",
 *   importance: "low",
 * });
 * ```
 */
export async function createNotificationChannel(
  channel: INotificationChannel,
): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }

  try {
    const importanceMap: Record<string, Notifications.AndroidImportance> = {
      default: Notifications.AndroidImportance.DEFAULT,
      high: Notifications.AndroidImportance.HIGH,
      low: Notifications.AndroidImportance.LOW,
      min: Notifications.AndroidImportance.MIN,
      max: Notifications.AndroidImportance.MAX,
    };

    await Notifications.setNotificationChannelAsync(channel.id, {
      name: channel.name,
      description: channel.description,
      importance: importanceMap[channel.importance ?? "default"],
      sound: channel.sound !== false ? "default" : undefined,
      vibrationPattern:
        channel.vibration !== false ? [0, 250, 250, 250] : undefined,
      enableVibrate: channel.vibration !== false,
    });
  } catch (error) {
    console.error("Failed to create notification channel:", error);
  }
}

/**
 * Delete a notification channel (Android only).
 *
 * @param channelId - Channel ID to delete
 */
export async function deleteNotificationChannel(
  channelId: string,
): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }

  try {
    await Notifications.deleteNotificationChannelAsync(channelId);
  } catch (error) {
    console.error("Failed to delete notification channel:", error);
  }
}

//#endregion

//#region Badge Management

/**
 * Set the app badge count (iOS only).
 *
 * @param count - Badge number (0 to clear)
 *
 * @example
 * ```typescript
 * // Set unread count
 * await setBadgeCount(5);
 *
 * // Clear badge
 * await setBadgeCount(0);
 * ```
 */
export async function setBadgeCount(count: number): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error("Failed to set badge count:", error);
  }
}

/**
 * Get current app badge count (iOS only).
 *
 * @returns Promise resolving to current badge count
 */
export async function getBadgeCount(): Promise<number> {
  try {
    return await Notifications.getBadgeCountAsync();
  } catch (error) {
    console.error("Failed to get badge count:", error);
    return 0;
  }
}

//#endregion

//#region Notification Behavior

/**
 * Configure how notifications are handled when app is in foreground.
 *
 * Call this once during app initialization.
 *
 * @example
 * ```typescript
 * // In App.tsx or initialization
 * configureNotificationHandler({
 *   shouldShowAlert: true,
 *   shouldPlaySound: true,
 *   shouldSetBadge: false,
 * });
 * ```
 */
export function configureNotificationHandler(options: {
  shouldShowAlert?: boolean;
  shouldPlaySound?: boolean;
  shouldSetBadge?: boolean;
}): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: options.shouldShowAlert ?? true,
      shouldPlaySound: options.shouldPlaySound ?? false,
      shouldSetBadge: options.shouldSetBadge ?? false,
      shouldShowBanner: options.shouldShowAlert ?? true,
      shouldShowList: options.shouldShowAlert ?? true,
    }),
  });
}

//#endregion
