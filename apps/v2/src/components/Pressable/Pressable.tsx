// apps/v2/src/components/Pressable/Pressable.tsx

import {
  Pressable as RNPressable,
  PressableProps as RNPressableProps,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";

//#region Types

type IPressableFeedback = "opacity" | "highlight" | "none";

type IProps = {
  /**
   * Child elements
   */
  children:
    | React.ReactNode
    | ((state: { pressed: boolean }) => React.ReactNode);
  /**
   * Press handler
   */
  onPress?: () => void;
  /**
   * Long press handler
   */
  onLongPress?: () => void;
  /**
   * Press in handler
   */
  onPressIn?: () => void;
  /**
   * Press out handler
   */
  onPressOut?: () => void;
  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;
  /**
   * Press feedback style
   * @default "opacity"
   */
  feedback?: IPressableFeedback;
  /**
   * Opacity when pressed (if feedback="opacity")
   * @default 0.7
   */
  pressedOpacity?: number;
  /**
   * Delay before onLongPress fires (ms)
   * @default 500
   */
  delayLongPress?: number;
  /**
   * Hit slop (extra touchable area)
   */
  hitSlop?:
    | number
    | { top?: number; bottom?: number; left?: number; right?: number };
  /**
   * Accessibility label
   */
  accessibilityLabel?: string;
  /**
   * Accessibility hint
   */
  accessibilityHint?: string;
  /**
   * Accessibility role
   * @default "button"
   */
  accessibilityRole?: RNPressableProps["accessibilityRole"];
  /**
   * Ref to underlying Pressable
   */
  ref?: React.Ref<React.ComponentRef<typeof RNPressable>>;
  /**
   * Test ID
   */
  testID?: string;
  /**
   * Additional style
   */
  style?: RNPressableProps["style"];
};

//#endregion Types

//#region Component

export function Pressable({
  children,
  onPress,
  onLongPress,
  onPressIn,
  onPressOut,
  disabled = false,
  feedback = "opacity",
  pressedOpacity = 0.7,
  delayLongPress = 500,
  hitSlop,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = "button",
  ref,
  testID,
  style,
}: IProps) {
  const handlePress = () => {
    if (!disabled) {
      onPress?.();
    }
  };

  const handleLongPress = () => {
    if (!disabled) {
      onLongPress?.();
    }
  };

  const handlePressIn = () => {
    if (!disabled) {
      onPressIn?.();
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      onPressOut?.();
    }
  };

  return (
    <RNPressable
      ref={ref}
      style={({ pressed }) => [
        styles.pressable,
        disabled && styles.disabled,
        feedback === "opacity" && pressed && { opacity: pressedOpacity },
        feedback === "highlight" && pressed && styles.highlighted,
        typeof style === "function" ? style({ pressed }) : style,
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      delayLongPress={delayLongPress}
      hitSlop={hitSlop}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ disabled }}
      testID={testID}
      // Android ripple effect
      android_ripple={
        feedback !== "none" && !disabled
          ? { color: "rgba(0, 0, 0, 0.1)", borderless: false }
          : undefined
      }
    >
      {children}
    </RNPressable>
  );
}

//#endregion Component

//#region Styles

const styles = StyleSheet.create((theme) => ({
  pressable: {},

  disabled: {
    opacity: 0.32,
  },

  highlighted: {
    backgroundColor: `${theme.colors.centerChannelColor}14`, // 8% opacity
  },
}));

//#endregion Styles
