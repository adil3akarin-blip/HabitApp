import React from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { DURATION_PRESS, pressOpacityDown, springSnappy } from '../../ui/motion';
import { hapticSelection } from '../../utils/haptics';

const AnimatedPressableView = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  scaleValue?: number;
  activeOpacity?: number;
  haptic?: boolean;
}

export default function AnimatedPressable({
  children,
  onPress,
  onLongPress,
  disabled,
  style,
  scaleValue = 0.96,
  activeOpacity = 1,
  haptic = true,
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withTiming(scaleValue, { duration: DURATION_PRESS });
    opacity.value = withTiming(
      activeOpacity < 1 ? activeOpacity : pressOpacityDown,
      { duration: DURATION_PRESS },
    );
    if (haptic) {
      hapticSelection();
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springSnappy);
    opacity.value = withTiming(1, { duration: DURATION_PRESS });
  };

  return (
    <AnimatedPressableView
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[animatedStyle, style]}
      accessibilityRole="button"
    >
      {children}
    </AnimatedPressableView>
  );
}
