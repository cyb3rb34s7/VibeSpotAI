import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import type { MyProfile } from "../api/client";
import { colors, radii, spacing, typography } from "../theme/tokens";

type ProfilePanelProps = {
  error: string | null;
  isLoading: boolean;
  profile: MyProfile | null;
};

export function ProfilePanel({ error, isLoading, profile }: ProfilePanelProps) {
  if (isLoading) {
    return (
      <View style={styles.statePanel}>
        <ActivityIndicator color={colors.lime} />
        <Text style={styles.stateText}>Loading your local signal...</Text>
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.statePanel}>
        <Text style={styles.errorTitle}>Profile unavailable</Text>
        <Text style={styles.stateText}>{error || "Start the backend to load profile data."}</Text>
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      <View style={styles.heroCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile.user.display_name.slice(0, 1)}</Text>
        </View>
        <View style={styles.heroText}>
          <Text style={styles.name}>{profile.user.display_name}</Text>
          <Text style={styles.handle}>
            @{profile.user.handle} / {profile.user.home_city}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <Metric label="drops" value={profile.stats.vibe_checks_count.toString()} />
        <Metric label="places" value={profile.stats.places_contributed_count.toString()} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Taste signal</Text>
        <View style={styles.tagRow}>
          {profile.taste_tags.map((tag) => (
            <View key={tag.label} style={styles.tag}>
              <Text style={styles.tagText}>{tag.label}</Text>
              <Text style={styles.tagCount}>{tag.count}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent drops</Text>
        {profile.recent_drops.map((drop) => (
          <View key={`${drop.place_slug}-${drop.submitted_at}`} style={styles.drop}>
            <View style={styles.dropIcon}>
              <Feather color={colors.lime} name="message-circle" size={16} />
            </View>
            <View style={styles.dropCopy}>
              <Text style={styles.dropPlace}>{drop.place_name}</Text>
              <Text numberOfLines={2} style={styles.dropNote}>
                {drop.short_note}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
  heroCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.lime,
    borderRadius: radii.full,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  avatarText: {
    color: colors.onLime,
    fontSize: typography.heading,
    fontWeight: "900",
  },
  heroText: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: "900",
  },
  handle: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: "800",
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  metric: {
    backgroundColor: colors.surfaceHigh,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flex: 1,
    padding: spacing.md,
  },
  metricValue: {
    color: colors.lime,
    fontSize: typography.heading,
    fontWeight: "900",
  },
  metricLabel: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: "800",
    marginTop: 2,
    textTransform: "uppercase",
  },
  section: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "900",
    marginBottom: spacing.sm,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  tag: {
    alignItems: "center",
    backgroundColor: colors.surfaceHigh,
    borderRadius: radii.full,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
  },
  tagText: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "800",
  },
  tagCount: {
    color: colors.lime,
    fontSize: typography.micro,
    fontWeight: "900",
  },
  drop: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  dropIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceHigh,
    borderRadius: radii.full,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  dropCopy: {
    flex: 1,
  },
  dropPlace: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "900",
  },
  dropNote: {
    color: colors.textSoft,
    fontSize: typography.small,
    lineHeight: 18,
    marginTop: 2,
  },
  statePanel: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing.sm,
    justifyContent: "center",
    minHeight: 260,
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
