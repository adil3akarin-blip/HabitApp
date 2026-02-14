import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { entrance, timing } from '../../motion/tokens';
import { colors, typography } from '../../theme/tokens';
import CheckDraw from '../../ui/svg/CheckDraw';
import ProgressRing from '../../ui/svg/ProgressRing';

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
  const allDone = showProgress && progressDone! >= progressTotal!;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.content}>
        {showProgress && (
          <Animated.View style={[styles.ringContainer, titleStyle]}>
            <ProgressRing
              value={progressDone!}
              max={progressTotal!}
              size={RING_SIZE}
              strokeWidth={RING_STROKE}
              trackColor={colors.glassStrong}
              progressColor={progressColor || colors.accentA}
            >
              {allDone ? (
                <CheckDraw size={18} stroke={progressColor || colors.accentA} strokeWidth={2} delay={120} />
              ) : (
                <Text style={styles.ringText}>{progressDone}</Text>
              )}
            </ProgressRing>
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
  ringText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
});
