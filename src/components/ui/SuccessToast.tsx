import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { spring, timing } from '../../motion/tokens';
import { colors, glowShadow, radii } from '../../theme/tokens';

interface SuccessToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  color?: string;
  icon?: React.ReactNode;
  duration?: number;
}

export default function SuccessToast({
  message,
  visible,
  onHide,
  color = colors.success,
  icon,
  duration = 2000,
}: SuccessToastProps) {
  const translateY = useSharedValue(-80);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, timing.standard);
      translateY.value = withSpring(0, spring.soft);
      scale.value = withSpring(1, spring.soft);

      // Auto-hide
      translateY.value = withDelay(
        duration,
        withTiming(-80, timing.exit),
      );
      opacity.value = withDelay(
        duration,
        withTiming(0, timing.exit, () => {
          runOnJS(onHide)();
        }),
      );
      scale.value = withDelay(
        duration,
        withTiming(0.9, timing.exit),
      );
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { borderColor: color + '30' },
        glowShadow(color, 12, 0.2),
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.message, { color }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: colors.bgElevated,
    borderRadius: radii.card,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  icon: {
    marginRight: 10,
  },
  message: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
