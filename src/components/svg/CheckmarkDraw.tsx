import React, { useEffect } from 'react';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const PATH_LENGTH = 24;

type CheckmarkDrawProps = {
  size?: number;
  stroke?: string;
  strokeWidth?: number;
  durationMs?: number;
  delayMs?: number;
  progress?: number;
  reduceMotion?: boolean;
};

export const CheckmarkDraw = React.memo(function CheckmarkDraw({
  size = 20,
  stroke = '#fff',
  strokeWidth = 2.5,
  durationMs = 280,
  delayMs = 0,
  progress,
  reduceMotion = false,
}: CheckmarkDrawProps) {
  const p = useSharedValue(progress ?? (reduceMotion ? 1 : 0));

  useEffect(() => {
    if (typeof progress === 'number') {
      p.value = reduceMotion ? progress : withTiming(progress, {
        duration: durationMs,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      p.value = reduceMotion
        ? 1
        : withDelay(
            delayMs,
            withTiming(1, {
              duration: durationMs,
              easing: Easing.out(Easing.cubic),
            })
          );
    }
  }, [progress, durationMs, delayMs, reduceMotion]);

  const animatedProps = useAnimatedProps(() => {
    const dashoffset = PATH_LENGTH * (1 - p.value);
    return { strokeDashoffset: dashoffset };
  });

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
