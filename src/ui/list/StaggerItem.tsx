import React, { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { svgDuration, svgEntrance, svgSpring, svgTiming } from '../motion/tokens';

type StaggerItemProps = {
  children: React.ReactNode;
  index: number;
  /** Maximum index that gets staggered (higher indices enter instantly) */
  maxStagger?: number;
  style?: StyleProp<ViewStyle>;
  reduceMotion?: boolean;
};

function StaggerItemInner({
  children,
  index,
  maxStagger = 10,
  style,
  reduceMotion = false,
}: StaggerItemProps) {
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      progress.value = 1;
      return;
    }

    const clampedIndex = Math.min(index, maxStagger);
    const delay = clampedIndex * svgDuration.staggerItem;

    progress.value = withDelay(
      delay,
      withSpring(1, svgSpring.staggerItem),
    );
  }, [index, maxStagger, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      opacity: p,
      transform: [
        { translateY: (1 - p) * svgEntrance.slideUp },
        { scale: svgEntrance.scaleFrom + p * (1 - svgEntrance.scaleFrom) },
      ],
    };
  });

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

export const StaggerItem = React.memo(StaggerItemInner);
export default StaggerItem;
