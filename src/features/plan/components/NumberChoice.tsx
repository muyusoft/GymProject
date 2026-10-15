import { Pressable, StyleSheet, Text, View } from "react-native";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";

interface NumberChoiceProps<T extends number> {
  options: readonly T[];
  value: T;
  /** Lo que dice el lector de pantalla de cada opción ("4 días", "45 minutos"). */
  labelFor: (option: T) => string;
  onChange: (option: T) => void;
}

/** Una fila de números para elegir uno; el elegido se invierte (fondo claro), no solo cambia de color. */
export function NumberChoice<T extends number>({ options, value, labelFor, onChange }: Readonly<NumberChoiceProps<T>>) {
  const { c } = useOverloadTheme();

  return (
    <View accessibilityRole="radiogroup" style={styles.row}>
      {options.map((option) => {
        const isSelected = option === value;
        return (
          <Pressable
            key={option}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={labelFor(option)}
            onPress={() => onChange(option)}
            style={[
              styles.option,
              isSelected
                ? { backgroundColor: c.text }
                : { backgroundColor: c.surface, borderColor: c.border, borderWidth: StyleSheet.hairlineWidth * 2 },
            ]}
          >
            <Text style={[styles.number, { color: isSelected ? c.background : c.text }]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: tokens.spacing[2] },
  option: {
    flex: 1,
    minHeight: tokens.dimensions.minTouch,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: tokens.borderRadius.md,
  },
  number: getTextStyle("numeric"),
});
