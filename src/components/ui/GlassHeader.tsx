import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { entrance, timing } from '../../motion/tokens';
import { colors, typography } from '../../theme/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface GlassHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  progressDone?: number;
  progressTotal?: number;
  progressColor?: string;
}

const RING_SIZE = 44;
const RING_STROKE = 4;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function GlassHeader({
  title,
  subtitle,
  rightAction,
  progressDone,
  progressTotal,
  progressColor,
}: GlassHeaderProps) {
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, timing.dramatic);
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * entrance.slideUpLarge }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const showProgress = progressDone !== undefined && progressTotal !== undefined && progressTotal > 0;
  const progressPercent = showProgress ? Math.min(progressDone! / progressTotal!, 1) : 0;
  const allDone = showProgress && progressDone! >= progressTotal!;

  const ringProgress = useSharedValue(0);

  useEffect(() => {
    if (showProgress) {
      ringProgress.value = withTiming(progressPercent, timing.dramatic);
    }
  }, [progressPercent]);

  const ringAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_CIRCUMFERENCE * (1 - ringProgress.value),
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.content}>
        {showProgress && (
          <Animated.View style={[styles.ringContainer, titleStyle]}>
            <Svg width={RING_SIZE} height={RING_SIZE}>
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke={colors.glassStrong}
                strokeWidth={RING_STROKE}
                fill="none"
              />
              <AnimatedCircle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke={progressColor || colors.accentA}
                strokeWidth={RING_STROKE}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                animatedProps={ringAnimatedProps}
                transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
              />
            </Svg>
            <View style={styles.ringLabel}>
              <Text style={[
                styles.ringText,
                allDone && { color: progressColor || colors.accentA },
              ]}>
                {allDone ? '\u2713' : `${progressDone}`}
              </Text>
            </View>
          </Animated.View>
        )}
        <View style={styles.titleContainer}>
          <Animated.Text style={[styles.title, titleStyle]}>{title}</Animated.Text>
          {subtitle && <Animated.Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Animated.Text>}
        </View>
        {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.hero,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  rightAction: {
    marginLeft: 16,
  },
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringLabel: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: RING_SIZE,
    height: RING_SIZE,
  },
  ringText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
});
