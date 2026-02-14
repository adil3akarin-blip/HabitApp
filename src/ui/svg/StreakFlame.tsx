import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type StreakFlameProps = {
  streak: number;
  size?: number;
  animate?: boolean;
};

type FlameLevel = 'cold' | 'warm' | 'hot' | 'blazing' | 'legendary';

function getFlameLevel(streak: number): FlameLevel {
  if (streak < 1) return 'cold';
  if (streak < 7) return 'warm';
  if (streak < 30) return 'hot';
  if (streak < 100) return 'blazing';
  return 'legendary';
}

const FLAME_COLORS: Record<FlameLevel, { inner: string; outer: string; glow: string }> = {
  cold: {
    inner: '#9CA3AF',
    outer: '#6B7280',
    glow: 'transparent',
  },
  warm: {
    inner: '#FBBF24',
    outer: '#F59E0B',
    glow: '#F59E0B',
  },
  hot: {
    inner: '#FB923C',
    outer: '#EA580C',
    glow: '#EA580C',
  },
  blazing: {
    inner: '#60A5FA',
    outer: '#3B82F6',
    glow: '#3B82F6',
  },
  legendary: {
    inner: '#C084FC',
    outer: '#9333EA',
    glow: '#9333EA',
  },
};

function StreakFlameInner({ streak, size = 24, animate = true }: StreakFlameProps) {
  const level = getFlameLevel(streak);
  const colors = FLAME_COLORS[level];
  const isActive = streak > 0;

  const flicker = useSharedValue(0);
  const pulse = useSharedValue(1);
  const glow = useSharedValue(0);

  useEffect(() => {
    if (!animate || !isActive) return;

    // Flicker animation - organic flame movement with varied timing
    flicker.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1800, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
        withTiming(-0.3, { duration: 2200, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
        withTiming(0.5, { duration: 1600, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
        withTiming(-0.1, { duration: 2000, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
        withTiming(0.3, { duration: 1400, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
      ),
      -1,
      false,
    );

    // Pulse for hot+ streaks - breathing effect
    if (level === 'hot' || level === 'blazing' || level === 'legendary') {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: 700, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
          withTiming(1, { duration: 900, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
        ),
        -1,
        false,
      );
    }

    // Glow for blazing+ streaks - pulsing aura with offset timing
    if (level === 'blazing' || level === 'legendary') {
      glow.value = 0.3;
      glow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
          withTiming(0.3, { duration: 1200, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
        ),
        -1,
        false,
      );
    }
  }, [animate, isActive, level]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.6,
    transform: [{ scale: 1 + glow.value * 0.3 }],
  }));

  const flickerStyle = useAnimatedStyle(() => {
    // More dynamic flame movement with varied interpolation
    const translateY = interpolate(
      flicker.value,
      [-0.3, -0.1, 0.3, 0.5, 0.8],
      [1, -0.5, -1.5, -1, -2],
    );
    const translateX = interpolate(
      flicker.value,
      [-0.3, -0.1, 0.3, 0.5, 0.8],
      [-0.3, 0.4, -0.2, 0.3, -0.1],
    );
    const scaleY = interpolate(
      flicker.value,
      [-0.3, -0.1, 0.3, 0.5, 0.8],
      [0.96, 1.03, 0.98, 1.02, 0.97],
    );
    const scaleX = interpolate(
      flicker.value,
      [-0.3, -0.1, 0.3, 0.5, 0.8],
      [1.02, 0.98, 1.01, 0.99, 1.01],
    );
    return {
      transform: [{ translateX }, { translateY }, { scaleX }, { scaleY }],
    };
  });

  // Flame SVG path (stylized fire icon)
  const flamePath = "M12 2C12 2 8 6 8 10C8 12 9 14 10 15C9 14 7 13 7 10C7 7 9 4 12 2ZM12 2C12 2 16 6 16 10C16 12 15 14 14 15C15 14 17 13 17 10C17 7 15 4 12 2ZM12 6C12 6 10 9 10 11C10 13 11 14 12 15C13 14 14 13 14 11C14 9 12 6 12 6Z";

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Glow layer for blazing+ */}
      {(level === 'blazing' || level === 'legendary') && (
        <Animated.View style={[styles.glowLayer, { width: size * 1.5, height: size * 1.5 }, glowStyle]}>
          <View
            style={[
              styles.glowCircle,
              {
                backgroundColor: colors.glow,
                width: size,
                height: size,
                borderRadius: size / 2,
              },
            ]}
          />
        </Animated.View>
      )}

      {/* Main flame */}
      <Animated.View style={[styles.flameContainer, containerStyle]}>
        <Animated.View style={flickerStyle}>
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Defs>
              <LinearGradient id="flameGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <Stop offset="0%" stopColor={colors.outer} />
                <Stop offset="50%" stopColor={colors.inner} />
                <Stop offset="100%" stopColor={colors.inner} stopOpacity={0.8} />
              </LinearGradient>
            </Defs>
            <Path
              d="M12 2.5C12 2.5 6.5 7.5 6.5 12.5C6.5 16.5 9 19.5 12 19.5C15 19.5 17.5 16.5 17.5 12.5C17.5 7.5 12 2.5 12 2.5ZM12 17.5C10.5 17.5 9 16 9 14C9 12 10.5 9.5 12 7.5C13.5 9.5 15 12 15 14C15 16 13.5 17.5 12 17.5Z"
              fill="url(#flameGradient)"
            />
            {/* Inner flame core */}
            <Path
              d="M12 9C12 9 10 11.5 10 13.5C10 15 11 16 12 16C13 16 14 15 14 13.5C14 11.5 12 9 12 9Z"
              fill={colors.inner}
              opacity={0.9}
            />
          </Svg>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowLayer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowCircle: {
    opacity: 0.3,
  },
  flameContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const StreakFlame = React.memo(StreakFlameInner);
export default StreakFlame;
