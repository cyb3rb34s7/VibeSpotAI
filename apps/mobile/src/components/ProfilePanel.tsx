import { Feather } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, StyleSheet, Text, View } from "react-native";

import type { MyProfile } from "../api/client";
import { colors, radii, spacing, typography } from "../theme/tokens";
import { PressScale } from "./PressScale";

type ProfilePanelProps = {
  error: string | null;
  isLoading: boolean;
  onLogout: () => void;
  profile: MyProfile | null;
};

export function ProfilePanel({ error, isLoading, onLogout, profile }: ProfilePanelProps) {
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

  const tastePercent = Math.min(89, 38 + profile.stats.vibe_checks_count * 3);
  const exploredBlocks = Math.min(8, profile.stats.places_contributed_count);

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

      <PressScale
        accessibilityRole="button"
        haptic="warning"
        onPress={onLogout}
        pressedScale={0.98}
        style={styles.logoutButton}
      >
        <Feather color={colors.text} name="log-out" size={16} />
        <Text style={styles.logoutText}>Sign out</Text>
      </PressScale>

      <View style={styles.statsRow}>
        <Metric label="drops" value={profile.stats.vibe_checks_count.toString()} />
        <Metric label="places" value={profile.stats.places_contributed_count.toString()} />
      </View>

      <View style={styles.streakCard}>
        <BreathingIcon />
        <View style={styles.streakCopy}>
          <Text style={styles.streakTitle}>{Math.max(1, profile.stats.vibe_checks_count)} day signal streak</Text>
          <Text style={styles.streakText}>
            Active now. Drop again before it cools into gray.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.progressHeader}>
          <Text style={styles.sectionTitle}>Taste profile</Text>
          <Text style={styles.progressValue}>{tastePercent}% defined</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${tastePercent}%` }]} />
        </View>
        <Text style={styles.progressHint}>
          Afternoon worker - window-seat hunter - cold brew curious
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.progressHeader}>
          <Text style={styles.sectionTitle}>Your city map</Text>
          <Text style={styles.progressValue}>{exploredBlocks}/16 blocks</Text>
        </View>
        <View style={styles.cityGrid}>
          {Array.from({ length: 16 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.cityBlock,
                index < exploredBlocks && styles.cityBlockActive,
                index === exploredBlocks && styles.cityBlockNext,
              ]}
            />
          ))}
        </View>
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Locked next</Text>
        <View style={styles.achievementRow}>
          <LockedAchievement title="Pioneer" subtitle="Claim 3 untouched cafes" />
          <LockedAchievement title="Zone regular" subtitle="Drop in 5 neighborhoods" />
        </View>
      </View>
    </View>
  );
}

function BreathingIcon() {
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { duration: 1000, toValue: 1, useNativeDriver: true }),
        Animated.timing(scale, { duration: 1000, toValue: 0, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [scale]);

  const animatedScale = scale.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });

  return (
    <Animated.View style={[styles.streakIcon, { transform: [{ scale: animatedScale }] }]}>
      <Feather color={colors.onLime} name="activity" size={20} />
    </Animated.View>
  );
}

function LockedAchievement({ subtitle, title }: { subtitle: string; title: string }) {
  return (
    <View style={styles.lockedAchievement}>
      <Feather color={colors.muted} name="lock" size={15} />
      <Text style={styles.lockedTitle}>{title}</Text>
      <Text style={styles.lockedSubtitle}>{subtitle}</Text>
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
  streakCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: "rgba(189, 244, 74, 0.18)",
    borderRadius: radii.xl,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  streakIcon: {
    alignItems: "center",
    backgroundColor: colors.lime,
    borderRadius: radii.full,
    height: 44,
    justifyContent: "center",
    shadowColor: colors.lime,
    shadowOpacity: 0.36,
    shadowRadius: 16,
    width: 44,
  },
  streakCopy: {
    flex: 1,
  },
  streakTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900",
  },
  streakText: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 3,
  },
  logoutButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceHigh,
    borderColor: colors.border,
    borderRadius: radii.full,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  logoutText: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "900",
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
  progressHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressValue: {
    color: colors.lime,
    fontSize: typography.small,
    fontWeight: "900",
  },
  progressTrack: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: radii.full,
    height: 12,
    marginTop: spacing.sm,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: colors.lime,
    borderRadius: radii.full,
    height: "100%",
  },
  progressHint: {
    color: colors.textSoft,
    fontSize: typography.small,
    fontWeight: "800",
    lineHeight: 18,
    marginTop: spacing.sm,
  },
  cityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: spacing.sm,
  },
  cityBlock: {
    backgroundColor: colors.surfaceHigh,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 34,
    width: "22%",
  },
  cityBlockActive: {
    backgroundColor: colors.lime,
    borderColor: colors.lime,
  },
  cityBlockNext: {
    borderColor: colors.amber,
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
  achievementRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  lockedAchievement: {
    backgroundColor: colors.surfaceHigh,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flex: 1,
    minHeight: 116,
    opacity: 0.78,
    padding: spacing.sm,
  },
  lockedTitle: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "900",
    marginTop: spacing.xs,
  },
  lockedSubtitle: {
    color: colors.muted,
    fontSize: typography.micro,
    fontWeight: "800",
    lineHeight: 15,
    marginTop: 4,
  },
});
