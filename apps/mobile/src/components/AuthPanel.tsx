import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";

import { colors, radii, spacing, typography } from "../theme/tokens";
import { PressScale } from "./PressScale";

type AuthPanelProps = {
  error: string | null;
  isLoading: boolean;
  localOtpCode: string | null;
  onStart: (email: string) => Promise<void>;
  onVerify: (email: string, otpCode: string) => Promise<void>;
};

export function AuthPanel({
  error,
  isLoading,
  localOtpCode,
  onStart,
  onVerify,
}: AuthPanelProps) {
  const [email, setEmail] = useState("priya@vibespot.local");
  const [otpCode, setOtpCode] = useState("");

  async function submitEmail() {
    await onStart(email);
  }

  async function submitOtp() {
    await onVerify(email, otpCode || localOtpCode || "");
  }

  return (
    <View style={styles.panel}>
      <View style={styles.icon}>
        <Feather color={colors.onLime} name="lock" size={22} />
      </View>
      <Text style={styles.title}>Unlock your city signal</Text>
      <Text style={styles.copy}>
        Start a private session and keep your taste map, streak, and drops tied to you.
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={email}
        />
      </View>

      <PressScale
        accessibilityRole="button"
        disabled={isLoading}
        haptic="medium"
        onPress={submitEmail}
        pressedScale={0.98}
        style={styles.primaryButton}
      >
        {isLoading && !localOtpCode ? (
          <ActivityIndicator color={colors.onLime} />
        ) : (
          <Text style={styles.primaryText}>Send code</Text>
        )}
      </PressScale>

      {localOtpCode ? (
        <>
          <View style={styles.localCode}>
            <Text style={styles.localCodeLabel}>Local sign-in code</Text>
            <Text style={styles.localCodeText}>{localOtpCode}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Code</Text>
            <TextInput
              keyboardType="number-pad"
              maxLength={6}
              onChangeText={setOtpCode}
              placeholder={localOtpCode}
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={otpCode}
            />
          </View>
          <PressScale
            accessibilityRole="button"
            disabled={isLoading}
            haptic="success"
            onPress={submitOtp}
            pressedScale={0.98}
            style={styles.secondaryButton}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.secondaryText}>Verify and continue</Text>
            )}
          </PressScale>
        </>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    alignItems: "stretch",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  icon: {
    alignItems: "center",
    backgroundColor: colors.lime,
    borderRadius: radii.full,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  title: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: "900",
  },
  copy: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 22,
  },
  field: {
    gap: 6,
  },
  label: {
    color: colors.muted,
    fontSize: typography.micro,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: colors.surfaceHigh,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800",
    minHeight: 52,
    paddingHorizontal: spacing.sm,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.lime,
    borderRadius: radii.lg,
    justifyContent: "center",
    minHeight: 52,
  },
  primaryText: {
    color: colors.onLime,
    fontSize: typography.body,
    fontWeight: "900",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceHigh,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 52,
  },
  secondaryText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900",
  },
  localCode: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radii.lg,
    padding: spacing.sm,
  },
  localCodeLabel: {
    color: colors.muted,
    fontSize: typography.micro,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  localCodeText: {
    color: colors.lime,
    fontSize: typography.heading,
    fontWeight: "900",
    marginTop: 2,
  },
  error: {
    color: colors.coral,
    fontSize: typography.small,
    fontWeight: "800",
  },
});
