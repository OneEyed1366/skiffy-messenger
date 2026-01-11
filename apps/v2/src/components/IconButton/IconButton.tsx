// apps/v2/src/components/IconButton/IconButton.tsx

import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

//#region Types

type IIconButtonSize = "sm" | "md" | "lg";
type IIconButtonVariant = "default" | "filled" | "outline";

type IProps = {
  /**
   * Icon element to render
   */
  icon: React.ReactNode;
  /**
   * Press handler
   */
  onPress?: () => void;
  /**
   * Long press handler
   */
  onLongPress?: () => void;
  /**
   * Accessibility label (REQUIRED - no visible text)
   */
  accessibilityLabel: string;
  /**
   * Button size (hit target)
   * @default "md"
   */
  size?: IIconButtonSize;
  /**
   * Visual variant
   * @default "default"
   */
  variant?: IIconButtonVariant;
  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;
  /**
   * Toggled/active state
   * @default false
   */
  toggled?: boolean;
  /**
   * Show notification badge dot
   * @default false
   */
  showBadge?: boolean;
  /**
   * Badge color
   * @default theme error color
   */
  badgeColor?: string;
  /**
   * Ref to underlying Pressable
   */
  ref?: React.Ref<React.ComponentRef<typeof Pressable>>;
  /**
   * Test ID
   */
  testID?: string;
};

//#endregion Types

//#region Component

export function IconButton({
  icon,
  onPress,
  onLongPress,
  accessibilityLabel,
  size = "md",
  variant = "default",
  disabled = false,
  toggled = false,
  showBadge = false,
  badgeColor,
  ref,
  testID,
}: IProps) {
  // @ts-expect-error - Unistyles type inference issue with compoundVariants
  styles.useVariants({ size, variant, disabled, toggled });

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

  return (
    <Pressable
      ref={ref}
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled && styles.buttonPressed,
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, selected: toggled }}
      testID={testID}
    >
      <View style={styles.iconContainer}>{icon}</View>

      {showBadge && (
        <View
          style={[styles.badge, badgeColor && { backgroundColor: badgeColor }]}
          testID={testID ? `${testID}-badge` : "icon-button-badge"}
        />
      )}
    </Pressable>
  );
}

//#endregion Component

//#region Styles

const styles = StyleSheet.create((theme) => ({
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.m,
    position: "relative",
    variants: {
      //#region Size Styles
      size: {
        sm: {
          width: 24,
          height: 24,
          borderRadius: theme.radius.s,
        },
        md: {
          width: 32,
          height: 32,
        },
        lg: {
          width: 40,
          height: 40,
        },
      },
      //#endregion Size Styles

      //#region Variant Styles
      variant: {
        default: {
          backgroundColor: "transparent",
        },
        filled: {
          backgroundColor: theme.colors.buttonBg,
        },
        outline: {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: theme.colors.borderDark,
        },
      },
      //#endregion Variant Styles

      //#region State Styles
      disabled: {
        true: { opacity: 0.32 },
        false: { opacity: 1 },
      },
      toggled: {
        true: {
          backgroundColor: `${theme.colors.buttonBg}14`, // 8% opacity
        },
        false: {},
      },
      //#endregion State Styles
    },
    compoundVariants: [
      // Toggled filled variant
      {
        variant: "filled",
        toggled: true,
        styles: {
          backgroundColor: theme.colors.buttonBg,
        },
      },
    ],
  },

  buttonPressed: {
    variants: {
      size: {
        sm: {},
        md: {},
        lg: {},
      },
      variant: {
        default: {
          backgroundColor: `${theme.colors.centerChannelColor}14`, // 8% opacity
        },
        filled: {
          backgroundColor: theme.colors.primaryHover,
        },
        outline: {
          backgroundColor: `${theme.colors.centerChannelColor}08`, // 3% opacity
        },
      },
      disabled: {
        true: {},
        false: {},
      },
      toggled: {
        true: {},
        false: {},
      },
    },
  },

  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    variants: {
      size: {
        sm: { width: 16, height: 16 },
        md: { width: 20, height: 20 },
        lg: { width: 24, height: 24 },
      },
      variant: {
        default: {},
        filled: {},
        outline: {},
      },
      disabled: {
        true: {},
        false: {},
      },
      toggled: {
        true: {},
        false: {},
      },
    },
  },

  badge: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.errorText,
    variants: {
      size: {
        sm: { top: 0, right: 0 },
        md: { top: 2, right: 2 },
        lg: { top: 4, right: 4 },
      },
      variant: {
        default: {},
        filled: {},
        outline: {},
      },
      disabled: {
        true: {},
        false: {},
      },
      toggled: {
        true: {},
        false: {},
      },
    },
  },
}));

//#endregion Styles
