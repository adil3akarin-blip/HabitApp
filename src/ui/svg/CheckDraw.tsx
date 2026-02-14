import React, { useEffect } from 'react';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { svgTiming } from '../motion/tokens';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Measured path length for "M20 6L9 17l-5-5" in a 24×24 viewBox
const PATH_LENGTH = 28;

type CheckDrawProps = {
  size?: number;
  stroke?: string;
  strokeWidth?: number;
  durationMs?: number;
  /** 0..1 controlled progress. If omitted, auto-plays draw-on. */
  progress?: number;
  /** Delay before draw-on starts (ms) */
  delay?: number;
  reduceMotion?: boolean;
};

function CheckDrawInner({
  size = 28,
  stroke = '#F5F0E8',
  strokeWidth = 2.5,
  durationMs,
  progress,
  delay = 0,
  reduceMotion = false,
}: CheckDrawProps) {
  const dur = durationMs ?? svgTiming.drawOn.duration!;
  const p = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (typeof progress === 'number') {
      p.value = reduceMotion ? progress : withTiming(progress, { ...svgTiming.drawOn, duration: dur });
    } else {
      p.value = reduceMotion
        ? 1
        : withDelay(delay, withTiming(1, { ...svgTiming.drawOn, duration: dur }));
    }
  }, [progress, dur, delay, reduceMotion]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: PATH_LENGTH * (1 - p.value),
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
}

export const CheckDraw = React.memo(CheckDrawInner);
export default CheckDraw;
