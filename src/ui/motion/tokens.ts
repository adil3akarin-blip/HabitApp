import { Easing, WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';

// ─── SVG Motion Tokens ──────────────────────────────────
// Evergreen, clarity-first motion for SVG components.
// Complements /src/motion/tokens.ts (app-wide tokens).
// ─────────────────────────────────────────────────────────

export const svgDuration = {
  drawOn: 380,
  ringFill: 500,
  sparkleLife: 600,
  pressFeedback: 120,
  staggerItem: 60,
  fadeIn: 220,
} as const;

export const svgTiming: Record<string, WithTimingConfig> = {
  drawOn: {
    duration: svgDuration.drawOn,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  },
  ringFill: {
    duration: svgDuration.ringFill,
    easing: Easing.bezier(0.05, 0.7, 0.1, 1),
  },
  sparkleIn: {
    duration: 280,
    easing: Easing.bezier(0.0, 0.0, 0.2, 1),
  },
  sparkleOut: {
    duration: 320,
    easing: Easing.bezier(0.4, 0, 1, 1),
  },
  pressFeedbackIn: {
    duration: svgDuration.pressFeedback,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  },
  fadeIn: {
    duration: svgDuration.fadeIn,
    easing: Easing.bezier(0.2, 0, 0, 1),
  },
};

export const svgSpring: Record<string, WithSpringConfig> = {
  pressBounce: {
    damping: 18,
    stiffness: 400,
    mass: 0.7,
  },
  sparkle: {
    damping: 8,
    stiffness: 260,
    mass: 0.6,
  },
  staggerItem: {
    damping: 20,
    stiffness: 300,
    mass: 0.9,
  },
};

export const svgEntrance = {
  slideUp: 14,
  scaleFrom: 0.92,
  sparkleScale: 1.4,
} as const;

export const svgPress = {
  depth: 0.88,
  depthSubtle: 0.94,
} as const;
