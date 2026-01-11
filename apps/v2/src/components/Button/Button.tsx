// apps/v2/src/components/Button/Button.tsx

import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";
import { useTranslation } from "react-i18next";

import type { ITranslationKey } from "@/locales";

//#region Types

type IButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "destructive"
  | "link";

type IButtonSize = "sm" | "md" | "lg";

type IProps = {
  /**
   * i18n translation key for button text
   */
  titleKey?: ITranslationKey;
  /**
   * Direct text content (use titleKey for i18n)
   */
  title?: string;
  /**
   * Press handler
   */
  onPress?: () => void;
  /**
   * Long press handler
   */
  onLongPress?: () => void;
  /**
   * Button visual variant
   * @default "primary"
   */
  variant?: IButtonVariant;
  /**
   * Button size
   * @default "md"
   */
  size?: IButtonSize;
  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;
  /**
   * Loading state - shows spinner and disables interaction
   * @default false
   */
  loading?: boolean;
  /**
   * i18n key for loading text (optional)
   */
  loadingTitleKey?: ITranslationKey;
  /**
   * Icon component to render on the left
   */
  iconLeft?: React.ReactNode;
  /**
   * Icon component to render on the right
   */
  iconRight?: React.ReactNode;
  /**
   * Make button full width
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Ref to the underlying Pressable
   */
  ref?: React.Ref<React.ComponentRef<typeof Pressable>>;
  /**
   * Test ID for testing
   */
  testID?: string;
} & UnistylesVariants<typeof styles>;

//#endregion Types

//#region Component

export function Button({
  titleKey,
  title,
  onPress,
  onLongPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  loadingTitleKey,
  iconLeft,
  iconRight,
  fullWidth = false,
  ref,
  testID,
}: IProps) {
  const { t } = useTranslation();

  const isDisabled = disabled || loading;
  const displayText =
    loading && loadingTitleKey
      ? t(loadingTitleKey)
      : titleKey
        ? t(titleKey)
        : title;

  styles.useVariants({
    variant,
    size,
    disabled: isDisabled,
    fullWidth,
  });

  const handlePress = () => {
    if (!isDisabled) {
      onPress?.();
    }
  };

  const handleLongPress = () => {
    if (!isDisabled) {
      onLongPress?.();
    }
  };

  return (
    <Pressable
      ref={ref}
      style={({ pressed }) => [
        styles.button,
        pressed && !isDisabled && styles.buttonPressed,
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      testID={testID}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={
            variant === "primary" || variant === "destructive"
              ? "#ffffff"
              : undefined
          }
          style={styles.spinner}
          testID={testID ? `${testID}-loading` : undefined}
        />
      )}

      {!loading && iconLeft && (
        <View style={styles.iconLeft} testID="icon-left">
          {iconLeft}
        </View>
      )}

      {displayText && (
        <Text style={styles.text} numberOfLines={1}>
          {displayText}
        </Text>
      )}

      {!loading && iconRight && (
        <View style={styles.iconRight} testID="icon-right">
          {iconRight}
        </View>
      )}
    </Pressable>
  );
}

//#endregion Component

//#region Styles

