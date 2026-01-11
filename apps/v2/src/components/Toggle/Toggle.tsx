// apps/v2/src/components/Toggle/Toggle.tsx

/**
 * Toggle/Switch component
 * Migrated from: vendor/desktop/webapp/channels/src/components/toggle.tsx
 *
 * Uses React Native Switch with Unistyles theming
 */

import { Platform, Pressable, Switch, Text } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";
import { useTranslation } from "react-i18next";

import type { ITranslationKey } from "@/locales";

//#region Types

type IToggleSize = "sm" | "md" | "lg";

type IProps = {
  /**
   * Current toggle state
   * @default false
   */
  value?: boolean;

  /**
   * Callback when toggle changes
   */
  onValueChange?: (value: boolean) => void;

  /**
   * Prevents user interaction
   * @default false
   */
  disabled?: boolean;

  /**
   * Label text displayed next to the toggle
   */
  label?: string;

  /**
   * Translation key for label (alternative to label prop)
   */
  labelKey?: ITranslationKey;

  /**
   * Label position relative to toggle
   * @default 'right'
   */
  labelPosition?: "left" | "right";

  /**
   * Size variant
   * @default 'md'
   */
  size?: IToggleSize;

  /**
   * Test ID for testing
   */
  testID?: string;

  /**
   * Ref to the switch component
   */
  ref?: React.Ref<React.ComponentRef<typeof Switch>>;
} & UnistylesVariants<typeof styles>;

//#endregion Types

//#region Component

export function Toggle({
  value = false,
  onValueChange,
  disabled = false,
  label,
  labelKey,
  labelPosition = "right",
  size = "md",
  testID,
  ref,
}: IProps) {
  const { t } = useTranslation();
  styles.useVariants({ size, disabled });

  const handleValueChange = (newValue: boolean) => {
    if (!disabled) {
      onValueChange?.(newValue);
    }
  };

  const displayLabel = labelKey ? t(labelKey) : label;

  const labelElement = displayLabel ? (
    <Text style={styles.label}>{displayLabel}</Text>
  ) : null;

  const switchComponent = (
    <Switch
      ref={ref}
      value={value}
      onValueChange={handleValueChange}
      disabled={disabled}
      trackColor={{
        false: styles.trackOff.backgroundColor as string,
        true: styles.trackOn.backgroundColor as string,
      }}
      thumbColor={
        Platform.OS === "android"
          ? value
            ? (styles.thumbOn.backgroundColor as string)
            : (styles.thumbOff.backgroundColor as string)
          : undefined
      }
      ios_backgroundColor={styles.trackOff.backgroundColor as string}
      accessibilityLabel={displayLabel}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      testID={testID}
      style={styles.switch}
    />
  );

  if (!labelElement) {
    return switchComponent;
  }

  return (
    <Pressable
      style={styles.container}
      onPress={() => handleValueChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={displayLabel}
      testID={testID ? `${testID}-container` : undefined}
    >
      {labelPosition === "left" && labelElement}
      {switchComponent}
      {labelPosition === "right" && labelElement}
    </Pressable>
  );
}

//#endregion Component

//#region Styles

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.gap(1.5),
    variants: {
      size: {
        sm: {},
        md: {},
        lg: {},
      },
      disabled: {
        true: {
          opacity: 0.5,
        },
        false: {},
      },
    },
  },

  switch: {
    variants: {
      size: {
        sm: {
          transform: [{ scale: 0.8 }],
        },
        md: {
          transform: [{ scale: 1 }],
        },
        lg: {
          transform: [{ scale: 1.2 }],
        },
      },
      disabled: {
        true: {},
        false: {},
      },
    },
  },

  label: {
    fontSize: 16,
    color: theme.colors.centerChannelColor,
    variants: {
      size: {
        sm: {
          fontSize: 14,
        },
        md: {
          fontSize: 16,
        },
        lg: {
          fontSize: 18,
        },
      },
      disabled: {
        true: {
          opacity: 0.5,
        },
        false: {
          opacity: 1,
        },
      },
    },
  },

  // Track colors (extracted for use in props)
  trackOff: {
    backgroundColor: theme.colors.centerChannelColor + "40", // 25% opacity
  },

  trackOn: {
    backgroundColor: theme.colors.buttonBg,
  },

  // Thumb colors (Android only)
  thumbOff: {
    backgroundColor: theme.colors.centerChannelBg,
  },

  thumbOn: {
    backgroundColor: theme.colors.buttonColor,
  },
}));

//#endregion Styles
