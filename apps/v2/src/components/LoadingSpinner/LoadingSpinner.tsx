// apps/v2/src/components/LoadingSpinner/LoadingSpinner.tsx

import { ActivityIndicator, View, Text } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";
import { useTranslation } from "react-i18next";

import type { ITranslationKey } from "@/locales";

//#region Types

type ISize = "small" | "medium" | "large";

type IColor = "primary" | "secondary" | "neutral" | "button";

type IProps = {
  /**
   * Size of the spinner
   * @default "medium"
   */
  size?: ISize;
  /**
   * Color variant of the spinner
   * @default "primary"
   */
  color?: IColor;
  /**
   * i18n key for optional label text displayed below spinner
   */
  labelKey?: ITranslationKey;
  /**
   * Whether to display as fullscreen overlay
   * @default false
   */
  fullscreen?: boolean;
  /**
   * Test ID for testing
   */
  testID?: string;
} & UnistylesVariants<typeof styles>;

//#endregion Types

//#region Constants

const SIZE_MAP: Record<ISize, number> = {
  small: 16,
  medium: 24,
  large: 40,
};

//#endregion Constants

//#region Component

export function LoadingSpinner({
  size = "medium",
  color = "primary",
  labelKey,
  fullscreen = false,
  testID = "loadingSpinner",
}: IProps) {
  const { t } = useTranslation();
  styles.useVariants({ size, color, fullscreen });

  const sizeKey: ISize = size ?? "medium";
  const colorKey: IColor = color ?? "primary";
  const spinnerSize = SIZE_MAP[sizeKey];
  const spinnerColor = getSpinnerColor(colorKey);

  return (
    <View
      style={fullscreen ? styles.fullscreenContainer : styles.container}
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel={t("loadingSpinner.loading")}
    >
      <View style={styles.spinnerWrapper}>
        <ActivityIndicator
          size={spinnerSize}
          color={spinnerColor}
          testID={`${testID}-indicator`}
        />
      </View>
      {labelKey ? (
        <Text style={styles.label} testID={`${testID}-label`}>
          {t(labelKey)}
        </Text>
      ) : null}
    </View>
  );
}

//#endregion Component

//#region Helpers

function getSpinnerColor(colorVariant: IColor): string {
  // Colors are resolved at runtime from theme
  // This function returns the appropriate color key
  const colorMap: Record<IColor, string> = {
    primary: "#166de0", // theme.colors.primary
    secondary: "#1ff4ff", // theme.colors.secondary
    neutral: "#3f4350", // theme.colors.centerChannelColor
    button: "#ffffff", // theme.colors.buttonColor
  };
  return colorMap[colorVariant];
}

//#endregion Helpers

//#region Styles

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.gap(1),
  },

  fullscreenContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
  },

  spinnerWrapper: {
    alignItems: "center",
    justifyContent: "center",
    variants: {
      size: {
        small: {
          width: 20,
          height: 20,
        },
        medium: {
          width: 28,
          height: 28,
        },
        large: {
          width: 48,
          height: 48,
        },
      },
      fullscreen: {
        true: {
          backgroundColor: theme.colors.centerChannelBg,
          borderRadius: theme.radius.m,
          padding: theme.gap(2),
        },
        false: {},
      },
    },
  },

  label: {
    marginTop: theme.gap(1),
    fontSize: 14,
    fontFamily: theme.fonts.primary,
    fontWeight: theme.fontWeights.normal,
    textAlign: "center",
    variants: {
      color: {
        primary: {
          color: theme.colors.primary,
        },
        secondary: {
          color: theme.colors.secondary,
        },
        neutral: {
          color: theme.colors.centerChannelColor,
        },
        button: {
          color: theme.colors.buttonColor,
        },
      },
      fullscreen: {
        true: {
          color: theme.colors.centerChannelColor,
        },
        false: {},
      },
    },
  },
}));

//#endregion Styles
