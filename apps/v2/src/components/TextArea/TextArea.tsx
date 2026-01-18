// apps/v2/src/components/TextArea/TextArea.tsx

import { useState } from "react";
import {
  TextInput,
  View,
  Text,
  Platform,
  type TextInputProps,
} from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";
import { useTranslation } from "react-i18next";

import type { ITranslationKey } from "@/locales";

//#region Types

type IProps = {
  /**
   * Current value (controlled)
   */
  value: string;
  /**
   * Text change handler
   */
  onChangeText: (text: string) => void;
  /**
   * Submit handler (Ctrl/Cmd+Enter on desktop)
   */
  onSubmit?: () => void;
  /**
   * Placeholder i18n key
   */
  placeholderKey?: ITranslationKey;
  /**
   * Direct placeholder text
   */
  placeholder?: string;
  /**
   * Maximum character limit
   */
  maxLength?: number;
  /**
   * Show character count
   * @default false
   */
  showCharacterCount?: boolean;
  /**
   * Warning threshold percentage for character count (0-1)
   * @default 0.9
   */
  warningThreshold?: number;
  /**
   * Minimum height in pixels
   * @default 80
   */
  minHeight?: number;
  /**
   * Maximum height in pixels (auto-grow stops here)
   * @default 200
   */
  maxHeight?: number;
  /**
   * Error state
   * @default false
   */
  error?: boolean;
  /**
   * Error message to display
   */
  errorMessage?: string;
  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;
  /**
   * Auto focus on mount
   * @default false
   */
  autoFocus?: boolean;
  /**
   * Ref to underlying TextInput
   */
  ref?: React.Ref<React.ComponentRef<typeof TextInput>>;
  /**
   * Test ID
   */
  testID?: string;
} & UnistylesVariants<typeof styles>;

//#endregion Types

//#region Component

export function TextArea({
  value,
  onChangeText,
  onSubmit,
  placeholderKey,
  placeholder,
  maxLength,
  showCharacterCount = false,
  warningThreshold = 0.9,
  minHeight = 80,
  maxHeight = 200,
  error = false,
  errorMessage,
  disabled = false,
  autoFocus = false,
  ref,
  testID,
}: IProps) {
  const { t } = useTranslation();
  const [height, setHeight] = useState(minHeight);

  styles.useVariants({ error, disabled });

  const placeholderText = placeholderKey ? t(placeholderKey) : placeholder;
  const characterCount = value.length;
  const isNearLimit = maxLength
    ? characterCount >= maxLength * warningThreshold
    : false;
  const isAtLimit = maxLength ? characterCount >= maxLength : false;

  const handleContentSizeChange: TextInputProps["onContentSizeChange"] = (
    e,
  ) => {
    const contentHeight = e.nativeEvent.contentSize.height;
    const newHeight = Math.min(Math.max(contentHeight, minHeight), maxHeight);
    setHeight(newHeight);
  };

  const handleKeyPress: TextInputProps["onKeyPress"] = (e) => {
    // Desktop: Ctrl/Cmd+Enter to submit
    if (
      Platform.OS === "web" ||
      Platform.OS === "macos" ||
      Platform.OS === "windows"
    ) {
      const nativeEvent = e.nativeEvent as {
        key: string;
        ctrlKey?: boolean;
        metaKey?: boolean;
      };

      if (
        nativeEvent.key === "Enter" &&
        (nativeEvent.ctrlKey || nativeEvent.metaKey)
      ) {
        onSubmit?.();
      }
    }
  };

  return (
    <View style={styles.container} testID={testID}>
      <TextInput
        ref={ref}
        style={[styles.input, { height }]}
        value={value}
        onChangeText={onChangeText}
        onContentSizeChange={handleContentSizeChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholderText}
        placeholderTextColor={styles.placeholder.color}
        maxLength={maxLength}
        multiline
        editable={!disabled}
        autoFocus={autoFocus}
        textAlignVertical="top"
        accessibilityLabel={placeholderText}
        accessibilityState={{ disabled }}
        testID={testID ? `${testID}-input` : undefined}
      />

      {(showCharacterCount || errorMessage) && (
        <View style={styles.footer}>
          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

          {showCharacterCount && maxLength && (
            <Text
              style={[
                styles.characterCount,
                isNearLimit && styles.characterCountWarning,
                isAtLimit && styles.characterCountError,
              ]}
              testID={testID ? `${testID}-character-count` : undefined}
            >
              {characterCount}/{maxLength}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

//#endregion Component

//#region Styles

const styles = StyleSheet.create((theme) => ({
  container: {
    width: "100%",
  },

  input: {
    fontFamily: theme.fonts.primary,
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.centerChannelColor,
    backgroundColor: theme.colors.centerChannelBg,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    borderRadius: theme.radius.m,
    paddingHorizontal: theme.gap(1.5), // 12px
    paddingVertical: theme.gap(1), // 8px
    variants: {
      error: {
        true: {
          borderColor: theme.colors.errorText,
        },
        false: {},
      },
      disabled: {
        true: {
          opacity: 0.5,
          backgroundColor: theme.colors.borderLight,
        },
        false: {},
      },
    },
  },

  placeholder: {
    color: `${theme.colors.centerChannelColor}80`, // 50% opacity
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.gap(0.5), // 4px
    paddingHorizontal: theme.gap(0.5), // 4px
  },

  errorText: {
    fontFamily: theme.fonts.primary,
    fontSize: 12,
    color: theme.colors.errorText,
    flex: 1,
  },

  characterCount: {
    fontFamily: theme.fonts.primary,
    fontSize: 12,
    color: `${theme.colors.centerChannelColor}80`, // 50% opacity
    marginLeft: "auto",
  },

  characterCountWarning: {
    color: theme.colors.awayIndicator, // Yellow/orange
  },

  characterCountError: {
    color: theme.colors.errorText,
  },
}));

//#endregion Styles
