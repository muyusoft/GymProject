import { StyleSheet, TextInput, View } from "react-native";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import IconRenderer from "@/shared/icons/icon-renderer";

const PENCIL_SIZE = 20;

interface PlanNameInputProps {
  value: string;
  accessibilityLabel: string;
  onChange: (value: string) => void;
}

/** Título editable de pantalla (plan o día) con el lápiz como pista visual. */
export function PlanNameInput({ value, accessibilityLabel, onChange }: Readonly<PlanNameInputProps>) {
  const { c } = useOverloadTheme();

  return (
    <View style={styles.row}>
      <TextInput
        accessibilityLabel={accessibilityLabel}
        value={value}
        onChangeText={onChange}
        placeholderTextColor={c.textSecondary}
        style={[styles.input, { color: c.text }]}
      />
      <IconRenderer name="pencil" size={PENCIL_SIZE} color={c.textSecondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[2] },
  input: { ...getTextStyle("displayLg"), flex: 1, minHeight: tokens.dimensions.minTouch },
});
