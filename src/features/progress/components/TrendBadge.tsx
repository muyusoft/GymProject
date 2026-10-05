import { StyleSheet, Text, View } from "react-native";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import type { IconName } from "@/shared/icons";
import IconRenderer from "@/shared/icons/icon-renderer";
import type { TrendDirection } from "../types/progress.types";

const ICON_SIZE = 16;
const ICONS: Record<TrendDirection, IconName> = {
  up: "trending-up",
  same: "minus",
  down: "trending-down",
};

interface TrendBadgeProps {
  direction: TrendDirection;
  text: string;
}

/** Subir va en volt; igual y bajar, en gris (nunca rojo). La dirección va en icono y en el texto. */
export function TrendBadge({ direction, text }: Readonly<TrendBadgeProps>) {
  const { c } = useOverloadTheme();
  const color = direction === "up" ? c.accentText : c.textSecondary;

  return (
    <View style={styles.row}>
      <IconRenderer name={ICONS[direction]} size={ICON_SIZE} color={color} />
      <Text style={[styles.text, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[1] },
  text: getTextStyle("bodySm"),
});
