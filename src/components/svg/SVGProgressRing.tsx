import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { colors } from '../../theme/tokens';
import { springGentle } from '../../ui/motion';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface SVGProgressRingProps {
  done: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  progressColor?: string;
  reduceMotion?: boolean;
}

const SVGProgressRing = React.memo(function SVGProgressRing({
  done,
  total,
  size = 52,
  strokeWidth = 4,
  trackColor = colors.glassStrong,
  progressColor = colors.accentB,
  reduceMotion = false,
}: SVGProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const ratio = total > 0 ? Math.min(done / total, 1) : 0;
  const isComplete = total > 0 && done >= total;

  const progress = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) {
      progress.value = ratio;
    } else {
      progress.value = withTiming(ratio, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      });
    }

    if (isComplete && !reduceMotion) {
      pulseScale.value = withSequence(
        withTiming(1.08, { duration: 200 }),
        withSpring(1, springGentle),
      );
    }
  }, [ratio, isComplete, reduceMotion]);

  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.container, { width: size, height: size }, containerStyle]}>
        <Svg width={size} height={size}>
          {/* Track */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={isComplete ? colors.accentA : progressColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference}`}
            animatedProps={animatedCircleProps}
            strokeLinecap="round"
            rotation={-90}
            origin={`${center}, ${center}`}
          />
        </Svg>
        <View style={styles.labelContainer}>
          <Text style={[styles.doneText, isComplete && { color: colors.accentA }]}>
            {done}
          </Text>
        </View>
      </Animated.View>
      <Text style={styles.totalText}>/{total}</Text>
    </View>
  );
});

export default SVGProgressRing;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  totalText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
  },
});