const styles = StyleSheet.create((theme) => ({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.s,
    gap: theme.gap(1),
    variants: {
      //#region Variant Styles
      variant: {
        primary: {
          backgroundColor: theme.colors.buttonBg,
          borderWidth: 0,
        },
        secondary: {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: theme.colors.buttonBg,
        },
        tertiary: {
          backgroundColor: `${theme.colors.buttonBg}14`, // 8% opacity
          borderWidth: 0,
        },
        destructive: {
          backgroundColor: theme.colors.errorText,
          borderWidth: 0,
        },
        link: {
          backgroundColor: "transparent",
          borderWidth: 0,
          paddingHorizontal: 0,
          height: "auto",
        },
      },
      //#endregion Variant Styles

      //#region Size Styles
      size: {
        sm: {
          height: 32,
          paddingHorizontal: theme.gap(2), // 16px
        },
        md: {
          height: 40,
          paddingHorizontal: theme.gap(2.5), // 20px
        },
        lg: {
          height: 48,
          paddingHorizontal: theme.gap(3), // 24px
        },
      },
      //#endregion Size Styles

      //#region State Styles
      disabled: {
        true: {
          opacity: 0.32,
        },
        false: {
          opacity: 1,
        },
      },
      //#endregion State Styles

      //#region Layout Styles
      fullWidth: {
        true: {
          width: "100%",
        },
        false: {},
      },
      //#endregion Layout Styles
    },
    compoundVariants: [
      // Disabled primary - different background
      {
        variant: "primary",
        disabled: true,
        styles: {
          backgroundColor: `${theme.colors.centerChannelColor}14`, // 8% opacity
        },
      },
      // Disabled secondary - different border
      {
        variant: "secondary",
        disabled: true,
        styles: {
          borderColor: `${theme.colors.centerChannelColor}52`, // 32% opacity
        },
      },
      // Disabled destructive - different background
      {
        variant: "destructive",
        disabled: true,
        styles: {
          backgroundColor: `${theme.colors.centerChannelColor}14`, // 8% opacity
        },
      },
      // Link size override - no fixed height
      {
        variant: "link",
        size: "sm",
        styles: {
          height: "auto",
          paddingHorizontal: 0,
        },
      },
      {
        variant: "link",
        size: "md",
        styles: {
          height: "auto",
          paddingHorizontal: 0,
        },
      },
      {
        variant: "link",
        size: "lg",
        styles: {
          height: "auto",
          paddingHorizontal: 0,
        },
      },
    ],
  },

  buttonPressed: {
    variants: {
      variant: {
        primary: {
          backgroundColor: theme.colors.primaryHover,
        },
        secondary: {
          backgroundColor: `${theme.colors.buttonBg}29`, // 16% opacity
        },
        tertiary: {
          backgroundColor: `${theme.colors.buttonBg}29`, // 16% opacity
        },
        destructive: {
          opacity: 0.9,
        },
        link: {
          opacity: 0.7,
        },
      },
    },
  },

  text: {
    fontFamily: theme.fonts.primary,
    fontWeight: theme.fontWeights.semiBold,
    textAlign: "center",
    variants: {
      //#region Text Variant Styles
      variant: {
        primary: {
          color: theme.colors.buttonColor,
        },
        secondary: {
          color: theme.colors.buttonBg,
        },
        tertiary: {
          color: theme.colors.buttonBg,
        },
        destructive: {
          color: "#ffffff",
        },
        link: {
          color: theme.colors.buttonBg,
          textDecorationLine: "underline",
        },
      },
      //#endregion Text Variant Styles

      //#region Text Size Styles
      size: {
        sm: {
          fontSize: 12,
        },
        md: {
          fontSize: 14,
        },
        lg: {
          fontSize: 16,
        },
      },
      //#endregion Text Size Styles

      //#region Text Disabled Styles
      disabled: {
        true: {
          color: `${theme.colors.centerChannelColor}52`, // 32% opacity
        },
        false: {},
      },
      //#endregion Text Disabled Styles
    },
    compoundVariants: [
      // Disabled link - keep link color
      {
        variant: "link",
        disabled: true,
        styles: {
          color: `${theme.colors.buttonBg}52`, // 32% opacity
        },
      },
      // Disabled primary/destructive - override text color
      {
        variant: "primary",
        disabled: true,
        styles: {
          color: `${theme.colors.centerChannelColor}52`, // 32% opacity
        },
      },
      {
        variant: "destructive",
        disabled: true,
        styles: {
          color: `${theme.colors.centerChannelColor}52`, // 32% opacity
        },
      },
    ],
  },

  spinner: {
    marginRight: theme.gap(0.5), // 4px
  },

  iconLeft: {
    marginRight: theme.gap(0.5), // 4px
    variants: {
      size: {
        sm: {
          width: 12,
          height: 12,
        },
        md: {
          width: 16,
          height: 16,
        },
        lg: {
          width: 20,
          height: 20,
        },
      },
    },
  },

  iconRight: {
    marginLeft: theme.gap(0.5), // 4px
    variants: {
      size: {
        sm: {
          width: 12,
          height: 12,
        },
        md: {
          width: 16,
          height: 16,
        },
        lg: {
          width: 20,
          height: 20,
        },
      },
    },
  },
}));

//#endregion Styles
