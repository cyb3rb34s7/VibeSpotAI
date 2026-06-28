import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "../theme/tokens";
import { PressScale } from "./PressScale";

const navItems = [
  { label: "Map", icon: "map" },
  { label: "Search", icon: "search" },
  { label: "Drop", icon: "plus-circle" },
  { label: "Profile", icon: "user" },
] as const;

export function BottomNav() {
  return (
    <View style={styles.container}>
      {navItems.map((item, index) => {
        const isActive = index === 0;

        return (
        <PressScale
          accessibilityLabel={item.label}
          accessibilityRole="button"
          key={item.label}
          pressedScale={0.95}
          style={[styles.item, isActive && styles.activeItem]}
        >
          <Feather
            color={isActive ? colors.onLime : colors.muted}
            name={item.icon}
            size={21}
          />
          <Text style={[styles.label, isActive && styles.activeText]}>{item.label}</Text>
        </PressScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    backgroundColor: colors.surfaceGlass,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    bottom: spacing.lg,
    flexDirection: "row",
    gap: spacing.xs,
    left: spacing.md,
    padding: spacing.xs,
    position: "absolute",
    right: spacing.md,
  },
  item: {
    alignItems: "center",
    borderRadius: radii.lg,
    flex: 1,
    gap: 2,
    justifyContent: "center",
    minHeight: 56,
  },
  activeItem: {
    backgroundColor: colors.lime,
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
  },
  label: {
    color: colors.muted,
    fontSize: typography.micro,
    fontWeight: "700",
  },
  activeText: {
    color: colors.onLime,
  },
});
