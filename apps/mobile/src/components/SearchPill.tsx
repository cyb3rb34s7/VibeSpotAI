import { Feather } from "@expo/vector-icons";
import { StyleSheet, TextInput, View } from "react-native";

import { colors, radii, spacing, typography } from "../theme/tokens";
import { PressScale } from "./PressScale";

type SearchPillProps = {
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  value: string;
};

export function SearchPill({ onChangeText, onSubmit, value }: SearchPillProps) {
  return (
    <View style={styles.container}>
      <Feather color={colors.lime} name="star" size={23} />
      <TextInput
        accessibilityLabel="Search by intent"
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder="Quiet cafe with strong wifi"
        placeholderTextColor={colors.textSoft}
        returnKeyType="search"
        style={styles.input}
        value={value}
      />
      <PressScale
        accessibilityLabel="Run intent search"
        accessibilityRole="button"
        haptic="light"
        onPress={onSubmit}
        pressedScale={0.94}
        style={styles.filterButton}
      >
        <Feather color={colors.text} name="arrow-right" size={18} />
      </PressScale>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.surfaceGlassStrong,
    borderColor: colors.border,
    borderRadius: radii.full,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 58,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: typography.body,
    fontWeight: "700",
    minHeight: 44,
    padding: 0,
  },
  filterButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceHigh,
    borderRadius: 999,
    minWidth: 52,
    paddingHorizontal: spacing.sm,
    height: 44,
    justifyContent: "center",
  },
});
