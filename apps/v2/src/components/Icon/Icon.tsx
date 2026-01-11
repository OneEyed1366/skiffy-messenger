// apps/v2/src/components/Icon/Icon.tsx

/**
 * Icon wrapper component
 * Migrated from: vendor/desktop/webapp/channels/src/components/widgets/icons/
 *
 * Provides consistent sizing, theming, and accessibility for icons.
 * Uses @expo/vector-icons for icon rendering with Unistyles for theming.
 */

import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { View } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";

//#region Types

type IIconFamily = "MaterialCommunityIcons" | "Ionicons" | "FontAwesome";

type IMaterialIconName = keyof typeof MaterialCommunityIcons.glyphMap;
type IIoniconsIconName = keyof typeof Ionicons.glyphMap;
type IFontAwesomeIconName = keyof typeof FontAwesome.glyphMap;

type IIconName = IMaterialIconName | IIoniconsIconName | IFontAwesomeIconName;

type IIconSize = "sm" | "md" | "lg";

type IProps = {
  /**
   * Icon name from the selected icon family
   */
  name: IIconName;
  /**
   * Icon family to use
   * @default "MaterialCommunityIcons"
   */
  family?: IIconFamily;
  /**
   * Custom color override (hex/rgb value)
   */
  color?: string;
  /**
   * Accessibility label for screen readers
   */
  accessibilityLabel?: string;
  /**
   * Whether to hide from accessibility tree (decorative icons)
   * @default false
   */
  accessibilityHidden?: boolean;
  /**
   * Test ID for testing
   */
  testID?: string;
  /**
   * Ref to the container View
   */
  ref?: React.Ref<React.ComponentRef<typeof View>>;
} & UnistylesVariants<typeof styles>;

//#endregion Types

//#region Constants

const SIZE_MAP = {
  sm: 16,
  md: 24,
  lg: 32,
} as const satisfies Record<IIconSize, number>;

//#endregion Constants

//#region Component

export function Icon({
  name,
  family = "MaterialCommunityIcons",
  color,
  size = "md",
  accessibilityLabel,
  accessibilityHidden = false,
  testID,
  ref,
}: IProps) {
  styles.useVariants({ size });

  const iconSize = SIZE_MAP[size ?? "md"];
  const IconComponent = getIconComponent(family);
  const iconColor = color ?? styles.icon.color;

  return (
    <View
      ref={ref}
      style={styles.container}
      accessible={!accessibilityHidden}
      accessibilityRole={accessibilityLabel ? "image" : undefined}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <IconComponent name={name as never} size={iconSize} color={iconColor} />
    </View>
  );
}

//#endregion Component

//#region Helpers

function getIconComponent(family: IIconFamily) {
  switch (family) {
    case "Ionicons":
      return Ionicons;
    case "FontAwesome":
      return FontAwesome;
    case "MaterialCommunityIcons":
    default:
      return MaterialCommunityIcons;
  }
}

//#endregion Helpers

//#region Styles

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: "center",
    justifyContent: "center",
    variants: {
      size: {
        sm: {
          width: SIZE_MAP.sm,
          height: SIZE_MAP.sm,
        },
        md: {
          width: SIZE_MAP.md,
          height: SIZE_MAP.md,
        },
        lg: {
          width: SIZE_MAP.lg,
          height: SIZE_MAP.lg,
        },
      },
    },
  },
  icon: {
    color: theme.colors.centerChannelColor,
  },
}));

//#endregion Styles
