import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import type { NearbyPlace } from "../api/client";
import { colors, radii, spacing, typography } from "../theme/tokens";
import { PressScale } from "./PressScale";

type PlacePreviewCardProps = {
  place: NearbyPlace;
};

export function PlacePreviewCard({ place }: PlacePreviewCardProps) {
  return (
    <PressScale accessibilityRole="button" pressedScale={0.985} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text style={styles.name}>{place.name}</Text>
          <View style={styles.metaRow}>
            <Feather color={colors.muted} name="map-pin" size={14} />
            <Text style={styles.meta}>
              {place.neighborhood} / {place.distance_m}m
            </Text>
          </View>
        </View>
        <View style={styles.matchPill}>
          <Text style={styles.matchText}>{place.match_percent}%</Text>
        </View>
      </View>

      <View style={styles.tagRow}>
        {place.tags.slice(0, 3).map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <Text numberOfLines={2} style={styles.summary}>
        {place.summary}
      </Text>
      <View style={styles.evidenceRow}>
        <Feather color={colors.muted} name="message-circle" size={14} />
        <Text style={styles.evidence}>Based on {place.evidence_count} early drops</Text>
      </View>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  titleGroup: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "900",
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginTop: 5,
  },
  meta: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: "700",
  },
  matchPill: {
    backgroundColor: colors.lime,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  matchText: {
    color: colors.onLime,
    fontSize: typography.small,
    fontWeight: "900",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  tag: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
  },
  tagText: {
    color: colors.text,
    fontSize: typography.micro,
    fontWeight: "800",
  },
  summary: {
    color: colors.textSoft,
    fontSize: typography.body,
    lineHeight: 22,
    marginTop: spacing.md,
  },
  evidenceRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginTop: spacing.sm,
  },
  evidence: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: "700",
  },
});
