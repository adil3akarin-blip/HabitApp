import React, { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

type FlameAnimatedProps = {
  size?: number;
  color?: string;
  isActive?: boolean;
};

export const FlameAnimated = React.memo(function FlameAnimated({
  size = 14,
  color = '#FF6B35',
  isActive = true,
}: FlameAnimatedProps) {
  const scale = useSharedValue(1);
  
  useEffect(() => {
    if (isActive) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );
    } else {
      scale.value = 1;
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const fillColor = isActive ? color : color + '40';
  
  return (
    <Animated.View style={animatedStyle}>
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Path
          d="M256 32c-8.6 0-16.5 4.6-20.8 12.1C203.4 96.7 160 176.6 160 256c0 53 43 96 96 96s96-43 96-96c0-79.4-43.4-159.3-75.2-211.9C272.5 36.6 264.6 32 256 32zm0 288c-17.7 0-32-14.3-32-32 0-26.5 14.5-53.1 25.1-71.5 2.7-4.7 9.1-4.7 11.8 0C271.5 234.9 288 261.5 288 288c0 17.7-14.3 32-32 32z"
          fill={fillColor}
        />
      </Svg>
    </Animated.View>
  );
});

export default FlameAnimated;
