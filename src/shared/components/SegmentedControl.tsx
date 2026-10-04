import { Pressable, StyleSheet, Text, View } from "react-native";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";

interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: Readonly<SegmentedControlProps<T>>) {
  const { c } = useOverloadTheme();

  return (
    <View style={[styles.track, { backgroundColor: c.surfaceAlt }]}>
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: isSelected }}
            onPress={() => onChange(option.value)}
            style={[styles.segment, isSelected && { backgroundColor: c.accent }]}
          >
            <Text
              style={[
                styles.label,
                {
                  color: isSelected ? c.onAccent : c.textSecondary,
                  fontFamily: isSelected
                    ? tokens.typography.fontFamily.sansSemibold
                    : tokens.typography.fontFamily.sans,
                },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing[1],
  },
  segment: {
    flex: 1,
    minHeight: tokens.dimensions.minTouch,
    borderRadius: tokens.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  label: getTextStyle("bodySm"),
});
