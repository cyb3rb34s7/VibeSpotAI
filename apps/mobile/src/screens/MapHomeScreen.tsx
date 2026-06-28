import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { getNearbyPlaces, type NearbyPlace } from "../api/client";
import { BottomNav } from "../components/BottomNav";
import { MapPreview } from "../components/MapPreview";
import { PlacePreviewCard } from "../components/PlacePreviewCard";
import { SearchPill } from "../components/SearchPill";
import { colors, spacing, typography } from "../theme/tokens";

export function MapHomeScreen() {
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPlaces() {
      try {
        const nearbyPlaces = await getNearbyPlaces();
        if (isMounted) {
          setPlaces(nearbyPlaces);
          setError(null);
        }
      } catch (caught) {
        if (isMounted) {
          setError(caught instanceof Error ? caught.message : "Unable to load places");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPlaces();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.background, colors.backgroundAlt, colors.background]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.brand}>VibeSpot</Text>
              <Text style={styles.subtitle}>Local signal, right now</Text>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>P</Text>
            </View>
          </View>

          <SearchPill />

          {isLoading ? (
            <View style={styles.statePanel}>
              <ActivityIndicator color={colors.lime} />
              <Text style={styles.stateText}>Loading the local grid...</Text>
            </View>
          ) : error ? (
            <View style={styles.statePanel}>
              <Text style={styles.errorTitle}>Backend not reachable</Text>
              <Text style={styles.stateText}>{error}</Text>
            </View>
          ) : (
            <>
              <MapPreview places={places} />

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Best nearby</Text>
                <Text style={styles.sectionMeta}>{places.length} live candidates</Text>
              </View>

              {places.slice(0, 6).map((place) => (
                <PlacePreviewCard key={place.id} place={place} />
              ))}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.md,
    paddingBottom: 116,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: spacing.sm,
  },
  brand: {
    color: colors.text,
    fontSize: typography.hero,
    fontWeight: "900",
    letterSpacing: 0,
  },
  subtitle: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: "800",
    marginTop: 2,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.surfaceHigh,
    borderColor: colors.lime,
    borderRadius: 999,
    borderWidth: 2,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  avatarText: {
    color: colors.lime,
    fontSize: typography.body,
    fontWeight: "900",
  },
  sectionHeader: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: "900",
  },
  sectionMeta: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: "800",
  },
  statePanel: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.sm,
    minHeight: 220,
    justifyContent: "center",
    padding: spacing.lg,
  },
  stateText: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 22,
    textAlign: "center",
  },
  errorTitle: {
    color: colors.coral,
    fontSize: typography.title,
    fontWeight: "900",
  },
});
