// apps/v2/src/components/Timestamp/Timestamp.tsx

import { useEffect, useRef, useState } from "react";
import { Pressable, Text } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";
import { useTranslation } from "react-i18next";

import {
  getRelativeTime,
  formatDateTime,
  formatTime,
  isToday,
  isYesterday,
} from "@/utils/date";

//#region Types

type ITimestampFormat = "relative" | "time" | "datetime";

type IProps = {
  /**
   * The timestamp value (Date, number, or ISO string)
   */
  value: Date | number | string;
  /**
   * Display format
   * @default "relative"
   */
  format?: ITimestampFormat;
  /**
   * Whether to auto-update relative time
   * @default true
   */
  live?: boolean;
  /**
   * Update interval in milliseconds (auto-calculated if not specified)
   */
  updateInterval?: number;
  /**
   * Show absolute time on press (mobile) instead of hover
   * @default true
   */
  showAbsoluteOnPress?: boolean;
  /**
   * Duration to show absolute time (ms)
   * @default 2000
   */
  absoluteDisplayDuration?: number;
  /**
   * Timezone for formatting
   */
  timeZone?: string;
  /**
   * Use 12-hour format
   * @default true
   */
  hour12?: boolean;
  /**
   * i18n key prefix for "Today"/"Yesterday" labels
   */
  relativeDateLabels?: {
    today?: string;
    yesterday?: string;
    tomorrow?: string;
  };
  /**
   * Accessibility label override
   */
  accessibilityLabel?: string;
  /**
   * Test ID for testing
   */
  testID?: string;
  /**
   * Ref to the underlying Pressable
   */
  ref?: React.Ref<React.ComponentRef<typeof Pressable>>;
} & UnistylesVariants<typeof styles>;

//#endregion Types

//#region Constants

/**
 * Auto-update intervals based on time difference.
 * Matches original Mattermost behavior.
 */
const UPDATE_INTERVALS = {
  SECOND: 1000, // Update every second for < 1 minute
  MINUTE: 15000, // Update every 15 seconds for < 1 hour
  HOUR: 300000, // Update every 5 minutes for < 1 day
  DAY: 3600000, // Update every hour for older times
} as const;

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

//#endregion Constants

//#region Helpers

/**
 * Normalizes input to a Date object.
 */
function toDate(input: Date | number | string): Date {
  if (input instanceof Date) {
    return input;
  }
  return new Date(input);
}

/**
 * Calculates optimal update interval based on time difference.
 */
function getOptimalInterval(diffMs: number): number {
  const absDiff = Math.abs(diffMs);

  if (absDiff < MS_PER_MINUTE) {
    return UPDATE_INTERVALS.SECOND;
  }
  if (absDiff < MS_PER_HOUR) {
    return UPDATE_INTERVALS.MINUTE;
  }
  if (absDiff < MS_PER_DAY) {
    return UPDATE_INTERVALS.HOUR;
  }
  return UPDATE_INTERVALS.DAY;
}

//#endregion Helpers

//#region Component

