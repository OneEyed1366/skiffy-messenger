// apps/v2/src/components/Modal/Modal.tsx

/**
 * Modal base component
 * Migrated from: vendor/desktop/webapp/platform/components/src/generic_modal/generic_modal.tsx
 *
 * Uses RN Modal + Animated API for cross-platform animations
 */

import { useEffect, useRef } from "react";
import {
  Modal as RNModal,
  Pressable,
  View,
  ScrollView,
  Animated,
  Platform,
} from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";
import { useTranslation } from "react-i18next";

import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/IconButton";
import { Text } from "@/components/Text";

import type { ITranslationKey } from "@/locales";

//#region Types

type IModalSize = "sm" | "md" | "lg" | "fullscreen";

type IProps = {
  /**
   * Controls modal visibility
   */
  visible: boolean;

  /**
   * Called when modal requests close (backdrop tap, escape key, close button)
   */
  onClose: () => void;

  /**
   * Called after modal enter animation completes
   */
  onEntered?: () => void;

  /**
   * Called after modal exit animation completes
   */
  onExited?: () => void;

  /**
   * Header title (direct string)
   */
  title?: string;

  /**
   * Header title (i18n key)
   */
  titleKey?: ITranslationKey;

  /**
   * Modal body content
   */
  children: React.ReactNode;

  /**
   * Footer content (typically action buttons)
   */
  footer?: React.ReactNode;

  /**
   * Modal width preset
   * @default "md"
   */
  size?: IModalSize;

  /**
   * Show close button in header
   * @default true
   */
  showCloseButton?: boolean;

  /**
   * Enable backdrop tap to close
   * @default true
   */
  dismissOnBackdrop?: boolean;

  /**
   * Enable escape key to close (desktop/web)
   * @default true
   */
  dismissOnEscape?: boolean;

  /**
   * Test ID for testing
   */
  testID?: string;

  /**
   * Ref for modal container
   */
  ref?: React.Ref<View>;
} & UnistylesVariants<typeof styles>;

//#endregion Types

//#region Constants

const ANIMATION_DURATION = 200;

//#endregion Constants

//#region Component

export function Modal({
  visible,
  onClose,
  onEntered,
  onExited,
  title,
  titleKey,
  children,
  footer,
  size = "md",
  showCloseButton = true,
  dismissOnBackdrop = true,
  dismissOnEscape = true,
  testID,
  ref,
}: IProps) {
  const { t } = useTranslation();

  styles.useVariants({ size });

  // Animation values
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(50)).current;

  // Track if modal was ever visible to handle exit animation
  const wasVisibleRef = useRef(false);

  // Handle visibility changes - animate in/out
  useEffect(() => {
    if (visible) {
      wasVisibleRef.current = true;

      // Enter animation
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onEntered?.();
      });
    } else if (wasVisibleRef.current) {
      // Exit animation (only if was visible before)
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 50,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onExited?.();
      });
    }
  }, [visible, backdropOpacity, contentOpacity, contentTranslateY, onEntered, onExited]);

  // Handle escape key (desktop/web)
  useEffect(() => {
    if (!dismissOnEscape || Platform.OS !== "web" || !visible) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [visible, dismissOnEscape, onClose]);

  const handleBackdropPress = () => {
    if (dismissOnBackdrop) {
      onClose();
    }
  };

  const handleCloseButtonPress = () => {
    onClose();
  };

  // Resolved title
  const displayTitle = titleKey ? t(titleKey) : title;
  const hasHeader = displayTitle || showCloseButton;

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      accessibilityViewIsModal
      testID={testID}
    >
      <View style={styles.container} ref={ref}>
        {/* Backdrop */}
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        >
          <Pressable
            style={styles.backdropPressable}
            onPress={handleBackdropPress}
            accessibilityRole="button"
            accessibilityLabel="Close modal"
            testID={testID ? `${testID}-backdrop` : undefined}
          />
        </Animated.View>

        {/* Content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslateY }],
            },
          ]}
          testID={testID ? `${testID}-content` : undefined}
        >
          {/* Header */}
          {hasHeader && (
            <View style={styles.header} testID={testID ? `${testID}-header` : undefined}>
              <View style={styles.headerTitle}>
                {displayTitle && (
                  <Text variant="heading" size="lg" weight="semiBold" testID={testID ? `${testID}-title` : undefined}>
                    {displayTitle}
                  </Text>
                )}
              </View>
              {showCloseButton && (
                <IconButton
                  icon={<Icon name="close" size="md" />}
                  onPress={handleCloseButtonPress}
                  accessibilityLabel="Close"
                  size="sm"
                  testID={testID ? `${testID}-close-button` : undefined}
                />
              )}
            </View>
          )}

          {/* Body */}
          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            testID={testID ? `${testID}-body` : undefined}
          >
            {children}
          </ScrollView>

          {/* Footer */}
          {footer && (
            <View style={styles.footer} testID={testID ? `${testID}-footer` : undefined}>
              {footer}
            </View>
          )}
        </Animated.View>
      </View>
    </RNModal>
  );
}

//#endregion Component

//#region Styles

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...({
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    } as const),
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdropPressable: {
    flex: 1,
  },
  content: {
    backgroundColor: theme.colors.centerChannelBg,
    borderRadius: theme.radius.l,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
    variants: {
      size: {
        sm: {
          width: 320,
          maxWidth: "85%",
        },
        md: {
          width: 480,
          maxWidth: "90%",
        },
        lg: {
          width: 640,
          maxWidth: "95%",
        },
        fullscreen: {
          width: "100%",
          height: "100%",
          maxWidth: "100%",
          maxHeight: "100%",
          borderRadius: 0,
        },
      },
    },
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(1.5),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderDefault,
  },
  headerTitle: {
    flex: 1,
  },
  body: {
    flexGrow: 0,
    flexShrink: 1,
  },
  bodyContent: {
    padding: theme.gap(2),
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: theme.gap(1),
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(1.5),
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderDefault,
  },
}));

//#endregion Styles
