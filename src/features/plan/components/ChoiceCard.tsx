import { Pressable, StyleSheet, Text, View } from "react-native";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";

const CHECK_SIZE = 16;
const SELECTED_BORDER = 2;

interface ChoiceCardProps {
  title: string;
  body?: string;
  isSelected: boolean;
  onPress: () => void;
}

/** Una opción de una pregunta: la elegida lleva borde y un check, no solo otro color. */
export function ChoiceCard({ title, body, isSelected, onPress }: Readonly<ChoiceCardProps>) {
  const { c } = useOverloadTheme();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={body ? `${title}. ${body}` : title}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: c.surface,
          borderColor: isSelected ? c.text : c.border,
          borderWidth: isSelected ? SELECTED_BORDER : StyleSheet.hairlineWidth * 2,
        },
      ]}
    >
      <View style={styles.texts}>
        <Text style={[styles.title, { color: c.text }]}>{title}</Text>
        {body && <Text style={[styles.body, { color: c.textSecondary }]}>{body}</Text>}
      </View>
      <View
        style={[
          styles.check,
          isSelected ? { backgroundColor: c.text } : { borderColor: c.border, borderWidth: SELECTED_BORDER },
        ]}
      >
        {isSelected && <IconRenderer name="check" size={CHECK_SIZE} color={c.background} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: tokens.dimensions.minTouch,
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
    borderRadius: tokens.borderRadius.lg,
  },
  texts: { flex: 1 },
  title: { ...getTextStyle("body"), fontFamily: tokens.typography.fontFamily.sansSemibold },
  body: getTextStyle("bodySm"),
  check: {
    width: tokens.spacing[8],
    height: tokens.spacing[8],
    borderRadius: tokens.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
