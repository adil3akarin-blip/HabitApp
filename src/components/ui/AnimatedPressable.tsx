import React from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { spring, timing } from '../../motion/tokens';

const AnimatedPressableView = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  scaleValue?: number;
  activeOpacity?: number;
}

export default function AnimatedPressable({
  children,
  onPress,
  onLongPress,
  disabled,
  style,
  scaleValue = 0.97,
  activeOpacity = 1,
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withTiming(scaleValue, timing.snappy);
    if (activeOpacity < 1) {
      opacity.value = withTiming(activeOpacity, timing.snappy);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, spring.snappy);
    opacity.value = withSpring(1, spring.tight);
  };

  return (
    <AnimatedPressableView
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[animatedStyle, style]}
    >
      {children}
    </AnimatedPressableView>
  );
}
