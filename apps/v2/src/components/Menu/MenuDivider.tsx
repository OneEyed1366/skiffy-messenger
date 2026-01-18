// apps/v2/src/components/Menu/MenuDivider.tsx

/**
 * MenuDivider component
 * Visual separator between menu item groups.
 */

import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

//#region Types

type IProps = {
  /**
   * Test ID for testing
   */
  testID?: string;
};

//#endregion Types

//#region Component

export function MenuDivider({ testID }: IProps) {
  return (
    <View style={styles.divider} accessibilityRole="none" testID={testID} />
  );
}

//#endregion Component

//#region Styles

const styles = StyleSheet.create((theme) => ({
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: theme.gap(1),
    marginHorizontal: theme.gap(2),
  },
}));

//#endregion Styles
