# G.06: Add Animation Tokens

## Metadata

| Field        | Value         |
| ------------ | ------------- |
| **ID**       | G.06          |
| **Layer**    | Global Styles |
| **Status**   | pending       |
| **Priority** | high          |
| **Estimate** | 1h            |
| **Parallel** | true          |
| **Assignee** | -             |
| **Created**  | 2026-01-04    |
| **Updated**  | 2026-01-04    |

## Dependencies

None

## Blocks

| Task ID | Name        |
| ------- | ----------- |
| T9.01   | Modal       |
| T9.03   | BottomSheet |
| T9.14   | Toast       |

## Description

Add animation duration and easing tokens for consistent motion design.

## Implementation

```typescript
// apps/v2/src/theme.ts

import { Easing } from "react-native-reanimated";

// Duration values in milliseconds
const duration = {
  instant: 0,
  fastest: 50,
  faster: 100,
  fast: 150,
  normal: 250,
  slow: 400,
  slower: 600,
  slowest: 1000,
} as const;

// Easing functions for react-native-reanimated
const easing = {
  // Standard easings
  linear: Easing.linear,
  ease: Easing.ease,
  easeIn: Easing.in(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  easeInOut: Easing.inOut(Easing.ease),

  // Cubic bezier equivalents
  easeInCubic: Easing.in(Easing.cubic),
  easeOutCubic: Easing.out(Easing.cubic),
  easeInOutCubic: Easing.inOut(Easing.cubic),

  // Spring-like (for bouncy effects)
  easeOutBack: Easing.out(Easing.back(1.5)),
  easeInBack: Easing.in(Easing.back(1.5)),

  // Elastic (for playful effects)
  easeOutElastic: Easing.out(Easing.elastic(1)),

  // Bounce
  bounce: Easing.bounce,
} as const;

// Spring configurations for react-native-reanimated
const springConfig = {
  // Gentle spring
  gentle: {
    damping: 20,
    stiffness: 100,
    mass: 1,
  },
  // Default spring
  default: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  // Bouncy spring
  bouncy: {
    damping: 10,
    stiffness: 180,
    mass: 1,
  },
  // Stiff spring (snappy)
  stiff: {
    damping: 20,
    stiffness: 300,
    mass: 0.8,
  },
  // Slow spring (for large movements)
  slow: {
    damping: 25,
    stiffness: 80,
    mass: 1.2,
  },
} as const;

// Animation presets for common use cases
const animationPresets = {
  // Fade in/out
  fadeIn: {
    duration: duration.fast,
    easing: easing.easeOut,
  },
  fadeOut: {
    duration: duration.faster,
    easing: easing.easeIn,
  },

  // Slide animations
  slideIn: {
    duration: duration.normal,
    easing: easing.easeOutCubic,
  },
  slideOut: {
    duration: duration.fast,
    easing: easing.easeInCubic,
  },

  // Scale animations
  scaleIn: {
    duration: duration.fast,
    easing: easing.easeOutBack,
  },
  scaleOut: {
    duration: duration.faster,
    easing: easing.easeIn,
  },

  // Modal animations
  modalIn: {
    duration: duration.normal,
    easing: easing.easeOutCubic,
  },
  modalOut: {
    duration: duration.fast,
    easing: easing.easeIn,
  },

  // Toast animations
  toastIn: {
    duration: duration.fast,
    easing: easing.easeOutBack,
  },
  toastOut: {
    duration: duration.faster,
    easing: easing.easeIn,
  },

  // Press feedback
  pressIn: {
    duration: duration.fastest,
    easing: easing.easeOut,
  },
  pressOut: {
    duration: duration.faster,
    easing: easing.easeOut,
  },
} as const;

// Combine into animation object
const animation = {
  duration,
  easing,
  spring: springConfig,
  presets: animationPresets,
} as const;

// Add to theme
const lightTheme = {
  // ... existing
  animation,
};
```

## Usage Examples

```typescript
// With react-native-reanimated
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

function FadeInView({ visible, children }) {
  const { animation } = useStyles.theme;

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(visible ? 1 : 0, {
      duration: animation.duration.fast,
      easing: animation.easing.easeOut,
    }),
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

// Using spring config
function BouncyButton({ onPress, children }) {
  const { animation } = useStyles.theme;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, animation.spring.stiff);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, animation.spring.bouncy);
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </Pressable>
  );
}

// Using presets
function Modal({ visible, onClose, children }) {
  const { animation } = useStyles.theme;

  return (
    <Animated.View
      entering={FadeIn.duration(animation.presets.modalIn.duration)}
      exiting={FadeOut.duration(animation.presets.modalOut.duration)}
    >
      {children}
    </Animated.View>
  );
}
```

## Acceptance Criteria

- [ ] Duration tokens defined (fastest to slowest)
- [ ] Easing functions defined (using reanimated Easing)
- [ ] Spring configurations defined
- [ ] Animation presets for common use cases
- [ ] Works with react-native-reanimated
- [ ] Consistent motion across the app

## Notes

- Use react-native-reanimated for all animations
- Prefer springs for interactive elements
- Use duration/easing for simple transitions
- Test animations on lower-end devices for performance
- Consider reduced motion accessibility setting
