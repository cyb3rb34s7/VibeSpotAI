import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

import type { NearbyPlace } from "../api/client";
import { colors, radii, spacing, typography } from "../theme/tokens";

type MapPreviewProps = {
  places: NearbyPlace[];
};

export function MapPreview({ places }: MapPreviewProps) {
  const featured = places.slice(0, 5);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["rgba(15,16,20,0.2)", "rgba(15,16,20,0.86)"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.gridLayer}>
        {Array.from({ length: 8 }).map((_, index) => (
          <View key={index} style={[styles.gridLine, { top: 34 + index * 42 }]} />
        ))}
        {Array.from({ length: 5 }).map((_, index) => (
          <View key={index} style={[styles.verticalLine, { left: 38 + index * 68 }]} />
        ))}
      </View>

      {featured.map((place, index) => (
        <View key={place.id} style={[styles.pin, pinPositions[index] ?? pinPositions[0]]}>
          <View style={styles.pinGlow} />
          <View style={styles.pinCore}>
            <Text style={styles.pinText}>{place.match_percent}</Text>
          </View>
        </View>
      ))}

      <View style={styles.mapLabel}>
        <Text style={styles.mapLabelTitle}>Koramangala live grid</Text>
        <Text style={styles.mapLabelMeta}>{places.length} seeded spots nearby</Text>
      </View>
    </View>
  );
}

const pinPositions = [
  { top: "35%", left: "48%" },
  { top: "45%", left: "64%" },
  { top: "52%", left: "30%" },
  { top: "27%", left: "70%" },
  { top: "61%", left: "53%" },
] as const;

const styles = StyleSheet.create({
  container: {
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    height: 270,
    overflow: "hidden",
    backgroundColor: colors.mapBase,
  },
  gridLayer: {
    bottom: 0,
    left: 0,
    opacity: 0.5,
    position: "absolute",
    right: 0,
    top: 0,
  },
  gridLine: {
    backgroundColor: colors.mapLine,
    height: 1,
    left: -20,
    position: "absolute",
    right: -20,
    transform: [{ rotate: "-12deg" }],
  },
  verticalLine: {
    backgroundColor: colors.mapLine,
    bottom: -20,
    position: "absolute",
    top: -20,
    transform: [{ rotate: "18deg" }],
    width: 1,
  },
  pin: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
  },
  pinGlow: {
    backgroundColor: colors.lime,
    borderRadius: 999,
    height: 52,
    opacity: 0.2,
    position: "absolute",
    width: 52,
  },
  pinCore: {
    alignItems: "center",
    backgroundColor: colors.lime,
    borderRadius: 999,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  pinText: {
    color: colors.onLime,
    fontSize: 10,
    fontWeight: "900",
  },
  mapLabel: {
    bottom: spacing.md,
    left: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    position: "absolute",
    backgroundColor: colors.surfaceGlassStrong,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  mapLabelTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800",
  },
  mapLabelMeta: {
    color: colors.muted,
    fontSize: typography.small,
    marginTop: 2,
  },
});
