import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

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
        <LivePin
          index={index}
          key={place.id}
          matchPercent={place.match_percent}
          position={pinPositions[index] ?? pinPositions[0]}
        />
      ))}

      <View style={styles.mapLabel}>
        <Text style={styles.mapLabelTitle}>Koramangala live grid</Text>
        <Text style={styles.mapLabelMeta}>{places.length} seeded spots nearby</Text>
      </View>
      <View style={styles.cityPulse}>
        <Text style={styles.cityPulseText}>Aditya dropped in HSR - Sneha pioneered Indiranagar</Text>
      </View>
    </View>
  );
}

function LivePin({
  index,
  matchPercent,
  position,
}: {
  index: number;
  matchPercent: number;
  position: (typeof pinPositions)[number];
}) {
  const pulse = useRef(new Animated.Value(0)).current;
  const isFresh = index === 0 || index === 3;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          duration: 1200 + index * 160,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          duration: 1200 + index * 160,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [index, pulse]);

  const glowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.42] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.04, 0.12] });

  return (
    <View style={[styles.pin, position]}>
      <Animated.View
        style={[
          styles.pinGlow,
          {
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
          },
        ]}
      />
      {isFresh ? <View style={styles.freshRing} /> : null}
      <View style={styles.pinStem} />
      <View style={styles.pinPoint} />
      <View style={styles.pinCard}>
        <View style={styles.pinAccent} />
        <Text style={styles.pinText}>{matchPercent}</Text>
        <View style={styles.avatarStack}>
          <View style={styles.avatarMini}>
            <Text style={styles.avatarMiniText}>M</Text>
          </View>
          <View style={[styles.avatarMini, styles.avatarMiniOffset]}>
            <Text style={styles.avatarMiniText}>R</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const pinPositions = [
  { top: "43%", left: "52%" },
  { top: "55%", left: "70%" },
  { top: "39%", left: "35%" },
  { top: "30%", left: "75%" },
  { top: "64%", left: "76%" },
] as const;

const styles = StyleSheet.create({
  container: {
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    height: 238,
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
    height: 14,
    opacity: 0.08,
    position: "absolute",
    top: 42,
    width: 14,
  },
  freshRing: {
    borderColor: colors.lime,
    borderRadius: 999,
    borderWidth: 1,
    height: 22,
    opacity: 0.22,
    position: "absolute",
    top: 38,
    width: 22,
  },
  pinStem: {
    backgroundColor: "rgba(189, 244, 74, 0.45)",
    borderRadius: radii.full,
    height: 14,
    position: "absolute",
    top: 31,
    width: 2,
  },
  pinPoint: {
    backgroundColor: colors.lime,
    borderColor: colors.mapBase,
    borderRadius: radii.full,
    borderWidth: 2,
    height: 8,
    position: "absolute",
    top: 42,
    width: 8,
  },
  pinCard: {
    alignItems: "center",
    backgroundColor: "rgba(24, 26, 32, 0.92)",
    borderColor: "rgba(189, 244, 74, 0.36)",
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    height: 28,
    justifyContent: "center",
    minWidth: 62,
    overflow: "hidden",
    paddingLeft: 8,
    paddingRight: 6,
  },
  pinAccent: {
    backgroundColor: colors.lime,
    bottom: 0,
    left: 0,
    position: "absolute",
    top: 0,
    width: 3,
  },
  pinText: {
    color: colors.lime,
    fontSize: 10,
    fontWeight: "900",
  },
  avatarStack: {
    flexDirection: "row",
  },
  avatarMini: {
    alignItems: "center",
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.mapBase,
    borderRadius: 999,
    borderWidth: 1,
    height: 16,
    justifyContent: "center",
    width: 16,
  },
  avatarMiniOffset: {
    marginLeft: -5,
  },
  avatarMiniText: {
    color: colors.text,
    fontSize: 8,
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
  cityPulse: {
    backgroundColor: "rgba(15, 16, 20, 0.72)",
    borderColor: colors.border,
    borderRadius: radii.full,
    borderWidth: 1,
    maxWidth: "62%",
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    position: "absolute",
    right: spacing.md,
    top: spacing.md,
  },
  cityPulseText: {
    color: colors.textSoft,
    fontSize: typography.micro,
    fontWeight: "800",
  },
});
