import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../../theme/tokens';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface EmptyStateIllustrationProps {
  size?: number;
  color?: string;
  secondaryColor?: string;
  reduceMotion?: boolean;
}

// SVG paths for a growing seedling
const STEM_PATH = 'M40 70 Q40 50 40 35';
const STEM_LENGTH = 35;

const LEAF_LEFT = 'M40 45 Q30 38 25 42 Q28 48 40 45';
const LEAF_LEFT_LENGTH = 30;

const LEAF_RIGHT = 'M40 38 Q50 30 55 35 Q52 42 40 38';
const LEAF_RIGHT_LENGTH = 32;

// Sparkle positions
const SPARKLES = [
  { cx: 20, cy: 25, delay: 400 },
  { cx: 60, cy: 20, delay: 600 },
  { cx: 15, cy: 50, delay: 800 },
  { cx: 65, cy: 45, delay: 500 },
];

const EmptyStateIllustration = React.memo(function EmptyStateIllustration({
  size = 120,
  color = colors.accentB,
  secondaryColor = colors.accentA,
  reduceMotion = false,
}: EmptyStateIllustrationProps) {
  const stemProgress = useSharedValue(0);
  const leafLeftProgress = useSharedValue(0);
  const leafRightProgress = useSharedValue(0);
  const sparkleAnim = useSharedValue(0);
  const breathe = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) {
      stemProgress.value = 1;
      leafLeftProgress.value = 1;
      leafRightProgress.value = 1;
      return;
    }

    // Draw stem
    stemProgress.value = withDelay(
      200,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }),
    );

    // Draw leaves after stem
    leafLeftProgress.value = withDelay(
      700,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }),
    );
    leafRightProgress.value = withDelay(
      900,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }),
    );

    // Sparkles loop
    sparkleAnim.value = withDelay(
      1100,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );

    // Gentle breathing
    breathe.value = withDelay(
      1200,
      withRepeat(
        withSequence(
          withTiming(1.03, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
  }, [reduceMotion]);

  const stemProps = useAnimatedProps(() => ({
    strokeDashoffset: STEM_LENGTH * (1 - stemProgress.value),
  }));

  const leafLeftProps = useAnimatedProps(() => ({
    strokeDashoffset: LEAF_LEFT_LENGTH * (1 - leafLeftProgress.value),
    fillOpacity: leafLeftProgress.value * 0.2,
  }));

  const leafRightProps = useAnimatedProps(() => ({
    strokeDashoffset: LEAF_RIGHT_LENGTH * (1 - leafRightProgress.value),
    fillOpacity: leafRightProgress.value * 0.2,
  }));

  const breatheStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathe.value }],
  }));

  return (
    <Animated.View style={[styles.container, { width: size, height: size }, breatheStyle]}>
      <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
        {/* Ground dot */}
        <Circle cx={40} cy={72} r={3} fill={color} fillOpacity={0.3} />

        {/* Stem — draw-on */}
        <AnimatedPath
          d={STEM_PATH}
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={STEM_LENGTH}
          animatedProps={stemProps}
        />

        {/* Left leaf — draw-on + fill */}
        <AnimatedPath
          d={LEAF_LEFT}
          stroke={color}
          strokeWidth={1.5}
          fill={color}
          strokeDasharray={LEAF_LEFT_LENGTH}
          animatedProps={leafLeftProps}
        />

        {/* Right leaf — draw-on + fill */}
        <AnimatedPath
          d={LEAF_RIGHT}
          stroke={secondaryColor}
          strokeWidth={1.5}
          fill={secondaryColor}
          strokeDasharray={LEAF_RIGHT_LENGTH}
          animatedProps={leafRightProps}
        />

        {/* Sparkles */}
        {SPARKLES.map((s, i) => (
          <SparklePoint
            key={i}
            cx={s.cx}
            cy={s.cy}
            delay={s.delay}
            color={i % 2 === 0 ? color : secondaryColor}
            anim={sparkleAnim}
            index={i}
          />
        ))}
      </Svg>
    </Animated.View>
  );
});

function SparklePoint({
  cx,
  cy,
  color,
  anim,
  index,
}: {
  cx: number;
  cy: number;
  delay: number;
  color: string;
  anim: { value: number };
  index: number;
}) {
  const props = useAnimatedProps(() => {
    // Offset each sparkle's phase
    const phase = (anim.value + index * 0.25) % 1;
    const opacity = interpolate(phase, [0, 0.5, 1], [0.2, 0.8, 0.2]);
    const r = interpolate(phase, [0, 0.5, 1], [1, 2.5, 1]);
    return { opacity, r };
  });

  return (
    <AnimatedCircle
      cx={cx}
      cy={cy}
      fill={color}
      animatedProps={props}
    />
  );
}

export default EmptyStateIllustration;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
