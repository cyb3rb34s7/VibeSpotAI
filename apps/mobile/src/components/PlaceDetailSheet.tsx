import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, View } from "react-native";

import type { PlaceDetail } from "../api/client";
import { colors, radii, spacing, typography } from "../theme/tokens";
import { PressScale } from "./PressScale";

type PlaceDetailSheetProps = {
  detail: PlaceDetail | null;
  error: string | null;
  isLoading: boolean;
  isVisible: boolean;
  onClose: () => void;
};

export function PlaceDetailSheet({
  detail,
  error,
  isLoading,
  isVisible,
  onClose,
}: PlaceDetailSheetProps) {
  return (
    <Modal animationType="slide" transparent visible={isVisible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <PressScale accessibilityLabel="Close place detail" onPress={onClose} style={styles.scrim} />
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          {isLoading ? (
            <View style={styles.state}>
              <ActivityIndicator color={colors.lime} />
              <Text style={styles.stateText}>Reading the room...</Text>
            </View>
          ) : error ? (
            <View style={styles.state}>
              <Text style={styles.errorTitle}>Could not load place</Text>
              <Text style={styles.stateText}>{error}</Text>
            </View>
          ) : detail ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.header}>
                <View style={styles.titleBlock}>
                  <Text style={styles.name}>{detail.name}</Text>
                  <Text style={styles.address} numberOfLines={2}>
                    {detail.address}
                  </Text>
                </View>
                <PressScale
                  accessibilityLabel="Close place detail"
                  onPress={onClose}
                  pressedScale={0.92}
                  style={styles.closeButton}
                >
                  <Feather color={colors.text} name="x" size={20} />
                </PressScale>
              </View>

              <View style={styles.heroMetricRow}>
                <Metric label="Best for" value={detail.best_for} />
                <Metric label="Evidence" value={`${detail.evidence_count} drops`} />
              </View>

              <Text style={styles.summary}>{detail.summary}</Text>

              <View style={styles.signalGrid}>
                <Metric label="Noise" value={`${detail.signals.avg_noise_score}/100`} />
                <Metric label="Wifi" value={`${detail.signals.avg_wifi_score}/5`} />
                <Metric label="Crowd" value={detail.signals.top_crowd_level} />
                <Metric label="Mode" value={detail.signals.top_recommend_mode} />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Avoid when</Text>
                <Text style={styles.bodyText}>{detail.avoid_when}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent drops</Text>
                {detail.recent_vibe_checks.slice(0, 3).map((check, index) => (
                  <View key={`${check.submitted_at}-${index}`} style={styles.drop}>
                    <Text style={styles.dropIntent}>{check.visit_intent}</Text>
                    <Text style={styles.dropNote}>{check.short_note}</Text>
                    <Text style={styles.dropMeta}>
                      {check.best_use_case} / {check.crowd_level}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text numberOfLines={1} adjustsFontSizeToFit style={styles.metricValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.42)",
    flex: 1,
    justifyContent: "flex-end",
  },
  scrim: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    maxHeight: "82%",
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  grabber: {
    alignSelf: "center",
    backgroundColor: colors.surfaceHigh,
    borderRadius: 999,
    height: 4,
    marginBottom: spacing.md,
    width: 46,
  },
  state: {
    alignItems: "center",
    gap: spacing.sm,
    justifyContent: "center",
    minHeight: 260,
  },
  stateText: {
    color: colors.muted,
    fontSize: typography.body,
    textAlign: "center",
  },
  errorTitle: {
    color: colors.coral,
    fontSize: typography.title,
    fontWeight: "900",
  },
  header: {
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  titleBlock: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: "900",
  },
  address: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 6,
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceHigh,
    borderRadius: 999,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  heroMetricRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  summary: {
    color: colors.textSoft,
    fontSize: typography.body,
    lineHeight: 23,
    marginTop: spacing.lg,
  },
  signalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  metric: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flex: 1,
    minWidth: 138,
    padding: spacing.sm,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: typography.micro,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  metricValue: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900",
    marginTop: 6,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "900",
    marginBottom: spacing.sm,
  },
  bodyText: {
    color: colors.textSoft,
    fontSize: typography.body,
    lineHeight: 23,
  },
  drop: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    padding: spacing.sm,
  },
  dropIntent: {
    color: colors.lime,
    fontSize: typography.small,
    fontWeight: "900",
  },
  dropNote: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 22,
    marginTop: 5,
  },
  dropMeta: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: "700",
    marginTop: 6,
  },
});
