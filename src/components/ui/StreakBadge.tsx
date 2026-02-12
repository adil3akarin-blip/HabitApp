import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../../theme/tokens';
import { springBounce } from '../../ui/motion';
import FlameIcon from '../svg/FlameIcon';

interface StreakBadgeProps {
  streak: number;
  color?: string;
  size?: 'small' | 'medium';
}

export default function StreakBadge({ streak, color = colors.accentA, size = 'small' }: StreakBadgeProps) {
  const scale = useSharedValue(1);
  const flameScale = useSharedValue(1);

  const isSmall = size === 'small';
  const iconSize = isSmall ? 12 : 16;
  const fontSize = isSmall ? 11 : 14;

  useEffect(() => {
    if (streak > 0) {
      // Pulse in when streak changes
      scale.value = withSequence(
        withTiming(1.2, { duration: 100 }),
        withSpring(1, springBounce),
      );

      // Gentle flame flicker
      flameScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.95, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      );
    }
  }, [streak]);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
  }));

  if (streak <= 0) return null;

  const isMilestone = streak >= 7 || streak % 10 === 0;

  return (
    <Animated.View
      style={[
        styles.badge,
        isSmall ? styles.badgeSmall : styles.badgeMedium,
        { backgroundColor: color + '20', borderColor: color + '40' },
        isMilestone && { backgroundColor: color + '30', borderColor: color + '60' },
        badgeStyle,
      ]}
    >
      <Animated.View style={flameStyle}>
        <FlameIcon size={iconSize} color={color} animate={streak > 0} />
      </Animated.View>
      <Text
        style={[
          styles.text,
          { fontSize, color },
          isMilestone && styles.textBold,
        ]}
      >
        {streak}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    gap: 2,
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeMedium: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontWeight: '600',
  },
  textBold: {
    fontWeight: '700',
  },
});
