import { useReducedMotion as useReanimatedReducedMotion } from 'react-native-reanimated';
import { duration, spring, timing } from './tokens';

/**
 * Returns motion-safe values. When Reduce Motion is on,
 * durations shrink to near-zero and springs become stiff.
 */
export function useMotionSafe() {
  const reduced = useReanimatedReducedMotion();

  return {
    reduced,
    duration: reduced
      ? { instant: 0, fast: 0, normal: 0, emphasis: 0, dramatic: 0, stagger: 0 }
      : duration,
    timing: reduced
      ? {
          snappy: { duration: 0 },
          standard: { duration: 0 },
          emphasized: { duration: 0 },
          dramatic: { duration: 0 },
          exit: { duration: 0 },
        }
      : timing,
    spring: reduced
      ? {
          tight: { damping: 100, stiffness: 1000, mass: 1 },
          soft: { damping: 100, stiffness: 1000, mass: 1 },
          snappy: { damping: 100, stiffness: 1000, mass: 1 },
          bouncy: { damping: 100, stiffness: 1000, mass: 1 },
        }
      : spring,
  };
}
