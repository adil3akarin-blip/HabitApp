import React, { useEffect } from 'react';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Measured path length for "M20 6L9 17l-5-5" in viewBox 0 0 24 24
const PATH_LENGTH = 28;

interface CheckmarkDrawProps {
  size?: number;
  stroke?: string;
  strokeWidth?: number;
  durationMs?: number;
  checked: boolean;
  reduceMotion?: boolean;
}

const CheckmarkDraw = React.memo(function CheckmarkDraw({
  size = 20,
  stroke = '#fff',
  strokeWidth = 2.5,
  durationMs = 350,
  checked,
  reduceMotion = false,
}: CheckmarkDrawProps) {
  const progress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      progress.value = checked ? 1 : 0;
    } else {
      progress.value = checked
        ? withTiming(1, { duration: durationMs, easing: Easing.out(Easing.cubic) })
        : withTiming(0, { duration: durationMs * 0.6, easing: Easing.in(Easing.cubic) });
    }
  }, [checked, durationMs, reduceMotion]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: PATH_LENGTH * (1 - progress.value),
  }));

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <AnimatedPath
        d="M20 6L9 17l-5-5"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={PATH_LENGTH}
        animatedProps={animatedProps}
      />
    </Svg>
  );
});

export default CheckmarkDraw;
