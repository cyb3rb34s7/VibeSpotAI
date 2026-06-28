import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import type { PlaceDetail, VibeCheckPayload } from "../api/client";
import { colors, radii, spacing, typography } from "../theme/tokens";
import { PressScale } from "./PressScale";

type PlaceDetailSheetProps = {
  detail: PlaceDetail | null;
  error: string | null;
  isLoading: boolean;
  isVisible: boolean;
  onClose: () => void;
  onSubmitVibeCheck: (payload: VibeCheckPayload) => Promise<void>;
};

const intentOptions = [
  { label: "Deep work", value: "deep_work", bestUseCase: "Deep Work" },
  { label: "Catch up", value: "catch_up", bestUseCase: "Friends" },
  { label: "Coffee", value: "coffee", bestUseCase: "Quick Coffee" },
] as const;

const crowdOptions = ["low", "medium", "high"] as const;
const wifiOptions = [3, 4, 5] as const;

type IntentOption = (typeof intentOptions)[number];

export function PlaceDetailSheet({
  detail,
  error,
  isLoading,
  isVisible,
  onClose,
  onSubmitVibeCheck,
}: PlaceDetailSheetProps) {
  const [selectedIntent, setSelectedIntent] = useState<IntentOption>(intentOptions[0]);
  const [crowdLevel, setCrowdLevel] = useState<(typeof crowdOptions)[number]>("low");
  const [wifiScore, setWifiScore] = useState<(typeof wifiOptions)[number]>(5);
  const [note, setNote] = useState("calm enough to focus, wifi felt stable");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  async function submitSignal() {
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      await onSubmitVibeCheck({
        best_use_case: selectedIntent.bestUseCase,
        crowd_level: crowdLevel,
        location_confidence: 0.9,
        noise_score: crowdLevel === "low" ? 22 : crowdLevel === "medium" ? 48 : 72,
        recommend_mode: "yes",
        short_note: note.trim(),
        visit_intent: selectedIntent.value,
        wifi_score: wifiScore,
      });
      setSubmitMessage("Signal added");
    } catch (caught) {
      setSubmitMessage(caught instanceof Error ? caught.message : "Could not add signal");
    } finally {
      setIsSubmitting(false);
    }
  }

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

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Drop your signal</Text>
                <Text style={styles.bodyText}>Intent</Text>
                <View style={styles.chipRow}>
                  {intentOptions.map((option) => (
                    <ChoiceChip
                      isActive={selectedIntent.value === option.value}
                      key={option.value}
                      label={option.label}
                      onPress={() => setSelectedIntent(option)}
                    />
                  ))}
                </View>

                <Text style={styles.bodyText}>Crowd</Text>
                <View style={styles.chipRow}>
                  {crowdOptions.map((option) => (
                    <ChoiceChip
                      isActive={crowdLevel === option}
                      key={option}
                      label={option}
                      onPress={() => setCrowdLevel(option)}
                    />
                  ))}
                </View>

                <Text style={styles.bodyText}>Wifi</Text>
                <View style={styles.chipRow}>
                  {wifiOptions.map((option) => (
                    <ChoiceChip
                      isActive={wifiScore === option}
                      key={option}
                      label={`${option}/5`}
                      onPress={() => setWifiScore(option)}
                    />
                  ))}
                </View>

                <TextInput
                  maxLength={180}
                  multiline
                  onChangeText={setNote}
                  placeholder="What did it actually feel like?"
                  placeholderTextColor={colors.muted}
                  style={styles.noteInput}
                  value={note}
                />
                <PressScale
                  accessibilityLabel="Submit vibe check"
                  disabled={isSubmitting || note.trim().length < 4}
                  onPress={submitSignal}
                  pressedScale={0.97}
                  style={[
                    styles.submitButton,
                    (isSubmitting || note.trim().length < 4) && styles.disabledButton,
                  ]}
                >
                  <Text style={styles.submitText}>
                    {isSubmitting ? "Dropping..." : "Drop signal"}
                  </Text>
                </PressScale>
                {submitMessage ? <Text style={styles.submitMessage}>{submitMessage}</Text> : null}
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

function ChoiceChip({
  isActive,
  label,
  onPress,
}: {
  isActive: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <PressScale onPress={onPress} pressedScale={0.94} style={[styles.choiceChip, isActive && styles.activeChoice]}>
      <Text style={[styles.choiceText, isActive && styles.activeChoiceText]}>{label}</Text>
    </PressScale>
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
    marginBottom: spacing.xs,
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
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  choiceChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 9,
  },
  activeChoice: {
    backgroundColor: colors.lime,
    borderColor: colors.lime,
  },
  choiceText: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  activeChoiceText: {
    color: colors.onLime,
  },
  noteInput: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 22,
    minHeight: 86,
    padding: spacing.sm,
    textAlignVertical: "top",
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: colors.lime,
    borderRadius: radii.full,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
  },
  disabledButton: {
    opacity: 0.55,
  },
  submitText: {
    color: colors.onLime,
    fontSize: typography.body,
    fontWeight: "900",
  },
  submitMessage: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: "800",
    marginTop: spacing.sm,
    textAlign: "center",
  },
});
