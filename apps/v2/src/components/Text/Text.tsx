// apps/v2/src/components/Text/Text.tsx

import { Text as RNText, TextProps as RNTextProps } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";
import { useTranslation } from "react-i18next";

import type { ITranslationKey } from "@/locales";

//#region Types

type ITextVariant = "heading" | "body" | "caption" | "label";
type ITextSize = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
type ITextWeight = "regular" | "medium" | "semiBold" | "bold";
type ITextColor =
  | "primary"
  | "secondary"
  | "muted"
  | "error"
  | "link"
  | "inherit";

type IProps = {
  /**
   * Text content (direct)
   */
  children?: React.ReactNode;
  /**
   * i18n translation key
   */
  textKey?: ITranslationKey;
  /**
   * i18n interpolation values
   */
  textParams?: Record<string, string | number>;
  /**
   * Semantic text variant
   * @default "body"
   */
  variant?: ITextVariant;
  /**
   * Text size
   * @default "md"
   */
  size?: ITextSize;
  /**
   * Font weight
   * @default "regular"
   */
  weight?: ITextWeight;
  /**
   * Text color
   * @default "primary"
   */
  color?: ITextColor;
  /**
   * Number of lines before truncation
   */
  numberOfLines?: number;
  /**
   * Text alignment
   * @default "left"
   */
  align?: "left" | "center" | "right";
  /**
   * Ref to underlying RNText
   */
  ref?: React.Ref<React.ComponentRef<typeof RNText>>;
  /**
   * Test ID
   */
  testID?: string;
  /**
   * Accessibility label (overrides children for screen readers)
   */
  accessibilityLabel?: string;
} & UnistylesVariants<typeof styles> &
  Pick<RNTextProps, "selectable" | "ellipsizeMode">;

//#endregion Types

//#region Component

export function Text({
  children,
  textKey,
  textParams,
  variant = "body",
  size = "md",
  weight = "regular",
  color = "primary",
  numberOfLines,
  align = "left",
  selectable = false,
  ellipsizeMode = "tail",
  ref,
  testID,
  accessibilityLabel,
}: IProps) {
  const { t } = useTranslation();

  styles.useVariants({ variant, size, weight, color, align });

  const content = textKey ? t(textKey, textParams) : children;

  return (
    <RNText
      ref={ref}
      style={styles.text}
      numberOfLines={numberOfLines}
      selectable={selectable}
      ellipsizeMode={ellipsizeMode}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text"
    >
      {content}
    </RNText>
  );
}

//#endregion Component

//#region Styles

const styles = StyleSheet.create((theme) => ({
  text: {
    fontFamily: theme.fonts.primary,
    variants: {
      //#region Variant Styles
      variant: {
        heading: {
          fontFamily: theme.fonts.heading,
        },
        body: {
          fontFamily: theme.fonts.primary,
        },
        caption: {
          fontFamily: theme.fonts.primary,
        },
        label: {
          fontFamily: theme.fonts.primary,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        },
      },
      //#endregion Variant Styles

      //#region Size Styles
      size: {
        xs: { fontSize: 10, lineHeight: 14 },
        sm: { fontSize: 12, lineHeight: 16 },
        md: { fontSize: 14, lineHeight: 20 },
        lg: { fontSize: 16, lineHeight: 24 },
        xl: { fontSize: 20, lineHeight: 28 },
        xxl: { fontSize: 24, lineHeight: 32 },
      },
      //#endregion Size Styles

      //#region Weight Styles
      weight: {
        regular: { fontWeight: "400" },
        medium: { fontWeight: "500" },
        semiBold: { fontWeight: "600" },
        bold: { fontWeight: "700" },
      },
      //#endregion Weight Styles

      //#region Color Styles
      color: {
        primary: { color: theme.colors.centerChannelColor },
        secondary: { color: theme.colors.centerChannelColor, opacity: 0.72 },
        muted: { color: theme.colors.centerChannelColor, opacity: 0.56 },
        error: { color: theme.colors.errorText },
        link: { color: theme.colors.linkColor },
        inherit: {}, // Uses parent color
      },
      //#endregion Color Styles

      //#region Align Styles
      align: {
        left: { textAlign: "left" },
        center: { textAlign: "center" },
        right: { textAlign: "right" },
      },
      //#endregion Align Styles
    },
    compoundVariants: [
      // Headings are bold by default
      { variant: "heading", weight: "regular", styles: { fontWeight: "700" } },
      // Labels are semiBold by default
      { variant: "label", weight: "regular", styles: { fontWeight: "600" } },
      // Captions are smaller
      {
        variant: "caption",
        size: "md",
        styles: { fontSize: 12, lineHeight: 16 },
      },
    ],
  },
}));

//#endregion Styles
