# L10: Layout Components

## Overview

Structural and layout components that compose base components into larger UI patterns.

## Target Location

`apps/v2/src/components/`

## Dependencies

- L6: Base Components
- L9: State Hooks

## Tasks

| ID                                                       | Name                 | Status  | Parallel | Est. | Assignee |
| -------------------------------------------------------- | -------------------- | ------- | -------- | ---- | -------- |
| [T10.01](../tasks/T10.01-component-modal.md)             | Modal                | pending | ✓        | 3h   | -        |
| [T10.02](../tasks/T10.02-component-full-screen-modal.md) | FullScreenModal      | pending | ✓        | 2h   | -        |
| [T10.03](../tasks/T10.03-component-bottom-sheet.md)      | BottomSheet          | pending | ✓        | 3h   | -        |
| [T10.04](../tasks/T10.04-component-menu.md)              | Menu                 | pending | ✓        | 3h   | -        |
| [T10.05](../tasks/T10.05-component-menu-item.md)         | MenuItem             | pending | ✓        | 1h   | -        |
| [T10.06](../tasks/T10.06-component-menu-divider.md)      | MenuDivider          | pending | ✓        | 0.5h | -        |
| [T10.07](../tasks/T10.07-component-header.md)            | Header               | pending | ✓        | 2h   | -        |
| [T10.08](../tasks/T10.08-component-tab-bar.md)           | TabBar               | pending | ✓        | 2h   | -        |
| [T10.09](../tasks/T10.09-component-sidebar-container.md) | SidebarContainer     | pending | ✓        | 3h   | -        |
| [T10.10](../tasks/T10.10-component-scroll-view.md)       | ScrollView           | pending | ✓        | 1h   | -        |
| [T10.11](../tasks/T10.11-component-flat-list.md)         | FlatList             | pending | ✓        | 1h   | -        |
| [T10.12](../tasks/T10.12-component-keyboard-avoiding.md) | KeyboardAvoidingView | pending | ✓        | 1h   | -        |
| [T10.13](../tasks/T10.13-component-safe-area.md)         | SafeAreaView         | pending | ✓        | 0.5h | -        |
| [T10.14](../tasks/T10.14-component-toast.md)             | Toast                | pending | ✓        | 2h   | -        |
| [T10.15](../tasks/T10.15-component-alert-dialog.md)      | AlertDialog          | pending | ✓        | 2h   | -        |

## Progress

- Total: 15
- Done: 0
- In Progress: 0
- Pending: 15

## File Structure

```
apps/v2/src/components/
├── Modal/
│   ├── Modal.tsx
│   ├── Modal.spec.tsx
│   ├── Modal.stories.tsx
│   └── index.ts
├── FullScreenModal/
│   └── ...
├── BottomSheet/
│   └── ...
├── Menu/
│   ├── Menu.tsx
│   ├── MenuItem.tsx
│   ├── MenuDivider.tsx
│   └── index.ts
├── Header/
│   └── ...
├── TabBar/
│   └── ...
├── SidebarContainer/
│   └── ...
├── Toast/
│   └── ...
└── AlertDialog/
    └── ...
```

## Key Components

### Modal (T9.01)

```typescript
import { Modal as RNModal, View, Pressable } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

type IProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  closeOnBackdrop?: boolean;
};

export function Modal({
  visible,
  onClose,
  children,
  title,
  size = 'md',
  closeOnBackdrop = true,
}: IProps) {
  styles.useVariants({ size });

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        style={styles.backdrop}
      >
        <Pressable
          style={styles.backdropPressable}
          onPress={closeOnBackdrop ? onClose : undefined}
        />
        <Animated.View style={styles.content}>
          {title && (
            <View style={styles.header}>
              <Text variant="heading">{title}</Text>
              <IconButton icon="close" onPress={onClose} />
            </View>
          )}
          <View style={styles.body}>{children}</View>
        </Animated.View>
      </Animated.View>
    </RNModal>
  );
}
```

### BottomSheet (T9.03)

```typescript
import { useRef } from 'react';
import BottomSheetBase, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

type IProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: (string | number)[];
};

export function BottomSheet({
  visible,
  onClose,
  children,
  snapPoints = ['50%', '90%'],
}: IProps) {
  const bottomSheetRef = useRef<BottomSheetBase>(null);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  return (
    <BottomSheetBase
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      onClose={onClose}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
        />
      )}
    >
      <BottomSheetView style={styles.content}>
        {children}
      </BottomSheetView>
    </BottomSheetBase>
  );
}
```

### Menu (T9.04)

```typescript
import { View, Modal, Pressable } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

type IProps = {
  visible: boolean;
  onClose: () => void;
  anchor?: { x: number; y: number };
  children: React.ReactNode;
};

export function Menu({ visible, onClose, anchor, children }: IProps) {
  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          entering={FadeIn.duration(150).springify()}
          style={[styles.menu, anchor && { top: anchor.y, left: anchor.x }]}
        >
          {children}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

// MenuItem.tsx
type MenuItemProps = {
  titleKey?: string;
  title?: string;
  icon?: React.ReactNode;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
};

export function MenuItem({
  titleKey,
  title,
  icon,
  onPress,
  destructive,
  disabled,
}: MenuItemProps) {
  const { t } = useTranslation();
  styles.useVariants({ destructive, disabled });

  return (
    <Pressable
      style={styles.menuItem}
      onPress={onPress}
      disabled={disabled}
    >
      {icon && <View style={styles.menuItemIcon}>{icon}</View>}
      <Text style={styles.menuItemText}>
        {titleKey ? t(titleKey) : title}
      </Text>
    </Pressable>
  );
}
```

### Toast (T9.14)

```typescript
import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'warning' | 'info';

type Toast = {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
};

// Toast store
type ToastStore = {
  toasts: Toast[];
  show: (toast: Omit<Toast, 'id'>) => void;
  hide: (id: string) => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  show: (toast) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, toast.duration ?? 3000);
  },
  hide: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

// Toast component
export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <View style={styles.container}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} />
      ))}
    </View>
  );
}

// Convenience function
export const toast = {
  success: (message: string) => useToastStore.getState().show({ type: 'success', message }),
  error: (message: string) => useToastStore.getState().show({ type: 'error', message }),
  warning: (message: string) => useToastStore.getState().show({ type: 'warning', message }),
  info: (message: string) => useToastStore.getState().show({ type: 'info', message }),
};
```

## Notes

- Use react-native-reanimated for animations
- Use @gorhom/bottom-sheet for bottom sheets
- Modals should handle keyboard avoidance
- Consider safe area insets for all layout components
- Test on both iOS and Android
