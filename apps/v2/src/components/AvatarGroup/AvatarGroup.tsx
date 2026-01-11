// apps/v2/src/components/AvatarGroup/AvatarGroup.tsx

/**
 * AvatarGroup component for displaying multiple avatars in an overlapping stack
 * Migrated from: vendor/desktop/webapp/channels/src/components/threading/global_threads/thread_item/avatars/avatars.tsx
 *
 * Features:
 * - Configurable max visible avatars (overflow shows "+N" indicator)
 * - Stacking direction (left-to-right or right-to-left)
 * - Size variants matching Avatar sizes
 * - Overlap amount configuration
 * - Accessible announcement of total count
 */

import React from "react";
import { View, Text, type ImageSourcePropType } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Avatar } from "@/components/Avatar";

//#region Types

type IAvatarStatus = "online" | "away" | "offline" | "dnd";

type IAvatarGroupSize = "xs" | "sm" | "md" | "lg";

type IAvatarData = {
  /**
   * Unique identifier for the avatar
   */
  id: string;
  /**
   * Image source URL or require() for local images
   */
  source?: ImageSourcePropType | string;
  /**
   * Initials to display when no image is available
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
};

type IProps = {
  /**
   * Array of avatar data objects
   */
  avatars: IAvatarData[];
  /**
   * Maximum avatars to show before overflow
   * @default 3
   */
  max?: number;
  /**
   * Avatar size
   * @default "md"
   */
  size?: IAvatarGroupSize;
  /**
   * Stacking direction - "left" means first avatar on top, "right" means last on top
   * @default "left"
   */
  stackDirection?: "left" | "right";
  /**
   * Overlap amount as percentage of avatar size (0-1)
   * @default 0.25
   */
  overlapRatio?: number;
  /**
   * Test ID
   */
  testID?: string;
  /**
   * Ref to the container View
   */
  ref?: React.Ref<React.ComponentRef<typeof View>>;
};

//#endregion Types

//#region Constants

const SIZE_MAP: Record<IAvatarGroupSize, number> = {
  xs: 20,
  sm: 24,
  md: 32,
  lg: 40,
} as const;

const FONT_SIZE_MAP: Record<IAvatarGroupSize, number> = {
  xs: 8,
  sm: 10,
  md: 12,
  lg: 14,
} as const;

//#endregion Constants

//#region Component

export function AvatarGroup({
  avatars,
  max = 3,
  size = "md",
  stackDirection = "left",
  overlapRatio = 0.25,
  testID,
  ref,
}: IProps) {
  const visibleAvatars = avatars.slice(0, max);
  const overflowCount = Math.max(0, avatars.length - max);
  const avatarSize = SIZE_MAP[size];
  const overlapOffset = -avatarSize * overlapRatio;

  const totalCount = avatars.length;
  const accessibilityLabel =
    totalCount === 0
      ? "No users"
      : totalCount === 1
        ? "1 user"
        : overflowCount > 0
          ? `${totalCount} users, showing ${max}`
          : `${totalCount} users`;

  // Empty state - render empty container
  if (avatars.length === 0) {
    return (
      <View
        ref={ref}
        style={styles.container}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="text"
      />
    );
  }

  return (
    <View
      ref={ref}
      style={styles.container}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text"
    >
      {visibleAvatars.map((avatar, index) => {
        const isFirst = index === 0;
        const zIndex =
          stackDirection === "left" ? visibleAvatars.length - index : index + 1;

        return (
          <View
            key={avatar.id}
            style={[
              styles.avatarWrapper,
              { zIndex },
              !isFirst && { marginLeft: overlapOffset },
            ]}
          >
            <Avatar
              source={avatar.source}
              initials={avatar.initials}
              username={avatar.username}
              size={size}
              status={avatar.status}
            />
          </View>
        );
      })}

      {overflowCount > 0 && (
        <View
          style={[
            styles.overflowBadge,
            {
              marginLeft: overlapOffset,
              zIndex: visibleAvatars.length + 1,
              width: avatarSize,
              height: avatarSize,
            },
          ]}
        >
          <Text
            style={[styles.overflowText, { fontSize: FONT_SIZE_MAP[size] }]}
          >
            +{overflowCount}
          </Text>
        </View>
      )}
    </View>
  );
}

//#endregion Component

//#region Styles

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarWrapper: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: theme.colors.centerChannelBg,
  },

  overflowBadge: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: theme.colors.sidebarBg,
    borderWidth: 2,
    borderColor: theme.colors.centerChannelBg,
  },

  overflowText: {
    fontFamily: theme.fonts.primary,
    fontWeight: theme.fontWeights.semiBold,
    color: theme.colors.sidebarText,
  },
}));

//#endregion Styles

//#region Type Exports

export type { IAvatarData, IAvatarGroupSize };

//#endregion Type Exports
