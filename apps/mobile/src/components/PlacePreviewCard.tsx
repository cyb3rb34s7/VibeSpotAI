import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import type { NearbyPlace } from "../api/client";
import { colors, radii, spacing, typography } from "../theme/tokens";
import { PressScale } from "./PressScale";

type PlacePreviewCardProps = {
  onPress?: () => void;
  place: NearbyPlace;
};

export function PlacePreviewCard({ onPress, place }: PlacePreviewCardProps) {
  const isFresh = place.match_percent >= 96 || Boolean(place.reason);

  return (
    <PressScale accessibilityRole="button" onPress={onPress} pressedScale={0.985} style={styles.card}>
      {isFresh ? (
        <View style={styles.freshBadge}>
          <View style={styles.freshDot} />
          <Text style={styles.freshText}>Fresh drop</Text>
        </View>
      ) : null}
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

      <Text numberOfLines={1} style={styles.summary}>
        {place.summary}
      </Text>
      <View style={styles.evidenceRow}>
        <Feather color={colors.muted} name={place.reason ? "zap" : "message-circle"} size={14} />
        <Text style={styles.evidence}>
          {place.reason || `Based on ${place.evidence_count} early drops`}
        </Text>
      </View>
      <View style={styles.socialRow}>
        <View style={styles.avatarStack}>
          {["M", "R", "A"].map((initial, index) => (
            <View key={initial} style={[styles.avatarMini, index > 0 && styles.avatarMiniOffset]}>
              <Text style={styles.avatarMiniText}>{initial}</Text>
            </View>
          ))}
        </View>
        <Text numberOfLines={1} style={styles.socialText}>
          Meera, Rohan +{Math.max(2, Math.round(place.evidence_count / 2))} shaped this signal
        </Text>
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
  freshBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(189, 244, 74, 0.1)",
    borderColor: "rgba(189, 244, 74, 0.22)",
    borderRadius: radii.full,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  freshDot: {
    backgroundColor: colors.lime,
    borderRadius: radii.full,
    height: 7,
    width: 7,
  },
  freshText: {
    color: colors.lime,
    fontSize: typography.micro,
    fontWeight: "900",
    textTransform: "uppercase",
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
  socialRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  avatarStack: {
    flexDirection: "row",
  },
  avatarMini: {
    alignItems: "center",
    backgroundColor: colors.surfaceHigh,
    borderColor: colors.surface,
    borderRadius: radii.full,
    borderWidth: 1,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  avatarMiniOffset: {
    marginLeft: -7,
  },
  avatarMiniText: {
    color: colors.text,
    fontSize: typography.micro,
    fontWeight: "900",
  },
  socialText: {
    color: colors.muted,
    flex: 1,
    fontSize: typography.micro,
    fontWeight: "800",
  },
});
