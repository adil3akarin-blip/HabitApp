import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { colors } from '../../theme/tokens';
import { spring, timing } from '../../motion/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedView = Animated.View;

type StreakBadgeProps = {
  streak: number;
  size?: number;
  color?: string;
  animate?: boolean;
  reduceMotion?: boolean;
};

const RING_STROKE = 3;

export const StreakBadge = React.memo(function StreakBadge({
  streak,
  size = 48,
  color = colors.danger,
  animate = true,
  reduceMotion = false,
}: StreakBadgeProps) {
  const radius = (size - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const ringProgress = useSharedValue(0);
  const scale = useSharedValue(animate && !reduceMotion ? 0.8 : 1);
  const flameScale = useSharedValue(animate && !reduceMotion ? 0 : 1);

  useEffect(() => {
    if (animate && !reduceMotion) {
      // Ring draws in
      ringProgress.value = withDelay(
        100,
        withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
      );
      // Badge scales up
      scale.value = withSpring(1, spring.soft);
      // Flame pops in
      flameScale.value = withDelay(
        200,
        withSequence(
          withSpring(1.2, spring.bouncy),
          withSpring(1, spring.tight)
        )
      );
    } else {
      ringProgress.value = 1;
      scale.value = 1;
      flameScale.value = 1;
    }
  }, [animate, reduceMotion]);

  const ringAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - ringProgress.value),
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: interpolate(scale.value, [0.8, 1], [0, 1]),
  }));

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
  }));

  const flameSize = size * 0.4;

  return (
    <AnimatedView style={[styles.container, { width: size, height: size }, containerStyle]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="streakRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor="#FFD93D" stopOpacity="0.8" />
          </LinearGradient>
        </Defs>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.glassStrong}
          strokeWidth={RING_STROKE}
          fill="none"
        />
        {/* Progress ring */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#streakRingGrad)"
          strokeWidth={RING_STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={ringAnimatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.content}>
        <AnimatedView style={flameStyle}>
          <Svg width={flameSize} height={flameSize} viewBox="0 0 24 24">
            <Defs>
              <LinearGradient id="badgeFlameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <Stop offset="0%" stopColor={color} stopOpacity="1" />
                <Stop offset="100%" stopColor="#FFD93D" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Path
              d="M12 22C8.13 22 5 18.87 5 15C5 11.5 7.5 8.5 10 6C10 9 12 11 14 11C14 8 12 5 12 2C16 4 19 8.58 19 13C19 17.97 15.97 22 12 22Z"
              fill="url(#badgeFlameGrad)"
            />
          </Svg>
        </AnimatedView>
        <Text style={[styles.streakText, { color }]}>{streak}</Text>
      </View>
    </AnimatedView>
  );
});

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginTop: -2,
  },
});

export default StreakBadge;
