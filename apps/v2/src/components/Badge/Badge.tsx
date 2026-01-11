// apps/v2/src/components/Badge/Badge.tsx

/**
 * Badge component for notification counts
 * Migrated from: vendor/desktop/webapp/channels/src/components/sidebar/sidebar_channel/channel_mention_badge.tsx
 */

import { View, Text } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";

//#region Types

type IProps = {
  /** Number to display (ignored for dot variant) */
  count?: number;
  /** Maximum number to display before showing "max+" */
  max?: number;
  /** Show badge even when count is 0 */
  showZero?: boolean;
  /** Optional icon to display before count */
  icon?: React.ReactNode;
  /** Accessible label for screen readers */
  accessibilityLabel?: string;
  /** Test ID for testing */
  testID?: string;
  /** Ref to the container View */
  ref?: React.Ref<React.ComponentRef<typeof View>>;
} & UnistylesVariants<typeof styles>;

//#endregion Types

//#region Constants

const DEFAULT_MAX = 99;

//#endregion Constants

//#region Component

export function Badge({
  count = 0,
  max = DEFAULT_MAX,
  showZero = false,
  icon,
  accessibilityLabel,
  testID,
  variant = "standard",
  color = "primary",
  position = "inline",
  size = "md",
  ref,
}: IProps) {
  styles.useVariants({ variant, color, position, size });

  // Dot variant doesn't need count logic
  if (variant === "dot") {
    return (
      <View
        ref={ref}
        style={styles.container}
        accessibilityLabel={accessibilityLabel ?? "New notification"}
        accessibilityRole="text"
        testID={testID}
      />
    );
  }

  // Don't render if count is 0 and showZero is false
  if (count === 0 && !showZero) {
    return null;
  }

  const displayValue = count > max ? `${max}+` : String(count);

  return (
    <View
      ref={ref}
      style={styles.container}
      accessibilityLabel={accessibilityLabel ?? `${count} notifications`}
      accessibilityRole="text"
      testID={testID}
    >
      {icon}
      <Text style={styles.text}>{displayValue}</Text>
    </View>
  );
}

//#endregion Component

//#region Styles

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    variants: {
      variant: {
        standard: {
          borderRadius: theme.radius.xl,
        },
        dot: {
          borderRadius: theme.radius.xl,
        },
      },
      color: {
        primary: {
          backgroundColor: theme.colors.buttonBg,
        },
        mention: {
          backgroundColor: theme.colors.mentionBg,
        },
        urgent: {
          backgroundColor: theme.colors.errorText,
        },
      },
      position: {
        inline: {},
        topRight: {
          position: "absolute",
          top: -4,
          right: -4,
        },
      },
      size: {
        sm: {
          minWidth: 16,
          height: 16,
          paddingHorizontal: theme.gap(0.5),
        },
        md: {
          minWidth: 20,
          height: 20,
          paddingHorizontal: theme.gap(0.75),
        },
        lg: {
          minWidth: 24,
          height: 24,
          paddingHorizontal: theme.gap(1),
        },
      },
    },
    compoundVariants: [
      {
        variant: "dot",
        size: "sm",
        styles: {
          width: 6,
          height: 6,
          minWidth: 6,
          paddingHorizontal: 0,
        },
      },
      {
        variant: "dot",
        size: "md",
        styles: {
          width: 8,
          height: 8,
          minWidth: 8,
          paddingHorizontal: 0,
        },
      },
      {
        variant: "dot",
        size: "lg",
        styles: {
          width: 10,
          height: 10,
          minWidth: 10,
          paddingHorizontal: 0,
        },
      },
    ],
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
    variants: {
      variant: {
        standard: {},
        dot: {
          display: "none",
        },
      },
      color: {
        primary: {
          color: theme.colors.buttonColor,
        },
        mention: {
          color: theme.colors.mentionColor,
        },
        urgent: {
          color: theme.colors.buttonColor,
        },
      },
      position: {
        inline: {},
        topRight: {},
      },
      size: {
        sm: {
          fontSize: 10,
        },
        md: {
          fontSize: 11,
        },
        lg: {
          fontSize: 13,
        },
      },
    },
  },
}));

//#endregion Styles
