import { StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "../theme/tokens";

export function SearchPill() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⌕</Text>
      <Text numberOfLines={1} style={styles.placeholder}>
        Find a quiet cafe with strong wifi...
      </Text>
      <View style={styles.filterButton}>
        <Text style={styles.filterText}>≡</Text>
      </View>
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
  icon: {
    color: colors.lime,
    fontSize: 28,
    lineHeight: 30,
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
  filterText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
  },
});
