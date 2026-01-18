// apps/v2/src/components/Menu/Menu.tsx

/**
 * Menu component
 * Migrated from: vendor/desktop/webapp/channels/src/components/menu/menu.tsx
 *
 * Provides a dropdown menu with trigger element, positioned overlay,
 * and coordinated item selection via context.
 */

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

//#region Types

type IMenuPosition = "top-start" | "top-end" | "bottom-start" | "bottom-end";

type ITriggerLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type IMenuContextValue = {
  closeMenu: () => void;
};

type IProps = {
  /**
   * Element that opens the menu when pressed
   */
  trigger: React.ReactNode;
  /**
   * Menu content (MenuItem, MenuDivider components)
   */
  children: React.ReactNode;
  /**
   * Controlled open state
   */
  open?: boolean;
  /**
   * Callback when open state changes
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Menu position relative to trigger
   * @default "bottom-start"
   */
  position?: IMenuPosition;
  /**
   * Test ID for testing
   */
  testID?: string;
};

//#endregion Types

//#region Context

const MenuContext = createContext<IMenuContextValue>({
  closeMenu: () => {},
});

export const useMenuContext = () => useContext(MenuContext);

//#endregion Context

//#region Component

export function Menu({
  trigger,
  children,
  open: controlledOpen,
  onOpenChange,
  position = "bottom-start",
  testID,
}: IProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState<ITriggerLayout>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const triggerRef = useRef<View>(null);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setOpen = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const handleTriggerPress = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setTriggerLayout({ x, y, width, height });
    });
    setOpen(!isOpen);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleBackdropPress = () => {
    handleClose();
  };

  // Handle Escape key on web
  useEffect(() => {
    if (Platform.OS !== "web" || !isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const menuPositionStyle = getMenuPositionStyle(position, triggerLayout);

  const contextValue: IMenuContextValue = {
    closeMenu: handleClose,
  };

  return (
    <>
      <Pressable
        ref={triggerRef}
        onPress={handleTriggerPress}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        testID={testID}
      >
        {trigger}
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
        statusBarTranslucent
        testID={testID ? `${testID}-modal` : undefined}
      >
        <Pressable
          style={styles.backdrop}
          onPress={handleBackdropPress}
          testID={testID ? `${testID}-backdrop` : undefined}
        >
          <View
            style={[styles.menuContainer, menuPositionStyle]}
            onStartShouldSetResponder={() => true}
            testID={testID ? `${testID}-content` : undefined}
          >
            <MenuContext.Provider value={contextValue}>
              <ScrollView
                style={styles.menuScroll}
                bounces={false}
                showsVerticalScrollIndicator={false}
              >
                {children}
              </ScrollView>
            </MenuContext.Provider>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

//#endregion Component

//#region Helpers

function getMenuPositionStyle(
  position: IMenuPosition,
  layout: ITriggerLayout,
): { top?: number; left?: number; right?: number; bottom?: number } {
  const { x, y, width, height } = layout;

  switch (position) {
    case "bottom-start":
      return { top: y + height + 4, left: x };
    case "bottom-end":
      return {
        top: y + height + 4,
        left: x + width,
        transform: [{ translateX: -200 }],
      } as { top: number; left: number };
    case "top-start":
      return { top: y - 4, left: x, transform: [{ translateY: -200 }] } as {
        top: number;
        left: number;
      };
    case "top-end":
      return {
        top: y - 4,
        left: x + width,
        transform: [{ translateX: -200 }, { translateY: -200 }],
      } as { top: number; left: number };
    default:
      return { top: y + height + 4, left: x };
  }
}

//#endregion Helpers

//#region Styles

const styles = StyleSheet.create((theme) => ({
  backdrop: {
    flex: 1,
    backgroundColor: "transparent",
  },

  menuContainer: {
    position: "absolute",
    minWidth: 200,
    maxWidth: 320,
    maxHeight: 400,
    backgroundColor: theme.colors.centerChannelBg,
    borderRadius: theme.radius.m,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    overflow: "hidden",
  },

  menuScroll: {
    paddingVertical: theme.gap(1),
  },
}));

//#endregion Styles
