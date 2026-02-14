import React, { useCallback } from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { svgPress, svgSpring, svgTiming } from '../motion/tokens';
import { hapticTap } from '../../utils/haptics';

const AnimatedPressableView = Animated.createAnimatedComponent(Pressable);

type PressFeedbackProps = {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Scale when pressed (0..1). Default: 0.88 for icons, use 0.94 for cards. */
  depth?: number;
  /** Enable haptic on press-in */
  haptic?: boolean;
  /** Accessible label for the pressable area */
  accessibilityLabel?: string;
  hitSlop?: number;
};

function PressFeedbackInner({
  children,
  onPress,
  onLongPress,
  disabled,
  style,
  depth = svgPress.depth,
  haptic = false,
  accessibilityLabel,
  hitSlop = 0,
}: PressFeedbackProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(depth, svgTiming.pressFeedbackIn);
    if (haptic) hapticTap();
  }, [depth, haptic]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, svgSpring.pressBounce);
  }, []);

  return (
    <AnimatedPressableView
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[animatedStyle, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={hitSlop}
    >
      {children}
    </AnimatedPressableView>
  );
}

export const PressFeedback = React.memo(PressFeedbackInner);
export default PressFeedback;
