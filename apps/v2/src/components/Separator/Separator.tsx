// apps/v2/src/components/Separator/Separator.tsx

import { Text, View } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";
import { useTranslation } from "react-i18next";

import type { ITranslationKey } from "@/locales";

//#region Types

type IProps = {
  /**
   * i18n translation key for label text
   */
  labelKey?: ITranslationKey;
  /**
   * Direct label text (use labelKey for i18n)
   */
  label?: string;
  /**
   * Separator orientation
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Line thickness
   * @default "thin"
   */
  thickness?: "thin" | "medium" | "thick";
  /**
   * Color variant
   * @default "neutral"
   */
  colorVariant?: "neutral" | "light" | "dark" | "notification";
  /**
   * Custom spacing around separator (vertical margin for horizontal, horizontal margin for vertical)
   * Uses theme.gap multiplier
   * @default 2
   */
  spacing?: number;
  /**
   * Ref to the container View
   */
  ref?: React.Ref<React.ComponentRef<typeof View>>;
  /**
   * Test ID for testing
   */
  testID?: string;
} & UnistylesVariants<typeof styles>;

//#endregion Types

//#region Component

export function Separator({
  labelKey,
  label,
  orientation = "horizontal",
  thickness = "thin",
  colorVariant = "neutral",
  spacing = 2,
  ref,
  testID,
}: IProps) {
  const { t } = useTranslation();

  const displayLabel = labelKey ? t(labelKey) : label;
  const hasLabel = Boolean(displayLabel) && orientation === "horizontal";

  styles.useVariants({
    orientation,
    thickness,
    colorVariant,
    hasLabel,
  });

  const spacingStyle =
    orientation === "horizontal"
      ? { marginVertical: spacing * 8 }
      : { marginHorizontal: spacing * 8 };

  return (
    <View
      ref={ref}
      style={[styles.container, spacingStyle]}
      accessible
      accessibilityRole="none"
      testID={testID}
    >
      {hasLabel ? (
        <>
          <View style={styles.line} />
          <View style={styles.labelContainer}>
            <Text style={styles.labelText}>{displayLabel}</Text>
          </View>
          <View style={styles.line} />
        </>
      ) : (
        <View style={styles.line} />
      )}
    </View>
  );
}

//#endregion Component

//#region Styles

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: "center",
    justifyContent: "center",
    variants: {
      //#region Orientation Styles
      orientation: {
        horizontal: {
          flexDirection: "row",
          width: "100%",
        },
        vertical: {
          flexDirection: "column",
          height: "100%",
        },
      },
      //#endregion Orientation Styles

      //#region Has Label (for accessibility)
      hasLabel: {
        true: {},
        false: {},
      },
      //#endregion Has Label

      //#region Thickness (container doesn't need thickness)
      thickness: {
        thin: {},
        medium: {},
        thick: {},
      },
      //#endregion Thickness

      //#region Color Variant (container doesn't need color)
      colorVariant: {
        neutral: {},
        light: {},
        dark: {},
        notification: {},
      },
      //#endregion Color Variant
    },
  },

  line: {
    variants: {
      //#region Line Orientation Styles
      orientation: {
        horizontal: {
          flex: 1,
          height: 1,
        },
        vertical: {
          flex: 1,
          width: 1,
        },
      },
      //#endregion Line Orientation Styles

      //#region Line Thickness Styles
      thickness: {
        thin: {},
        medium: {},
        thick: {},
      },
      //#endregion Line Thickness Styles

      //#region Line Color Variant Styles
      colorVariant: {
        neutral: {
          backgroundColor: theme.colors.borderDefault,
        },
        light: {
          backgroundColor: theme.colors.borderLight,
        },
        dark: {
          backgroundColor: theme.colors.borderDark,
        },
        notification: {
          backgroundColor: theme.colors.newMessageSeparator,
        },
      },
      //#endregion Line Color Variant Styles

      //#region Has Label (line doesn't change)
      hasLabel: {
        true: {},
        false: {},
      },
      //#endregion Has Label
    },
    compoundVariants: [
      // Horizontal thickness overrides
      {
        orientation: "horizontal",
        thickness: "medium",
        styles: {
          height: 2,
        },
      },
      {
        orientation: "horizontal",
        thickness: "thick",
        styles: {
          height: 4,
        },
      },
      // Vertical thickness overrides
      {
        orientation: "vertical",
        thickness: "medium",
        styles: {
          width: 2,
        },
      },
      {
        orientation: "vertical",
        thickness: "thick",
        styles: {
          width: 4,
        },
      },
    ],
  },

  labelContainer: {
    paddingHorizontal: theme.gap(1.5), // 12px
    backgroundColor: theme.colors.centerChannelBg,
    borderRadius: 50, // pill shape
    variants: {
      //#region Label Container Orientation
      orientation: {
        horizontal: {},
        vertical: {
          display: "none",
        },
      },
      //#endregion Label Container Orientation

      //#region Label Container Thickness (unused)
      thickness: {
        thin: {},
        medium: {},
        thick: {},
      },
      //#endregion Label Container Thickness

      //#region Label Container Color Variant (unused)
      colorVariant: {
        neutral: {},
        light: {},
        dark: {},
        notification: {},
      },
      //#endregion Label Container Color Variant

      //#region Has Label
      hasLabel: {
        true: {},
        false: {
          display: "none",
        },
      },
      //#endregion Has Label
    },
  },

  labelText: {
    fontFamily: theme.fonts.primary,
    fontSize: 13,
    fontWeight: theme.fontWeights.semiBold,
    lineHeight: 26, // 2em equivalent
    textAlign: "center",
    variants: {
      //#region Label Text Orientation (unused)
      orientation: {
        horizontal: {},
        vertical: {},
      },
      //#endregion Label Text Orientation

      //#region Label Text Thickness (unused)
      thickness: {
        thin: {},
        medium: {},
        thick: {},
      },
      //#endregion Label Text Thickness

      //#region Label Text Color Variant Styles
      colorVariant: {
        neutral: {
          color: theme.colors.centerChannelColor,
        },
        light: {
          color: theme.colors.centerChannelColor,
        },
        dark: {
          color: theme.colors.centerChannelColor,
        },
        notification: {
          color: theme.colors.newMessageSeparator,
        },
      },
      //#endregion Label Text Color Variant Styles

      //#region Has Label (unused)
      hasLabel: {
        true: {},
        false: {},
      },
      //#endregion Has Label
    },
  },
}));

//#endregion Styles
