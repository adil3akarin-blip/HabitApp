import React, { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { duration, entrance, timing } from '../motion/tokens';

interface AnimatedListItemProps {
  children: React.ReactNode;
  index: number;
  maxDelay?: number;
}

/**
 * Wraps a list item with a staggered fade-slide-up entrance.
 * Items beyond index 8 enter instantly (no long waits for big lists).
 */
export default function AnimatedListItem({
  children,
  index,
  maxDelay = 8,
}: AnimatedListItemProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    const clampedIndex = Math.min(index, maxDelay);
    progress.value = withDelay(
      clampedIndex * duration.stagger,
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
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
}
