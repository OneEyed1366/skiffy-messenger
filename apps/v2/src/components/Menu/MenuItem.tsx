// apps/v2/src/components/Menu/MenuItem.tsx

/**
 * MenuItem component
 * Migrated from: vendor/desktop/webapp/channels/src/components/menu/menu_item.tsx
 *
 * Individual menu item with label, description, icons, and variants.
 */

import { Pressable, Text, View } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";
import { useTranslation } from "react-i18next";

import type { ITranslationKey } from "@/locales";
import { useMenuContext } from "./Menu";

//#region Types

type IProps = {
  /**
   * Direct text label
   */
  label?: string;
  /**
   * i18n translation key for label
   */
  labelKey?: ITranslationKey;
  /**
   * Secondary description text
   */
  description?: string;
  /**
   * Icon component to render on the left
   */
  leadingIcon?: React.ReactNode;
  /**
   * Element to render on the right (icon, badge, shortcut)
   */
  trailingElement?: React.ReactNode;
  /**
   * Mark as destructive action (red styling)
   * @default false
   */
  destructive?: boolean;
  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;
  /**
   * Press handler
   */
  onPress?: () => void;
  /**
   * Prevent menu from closing when this item is selected
   * @default false
   */
  keepOpen?: boolean;
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

export function MenuItem({
  label,
  labelKey,
  description,
  leadingIcon,
  trailingElement,
  destructive = false,
  disabled = false,
  onPress,
  keepOpen = false,
  ref,
  testID,
}: IProps) {
  const { t } = useTranslation();
  const { closeMenu } = useMenuContext();

  const displayLabel = labelKey ? t(labelKey) : label;

  styles.useVariants({
    destructive,
    disabled,
  });

  const handlePress = () => {
    if (disabled) return;

    onPress?.();

    if (!keepOpen) {
      closeMenu();
    }
  };

  return (
    <Pressable
      ref={ref}
      style={({ pressed }) => [
        styles.container,
        pressed && !disabled && styles.containerPressed,
      ]}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="menuitem"
      accessibilityState={{ disabled }}
      accessibilityHint={destructive ? "Destructive action" : undefined}
      testID={testID}
    >
      {leadingIcon && <View style={styles.leadingIcon}>{leadingIcon}</View>}

      <View style={styles.labelContainer}>
        {displayLabel && (
          <Text style={styles.label} numberOfLines={1}>
            {displayLabel}
          </Text>
        )}
        {description && (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>

      {trailingElement && (
        <View style={styles.trailingElement}>{trailingElement}</View>
      )}
    </Pressable>
  );
}

//#endregion Component

//#region Styles

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.gap(1),
    paddingHorizontal: theme.gap(2),
    minHeight: 36,
    variants: {
      destructive: {
        true: {},
        false: {},
      },
      disabled: {
        true: {
          opacity: 0.32,
        },
        false: {
          opacity: 1,
        },
      },
    },
  },

  containerPressed: {
    backgroundColor: theme.colors.borderLight,
  },

  leadingIcon: {
    width: 18,
    height: 18,
    marginRight: theme.gap(1.25),
    alignItems: "center",
    justifyContent: "center",
  },

  labelContainer: {
    flex: 1,
    gap: theme.gap(0.5),
  },

  label: {
    fontFamily: theme.fonts.primary,
    fontSize: 14,
    fontWeight: theme.fontWeights.normal,
    lineHeight: 20,
    variants: {
      destructive: {
        true: {
          color: theme.colors.errorText,
        },
        false: {
          color: theme.colors.centerChannelColor,
        },
      },
    },
  },

  description: {
    fontFamily: theme.fonts.primary,
    fontSize: 12,
    fontWeight: theme.fontWeights.normal,
    lineHeight: 16,
    variants: {
      destructive: {
        true: {
          color: theme.colors.errorText,
        },
        false: {
          color: `${theme.colors.centerChannelColor}BF`, // 75% opacity
        },
      },
    },
  },

  trailingElement: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: theme.gap(2),
  },
}));

//#endregion Styles
