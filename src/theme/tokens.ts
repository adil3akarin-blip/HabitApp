export const colors = {
  bg: "#070A12",
  text: "rgba(255,255,255,0.92)",
  textMuted: "rgba(255,255,255,0.65)",
  textFaint: "rgba(255,255,255,0.45)",

  glass: "rgba(255,255,255,0.06)",
  glassStrong: "rgba(255,255,255,0.10)",
  border: "rgba(255,255,255,0.12)",

  accentA: "#7C3AED",
  accentB: "#22D3EE",
  danger: "#FB7185",
};

export const radii = {
  card: 14,
  modal: 20,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
};

export const shadow = {
  shadowColor: "#000",
  shadowOpacity: 0.25,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 8 },
  elevation: 6,
};
