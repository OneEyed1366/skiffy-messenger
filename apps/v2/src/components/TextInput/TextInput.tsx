// apps/v2/src/components/TextInput/TextInput.tsx

import React, { useState } from "react";
import {
  View,
  TextInput as RNTextInput,
  Text,
  Pressable,
  type TextInputProps as RNTextInputProps,
} from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";
import { useTranslation } from "react-i18next";

import { Icon } from "@/components/Icon";
import type { ITranslationKey } from "@/locales";

//#region Types

type IProps = {
  /**
   * Input value (controlled)
   */
  value?: string;
  /**
   * Text change handler
   */
  onChangeText?: (text: string) => void;
  /**
   * Floating label i18n key
   */
  labelKey?: ITranslationKey;
  /**
   * Floating label direct text
   */
  label?: string;
  /**
   * Placeholder text i18n key
   */
  placeholderKey?: ITranslationKey;
  /**
   * Placeholder direct text
   */
  placeholder?: string;
  /**
   * Helper text i18n key
   */
  helperTextKey?: ITranslationKey;
  /**
   * Helper text direct
   */
  helperText?: string;
  /**
   * Error message (shows error state automatically)
   */
  errorMessage?: string;
  /**
   * Icon element to display on the left side
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon element to display on the right side
   */
  rightIcon?: React.ReactNode;
  /**
   * Show clear button when input has value
   */
  clearable?: boolean;
  /**
   * Callback when clear button is pressed
   */
  onClear?: () => void;
  /**
   * Enable multiline textarea mode
   */
  multiline?: boolean;
  /**
   * Number of lines for multiline mode
   */
  numberOfLines?: number;
  /**
   * Enable password mode
   */
  secureTextEntry?: boolean;
  /**
   * Show password visibility toggle (only when secureTextEntry=true)
   */
  showPasswordToggle?: boolean;
  /**
   * Disabled state
   */
  disabled?: boolean;
  /**
   * Auto focus on mount
   */
  autoFocus?: boolean;
  /**
   * Test ID for testing
   */
  testID?: string;
  /**
   * Ref to the underlying TextInput
   */
  ref?: React.Ref<React.ComponentRef<typeof RNTextInput>>;
} & Omit<RNTextInputProps, "placeholder" | "editable" | "secureTextEntry"> &
  UnistylesVariants<typeof styles>;

//#endregion Types

//#region Component

