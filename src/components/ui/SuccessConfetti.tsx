import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { CELEBRATION_DURATION, PARTICLE_COUNT } from '../../ui/motion';

interface SuccessConfettiProps {
  active: boolean;
  color: string;
  onComplete?: () => void;
}

const PARTICLE_COLORS_LIGHT = [
  'rgba(255,255,255,0.9)',
  'rgba(255,255,255,0.7)',
  'rgba(255,255,255,0.5)',
];

interface ParticleProps {
  index: number;
  color: string;
  active: boolean;
}

function Particle({ index, color, active }: ParticleProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const angle = (index / PARTICLE_COUNT) * Math.PI * 2;
  const radius = 28 + Math.random() * 18;
  const targetX = Math.cos(angle) * radius;
  const targetY = Math.sin(angle) * radius;
  const delay = index * 25;
  const particleColor = index % 2 === 0 ? color : PARTICLE_COLORS_LIGHT[index % 3];
  const size = 4 + (index % 3) * 2;

  useEffect(() => {
    if (active) {
      scale.value = withDelay(
        delay,
        withSequence(
          withTiming(1.2, { duration: 120, easing: Easing.out(Easing.cubic) }),
          withTiming(0, { duration: 380, easing: Easing.in(Easing.cubic) }),
        ),
      );
      opacity.value = withDelay(
        delay,
        withSequence(
          withTiming(1, { duration: 80 }),
          withDelay(200, withTiming(0, { duration: 300 })),
        ),
      );
      translateX.value = withDelay(
        delay,
        withTiming(targetX, { duration: 450, easing: Easing.out(Easing.cubic) }),
      );
      translateY.value = withDelay(
        delay,
        withTiming(targetY, { duration: 450, easing: Easing.out(Easing.cubic) }),
      );
    } else {
      scale.value = 0;
      opacity.value = 0;
      translateX.value = 0;
      translateY.value = 0;
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: particleColor,
        },
        animatedStyle,
      ]}
    />
  );
}

export default function SuccessConfetti({ active, color, onComplete }: SuccessConfettiProps) {
  const ringScale = useSharedValue(0);
  const ringOpacity = useSharedValue(0);

  useEffect(() => {
    if (active) {
      ringScale.value = withSequence(
        withTiming(1.6, { duration: 300, easing: Easing.out(Easing.cubic) }),
        withTiming(2, { duration: 200 }),
      );
      ringOpacity.value = withSequence(
        withTiming(0.4, { duration: 100 }),
        withDelay(200, withTiming(0, { duration: 300 })),
      );

      if (onComplete) {
        const timer = setTimeout(() => {
          runOnJS(onComplete)();
        }, CELEBRATION_DURATION);
        return () => clearTimeout(timer);
      }
    } else {
      ringScale.value = 0;
      ringOpacity.value = 0;
    }
  }, [active]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.ring,
          { borderColor: color },
          ringStyle,
        ]}
      />
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <Particle key={i} index={i} color={color} active={active} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
  },
  particle: {
    position: 'absolute',
  },
});