export function Timestamp({
  value,
  format = "relative",
  live = true,
  updateInterval,
  showAbsoluteOnPress = true,
  absoluteDisplayDuration = 2000,
  timeZone,
  hour12 = true,
  relativeDateLabels,
  accessibilityLabel,
  testID,
  size = "md",
  muted = false,
  ref,
}: IProps) {
  const { t } = useTranslation();
  const [now, setNow] = useState(() => Date.now());
  const [showAbsolute, setShowAbsolute] = useState(false);
  const absoluteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dateValue = toDate(value);
  const timestamp = dateValue.getTime();
  const diffMs = timestamp - now;

  //#region Auto-Update Effect

  useEffect(() => {
    if (!live || format !== "relative") {
      return;
    }

    const interval = updateInterval ?? getOptimalInterval(diffMs);
    const timerId = setInterval(() => {
      setNow(Date.now());
    }, interval);

    return () => {
      clearInterval(timerId);
    };
  }, [live, format, diffMs, updateInterval]);

  //#endregion Auto-Update Effect

  //#region Cleanup Effect

  useEffect(() => {
    return () => {
      if (absoluteTimeoutRef.current) {
        clearTimeout(absoluteTimeoutRef.current);
      }
    };
  }, []);

  //#endregion Cleanup Effect

  //#region Handlers

  const handlePress = () => {
    if (!showAbsoluteOnPress) {
      return;
    }

    // Clear existing timeout
    if (absoluteTimeoutRef.current) {
      clearTimeout(absoluteTimeoutRef.current);
    }

    setShowAbsolute(true);

    absoluteTimeoutRef.current = setTimeout(() => {
      setShowAbsolute(false);
      absoluteTimeoutRef.current = null;
    }, absoluteDisplayDuration);
  };

  const handleLongPress = () => {
    // Keep absolute time visible until released
    if (absoluteTimeoutRef.current) {
      clearTimeout(absoluteTimeoutRef.current);
    }
    setShowAbsolute(true);
  };

  const handlePressOut = () => {
    if (showAbsolute && showAbsoluteOnPress) {
      absoluteTimeoutRef.current = setTimeout(() => {
        setShowAbsolute(false);
        absoluteTimeoutRef.current = null;
      }, absoluteDisplayDuration);
    }
  };

  //#endregion Handlers

  //#region Formatting

  const formatOptions = { timeZone, hour12 };

  const getDisplayText = (): string => {
    // Show absolute time if toggled
    if (showAbsolute) {
      return formatDateTime(dateValue, formatOptions);
    }

    switch (format) {
      case "time":
        return formatTime(dateValue, formatOptions);

      case "datetime":
        return formatDateTime(dateValue, formatOptions);

      case "relative":
      default: {
        // Use translated labels for today/yesterday
        const labels = relativeDateLabels ?? {
          today: t("timestamp.today", "Today"),
          yesterday: t("timestamp.yesterday", "Yesterday"),
          tomorrow: t("timestamp.tomorrow", "Tomorrow"),
        };

        // For today/yesterday, show relative day + time
        if (isToday(dateValue)) {
          const time = formatTime(dateValue, formatOptions);
          return `${labels.today}, ${time}`;
        }

        if (isYesterday(dateValue)) {
          const time = formatTime(dateValue, formatOptions);
          return `${labels.yesterday}, ${time}`;
        }

        // For recent times (< 1 day), show relative time
        const absDiff = Math.abs(diffMs);
        if (absDiff < MS_PER_DAY) {
          return getRelativeTime(dateValue);
        }

        // For older times, show date and time
        return formatDateTime(dateValue, formatOptions);
      }
    }
  };

  //#endregion Formatting

  const displayText = getDisplayText();
  const absoluteTimeText = formatDateTime(dateValue, formatOptions);

  styles.useVariants({ size, muted });

  return (
    <Pressable
      ref={ref}
      style={styles.container}
      onPress={handlePress}
      onLongPress={handleLongPress}
      onPressOut={handlePressOut}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel ?? absoluteTimeText}
      accessibilityHint={
        showAbsoluteOnPress
          ? t("timestamp.pressForAbsolute", "Press to see exact time")
          : undefined
      }
      testID={testID}
    >
      <Text style={styles.text} numberOfLines={1}>
        {displayText}
      </Text>
    </Pressable>
  );
}

//#endregion Component

//#region Styles

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },

  text: {
    fontFamily: theme.fonts.primary,
    variants: {
      //#region Size Variants
      size: {
        sm: {
          fontSize: 11,
          lineHeight: 16,
        },
        md: {
          fontSize: 12,
          lineHeight: 16,
        },
        lg: {
          fontSize: 14,
          lineHeight: 20,
        },
      },
      //#endregion Size Variants

      //#region Muted Variants
      muted: {
        true: {
          color: theme.colors.centerChannelColor,
          opacity: 0.56,
        },
        false: {
          color: theme.colors.centerChannelColor,
          opacity: 0.72,
        },
      },
      //#endregion Muted Variants
    },
  },
}));

//#endregion Styles
