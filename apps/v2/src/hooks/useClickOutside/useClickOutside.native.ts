// apps/v2/src/hooks/useClickOutside/useClickOutside.native.ts

import { useRef } from "react";

//#region Types

export type IClickOutsideResult = {
  /** Props to spread on a backdrop Pressable component */
  backdropProps: {
    onPress: () => void;
  };
};

//#endregion Types

//#region useClickOutside

/**
 * Hook to detect clicks outside content in React Native.
 * Returns props to spread on a backdrop Pressable that covers the screen.
 *
 * Unlike the web version which uses document event listeners,
 * React Native requires a backdrop pattern - a full-screen Pressable
 * behind your content that captures outside taps.
 *
 * @param handler - Callback fired when backdrop is pressed
 * @param enabled - Whether the handler should fire. Default: true
 *
 * @example
 * ```tsx
 * function Modal({ onClose }) {
 *   const { backdropProps } = useClickOutside(onClose);
 *
 *   return (
 *     <View style={StyleSheet.absoluteFill}>
 *       <Pressable style={StyleSheet.absoluteFill} {...backdropProps} />
 *       <View style={styles.content}>
 *         Modal content here
 *       </View>
 *     </View>
 *   );
 * }
 * ```
 */
export function useClickOutside(
  handler: () => void,
  enabled: boolean = true,
): IClickOutsideResult {
  // Store handler in ref to keep backdropProps stable
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const onPress = () => {
    if (enabled) {
      handlerRef.current();
    }
  };

  return {
    backdropProps: {
      onPress,
    },
  };
}

//#endregion useClickOutside
