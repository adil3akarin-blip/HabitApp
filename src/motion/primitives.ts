import {
  SharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { duration, entrance, spring, timing } from './tokens';

/**
 * Animate a shared value for a staggered fade-slide-up entrance.
 * Drive both opacity and translateY from a single progress value (0→1).
 */
export function enterFadeUp(
  progress: SharedValue<number>,
  index: number = 0,
) {
  'worklet';
  progress.value = 0;
  progress.value = withDelay(
    index * duration.stagger,
    withTiming(1, timing.emphasized),
  );
}

/**
 * Stagger helper: returns delay ms for a given index.
 */
export function staggerDelay(index: number): number {
  return index * duration.stagger;
}

/**
 * Animate entrance with spring physics (for cards).
 */
export function enterSpring(
  progress: SharedValue<number>,
  index: number = 0,
) {
  'worklet';
  progress.value = 0;
  progress.value = withDelay(
    index * duration.stagger,
    withSpring(1, spring.soft),
  );
}

/**
 * Shared style helpers — use with useAnimatedStyle.
 * progress: 0 = hidden, 1 = visible
 */
export const styleHelpers = {
  fadeSlideUp: (progress: number) => ({
    opacity: progress,
    transform: [
      { translateY: (1 - progress) * entrance.slideUp },
    ],
  }),
  fadeSlideUpLarge: (progress: number) => ({
    opacity: progress,
    transform: [
      { translateY: (1 - progress) * entrance.slideUpLarge },
    ],
  }),
  fadeScale: (progress: number) => ({
    opacity: progress,
    transform: [
      { scale: entrance.fadeScale + progress * (1 - entrance.fadeScale) },
    ],
  }),
};
