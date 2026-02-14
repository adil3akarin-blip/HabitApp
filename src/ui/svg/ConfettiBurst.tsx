import React, { forwardRef, useCallback, useImperativeHandle, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

export type ConfettiBurstRef = {
  play: () => void;
};

type ConfettiBurstProps = {
  colors?: string[];
  particleCount?: number;
  duration?: number;
  spread?: number;
  startVelocity?: number;
};

type Particle = {
  id: number;
  color: string;
  size: number;
  angle: number;
  velocity: number;
  rotationSpeed: number;
  shape: 'square' | 'circle' | 'rectangle';
};

const ConfettiBurstInner = forwardRef<ConfettiBurstRef, ConfettiBurstProps>(
  function ConfettiBurst(
    {
      colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3'],
      particleCount = 24,
      duration = 1400,
      spread = 120,
      startVelocity = 180,
    },
    ref,
  ) {
    const progress = useSharedValue(0);
    const isPlaying = useSharedValue(false);

    const particles: Particle[] = useMemo(() => {
      return Array.from({ length: particleCount }, (_, i) => {
        const angleSpread = spread * (Math.PI / 180);
        const baseAngle = -Math.PI / 2; // Start pointing up
        const angle = baseAngle + (Math.random() - 0.5) * angleSpread;
        
        return {
          id: i,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 6 + Math.random() * 6,
          angle,
          velocity: startVelocity * (0.6 + Math.random() * 0.4),
          rotationSpeed: (Math.random() - 0.5) * 1080,
          shape: ['square', 'circle', 'rectangle'][Math.floor(Math.random() * 3)] as Particle['shape'],
        };
      });
    }, [colors, particleCount, spread, startVelocity]);

    const play = useCallback(() => {
      'worklet';
      isPlaying.value = true;
      progress.value = 0;
      progress.value = withTiming(
        1,
        {
          duration,
          easing: Easing.linear,
        },
        (finished) => {
          if (finished) {
            isPlaying.value = false;
          }
        },
      );
    }, [duration]);

    useImperativeHandle(ref, () => ({ play }), [play]);

    const containerStyle = useAnimatedStyle(() => ({
      opacity: isPlaying.value ? 1 : 0,
    }));

    return (
      <Animated.View style={[styles.container, containerStyle]} pointerEvents="none">
        {particles.map((particle) => (
          <ParticleView
            key={particle.id}
            particle={particle}
            progress={progress}
            duration={duration}
          />
        ))}
      </Animated.View>
    );
  },
);

function ParticleView({
  particle,
  progress,
  duration,
}: {
  particle: Particle;
  progress: ReturnType<typeof useSharedValue<number>>;
  duration: number;
}) {
  const gravity = 600;
  
  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const t = p * (duration / 1000);
    
    // Physics: position = v0*t + 0.5*g*t^2
    const vx = Math.cos(particle.angle) * particle.velocity;
    const vy = Math.sin(particle.angle) * particle.velocity;
    
    const x = vx * t;
    const y = vy * t + 0.5 * gravity * t * t;
    
    // Rotation
    const rotation = particle.rotationSpeed * p;
    
    // Fade out in last 30%
    const opacity = interpolate(p, [0, 0.7, 1], [1, 1, 0]);
    
    // Scale down slightly at end
    const scale = interpolate(p, [0, 0.5, 1], [1, 1.1, 0.6]);

    return {
      opacity,
      transform: [
        { translateX: x },
        { translateY: y },
        { rotate: `${rotation}deg` },
        { scale },
      ],
    };
  });

  const shapeStyle = useMemo(() => {
    const base = {
      width: particle.size,
      height: particle.shape === 'rectangle' ? particle.size * 0.4 : particle.size,
      backgroundColor: particle.color,
    };
    
    if (particle.shape === 'circle') {
      return { ...base, borderRadius: particle.size / 2 };
    }
    return { ...base, borderRadius: 2 };
  }, [particle]);

  return (
    <Animated.View style={[styles.particle, shapeStyle, animatedStyle]} />
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    zIndex: 9999,
  },
  particle: {
    position: 'absolute',
  },
});

export const ConfettiBurst = React.memo(ConfettiBurstInner);
export default ConfettiBurst;
