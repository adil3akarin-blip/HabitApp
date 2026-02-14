import React, { useEffect } from 'react';
import Svg, { Path, G } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { spring, timing } from '../../motion/tokens';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

type PlusToCheckProps = {
  size?: number;
  isChecked: boolean;
  color?: string;
  checkedColor?: string;
  strokeWidth?: number;
  durationMs?: number;
  reduceMotion?: boolean;
};

export const PlusToCheck = React.memo(function PlusToCheck({
  size = 20,
  isChecked,
  color = '#888',
  checkedColor = '#fff',
  strokeWidth = 2.5,
  durationMs = 250,
  reduceMotion = false,
}: PlusToCheckProps) {
  const progress = useSharedValue(isChecked ? 1 : 0);
  const rotation = useSharedValue(isChecked ? 0 : 0);

  useEffect(() => {
    if (reduceMotion) {
      progress.value = isChecked ? 1 : 0;
      rotation.value = 0;
    } else {
      progress.value = withTiming(isChecked ? 1 : 0, {
        duration: durationMs,
        easing: Easing.out(Easing.cubic),
      });
      rotation.value = withSpring(isChecked ? 45 : 0, spring.snappy);
    }
  }, [isChecked, reduceMotion, durationMs]);

  // Plus icon paths
  const plusHorizontalProps = useAnimatedProps(() => {
    const opacity = interpolate(progress.value, [0, 0.3], [1, 0]);
    return { opacity };
  });

  const plusVerticalProps = useAnimatedProps(() => {
    const opacity = interpolate(progress.value, [0, 0.3], [1, 0]);
    return { opacity };
  });

  // Checkmark path - draws on
  const checkProps = useAnimatedProps(() => {
    const dashoffset = interpolate(progress.value, [0.3, 1], [24, 0]);
    const opacity = interpolate(progress.value, [0.2, 0.4], [0, 1]);
    return {
      strokeDashoffset: dashoffset,
      opacity,
    };
  });

  const groupStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const currentColor = reduceMotion
    ? (isChecked ? checkedColor : color)
    : color;

  const checkColor = checkedColor;

  return (
    <Animated.View style={groupStyle}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Plus horizontal */}
        <AnimatedPath
          d="M5 12H19"
          stroke={currentColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          animatedProps={plusHorizontalProps}
        />
        {/* Plus vertical */}
        <AnimatedPath
          d="M12 5V19"
          stroke={currentColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          animatedProps={plusVerticalProps}
        />
        {/* Checkmark */}
        <AnimatedPath
          d="M20 6L9 17l-5-5"
          stroke={checkColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={24}
          animatedProps={checkProps}
        />
      </Svg>
    </Animated.View>
  );
});

export default PlusToCheck;
