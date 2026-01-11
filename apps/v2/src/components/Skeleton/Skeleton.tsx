// apps/v2/src/components/Skeleton/Skeleton.tsx

import { DimensionValue, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";
import { useEffect } from "react";

//#region Types

type ISkeletonShape = "text" | "circle" | "rect";

type IProps = {
  /**
   * Shape variant of the skeleton
   * @default "rect"
   */
  shape?: ISkeletonShape;
  /**
   * Width of the skeleton (number for pixels, string for percentage)
   * @default "100%"
   */
  width?: number | string;
  /**
   * Height of the skeleton (number for pixels, string for percentage)
   * @default 16
   */
  height?: number | string;
  /**
   * Border radius override (auto-calculated for circle/text)
   */
  radius?: number;
  /**
   * Disable shimmer animation
   * @default false
   */
  disableAnimation?: boolean;
  /**
   * Test ID for testing
   */
  testID?: string;
} & UnistylesVariants<typeof styles>;

type ISkeletonGroupProps = {
  /**
   * Number of skeleton items to render
   * @default 1
   */
  count?: number;
  /**
   * Gap between skeleton items
   * @default 8
   */
  gap?: number;
  /**
   * Direction of skeleton items
   * @default "column"
   */
  direction?: "row" | "column";
  /**
   * Props to pass to each skeleton item
   */
  itemProps?: Omit<IProps, "testID">;
  /**
   * Test ID prefix for testing
   */
  testID?: string;
};

type ISkeletonAvatarProps = {
  /**
   * Size of the avatar skeleton
   * @default 40
   */
  size?: number;
  /**
   * Disable shimmer animation
   * @default false
   */
  disableAnimation?: boolean;
  /**
   * Test ID for testing
   */
  testID?: string;
};

type ISkeletonTextProps = {
  /**
   * Number of text lines
   * @default 1
   */
  lines?: number;
  /**
   * Height of each line
   * @default 14
   */
  lineHeight?: number;
  /**
   * Gap between lines
   * @default 8
   */
  gap?: number;
  /**
   * Width of the last line (percentage 0-100)
   * @default 60
   */
  lastLineWidth?: number;
  /**
   * Disable shimmer animation
   * @default false
   */
  disableAnimation?: boolean;
  /**
   * Test ID prefix for testing
   */
  testID?: string;
};

//#endregion Types

//#region Constants

const SHIMMER_DURATION = 1200;

//#endregion Constants

//#region Skeleton Component

export function Skeleton({
  shape = "rect",
  width = "100%",
  height = 16,
  radius,
  disableAnimation = false,
  testID,
}: IProps) {
  const shimmerPosition = useSharedValue(0);

  useEffect(() => {
    if (!disableAnimation) {
      shimmerPosition.value = withRepeat(
        withTiming(1, {
          duration: SHIMMER_DURATION,
          easing: Easing.linear,
        }),
        -1, // Infinite repeat
        false, // Don't reverse
      );
    }
  }, [disableAnimation, shimmerPosition]);

  const animatedStyle = useAnimatedStyle(() => {
    if (disableAnimation) {
      return {};
    }
    return {
      opacity: 0.5 + shimmerPosition.value * 0.5,
    };
  });

  const computedRadius = (() => {
    if (radius !== undefined) return radius;
    if (shape === "circle") {
      const size = typeof height === "number" ? height : 40;
      return size / 2;
    }
    if (shape === "text") return 4;
    return 4;
  })();

  const computedHeight = (() => {
    if (shape === "circle" && width !== undefined && height === 16) {
      // For circle, use width as both dimensions if height not explicitly set
      return width;
    }
    return height;
  })();

  styles.useVariants({ shape });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as DimensionValue,
          height: computedHeight as DimensionValue,
          borderRadius: computedRadius,
        },
        animatedStyle,
      ]}
      testID={testID}
      accessibilityRole="none"
      accessibilityLabel="Loading"
    />
  );
}

//#endregion Skeleton Component

//#region SkeletonGroup Component

export function SkeletonGroup({
  count = 1,
  gap = 8,
  direction = "column",
  itemProps = {},
  testID,
}: ISkeletonGroupProps) {
  return (
    <View
      style={[
        styles.group,
        {
          flexDirection: direction,
          gap,
        },
      ]}
      testID={testID}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          {...itemProps}
          testID={testID ? `${testID}-item-${index}` : undefined}
        />
      ))}
    </View>
  );
}

