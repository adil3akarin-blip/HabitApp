import React, { useEffect } from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { duration, entrance, timing } from '../motion/tokens';

interface AnimatedSectionProps {
  children: React.ReactNode;
  index?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Wraps a screen section with a staggered fade-slide-up entrance.
 * Use `index` to control stagger order within a screen.
 */
export default function AnimatedSection({
  children,
  index = 0,
  style,
}: AnimatedSectionProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      index * 80 + 60, // slightly longer stagger for sections
      withTiming(1, timing.emphasized),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * entrance.slideUp },
    ],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}
