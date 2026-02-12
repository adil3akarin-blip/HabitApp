import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { colors, radii } from '../../theme/tokens';
import { springBounce } from '../../ui/motion';

interface PillProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

export default function Pill({ label, value, icon }: PillProps) {
  const scale = useSharedValue(1);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value && typeof value === 'number' && value > 0) {
      scale.value = withSequence(
        withTiming(1.15, { duration: 100 }),
        withSpring(1, springBounce),
      );
    }
    prevValue.current = value;
  }, [value]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.pill, animatedStyle]}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassStrong,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  icon: {
    marginRight: 2,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  label: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
