import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "../theme/tokens";

const navItems = [
  { label: "Map", icon: "◇", active: true },
  { label: "Search", icon: "⌕", active: false },
  { label: "Drop", icon: "+", active: false },
  { label: "Profile", icon: "◡", active: false },
] as const;

export function BottomNav() {
  return (
    <View style={styles.container}>
      {navItems.map((item) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            styles.item,
            item.active && styles.activeItem,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.icon, item.active && styles.activeText]}>{item.icon}</Text>
          <Text style={[styles.label, item.active && styles.activeText]}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    bottom: spacing.lg,
    flexDirection: "row",
    gap: spacing.xs,
    left: spacing.md,
    padding: spacing.xs,
    position: "absolute",
    right: spacing.md,
    backgroundColor: colors.surfaceGlass,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
  },
  item: {
    alignItems: "center",
    borderRadius: radii.lg,
    flex: 1,
    gap: 2,
    minHeight: 56,
    justifyContent: "center",
  },
  activeItem: {
    backgroundColor: colors.lime,
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  icon: {
    color: colors.muted,
    fontSize: 22,
    lineHeight: 24,
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
