// apps/v2/src/components/Checkbox/Checkbox.tsx

import { Pressable, View, Text } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";
import { useTranslation } from "react-i18next";

import type { ITranslationKey } from "@/locales";

//#region Types

type ICheckboxState = "checked" | "unchecked" | "indeterminate";

type IProps = {
  /**
   * Whether the checkbox is checked
   * @default false
   */
  checked?: boolean;

  /**
   * Whether the checkbox is in indeterminate state (partial selection)
   * @default false
   */
  indeterminate?: boolean;

  /**
   * Label text displayed next to the checkbox
   */
  label?: string;

  /**
   * Translation key for label (alternative to label prop)
   */
  labelKey?: ITranslationKey;

  /**
   * Callback when checkbox state changes
   */
  onChange?: (checked: boolean) => void;

  /**
   * Whether the checkbox is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the checkbox is in error state
   * @default false
   */
  error?: boolean;

  /**
   * Error message to display
   */
  errorMessage?: string;

  /**
   * Accessibility label for screen readers
   */
  accessibilityLabel?: string;

  /**
   * Test ID for testing
   */
  testID?: string;

  /**
   * Ref to the pressable element
   */
  ref?: React.Ref<React.ComponentRef<typeof Pressable>>;
} & UnistylesVariants<typeof styles>;

//#endregion Types

//#region Component

export function Checkbox({
  checked = false,
  indeterminate = false,
  label,
  labelKey,
  onChange,
  disabled = false,
  error = false,
  errorMessage,
  accessibilityLabel,
  testID,
  ref,
}: IProps) {
  const { t } = useTranslation();

  const state: ICheckboxState = indeterminate
    ? "indeterminate"
    : checked
      ? "checked"
      : "unchecked";

  styles.useVariants({ state, disabled, error });

  const handlePress = () => {
    if (disabled) return;
    onChange?.(!checked);
  };

  const displayLabel = labelKey ? t(labelKey) : label;

  return (
    <View style={styles.container}>
      <Pressable
        ref={ref}
        style={styles.pressable}
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="checkbox"
        accessibilityState={{
          checked: indeterminate ? "mixed" : checked,
          disabled,
        }}
        accessibilityLabel={accessibilityLabel ?? displayLabel}
        testID={testID}
      >
        <View style={styles.checkbox}>
          {state === "checked" && <CheckmarkIcon />}
          {state === "indeterminate" && <IndeterminateIcon />}
        </View>
        {displayLabel && <Text style={styles.label}>{displayLabel}</Text>}
      </Pressable>
      {error && errorMessage && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}
    </View>
  );
}

//#endregion Component

//#region Icons

function CheckmarkIcon() {
  return (
    <View style={styles.checkmark}>
      <View style={styles.checkmarkShort} />
      <View style={styles.checkmarkLong} />
    </View>
  );
}

function IndeterminateIcon() {
  return <View style={styles.indeterminateLine} />;
}

//#endregion Icons

//#region Styles

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "column",
  },
  pressable: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.gap(1),
    variants: {
      disabled: {
        true: {
          opacity: 0.5,
        },
        false: {},
      },
      // Required for useVariants even if not used on pressable
      state: {
        checked: {},
        unchecked: {},
        indeterminate: {},
      },
      error: {
        true: {},
        false: {},
      },
    },
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: theme.radius.s, // 4px
    borderWidth: 2,
    borderColor: `${theme.colors.centerChannelColor}40`, // ~25% opacity
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    variants: {
      state: {
        checked: {
          borderColor: theme.colors.buttonBg,
          backgroundColor: theme.colors.buttonBg,
        },
        unchecked: {
          borderColor: `${theme.colors.centerChannelColor}40`,
          backgroundColor: "transparent",
        },
        indeterminate: {
          borderColor: theme.colors.buttonBg,
          backgroundColor: theme.colors.buttonBg,
        },
      },
      disabled: {
        true: {},
        false: {},
      },
      error: {
        true: {
          borderColor: theme.colors.errorText,
        },
        false: {},
      },
    },
  },
  checkmark: {
    width: 10,
    height: 10,
    position: "relative",
  },
  checkmarkShort: {
    position: "absolute",
    width: 3,
    height: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 1,
    transform: [{ rotate: "-45deg" }],
    left: 0,
    bottom: 2,
  },
  checkmarkLong: {
    position: "absolute",
    width: 3,
    height: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 1,
    transform: [{ rotate: "45deg" }],
    right: 1,
    bottom: 1,
  },
  indeterminateLine: {
    width: 10,
    height: 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 1,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.centerChannelColor,
    variants: {
      disabled: {
        true: {},
        false: {},
      },
      state: {
        checked: {},
        unchecked: {},
        indeterminate: {},
      },
      error: {
        true: {},
        false: {},
      },
    },
  },
  errorText: {
    fontSize: 12,
    lineHeight: 16,
    color: theme.colors.errorText,
    marginTop: theme.gap(0.5),
    marginLeft: 28, // checkbox width (20) + gap (8)
  },
}));

//#endregion Styles
