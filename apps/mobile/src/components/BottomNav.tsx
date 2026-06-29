import { Feather } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "../theme/tokens";
import { PressScale } from "./PressScale";

const navItems = [
  { label: "Map", icon: "map" },
  { label: "Search", icon: "search" },
  { label: "Drop", icon: "plus-circle" },
  { label: "Profile", icon: "user" },
] as const;

export type BottomNavTab = (typeof navItems)[number]["label"];

type BottomNavProps = {
  activeTab: BottomNavTab;
  onSelectTab: (tab: BottomNavTab) => void;
  pendingDrops?: number;
  streakCount?: number;
};

export function BottomNav({ activeTab, onSelectTab, pendingDrops = 0, streakCount = 0 }: BottomNavProps) {
  const breath = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, { duration: 1300, toValue: 1, useNativeDriver: true }),
        Animated.timing(breath, { duration: 1300, toValue: 0, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [breath]);

  const streakScale = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });

  return (
    <View style={styles.dock}>
      <View style={styles.container}>
        {navItems.map((item) => {
          const isActive = item.label === activeTab;
          const showDropDot = item.label === "Drop" && pendingDrops > 0;
          const showStreak = item.label === "Profile" && streakCount > 0;

          return (
            <PressScale
              accessibilityLabel={item.label}
              accessibilityRole="button"
              haptic={item.label === "Drop" ? "medium" : "light"}
              key={item.label}
              onPress={() => onSelectTab(item.label)}
              pressedScale={0.95}
              style={[styles.item, isActive && styles.activeItem]}
            >
              <Animated.View
                style={showStreak ? { transform: [{ scale: streakScale }] } : undefined}
              >
                <Feather
                  color={isActive ? colors.onLime : showStreak ? colors.lime : colors.muted}
                  name={item.icon}
                  size={21}
                />
              </Animated.View>
              {showDropDot ? (
                <View style={styles.pendingDot}>
                  <Text style={styles.pendingText}>{pendingDrops}</Text>
                </View>
              ) : null}
              {showStreak ? (
                <View style={styles.streakPill}>
                  <Text style={styles.streakText}>{Math.min(99, streakCount)}</Text>
                </View>
              ) : null}
              <Text style={[styles.label, isActive && styles.activeText]}>{item.label}</Text>
            </PressScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    backgroundColor: colors.background,
    paddingBottom: spacing.xs,
    paddingTop: spacing.lg,
  },
  container: {
    alignSelf: "stretch",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.full,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
  },
  item: {
    alignItems: "center",
    borderRadius: radii.lg,
    flex: 1,
    gap: 2,
    justifyContent: "center",
    minHeight: 56,
    overflow: "hidden",
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
  pendingDot: {
    alignItems: "center",
    backgroundColor: colors.amber,
    borderColor: colors.surface,
    borderRadius: radii.full,
    borderWidth: 1,
    minWidth: 18,
    paddingHorizontal: 4,
    position: "absolute",
    right: 16,
    top: 7,
  },
  pendingText: {
    color: colors.onLime,
    fontSize: 9,
    fontWeight: "900",
  },
  streakPill: {
    backgroundColor: "rgba(189, 244, 74, 0.14)",
    borderColor: "rgba(189, 244, 74, 0.28)",
    borderRadius: radii.full,
    borderWidth: 1,
    paddingHorizontal: 5,
    position: "absolute",
    right: 12,
    top: 6,
  },
  streakText: {
    color: colors.lime,
    fontSize: 9,
    fontWeight: "900",
  },
});
