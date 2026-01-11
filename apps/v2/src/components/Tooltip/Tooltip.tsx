// apps/v2/src/components/Tooltip/Tooltip.tsx

/**
 * Tooltip component
 * Migrated from: vendor/desktop/webapp/channels/src/components/with_tooltip/index.tsx
 *
 * Uses Modal for rendering and measureInWindow API for positioning
 */

import { useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useTranslation } from "react-i18next";

import type { ITranslationKey } from "@/locales";

//#region Types

type ITooltipPlacement = "top" | "bottom" | "left" | "right";

type ITooltipPosition = {
  top: number;
  left: number;
  arrowTop: number;
  arrowLeft: number;
  arrowRotation: string;
};

type IProps = {
  /**
   * Content to display in the tooltip (direct text)
   */
  content?: string;

  /**
   * i18n translation key for tooltip content
   */
  contentKey?: ITranslationKey;

  /**
   * Tooltip placement relative to trigger
   * @default "top"
   */
  placement?: ITooltipPlacement;

  /**
   * Trigger element (the element that shows the tooltip)
   */
  children: React.ReactNode;

  /**
   * Delay before showing tooltip (ms)
   * @default 300
   */
  showDelay?: number;

  /**
   * Delay before hiding tooltip (ms)
   * @default 0
   */
  hideDelay?: number;

  /**
   * Whether tooltip is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Callback when tooltip opens
   */
  onOpen?: () => void;

  /**
   * Callback when tooltip closes
   */
  onClose?: () => void;

  /**
   * Test ID for testing
   */
  testID?: string;

  /**
   * Ref to the container View
   */
  ref?: React.Ref<View>;
};

//#endregion Types

//#region Constants

const ARROW_SIZE = 6;
const TOOLTIP_OFFSET = 8;
const ANIMATION_DURATION = 150;

//#endregion Constants

//#region Component

export function Tooltip({
  content,
  contentKey,
  placement = "top",
  children,
  showDelay = 300,
  hideDelay = 0,
  disabled = false,
  onOpen,
  onClose,
  testID,
  ref,
}: IProps) {
  const { t } = useTranslation();

  const [visible, setVisible] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [tooltipSize, setTooltipSize] = useState({ width: 0, height: 0 });

  const opacity = useRef(new Animated.Value(0)).current;
  const triggerRef = useRef<View>(null);
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayContent = contentKey ? t(contentKey) : content;

  const clearTimeouts = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const measureTrigger = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setTriggerLayout({ x, y, width, height });
    });
  };

  const showTooltip = () => {
    if (disabled) return;

    clearTimeouts();
    measureTrigger();

    showTimeoutRef.current = setTimeout(() => {
      setVisible(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start();
      onOpen?.();
    }, showDelay);
  };

  const hideTooltip = () => {
    clearTimeouts();

    hideTimeoutRef.current = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
        onClose?.();
      });
    }, hideDelay);
  };

  const calculatePosition = (): ITooltipPosition => {
    // Default position when measurement is not available (e.g., in tests)
    const defaultPosition: ITooltipPosition = {
      top: 0,
      left: 0,
      arrowTop: 0,
      arrowLeft: 0,
      arrowRotation: "180deg",
    };

    if (!triggerLayout) return defaultPosition;

    const { x, y, width, height } = triggerLayout;
    let top = 0;
    let left = 0;
    let arrowTop = 0;
    let arrowLeft = 0;
    let arrowRotation = "0deg";

    switch (placement) {
      case "top":
        top = y - tooltipSize.height - TOOLTIP_OFFSET;
        left = x + width / 2 - tooltipSize.width / 2;
        arrowTop = tooltipSize.height - 2;
        arrowLeft = tooltipSize.width / 2 - ARROW_SIZE;
        arrowRotation = "180deg";
        break;
      case "bottom":
        top = y + height + TOOLTIP_OFFSET;
        left = x + width / 2 - tooltipSize.width / 2;
        arrowTop = -ARROW_SIZE + 2;
        arrowLeft = tooltipSize.width / 2 - ARROW_SIZE;
        arrowRotation = "0deg";
        break;
      case "left":
        top = y + height / 2 - tooltipSize.height / 2;
        left = x - tooltipSize.width - TOOLTIP_OFFSET;
        arrowTop = tooltipSize.height / 2 - ARROW_SIZE;
        arrowLeft = tooltipSize.width - 2;
        arrowRotation = "90deg";
        break;
      case "right":
        top = y + height / 2 - tooltipSize.height / 2;
        left = x + width + TOOLTIP_OFFSET;
        arrowTop = tooltipSize.height / 2 - ARROW_SIZE;
        arrowLeft = -ARROW_SIZE + 2;
        arrowRotation = "-90deg";
        break;
    }

    return { top, left, arrowTop, arrowLeft, arrowRotation };
  };

  const position = visible ? calculatePosition() : null;

  // Platform-specific trigger props
  const triggerProps =
    Platform.OS === "web"
      ? {
          onHoverIn: showTooltip,
          onHoverOut: hideTooltip,
          onFocus: showTooltip,
          onBlur: hideTooltip,
        }
      : {
          onLongPress: showTooltip,
          onPressOut: hideTooltip,
        };

  const handleOverlayPress = () => {
    Keyboard.dismiss();
    hideTooltip();
  };

  return (
    <View ref={ref} testID={testID}>
      <Pressable
        ref={triggerRef}
        {...triggerProps}
        accessibilityHint={displayContent}
        testID={testID ? `${testID}-trigger` : undefined}
      >
        {children}
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={hideTooltip}
        testID={testID ? `${testID}-modal` : undefined}
      >
        <Pressable
          style={styles.overlay}
          onPress={handleOverlayPress}
          testID={testID ? `${testID}-overlay` : undefined}
        >
          {position && (
            <Animated.View
              style={[
                styles.container,
                {
                  top: position.top,
                  left: position.left,
                  opacity,
                },
              ]}
              onLayout={(e) => {
                const { width, height } = e.nativeEvent.layout;
                if (
                  width !== tooltipSize.width ||
                  height !== tooltipSize.height
                ) {
                  setTooltipSize({ width, height });
                }
              }}
              accessibilityRole="text"
              testID={testID ? `${testID}-content` : undefined}
            >
              <View style={styles.content}>
                <Text style={styles.text}>{displayContent}</Text>
              </View>
              <View
                style={[
                  styles.arrow,
                  {
                    top: position.arrowTop,
                    left: position.arrowLeft,
                    transform: [{ rotate: position.arrowRotation }],
                  },
                ]}
                testID={testID ? `${testID}-arrow` : undefined}
              />
            </Animated.View>
          )}
        </Pressable>
      </Modal>
    </View>
  );
}

//#endregion Component

//#region Styles

const styles = StyleSheet.create((theme) => ({
  overlay: {
    flex: 1,
  },
  container: {
    position: "absolute",
    maxWidth: 200,
    zIndex: 9999,
  },
  content: {
    paddingHorizontal: theme.gap(1),
    paddingVertical: theme.gap(0.5),
    backgroundColor: theme.colors.sidebarBg,
    borderRadius: theme.radius.s,
  },
  text: {
    color: theme.colors.sidebarText,
    fontFamily: theme.fonts.primary,
    fontSize: 12,
  },
  arrow: {
    position: "absolute",
    width: 0,
    height: 0,
    borderLeftWidth: ARROW_SIZE,
    borderRightWidth: ARROW_SIZE,
    borderBottomWidth: ARROW_SIZE,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: theme.colors.sidebarBg,
  },
}));

//#endregion Styles
