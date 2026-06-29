import { type PropsWithChildren, useRef } from "react";
import {
  Animated,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { triggerHaptic, type HapticIntent } from "../utils/haptics";

type PressScaleProps = PropsWithChildren<
  Omit<PressableProps, "style"> & {
    haptic?: HapticIntent;
    pressedScale?: number;
    style?: StyleProp<ViewStyle>;
  }
>;

export function PressScale({
  children,
  haptic,
  pressedScale = 0.98,
  style,
  onPress,
  onPressIn,
  onPressOut,
  ...props
}: PressScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  function animate(toValue: number) {
    Animated.spring(scale, {
      friction: 7,
      tension: 140,
      toValue,
      useNativeDriver: true,
    }).start();
  }

  return (
    <Pressable
      {...props}
      onPress={(event) => {
        if (!props.disabled && haptic) {
          triggerHaptic(haptic);
        }
        onPress?.(event);
      }}
      onPressIn={(event) => {
        animate(pressedScale);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animate(1);
        onPressOut?.(event);
      }}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
