import { Pressable, StyleSheet, Text, View } from "react-native";

import type { NearbyPlace } from "../api/client";
import { colors, radii, spacing, typography } from "../theme/tokens";

type PlacePreviewCardProps = {
  place: NearbyPlace;
};

export function PlacePreviewCard({ place }: PlacePreviewCardProps) {
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text style={styles.name}>{place.name}</Text>
          <Text style={styles.meta}>
            {place.neighborhood} · {place.distance_m}m
          </Text>
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
      <Text style={styles.evidence}>Based on {place.evidence_count} early drops</Text>
    </Pressable>
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
  pressed: {
    transform: [{ scale: 0.985 }],
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
  meta: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: "700",
    marginTop: 4,
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
  evidence: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: "700",
    marginTop: spacing.sm,
  },
});
