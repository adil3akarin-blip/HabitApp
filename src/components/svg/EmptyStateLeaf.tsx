import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { colors } from '../../theme/tokens';
import { spring } from '../../motion/tokens';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedView = Animated.View;

type EmptyStateLeafProps = {
  size?: number;
  color?: string;
  reduceMotion?: boolean;
};

const LEAF_PATH_LENGTH = 120;
const STEM_PATH_LENGTH = 40;

export const EmptyStateLeaf = React.memo(function EmptyStateLeaf({
  size = 80,
  color = colors.accentA,
  reduceMotion = false,
}: EmptyStateLeafProps) {
  const leafDraw = useSharedValue(reduceMotion ? 1 : 0);
  const stemDraw = useSharedValue(reduceMotion ? 1 : 0);
  const scale = useSharedValue(reduceMotion ? 1 : 0.8);
  const rotation = useSharedValue(0);
  const sparkle1 = useSharedValue(0);
  const sparkle2 = useSharedValue(0);
  const sparkle3 = useSharedValue(0);

  useEffect(() => {
    if (!reduceMotion) {
      // Stem draws first
      stemDraw.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
      // Then leaf draws
      leafDraw.value = withDelay(
        200,
        withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
      );
      // Scale up
      scale.value = withDelay(100, withSpring(1, spring.soft));
      // Gentle sway
      rotation.value = withDelay(
        800,
        withRepeat(
          withSequence(
            withTiming(3, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
            withTiming(-3, { duration: 2000, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          true
        )
      );
      // Sparkles appear sequentially
      sparkle1.value = withDelay(600, withSpring(1, spring.bouncy));
      sparkle2.value = withDelay(750, withSpring(1, spring.bouncy));
      sparkle3.value = withDelay(900, withSpring(1, spring.bouncy));
    }
  }, [reduceMotion]);

  const leafAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: LEAF_PATH_LENGTH * (1 - leafDraw.value),
    fillOpacity: interpolate(leafDraw.value, [0.5, 1], [0, 0.15]),
  }));

  const stemAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: STEM_PATH_LENGTH * (1 - stemDraw.value),
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: interpolate(scale.value, [0.8, 1], [0, 1]),
  }));

  const sparkle1Style = useAnimatedStyle(() => ({
    transform: [{ scale: sparkle1.value }],
    opacity: sparkle1.value,
  }));

  const sparkle2Style = useAnimatedStyle(() => ({
    transform: [{ scale: sparkle2.value }],
    opacity: sparkle2.value,
  }));

  const sparkle3Style = useAnimatedStyle(() => ({
    transform: [{ scale: sparkle3.value }],
    opacity: sparkle3.value,
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <AnimatedView style={containerStyle}>
        <Svg width={size} height={size} viewBox="0 0 80 80">
          <Defs>
            <LinearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={color} stopOpacity="1" />
              <Stop offset="100%" stopColor={color} stopOpacity="0.6" />
            </LinearGradient>
          </Defs>
          
          {/* Stem */}
          <AnimatedPath
            d="M40 70 Q40 50 40 40"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={STEM_PATH_LENGTH}
            animatedProps={stemAnimatedProps}
          />
          
          {/* Leaf */}
          <AnimatedPath
            d="M40 40 Q20 30 25 15 Q35 20 40 10 Q45 20 55 15 Q60 30 40 40"
            stroke="url(#leafGrad)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={color}
            strokeDasharray={LEAF_PATH_LENGTH}
            animatedProps={leafAnimatedProps}
          />
          
          {/* Center vein */}
          <Path
            d="M40 38 L40 18"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={0.5}
          />
        </Svg>
      </AnimatedView>
      
      {/* Sparkles */}
      <AnimatedView style={[styles.sparkle, { top: '15%', right: '20%' }, sparkle1Style]}>
        <Svg width={12} height={12} viewBox="0 0 24 24">
          <Path
            d="M12 2L13 9L20 10L13 11L12 18L11 11L4 10L11 9L12 2Z"
            fill={color}
            opacity={0.8}
          />
        </Svg>
      </AnimatedView>
      
      <AnimatedView style={[styles.sparkle, { top: '25%', left: '15%' }, sparkle2Style]}>
        <Svg width={8} height={8} viewBox="0 0 24 24">
          <Circle cx={12} cy={12} r={4} fill={color} opacity={0.6} />
        </Svg>
      </AnimatedView>
      
      <AnimatedView style={[styles.sparkle, { bottom: '35%', right: '15%' }, sparkle3Style]}>
        <Svg width={10} height={10} viewBox="0 0 24 24">
          <Path
            d="M12 2L13 9L20 10L13 11L12 18L11 11L4 10L11 9L12 2Z"
            fill={color}
            opacity={0.7}
          />
        </Svg>
      </AnimatedView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkle: {
    position: 'absolute',
  },
});

export default EmptyStateLeaf;
