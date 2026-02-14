// ─── Warm Ink ───────────────────────────────────────────
// Editorial minimalism · warm charcoal · amber accent
// ────────────────────────────────────────────────────────

export const colors = {
  // Backgrounds — warm charcoal, not cold blue-black
  bg: "#141210",
  bgElevated: "#1C1A17",
  bgCard: "#1F1D19",

  // Text — warm whites
  text: "#F5F0E8",
  textSecondary: "#A8A196",
  textMuted: "rgba(245,240,232,0.65)",
  textFaint: "rgba(245,240,232,0.35)",

  // Surfaces
  glass: "rgba(245,240,232,0.04)",
  glassStrong: "rgba(245,240,232,0.08)",
  border: "rgba(245,240,232,0.08)",
  borderStrong: "rgba(245,240,232,0.14)",

  // Accent — warm amber/gold
  accentA: "#E8A838",
  accentB: "#D4793A",

  // Semantic
  danger: "#E05C5C",
  success: "#5CAE7A",
};

export const radii = {
  xs: 6,
  card: 12,
  button: 10,
  modal: 16,
  pill: 999,
  circle: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  hero: {
    fontSize: 34,
    fontWeight: "800" as const,
    letterSpacing: -0.8,
  },
  title: {
    fontSize: 26,
    fontWeight: "700" as const,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: "500" as const,
  },
  caption: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  small: {
    fontSize: 11,
    fontWeight: "500" as const,
    letterSpacing: 0.3,
    textTransform: "uppercase" as const,
  },
};

// ─── Glow shadows ─────────────────────────────────────────
// Use sparingly: completed states, streak highlights, accent CTAs
export function glowShadow(
  color: string,
  radius: number = 12,
  opacity: number = 0.4,
) {
  return {
    shadowColor: color,
    shadowOpacity: opacity,
    shadowRadius: radius,
    shadowOffset: { width: 0, height: 0 },
    elevation: Math.round(radius * 0.8),
  };
}

export const shadowLight = {
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 3,
};

export const shadowMedium = {
  shadowColor: "#000",
  shadowOpacity: 0.15,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 4 },
  elevation: 6,
};

// ─── Gradient presets ─────────────────────────────────────
export const gradients = {
  warmGlow: [colors.accentA + "00", colors.accentA + "18"],
  cardShine: ["rgba(245,240,232,0.06)", "rgba(245,240,232,0.01)"],
  onboardingAmber: [colors.bg, "#1A1510"],
  onboardingCopper: [colors.bg, "#1A1210"],
  onboardingForest: [colors.bg, "#101A14"],
};
