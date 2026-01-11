// apps/v2/src/components/Pill/Pill.tsx

import { Pressable, Text, View } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";
import { useTranslation } from "react-i18next";

import type { ITranslationKey } from "@/locales";

//#region Types

type IProps = {
  /**
   * i18n translation key for pill text
   */
  labelKey?: ITranslationKey;
  /**
   * Direct text content (use labelKey for i18n)
   */
  label?: string;
  /**
   * Color variant
   * @default "neutral"
   */
  color?: "neutral" | "info" | "success" | "warning" | "danger";
  /**
   * Pill size
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Icon component to render on the left
   */
  iconLeft?: React.ReactNode;
  /**
   * Callback when dismiss button is pressed (shows X button when provided)
   */
  onDismiss?: () => void;
  /**
   * Callback when pill is pressed (makes pill interactive)
   */
  onPress?: () => void;
  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;
  /**
   * Ref to the underlying View/Pressable
   */
  ref?: React.Ref<React.ComponentRef<typeof View>>;
  /**
   * Test ID for testing
   */
  testID?: string;
} & UnistylesVariants<typeof styles>;

//#endregion Types

//#region Component

export function Pill({
  labelKey,
  label,
  color = "neutral",
  size = "md",
  iconLeft,
  onDismiss,
  onPress,
  disabled = false,
  ref,
  testID,
}: IProps) {
  const { t } = useTranslation();

  const displayText = labelKey ? t(labelKey) : label;
  const isInteractive = !!onPress || !!onDismiss;

  styles.useVariants({
    color,
    size,
    disabled,
    interactive: isInteractive,
  });

  const handlePress = () => {
    if (!disabled) {
      onPress?.();
    }
  };

  const handleDismiss = () => {
    if (!disabled) {
      onDismiss?.();
    }
  };

  const content = (
    <>
      {iconLeft && <View style={styles.iconLeft}>{iconLeft}</View>}

      {displayText && (
        <Text style={styles.text} numberOfLines={1}>
          {displayText}
        </Text>
      )}

      {onDismiss && (
        <Pressable
          style={styles.dismissButton}
          onPress={handleDismiss}
          disabled={disabled}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel={t("label.dismiss")}
          testID={testID ? `${testID}-dismiss` : undefined}
        >
          <Text style={styles.dismissIcon}>×</Text>
        </Pressable>
      )}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        ref={ref as React.Ref<React.ComponentRef<typeof Pressable>>}
        style={({ pressed }) => [
          styles.container,
          pressed && !disabled && styles.containerPressed,
        ]}
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        testID={testID}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      ref={ref}
      style={styles.container}
      accessibilityRole="text"
      testID={testID}
    >
      {content}
    </View>
  );
}

//#endregion Component

//#region Styles

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: theme.radius.xl, // Pill shape (12-16px)
    gap: theme.gap(0.5), // 4px
    variants: {
      //#region Size Styles
      size: {
        sm: {
          height: 20,
          paddingHorizontal: theme.gap(1), // 8px
        },
        md: {
          height: 24,
          paddingHorizontal: theme.gap(1), // 8px
        },
        lg: {
          height: 28,
          paddingHorizontal: theme.gap(1.5), // 12px
        },
      },
      //#endregion Size Styles

      //#region Color Styles
      color: {
        neutral: {
          backgroundColor: `${theme.colors.centerChannelColor}14`, // 8% opacity
        },
        info: {
          backgroundColor: theme.colors.linkColor,
        },
        success: {
          backgroundColor: theme.colors.onlineIndicator,
        },
        warning: {
          backgroundColor: theme.colors.awayIndicator,
        },
        danger: {
          backgroundColor: theme.colors.errorText,
        },
      },
      //#endregion Color Styles

      //#region State Styles
      disabled: {
        true: {
          opacity: 0.48,
        },
        false: {
          opacity: 1,
        },
      },

      interactive: {
        true: {},
        false: {},
      },
      //#endregion State Styles
    },
  },

  containerPressed: {
    variants: {
      color: {
        neutral: {
          backgroundColor: `${theme.colors.centerChannelColor}20`, // 12% opacity
        },
        info: {
          opacity: 0.85,
        },
        success: {
          opacity: 0.85,
        },
        warning: {
          opacity: 0.85,
        },
        danger: {
          opacity: 0.85,
        },
      },
    },
  },

  text: {
    fontFamily: theme.fonts.primary,
    fontWeight: theme.fontWeights.semiBold,
    maxWidth: 200,
    variants: {
      //#region Text Size Styles
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
      //#endregion Text Size Styles

      //#region Text Color Styles
      color: {
        neutral: {
          color: theme.colors.centerChannelColor,
        },
        info: {
          color: "#ffffff",
        },
        success: {
          color: "#ffffff",
        },
        warning: {
          color: "#ffffff",
        },
        danger: {
          color: "#ffffff",
        },
      },
      //#endregion Text Color Styles
    },
  },

  iconLeft: {
    justifyContent: "center",
    alignItems: "center",
    variants: {
      size: {
        sm: {
          width: 12,
          height: 12,
        },
        md: {
          width: 14,
          height: 14,
        },
        lg: {
          width: 16,
          height: 16,
        },
      },
    },
  },

  dismissButton: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: theme.gap(0.25), // 2px
    variants: {
      size: {
        sm: {
          width: 14,
          height: 14,
        },
        md: {
          width: 16,
          height: 16,
        },
        lg: {
          width: 18,
          height: 18,
        },
      },
    },
  },

  dismissIcon: {
    fontWeight: theme.fontWeights.semiBold,
    textAlign: "center",
    variants: {
      size: {
        sm: {
          fontSize: 12,
          lineHeight: 14,
        },
        md: {
          fontSize: 14,
          lineHeight: 16,
        },
        lg: {
          fontSize: 16,
          lineHeight: 18,
        },
      },
      color: {
        neutral: {
          color: `${theme.colors.centerChannelColor}64`, // 40% opacity
        },
        info: {
          color: "rgba(255, 255, 255, 0.8)",
        },
        success: {
          color: "rgba(255, 255, 255, 0.8)",
        },
        warning: {
          color: "rgba(255, 255, 255, 0.8)",
        },
        danger: {
          color: "rgba(255, 255, 255, 0.8)",
        },
      },
    },
  },
}));

//#endregion Styles
