import React, { forwardRef, useCallback, useImperativeHandle } from 'react';
import { View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming
} from 'react-native-reanimated';

export type ConfettiRef = {
  play: () => void;
};

type ConfettiProps = {
  /** Container size */
  size?: number;
  /** Primary color (will generate variations) */
  color?: string;
  /** Number of confetti pieces */
  count?: number;
  reduceMotion?: boolean;
};

type ConfettiPiece = {
  id: number;
  color: string;
  size: number;
  startX: number;
  rotation: number;
  delay: number;
};

const ConfettiInner = forwardRef<ConfettiRef, ConfettiProps>(
  function Confetti(
    {
      size = 200,
      color = '#E8A838',
      count = 20,
      reduceMotion = false,
    },
    ref,
  ) {
    const progress = useSharedValue(0);

    // Generate confetti pieces with random properties
    const pieces: ConfettiPiece[] = Array.from({ length: count }, (_, i) => {
      const hue = getHue(color);
      const variation = (Math.random() - 0.5) * 60;
      const pieceColor = `hsl(${hue + variation}, 70%, ${50 + Math.random() * 20}%)`;
      
      return {
        id: i,
        color: pieceColor,
        size: 4 + Math.random() * 4,
        startX: Math.random() * size,
        rotation: Math.random() * 360,
        delay: Math.random() * 100,
      };
    });

    const play = useCallback(() => {
      if (reduceMotion) {
        progress.value = 1;
        progress.value = withDelay(300, withTiming(0, { duration: 100 }));
        return;
      }

      // Reset
      progress.value = 0;

      // Animate confetti falling
      progress.value = withTiming(1, {
        duration: 1200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }, [reduceMotion]);

    useImperativeHandle(ref, () => ({ play }), [play]);

    return (
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size * 1.5,
          top: -size * 0.3,
          left: -size / 2,
          overflow: 'visible',
        }}
        pointerEvents="none"
      >
        {pieces.map((piece) => (
          <ConfettiPiece
            key={piece.id}
            piece={piece}
            progress={progress}
            containerSize={size}
          />
        ))}
      </View>
    );
  },
);

function ConfettiPiece({
  piece,
  progress,
  containerSize,
}: {
  piece: ConfettiPiece;
  progress: ReturnType<typeof useSharedValue<number>>;
  containerSize: number;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;
    
    // Two-phase animation: burst out, then fall
    const burstPhase = Math.min(p * 3, 1);
    const fallPhase = Math.max((p - 0.3) / 0.7, 0);
    
    // Initial burst outward from center
    const burstX = (piece.startX - containerSize / 2) * burstPhase;
    const burstY = -20 * burstPhase;
    
    // Then fall with gravity (accelerating)
    const fallDistance = containerSize * 1.8;
    const fallY = fallPhase * fallPhase * fallDistance;
    
    // Horizontal drift during fall
    const driftAmount = 40;
    const driftX = Math.sin(fallPhase * Math.PI * 2.5) * driftAmount * fallPhase;
    
    const translateX = containerSize / 2 + burstX + driftX;
    const translateY = burstY + fallY;
    
    // Rotation
    const rotate = piece.rotation + p * 720;
    
    // Fade out at the end
    const opacity = p < 0.85 ? 1 : 1 - (p - 0.85) * 6.67;
    
    // Scale variation for depth
    const scale = 0.7 + Math.sin(p * Math.PI * 1.5) * 0.5;

    return {
      position: 'absolute',
      left: translateX,
      top: translateY,
      width: piece.size,
      height: piece.size,
      backgroundColor: piece.color,
      borderRadius: piece.size / 4,
      opacity,
      transform: [
        { rotate: `${rotate}deg` },
        { scale },
      ],
    };
  });

  return <Animated.View style={animatedStyle} />;
}

// Helper to extract hue from hex color
function getHue(hexColor: string): number {
  // Simple conversion - assumes hex format
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let hue = 0;
  if (delta !== 0) {
    if (max === r) {
      hue = 60 * (((g - b) / delta) % 6);
    } else if (max === g) {
      hue = 60 * ((b - r) / delta + 2);
    } else {
      hue = 60 * ((r - g) / delta + 4);
    }
  }

  return hue < 0 ? hue + 360 : hue;
}

export const Confetti = React.memo(ConfettiInner);
export default Confetti;
