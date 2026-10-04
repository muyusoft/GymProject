import { Pressable, StyleSheet, Text } from "react-native";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function Chip({ label, selected, onPress }: ChipProps) {
  const { c } = useOverloadTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: selected ? c.accent : c.surfaceAlt },
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: selected ? c.onAccent : c.text,
            fontFamily: selected
              ? tokens.typography.fontFamily.sansSemibold
              : tokens.typography.fontFamily.sans,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: tokens.dimensions.minTouch,
    borderRadius: tokens.borderRadius.sm,
    paddingHorizontal: tokens.spacing[4],
    alignItems: "center",
    justifyContent: "center",
  },
  label: getTextStyle("bodySm"),
});
