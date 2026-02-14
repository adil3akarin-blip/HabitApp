import React, { useEffect, useCallback } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  runOnJS,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { spring } from '../../motion/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Particle = {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
  angle: number;
  distance: number;
};

type CelebrationBurstProps = {
  isActive: boolean;
  originX?: number;
  originY?: number;
  colors?: string[];
  particleCount?: number;
  onComplete?: () => void;
  reduceMotion?: boolean;
};

const DEFAULT_COLORS = ['#FFD93D', '#FF6B35', '#6BCB77', '#4D96FF', '#9B59B6'];

const AnimatedView = Animated.View;

const ParticleView = React.memo(function ParticleView({
  particle,
  isActive,
}: {
  particle: Particle;
  isActive: boolean;
}) {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      progress.value = withDelay(
        particle.delay,
        withSpring(1, { damping: 12, stiffness: 100 })
      );
      opacity.value = withDelay(
        particle.delay,
        withSequence(
          withTiming(1, { duration: 100 }),
          withDelay(400, withTiming(0, { duration: 300 }))
        )
      );
    } else {
      progress.value = 0;
      opacity.value = 0;
    }
  }, [isActive]);

  const style = useAnimatedStyle(() => {
    const translateX = interpolate(progress.value, [0, 1], [0, Math.cos(particle.angle) * particle.distance]);
    const translateY = interpolate(progress.value, [0, 1], [0, Math.sin(particle.angle) * particle.distance]);
    const scale = interpolate(progress.value, [0, 0.5, 1], [0, 1.2, 0.6]);
    const rotate = interpolate(progress.value, [0, 1], [0, 360]);

    return {
      transform: [
        { translateX },
        { translateY },
        { scale },
        { rotate: `${rotate}deg` },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <AnimatedView
      style={[
        styles.particle,
        {
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.color,
          borderRadius: particle.size / 2,
        },
        style,
      ]}
    />
  );
});

export const CelebrationBurst = React.memo(function CelebrationBurst({
  isActive,
  originX = SCREEN_WIDTH / 2,
  originY = 200,
  colors = DEFAULT_COLORS,
  particleCount = 12,
  onComplete,
  reduceMotion = false,
}: CelebrationBurstProps) {
  const [particles, setParticles] = React.useState<Particle[]>([]);

  const generateParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      newParticles.push({
        id: i,
        x: originX,
        y: originY,
        color: colors[i % colors.length],
        size: 6 + Math.random() * 6,
        delay: i * 20,
        angle,
        distance: 40 + Math.random() * 40,
      });
    }
    return newParticles;
  }, [originX, originY, colors, particleCount]);

  useEffect(() => {
    if (isActive && !reduceMotion) {
      setParticles(generateParticles());
      const timeout = setTimeout(() => {
        onComplete?.();
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [isActive, reduceMotion]);

  if (!isActive || reduceMotion) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((particle) => (
        <ParticleView key={particle.id} particle={particle} isActive={isActive} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
  },
});

export default CelebrationBurst;
