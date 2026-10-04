import { StyleSheet, Text, View } from "react-native";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import IconRenderer from "@/shared/icons/icon-renderer";

const ICON_SIZE = 20;

interface InlineErrorProps {
  message: string;
}

/** Aviso de error con icono y texto (nunca solo color). */
export function InlineError({ message }: InlineErrorProps) {
  const { c } = useOverloadTheme();

  return (
    <View accessibilityRole="alert" style={styles.row}>
      <IconRenderer name="triangle-alert" size={ICON_SIZE} color={c.danger} />
      <Text style={[styles.message, { color: c.danger }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[2] },
  message: { ...getTextStyle("bodySm"), flex: 1 },
});
