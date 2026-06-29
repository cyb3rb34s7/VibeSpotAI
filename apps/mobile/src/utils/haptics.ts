import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export type HapticIntent = "light" | "medium" | "success" | "warning";

export function triggerHaptic(intent: HapticIntent) {
  if (Platform.OS === "web") {
    return;
  }

  if (intent === "success") {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return;
  }

  if (intent === "warning") {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    return;
  }

  const style =
    intent === "medium"
      ? Haptics.ImpactFeedbackStyle.Medium
      : Haptics.ImpactFeedbackStyle.Light;
  void Haptics.impactAsync(style);
}