export function TextInput({
  value,
  onChangeText,
  labelKey,
  label,
  placeholderKey,
  placeholder,
  helperTextKey,
  helperText,
  errorMessage,
  leftIcon,
  rightIcon,
  clearable = false,
  onClear,
  multiline = false,
  numberOfLines = 4,
  secureTextEntry = false,
  showPasswordToggle = false,
  disabled = false,
  autoFocus = false,
  testID,
  onFocus,
  onBlur,
  ref,
  ...restProps
}: IProps) {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Determine states
  const hasError = Boolean(errorMessage);
  const hasValue = Boolean(value && String(value).length > 0);
  const isLabelFloating = isFocused || hasValue;

  // Resolve translated strings
  const resolvedLabel = labelKey ? t(labelKey) : label;
  const resolvedPlaceholder = placeholderKey ? t(placeholderKey) : placeholder;
  const resolvedHelperText = helperTextKey ? t(helperTextKey) : helperText;

  // Apply variants
  styles.useVariants({
    hasError,
    disabled,
    focused: isFocused,
    multiline,
    floating: isLabelFloating,
  });

  const handleFocus: RNTextInputProps["onFocus"] = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur: RNTextInputProps["onBlur"] = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleClear = () => {
    onClear?.();
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const showClearButton = clearable && hasValue && !secureTextEntry;
  const showPasswordButton = secureTextEntry && showPasswordToggle;
  const isSecure = secureTextEntry && !isPasswordVisible;

  return (
    <View
      style={styles.container}
      accessibilityState={{ disabled }}
      testID={testID}
    >
      {/* Input Container */}
      <View style={styles.inputWrapper}>
        {/* Left Icon */}
        {leftIcon && (
          <View
            style={styles.leftIcon}
            testID={testID ? `${testID}-left-icon` : undefined}
          >
            {leftIcon}
          </View>
        )}

        {/* Input Area with Floating Label */}
        <View style={styles.inputArea}>
          {/* Floating Label */}
          {resolvedLabel && (
            <Text
              style={styles.label}
              accessibilityRole="text"
              testID={testID ? `${testID}-label` : undefined}
            >
              {resolvedLabel}
            </Text>
          )}

          {/* Text Input */}
          <RNTextInput
            ref={ref}
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={
              isLabelFloating || !resolvedLabel
                ? resolvedPlaceholder
                : undefined
            }
            placeholderTextColor={styles.placeholder.color}
            editable={!disabled}
            secureTextEntry={isSecure}
            multiline={multiline}
            numberOfLines={multiline ? numberOfLines : 1}
            textAlignVertical={multiline ? "top" : "center"}
            autoFocus={autoFocus}
            onFocus={handleFocus}
            onBlur={handleBlur}
            accessibilityLabel={resolvedLabel}
            accessibilityHint={resolvedHelperText}
            testID={testID ? `${testID}-input` : undefined}
            {...restProps}
          />
        </View>

        {/* Right Icon (only when no clear/password buttons) */}
        {rightIcon && !showClearButton && !showPasswordButton && (
          <View
            style={styles.rightIcon}
            testID={testID ? `${testID}-right-icon` : undefined}
          >
            {rightIcon}
          </View>
        )}

        {/* Clear Button */}
        {showClearButton && (
          <Pressable
            onPress={handleClear}
            style={styles.actionButton}
            accessibilityRole="button"
            accessibilityLabel={t("renderer.components.textInput.clear")}
            testID={testID ? `${testID}-clear` : undefined}
          >
            <Icon name="close-circle" size="sm" />
          </Pressable>
        )}

        {/* Password Toggle */}
        {showPasswordButton && (
          <Pressable
            onPress={togglePasswordVisibility}
            style={styles.actionButton}
            accessibilityRole="button"
            accessibilityLabel={
              isPasswordVisible
                ? t("renderer.components.textInput.hidePassword")
                : t("renderer.components.textInput.showPassword")
            }
            testID={testID ? `${testID}-password-toggle` : undefined}
          >
            <Icon name={isPasswordVisible ? "eye-off" : "eye"} size="sm" />
          </Pressable>
        )}
      </View>

      {/* Helper Text (hidden when error is present) */}
      {resolvedHelperText && !errorMessage && (
        <Text
          style={styles.helperText}
          testID={testID ? `${testID}-helper` : undefined}
        >
          {resolvedHelperText}
        </Text>
      )}

      {/* Error Message */}
      {errorMessage && (
        <Text
          style={styles.errorText}
          accessibilityRole="alert"
          testID={testID ? `${testID}-error` : undefined}
        >
          {errorMessage}
        </Text>
      )}
    </View>
  );
}

//#endregion Component

//#region Styles

const styles = StyleSheet.create((theme) => ({
  container: {
    width: "100%",
    variants: {
      disabled: {
        true: { opacity: 0.5 },
        false: {},
      },
    },
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.centerChannelBg,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    borderRadius: theme.radius.m,
    paddingHorizontal: theme.gap(1.5),
    minHeight: 48,
    variants: {
      focused: {
        true: { borderColor: theme.colors.buttonBg },
        false: {},
      },
      hasError: {
        true: { borderColor: theme.colors.errorText },
        false: {},
      },
      disabled: {
        true: { backgroundColor: theme.colors.borderLight },
        false: {},
      },
      multiline: {
        true: {
          minHeight: 100,
          alignItems: "flex-start",
          paddingVertical: theme.gap(1),
        },
        false: {},
      },
    },
  },

  inputArea: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: theme.gap(0.5),
    variants: {
      floating: {
        true: { paddingTop: theme.gap(2) },
        false: {},
      },
      multiline: {
        true: { paddingTop: theme.gap(2.5) },
        false: {},
      },
    },
  },

  label: {
    position: "absolute",
    left: 0,
    fontSize: 16,
    color: theme.colors.centerChannelColor,
    variants: {
      floating: {
        true: {
          top: 4,
          fontSize: 12,
          color: theme.colors.buttonBg,
        },
        false: {
          top: "50%",
          transform: [{ translateY: -10 }],
        },
      },
      hasError: {
        true: { color: theme.colors.errorText },
        false: {},
      },
      focused: {
        true: { color: theme.colors.buttonBg },
        false: {},
      },
      disabled: {
        true: { color: theme.colors.centerChannelColor },
        false: {},
      },
    },
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.centerChannelColor,
    paddingVertical: 0,
    minHeight: 24,
    variants: {
      multiline: {
        true: { minHeight: 60, textAlignVertical: "top" },
        false: {},
      },
      disabled: {
        true: {},
        false: {},
      },
    },
  },

  placeholder: {
    color: `${theme.colors.centerChannelColor}80`,
  },

  leftIcon: {
    marginRight: theme.gap(1),
  },

  rightIcon: {
    marginLeft: theme.gap(1),
  },

  actionButton: {
    padding: theme.gap(0.5),
    marginLeft: theme.gap(0.5),
  },

  helperText: {
    fontSize: 12,
    color: `${theme.colors.centerChannelColor}80`,
    marginTop: theme.gap(0.5),
    marginLeft: theme.gap(0.5),
  },

  errorText: {
    fontSize: 12,
    color: theme.colors.errorText,
    marginTop: theme.gap(0.5),
    marginLeft: theme.gap(0.5),
  },
}));

//#endregion Styles
