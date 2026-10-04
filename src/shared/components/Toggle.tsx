import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";

interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}

export function Toggle({ value, onChange, label, description }: ToggleProps) {
  const { c } = useOverloadTheme();

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={styles.row}
    >
      <View style={styles.texts}>
        <Text style={[styles.label, { color: c.text }]}>{label}</Text>
        {description && (
          <Text style={[styles.description, { color: c.textSecondary }]}>
            {description}
          </Text>
        )}
      </View>
      <View pointerEvents="none" accessible={false}>
        <Switch
          value={value}
          trackColor={{ false: c.surfaceAlt, true: c.accent }}
          thumbColor={value ? c.onAccent : c.textSecondary}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: tokens.dimensions.minTouch,
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[4],
  },
  texts: { flex: 1 },
  label: getTextStyle("body"),
  description: getTextStyle("bodySm"),
});
