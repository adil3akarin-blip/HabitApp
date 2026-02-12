import { WithSpringConfig, WithTimingConfig, Easing } from 'react-native-reanimated';

// Press feedback
export const pressScaleDown = 0.97;
export const pressOpacityDown = 0.92;

// Durations
export const DURATION_PRESS = 100;
export const DURATION_MICRO = 200;
export const DURATION_FADE_IN = 180;
export const DURATION_FADE_OUT = 140;
export const DURATION_SCREEN = 340;

// Stagger
export const STAGGER_DELAY = 50;
export const STAGGER_DELAY_FAST = 35;

// Springs
export const springPress: WithSpringConfig = {
  damping: 18,
  stiffness: 220,
};

export const springBounce: WithSpringConfig = {
  damping: 12,
  stiffness: 400,
};

export const springGentle: WithSpringConfig = {
  damping: 20,
  stiffness: 180,
};

export const springSnappy: WithSpringConfig = {
  damping: 15,
  stiffness: 300,
};

// Timing configs
export const timingFadeIn: WithTimingConfig = {
  duration: DURATION_FADE_IN,
  easing: Easing.out(Easing.cubic),
};

export const timingFadeOut: WithTimingConfig = {
  duration: DURATION_FADE_OUT,
  easing: Easing.in(Easing.cubic),
};

export const timingMicro: WithTimingConfig = {
  duration: DURATION_MICRO,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

// Celebration
export const CELEBRATION_DURATION = 600;
export const PARTICLE_COUNT = 8;
