import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "../theme/tokens";
import { PressScale } from "./PressScale";

export function SearchPill() {
  return (
    <PressScale accessibilityRole="button" pressedScale={0.985} style={styles.container}>
      <Feather color={colors.lime} name="star" size={23} />
      <Text numberOfLines={1} style={styles.placeholder}>
        Find a quiet cafe with strong wifi...
      </Text>
      <View pointerEvents="none" style={styles.filterButton}>
        <Feather color={colors.text} name="sliders" size={19} />
      </View>
    </PressScale>
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
  placeholder: {
    color: colors.text,
    flex: 1,
    fontSize: typography.body,
    fontWeight: "700",
  },
  filterButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceHigh,
    borderRadius: 999,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
});