//#endregion SkeletonGroup Component

//#region SkeletonAvatar Component

export function SkeletonAvatar({
  size = 40,
  disableAnimation = false,
  testID,
}: ISkeletonAvatarProps) {
  return (
    <Skeleton
      shape="circle"
      width={size}
      height={size}
      disableAnimation={disableAnimation}
      testID={testID}
    />
  );
}

//#endregion SkeletonAvatar Component

//#region SkeletonText Component

export function SkeletonText({
  lines = 1,
  lineHeight = 14,
  gap = 8,
  lastLineWidth = 60,
  disableAnimation = false,
  testID,
}: ISkeletonTextProps) {
  return (
    <View style={[styles.textContainer, { gap }]} testID={testID}>
      {Array.from({ length: lines }).map((_, index) => {
        const isLastLine = index === lines - 1 && lines > 1;
        const width = isLastLine ? `${lastLineWidth}%` : "100%";

        return (
          <Skeleton
            key={index}
            shape="text"
            width={width}
            height={lineHeight}
            disableAnimation={disableAnimation}
            testID={testID ? `${testID}-line-${index}` : undefined}
          />
        );
      })}
    </View>
  );
}

//#endregion SkeletonText Component

//#region Composed Skeleton Layouts

type ISkeletonCardProps = {
  /**
   * Show avatar placeholder
   * @default true
   */
  showAvatar?: boolean;
  /**
   * Number of text lines
   * @default 2
   */
  textLines?: number;
  /**
   * Disable shimmer animation
   * @default false
   */
  disableAnimation?: boolean;
  /**
   * Test ID for testing
   */
  testID?: string;
};

export function SkeletonCard({
  showAvatar = true,
  textLines = 2,
  disableAnimation = false,
  testID,
}: ISkeletonCardProps) {
  return (
    <View style={styles.card} testID={testID}>
      {showAvatar && (
        <SkeletonAvatar
          size={40}
          disableAnimation={disableAnimation}
          testID={testID ? `${testID}-avatar` : undefined}
        />
      )}
      <View style={styles.cardContent}>
        <Skeleton
          shape="text"
          width="40%"
          height={12}
          disableAnimation={disableAnimation}
          testID={testID ? `${testID}-title` : undefined}
        />
        <SkeletonText
          lines={textLines}
          lineHeight={14}
          gap={6}
          lastLineWidth={75}
          disableAnimation={disableAnimation}
          testID={testID ? `${testID}-text` : undefined}
        />
      </View>
    </View>
  );
}

type ISkeletonListProps = {
  /**
   * Number of list items
   * @default 3
   */
  count?: number;
  /**
   * Gap between items
   * @default 16
   */
  gap?: number;
  /**
   * Show avatar in each item
   * @default true
   */
  showAvatar?: boolean;
  /**
   * Disable shimmer animation
   * @default false
   */
  disableAnimation?: boolean;
  /**
   * Test ID prefix for testing
   */
  testID?: string;
};

export function SkeletonList({
  count = 3,
  gap = 16,
  showAvatar = true,
  disableAnimation = false,
  testID,
}: ISkeletonListProps) {
  return (
    <View style={[styles.list, { gap }]} testID={testID}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard
          key={index}
          showAvatar={showAvatar}
          textLines={1}
          disableAnimation={disableAnimation}
          testID={testID ? `${testID}-item-${index}` : undefined}
        />
      ))}
    </View>
  );
}

//#endregion Composed Skeleton Layouts

//#region Styles

const styles = StyleSheet.create((theme) => ({
  skeleton: {
    backgroundColor: theme.colors.centerChannelColor,
    opacity: 0.08,
    variants: {
      shape: {
        text: {},
        circle: {},
        rect: {},
      },
    },
  },

  group: {
    flexDirection: "column",
  },

  textContainer: {
    flexDirection: "column",
    width: "100%",
  },

  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.gap(1.5), // 12px
  },

  cardContent: {
    flex: 1,
    gap: theme.gap(1), // 8px
  },

  list: {
    flexDirection: "column",
  },
}));

//#endregion Styles
