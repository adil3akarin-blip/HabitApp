import { Easing, WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';

// ─── Warm Ink Motion Tokens ─────────────────────────────
// Editorial weight · ink-on-paper settle · decisive entries
// ─────────────────────────────────────────────────────────

// Durations — utility is fast, emotion is slower
export const duration = {
  instant: 90,
  fast: 140,
  normal: 200,
  emphasis: 280,
  dramatic: 420,
  stagger: 50, // delay between staggered items
} as const;

// Timing configs — for non-spring animations
export const timing: Record<string, WithTimingConfig> = {
  // Quick utility — button feedback, micro state changes
  snappy: {
    duration: duration.fast,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  },
  // Standard — most transitions
  standard: {
    duration: duration.normal,
    easing: Easing.bezier(0.2, 0, 0, 1),
  },
  // Emphasized — entrances, reveals
  emphasized: {
    duration: duration.emphasis,
    easing: Easing.bezier(0.05, 0.7, 0.1, 1),
  },
  // Dramatic — hero moments, goal completion
  dramatic: {
    duration: duration.dramatic,
    easing: Easing.bezier(0.0, 0.0, 0.2, 1),
  },
  // Exit — quick, decisive, no lingering
  exit: {
    duration: duration.fast,
    easing: Easing.bezier(0.4, 0, 1, 1),
  },
};

// Spring configs — for physics-based motion
export const spring: Record<string, WithSpringConfig> = {
  // Tight — quick settle, minimal overshoot (buttons, toggles)
  tight: {
    damping: 20,
    stiffness: 400,
    mass: 0.8,
  },
  // Soft — calm settle, editorial feel (cards, sections)
  soft: {
    damping: 18,
    stiffness: 200,
    mass: 1,
  },
  // Snappy — crisp, immediate (press feedback)
  snappy: {
    damping: 22,
    stiffness: 500,
    mass: 0.6,
  },
  // Bouncy — playful overshoot (use sparingly: celebrations)
  bouncy: {
    damping: 10,
    stiffness: 300,
    mass: 0.8,
  },
};

// Entrance offsets — how far elements travel on enter
export const entrance = {
  slideUp: 16,       // subtle card/section slide
  slideUpLarge: 28,  // hero entrance
  fadeScale: 0.96,   // scale-from for fade+scale entries
} as const;

// Press feedback
export const press = {
  scale: 0.97,       // card press
  scaleSmall: 0.92,  // button press
  scaleTiny: 0.85,   // toggle/icon press
} as const;
