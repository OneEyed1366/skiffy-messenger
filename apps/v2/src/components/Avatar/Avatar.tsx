// apps/v2/src/components/Avatar/Avatar.tsx

/**
 * Avatar component for user profile images
 * Migrated from: vendor/desktop/webapp/channels/src/components/widgets/users/avatar/avatar.tsx
 *
 * Features:
 * - Image source with lazy loading
 * - Initials fallback when no image available
 * - Status indicator overlay (online/away/offline/dnd)
 * - Size variants (xs, sm, md, lg, xl, xxl)
 * - Shape variants (circle, rounded square)
 * - Bot/webhook indicator
 */

import React from "react";
import { Image, Text, View, type ImageSourcePropType } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";

//#region Types

type IAvatarStatus = "online" | "away" | "offline" | "dnd";

type IAvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

type IProps = {
  /**
   * Image source URL or require() for local images
   */
  source?: ImageSourcePropType | string;

  /**
   * Initials to display when no image is available (1-2 characters)
   */
  initials?: string;

  /**
   * Username for auto-generating initials and accessibility
   */
  username?: string;

  /**
   * User status indicator
   */
  status?: IAvatarStatus;

  /**
   * Whether to hide the status indicator
   */
  hideStatus?: boolean;

  /**
   * Whether this avatar represents a bot/webhook
   */
  isBot?: boolean;

  /**
   * Custom accessibility label
   */
  accessibilityLabel?: string;

  /**
   * Callback when image fails to load
   */
  onImageError?: () => void;

  /**
   * Test ID for testing
   */
  testID?: string;

  /**
   * Ref to the container View
   */
  ref?: React.Ref<React.ComponentRef<typeof View>>;
} & UnistylesVariants<typeof styles>;

//#endregion Types

//#region Constants

const SIZE_MAP: Record<IAvatarSize, number> = {
  xs: 20,
  sm: 24,
  md: 32,
  lg: 36,
  xl: 50,
  xxl: 128,
} as const;

const FONT_SIZE_MAP: Record<IAvatarSize, number> = {
  xs: 10,
  sm: 11,
  md: 14,
  lg: 16,
  xl: 22,
  xxl: 50,
} as const;

const STATUS_SIZE_MAP: Record<IAvatarSize, number> = {
  xs: 6,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  xxl: 24,
} as const;

//#endregion Constants

//#region Component

export function Avatar({
  source,
  initials,
  username,
  status,
  hideStatus = false,
  isBot = false,
  size = "md",
  shape = "circle",
  accessibilityLabel,
  onImageError,
  testID,
  ref,
}: IProps) {
  styles.useVariants({ size, shape });

  const [imageError, setImageError] = React.useState(false);

  const showInitials = !source || imageError;
  const showStatus = !hideStatus && status;

  // Generate initials from username if not provided
  const displayInitials =
    initials?.slice(0, 2).toUpperCase() ??
    username?.slice(0, 2).toUpperCase() ??
    "";

  const handleImageError = () => {
    setImageError(true);
    onImageError?.();
  };

  const imageSource: ImageSourcePropType | undefined =
    typeof source === "string" ? { uri: source } : source;

  const label = accessibilityLabel ?? `${username ?? "User"} profile image`;

  return (
    <View
      ref={ref}
      style={styles.container}
      accessibilityRole="image"
      accessibilityLabel={label}
      testID={testID}
    >
      {showInitials ? (
        <View style={styles.initialsContainer}>
          <Text style={styles.initialsText}>{displayInitials}</Text>
        </View>
      ) : (
        <Image
          source={imageSource!}
          style={styles.image}
          onError={handleImageError}
          accessibilityLabel={label}
        />
      )}

      {showStatus && (
        <View style={styles.statusContainer}>
          <StatusIndicator status={status} size={size} />
        </View>
      )}

      {isBot && (
        <View style={styles.botBadge}>
          <Text style={styles.botBadgeText}>BOT</Text>
        </View>
      )}
    </View>
  );
}

//#endregion Component

//#region StatusIndicator

type IStatusIndicatorProps = {
  status: IAvatarStatus;
  size: IAvatarSize;
};

function StatusIndicator({ status, size }: IStatusIndicatorProps) {
  const indicatorSize = STATUS_SIZE_MAP[size];

  return (
    <View
      style={[
        statusStyles.indicator,
        statusStyles[status],
        {
          width: indicatorSize,
          height: indicatorSize,
          borderRadius: indicatorSize / 2,
        },
      ]}
      accessibilityLabel={`Status: ${status}`}
    />
  );
}

const statusStyles = StyleSheet.create((theme) => ({
  indicator: {
    borderWidth: 2,
    borderColor: theme.colors.centerChannelBg,
  },
  online: {
    backgroundColor: theme.colors.onlineIndicator,
  },
  away: {
    backgroundColor: theme.colors.awayIndicator,
  },
  offline: {
    backgroundColor: theme.colors.centerChannelColor,
    opacity: 0.4,
  },
  dnd: {
    backgroundColor: theme.colors.dndIndicator,
  },
}));

//#endregion StatusIndicator

//#region Styles

const styles = StyleSheet.create((theme) => ({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    variants: {
      size: {
        xs: { width: SIZE_MAP.xs, height: SIZE_MAP.xs },
        sm: { width: SIZE_MAP.sm, height: SIZE_MAP.sm },
        md: { width: SIZE_MAP.md, height: SIZE_MAP.md },
        lg: { width: SIZE_MAP.lg, height: SIZE_MAP.lg },
        xl: { width: SIZE_MAP.xl, height: SIZE_MAP.xl },
        xxl: { width: SIZE_MAP.xxl, height: SIZE_MAP.xxl },
      },
      shape: {
        circle: { borderRadius: 9999 },
        rounded: { borderRadius: theme.radius.m },
      },
    },
  },
  image: {
    width: "100%",
    height: "100%",
    variants: {
      size: {
        xs: {},
        sm: {},
        md: {},
        lg: {},
        xl: {},
        xxl: {},
      },
      shape: {
        circle: { borderRadius: 9999 },
        rounded: { borderRadius: theme.radius.m },
      },
    },
  },
  initialsContainer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.sidebarBg,
    variants: {
      size: {
        xs: {},
        sm: {},
        md: {},
        lg: {},
        xl: {},
        xxl: {},
      },
      shape: {
        circle: { borderRadius: 9999 },
        rounded: { borderRadius: theme.radius.m },
      },
    },
  },
  initialsText: {
    color: theme.colors.sidebarText,
    fontWeight: theme.fontWeights.semiBold,
    variants: {
      size: {
        xs: { fontSize: FONT_SIZE_MAP.xs },
        sm: { fontSize: FONT_SIZE_MAP.sm },
        md: { fontSize: FONT_SIZE_MAP.md },
        lg: { fontSize: FONT_SIZE_MAP.lg },
        xl: { fontSize: FONT_SIZE_MAP.xl },
        xxl: { fontSize: FONT_SIZE_MAP.xxl },
      },
      shape: {
        circle: {},
        rounded: {},
      },
    },
  },
  statusContainer: {
    position: "absolute",
    bottom: -2,
    right: -2,
  },
  botBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: theme.radius.xs,
    borderWidth: 1,
    borderColor: theme.colors.centerChannelBg,
  },
  botBadgeText: {
    color: theme.colors.buttonColor,
    fontSize: 6,
    fontWeight: theme.fontWeights.semiBold,
  },
}));

//#endregion Styles
