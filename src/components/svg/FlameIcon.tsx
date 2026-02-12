import React, { useEffect } from 'react';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface FlameIconProps {
  size?: number;
  color?: string;
  animate?: boolean;
  reduceMotion?: boolean;
}

// Two flame shapes for subtle morph-like effect via opacity crossfade
// Main flame body
const FLAME_MAIN =
  'M12 2C12 2 7 8.5 7 13a5 5 0 0 0 10 0c0-4.5-5-11-5-11z';
// Inner flame highlight
const FLAME_INNER =
  'M12 9c0 0-2.5 3.5-2.5 5.5a2.5 2.5 0 0 0 5 0C14.5 12.5 12 9 12 9z';

const FlameIcon = React.memo(function FlameIcon({
  size = 14,
  color = '#FF6B35',
  animate = true,
  reduceMotion = false,
}: FlameIconProps) {
  const flicker = useSharedValue(0);

  useEffect(() => {
    if (animate && !reduceMotion) {
      flicker.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 600, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      );
    } else {
      flicker.value = 0;
    }
  }, [animate, reduceMotion]);

  const mainProps = useAnimatedProps(() => {
    const opacity = interpolate(flicker.value, [0, 1], [1, 0.85]);
    const scaleY = interpolate(flicker.value, [0, 1], [1, 0.95]);
    return {
      opacity,
      // transform as string for SVG
      transform: `translate(12, 18) scale(1, ${scaleY}) translate(-12, -18)`,
    };
  });

  const innerProps = useAnimatedProps(() => {
    const opacity = interpolate(flicker.value, [0, 1], [0.7, 1]);
    const scaleY = interpolate(flicker.value, [0, 1], [1, 1.08]);
    return {
      opacity,
      transform: `translate(12, 14.5) scale(1, ${scaleY}) translate(-12, -14.5)`,
    };
  });

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <AnimatedPath
        d={FLAME_MAIN}
        fill={color}
        animatedProps={mainProps}
      />
      <AnimatedPath
        d={FLAME_INNER}
        fill="#fff"
        fillOpacity={0.4}
        animatedProps={innerProps}
      />
    </Svg>
  );
});

export default FlameIcon;
