import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { NearbyPlace } from "../api/client";
import { colors, radii, spacing, typography } from "../theme/tokens";
import { PressScale } from "./PressScale";

type FreshDropsPeekProps = {
  places: NearbyPlace[];
};

export function FreshDropsPeek({ places }: FreshDropsPeekProps) {
  const [revealed, setRevealed] = useState(1);
  const drops = places.slice(0, 3);
  const visibleRows = drops.slice(0, Math.min(drops.length, revealed + 1));

  if (drops.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.liveDot} />
        <Text style={styles.title}>{drops.length} fresh drops nearby</Text>
        <Text style={styles.meta}>rotates every open</Text>
      </View>

      {visibleRows.map((place, index) => {
        const isVisible = index < revealed;
        return (
          <PressScale
            accessibilityLabel={isVisible ? `${place.name} fresh drop` : "Reveal hidden drop"}
            accessibilityRole="button"
            haptic={isVisible ? "light" : "medium"}
            key={place.id}
            onPress={() => setRevealed(Math.min(3, revealed + 1))}
            pressedScale={0.98}
            style={[styles.dropRow, !isVisible && styles.hiddenDrop]}
          >
            <View style={styles.dropIcon}>
              <Feather color={isVisible ? colors.lime : colors.muted} name="zap" size={14} />
            </View>
            <View style={styles.dropCopy}>
              <Text style={styles.dropTitle}>
                {isVisible ? place.name : "Tap to reveal nearby signal"}
              </Text>
              <Text numberOfLines={1} style={styles.dropText}>
                {isVisible
                  ? place.reason || `${place.evidence_count} people shaped this signal`
                  : "A place near you is moving right now"}
              </Text>
            </View>
            <Text style={styles.distance}>{isVisible ? `${place.distance_m}m` : "?"}</Text>
          </PressScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceGlassStrong,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.sm,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  liveDot: {
    backgroundColor: colors.lime,
    borderRadius: radii.full,
    height: 8,
    shadowColor: colors.lime,
    shadowOpacity: 0.8,
    shadowRadius: 10,
    width: 8,
  },
  title: {
    color: colors.text,
    flex: 1,
    fontSize: typography.small,
    fontWeight: "900",
  },
  meta: {
    color: colors.muted,
    fontSize: typography.micro,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  dropRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.sm,
    paddingVertical: 9,
  },
  hiddenDrop: {
    opacity: 0.62,
  },
  dropIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceHigh,
    borderRadius: radii.full,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  dropCopy: {
    flex: 1,
  },
  dropTitle: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "900",
  },
  dropText: {
    color: colors.muted,
    fontSize: typography.micro,
    fontWeight: "700",
    marginTop: 2,
  },
  distance: {
    color: colors.lime,
    fontSize: typography.small,
    fontWeight: "900",
  },
});
