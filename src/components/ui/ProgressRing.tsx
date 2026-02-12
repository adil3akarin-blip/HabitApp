import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { colors } from '../../theme/tokens';
import { springGentle } from '../../ui/motion';

interface ProgressRingProps {
  done: number;
  total: number;
  color?: string;
}

export default function ProgressRing({
  done,
  total,
  color = colors.accentB,
}: ProgressRingProps) {
  const progress = useSharedValue(0);
  const scale = useSharedValue(0.9);

  const ratio = total > 0 ? done / total : 0;
  const isComplete = total > 0 && done >= total;

  useEffect(() => {
    progress.value = withTiming(ratio, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
    scale.value = withSpring(1, springGentle);
  }, [ratio]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.min(progress.value * 100, 100)}%` as any,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { backgroundColor: color }, fillStyle]} />
      </View>
      <View style={styles.textRow}>
        <Text style={[styles.done, isComplete && { color }]}>{done}</Text>
        <Text style={styles.separator}>/</Text>
        <Text style={styles.total}>{total}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,
  },
  track: {
    width: 80,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.glassStrong,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  done: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  separator: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textFaint,
    marginHorizontal: 2,
  },
  total: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
});
