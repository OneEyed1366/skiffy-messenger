// apps/v2/src/components/Menu/MenuHeader.tsx

import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useTranslation } from "react-i18next";

import type { ITranslationKey } from "@/locales";

//#region Types

type IProps = {
  /**
   * i18n translation key for header text
   */
  titleKey?: ITranslationKey;
  /**
   * Direct header text (use titleKey for i18n)
   */
  title?: string;
  /**
   * Test ID for testing
   */
  testID?: string;
};

//#endregion Types

//#region Component

export function MenuHeader({ titleKey, title, testID }: IProps) {
  const { t } = useTranslation();
  const displayTitle = titleKey ? String(t(titleKey)) : title;

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.title} numberOfLines={1}>
        {displayTitle}
      </Text>
    </View>
  );
}

//#endregion Component

//#region Styles

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingVertical: theme.gap(1),
    paddingHorizontal: theme.gap(2.5),
  },

  title: {
    fontFamily: theme.fonts.primary,
    fontSize: 12,
    fontWeight: theme.fontWeights.semiBold,
    lineHeight: 16,
    color: `${theme.colors.centerChannelColor}A3`,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
}));

//#endregion Styles
