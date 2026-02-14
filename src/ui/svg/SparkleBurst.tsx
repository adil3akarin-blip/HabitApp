import React, { forwardRef, useCallback, useImperativeHandle } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import Svg, { Circle, Line } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedLine = Animated.createAnimatedComponent(Line);

// 8 sparkle rays evenly distributed for fuller effect
const RAY_COUNT = 8;
const ANGLE_STEP = (2 * Math.PI) / RAY_COUNT;

export type SparkleBurstRef = {
  play: () => void;
};

type SparkleBurstProps = {
  size?: number;
  color?: string;
  /** Number of sparkle rays */
  rays?: number;
  reduceMotion?: boolean;
};

const SparkleBurstInner = forwardRef<SparkleBurstRef, SparkleBurstProps>(
  function SparkleBurst(
    {
      size = 48,
      color = '#E8A838',
      rays = RAY_COUNT,
      reduceMotion = false,
    },
    ref,
  ) {
    const progress = useSharedValue(0);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.6);

    const play = useCallback(() => {
      if (reduceMotion) {
        opacity.value = 1;
        scale.value = 1;
        progress.value = 1;
        // Quick fade out
        opacity.value = withDelay(200, withTiming(0, { duration: 100 }));
        return;
      }

      // Reset
      opacity.value = 0;
      scale.value = 0.4;
      progress.value = 0;

      // Burst in with overshoot
      opacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(400, withTiming(0, { duration: 400 })),
      );
      scale.value = withSequence(
        withTiming(1.6, { duration: 200 }),
        withTiming(1.2, { duration: 150 }),
        withTiming(0.8, { duration: 400 }),
      );
      progress.value = withTiming(1, { duration: 600 });
    }, [reduceMotion]);

    useImperativeHandle(ref, () => ({ play }), [play]);

    const containerStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    }));

    const center = size / 2;
    const innerR = size * 0.12;
    const outerR = size * 0.48;

    // Build ray elements
    const rayElements = Array.from({ length: rays }, (_, i) => {
      const angle = i * ((2 * Math.PI) / rays);
      const x1 = center + Math.cos(angle) * innerR;
      const y1 = center + Math.sin(angle) * innerR;
      const x2 = center + Math.cos(angle) * outerR;
      const y2 = center + Math.sin(angle) * outerR;

      return (
        <Line
          key={`ray-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          opacity={0.85}
        />
      );
    });

    // Small dots at ray tips
    const dotElements = Array.from({ length: rays }, (_, i) => {
      const angle = i * ((2 * Math.PI) / rays) + ((2 * Math.PI) / rays) / 2;
      const cx = center + Math.cos(angle) * (outerR * 0.7);
      const cy = center + Math.sin(angle) * (outerR * 0.7);

      return (
        <Circle
          key={`dot-${i}`}
          cx={cx}
          cy={cy}
          r={2}
          fill={color}
          opacity={0.7}
        />
      );
    });

    return (
      <Animated.View
        style={[
          { width: size, height: size, position: 'absolute' },
          containerStyle,
        ]}
        pointerEvents="none"
      >
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {rayElements}
          {dotElements}
          <Circle
            cx={center}
            cy={center}
            r={3.5}
            fill={color}
            opacity={0.9}
          />
          <Circle
            cx={center}
            cy={center}
            r={6}
            fill={color}
            opacity={0.2}
          />
        </Svg>
      </Animated.View>
    );
  },
);

export const SparkleBurst = React.memo(SparkleBurstInner);
export default SparkleBurst;
