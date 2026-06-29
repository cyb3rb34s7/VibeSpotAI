import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import type { NearbyPlace } from "../api/client";
import { colors, radii, spacing, typography } from "../theme/tokens";
import { PressScale } from "./PressScale";

type MapPreviewProps = {
  onOpenPlace?: (slug: string) => void;
  places: NearbyPlace[];
};

export function MapPreview({ onOpenPlace, places }: MapPreviewProps) {
  const featured = places.slice(0, 5);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(featured[0]?.id ?? null);
  const selectedPlace = useMemo(
    () => featured.find((place) => place.id === selectedPlaceId) ?? featured[0],
    [featured, selectedPlaceId],
  );

  useEffect(() => {
    setSelectedPlaceId(featured[0]?.id ?? null);
  }, [featured[0]?.id]);

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
          isSelected={place.id === selectedPlace?.id}
          key={place.id}
          label={markerLabel(place, index)}
          onPress={() => setSelectedPlaceId(place.id)}
          position={pinPositions[index] ?? pinPositions[0]}
        />
      ))}

      {selectedPlace ? (
        <FloatingPlaceCard onOpenPlace={onOpenPlace} place={selectedPlace} />
      ) : null}
      <View style={styles.cityPulse}>
        <Text style={styles.cityPulseText}>Aditya dropped in HSR - Sneha pioneered Indiranagar</Text>
      </View>
    </View>
  );
}

function LivePin({
  index,
  isSelected,
  label,
  onPress,
  position,
}: {
  index: number;
  isSelected: boolean;
  label: string;
  onPress: () => void;
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
    <PressScale
      accessibilityLabel={`${label} map marker`}
      accessibilityRole="button"
      containerStyle={[styles.pin, position]}
      haptic={isFresh ? "medium" : "light"}
      onPress={onPress}
      pressedScale={0.94}
      style={[styles.pinPress, isSelected && styles.selectedPinPress]}
    >
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
      <View style={[styles.pinCard, isSelected && styles.selectedPinCard]}>
        <View style={styles.pinAccent} />
        <Text numberOfLines={1} style={[styles.pinText, isSelected && styles.selectedPinText]}>
          {label}
        </Text>
      </View>
    </PressScale>
  );
}

function FloatingPlaceCard({
  onOpenPlace,
  place,
}: {
  onOpenPlace?: (slug: string) => void;
  place: NearbyPlace;
}) {
  return (
    <View style={styles.placeCard}>
      <View style={styles.placeHeader}>
        <View style={styles.placeCopy}>
          <Text numberOfLines={1} style={styles.placeName}>{place.name}</Text>
          <Text numberOfLines={1} style={styles.placeMeta}>
            {place.neighborhood} / {place.distance_m}m
          </Text>
        </View>
        <View style={styles.matchBadge}>
          <Text style={styles.matchText}>{place.match_percent}%</Text>
        </View>
      </View>
      <Text numberOfLines={2} style={styles.placeReason}>
        {place.reason || `${place.evidence_count} people shaped this signal`}
      </Text>
      <PressScale
        accessibilityLabel={`Open ${place.name}`}
        accessibilityRole="button"
        containerStyle={styles.openButtonShell}
        haptic="medium"
        onPress={() => onOpenPlace?.(place.slug)}
        pressedScale={0.97}
        style={styles.openButton}
      >
        <Text style={styles.openButtonText}>View vibe</Text>
      </PressScale>
    </View>
  );
}

function markerLabel(place: NearbyPlace, index: number) {
  if (index === 0) {
    return "Fresh";
  }

  const firstTag = place.tags[0]?.replace(/\s+/g, " ");
  if (firstTag && firstTag.length <= 10) {
    return firstTag;
  }

  return `${place.match_percent}%`;
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
    position: "absolute",
  },
  pinPress: {
    alignItems: "center",
    justifyContent: "center",
  },
  selectedPinPress: {
    zIndex: 4,
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
  selectedPinCard: {
    backgroundColor: colors.lime,
    borderColor: colors.lime,
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
  selectedPinText: {
    color: colors.onLime,
  },
  placeCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    bottom: spacing.md,
    elevation: 12,
    gap: spacing.xs,
    left: spacing.md,
    minWidth: 278,
    padding: spacing.sm,
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    zIndex: 5,
  },
  placeHeader: {
    paddingRight: 58,
  },
  placeCopy: {
    minWidth: 0,
  },
  placeName: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900",
  },
  placeMeta: {
    color: colors.muted,
    fontSize: typography.micro,
    fontWeight: "800",
    marginTop: 2,
  },
  matchBadge: {
    backgroundColor: colors.lime,
    borderRadius: radii.full,
    paddingHorizontal: spacing.xs,
    paddingVertical: 5,
    position: "absolute",
    right: spacing.sm,
    top: spacing.sm,
  },
  matchText: {
    color: colors.onLime,
    fontSize: typography.micro,
    fontWeight: "900",
  },
  placeReason: {
    color: colors.textSoft,
    fontSize: typography.micro,
    fontWeight: "800",
    lineHeight: 15,
  },
  openButtonShell: {
    alignSelf: "flex-start",
  },
  openButton: {
    backgroundColor: colors.surfaceHigh,
    borderColor: colors.border,
    borderRadius: radii.full,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
  },
  openButtonText: {
    color: colors.text,
    fontSize: typography.micro,
    fontWeight: "900",
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
