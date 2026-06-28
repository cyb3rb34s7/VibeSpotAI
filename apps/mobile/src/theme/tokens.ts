export const colors = {
  background: "#0F1014",
  backgroundAlt: "#171922",
  surface: "#181A20",
  surfaceHigh: "#242730",
  surfaceGlass: "rgba(24, 26, 32, 0.86)",
  surfaceGlassStrong: "rgba(36, 39, 48, 0.92)",
  border: "rgba(255, 255, 255, 0.08)",
  text: "#F2F1EA",
  textSoft: "#D7D8CC",
  muted: "#A8AD9A",
  lime: "#BDF44A",
  onLime: "#172000",
  coral: "#FF9A7A",
  mapBase: "#171A19",
  mapLine: "rgba(189, 244, 74, 0.12)",
} as const;

export const spacing = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 26,
  xl: 34,
} as const;

export const radii = {
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

export const typography = {
  hero: 38,
  heading: 25,
  title: 20,
  body: 16,
  small: 13,
  micro: 11,
} as const;
