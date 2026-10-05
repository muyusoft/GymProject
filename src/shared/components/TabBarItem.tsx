import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { getTextStyle, tokens } from "@/design/tokens";

interface TabBarItemProps {
  label: string;
  icon: ReactNode;
  isFocused: boolean;
  labelColor: string;
  onPress: () => void;
  onLongPress: () => void;
}

export function TabBarItem({
  label,
  icon,
  isFocused,
  labelColor,
  onPress,
  onLongPress,
}: Readonly<TabBarItemProps>) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.item}
    >
      {icon}
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flex: 1,
    minHeight: tokens.dimensions.minTouch,
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacing[1],
    paddingVertical: tokens.spacing[2],
  },
  label: getTextStyle("label"),
});
