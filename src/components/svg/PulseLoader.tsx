import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { colors } from '../../theme/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface PulseLoaderProps {
  size?: number;
  color?: string;
  secondaryColor?: string;
  reduceMotion?: boolean;
}

const RING_COUNT = 3;
const DURATION = 1600;

function PulseRing({
  index,
  size,
  color,
  reduceMotion,
}: {
  index: number;
  size: number;
  color: string;
  reduceMotion: boolean;
}) {
  const anim = useSharedValue(0);
  const center = size / 2;
  const maxRadius = size / 2 - 2;
  const delay = index * (DURATION / RING_COUNT);

  useEffect(() => {
    if (reduceMotion) {
      anim.value = 0.5;
      return;
    }
    anim.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: DURATION, easing: Easing.out(Easing.cubic) }),
        -1,
        false,
      ),
    );
  }, [reduceMotion]);

  const animatedProps = useAnimatedProps(() => {
    const r = interpolate(anim.value, [0, 1], [4, maxRadius]);
    const opacity = interpolate(anim.value, [0, 0.4, 1], [0.6, 0.3, 0]);
    return {
      r,
      opacity,
    };
  });

  return (
    <AnimatedCircle
      cx={center}
      cy={center}
      fill="none"
      stroke={color}
      strokeWidth={2}
      animatedProps={animatedProps}
    />
  );
}

const PulseLoader = React.memo(function PulseLoader({
  size = 48,
  color = colors.accentA,
  secondaryColor = colors.accentB,
  reduceMotion = false,
}: PulseLoaderProps) {
  const dotScale = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    dotScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 600, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [reduceMotion]);

  const dotProps = useAnimatedProps(() => ({
    r: 3 * dotScale.value,
  }));

  const center = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {Array.from({ length: RING_COUNT }).map((_, i) => (
          <PulseRing
            key={i}
            index={i}
            size={size}
            color={i % 2 === 0 ? color : secondaryColor}
            reduceMotion={reduceMotion}
          />
        ))}
        <AnimatedCircle
          cx={center}
          cy={center}
          fill={color}
          animatedProps={dotProps}
        />
      </Svg>
    </View>
  );
});

export default PulseLoader;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
