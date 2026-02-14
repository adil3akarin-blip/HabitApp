import React, { useEffect } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { svgTiming } from '../motion/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type ProgressRingProps = {
  /** Current value (0..max) */
  value: number;
  /** Maximum value */
  max: number;
  /** Outer diameter */
  size?: number;
  strokeWidth?: number;
  /** Track (background) color */
  trackColor?: string;
  /** Progress arc color */
  progressColor?: string;
  /** Optional content rendered in the center */
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  reduceMotion?: boolean;
};

function ProgressRingInner({
  value,
  max,
  size = 44,
  strokeWidth = 4,
  trackColor = 'rgba(245,240,232,0.08)',
  progressColor = '#E8A838',
  children,
  style,
  reduceMotion = false,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = max > 0 ? Math.min(value / max, 1) : 0;

  const progress = useSharedValue(reduceMotion ? percent : 0);

  useEffect(() => {
    progress.value = reduceMotion
      ? percent
      : withTiming(percent, svgTiming.ringFill);
  }, [percent, reduceMotion]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children && (
        <View style={{ position: 'absolute', justifyContent: 'center', alignItems: 'center' }}>
          {children}
        </View>
      )}
    </View>
  );
}

export const ProgressRing = React.memo(ProgressRingInner);
export default ProgressRing;
