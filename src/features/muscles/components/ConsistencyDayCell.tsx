import { parseISO } from "date-fns";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import type { CalendarDay } from "../types/muscles.types";

const BORDER_WIDTH = 2;
/** Las celdas son chicas: el área táctil se amplía un poco hacia el espacio entre ellas. */
const CELL_HIT_SLOP = tokens.spacing[1];

interface ConsistencyDayCellProps {
  /** null deja el hueco de un día de otro mes. */
  day: CalendarDay | null;
  /** Abre el resumen del día; solo aplica a los días con entreno hecho. */
  onSelect: (date: string) => void;
}

/**
 * Un día del mes. Hecho va relleno, pendiente con borde punteado y hoy con borde sólido;
 * además cada estado se anuncia con texto.
 */
export function ConsistencyDayCell({ day, onSelect }: Readonly<ConsistencyDayCellProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  if (!day) return <View style={styles.cell} />;

  const isDone = day.state === "done";
  const fullDate = new Intl.DateTimeFormat(i18n.language, { weekday: "long", day: "numeric", month: "long" }).format(parseISO(day.date));
  const borderColor = day.isToday ? c.text : c.accentText;
  const hasBorder = day.isToday || day.state === "pending";

  return (
    <Pressable
      accessibilityRole={isDone ? "button" : "text"}
      accessibilityLabel={t("muscles.consistency.day", { date: fullDate, state: t(`muscles.consistency.state.${day.state}`) })}
      accessibilityHint={isDone ? t("daySummary.openHint") : undefined}
      disabled={!isDone}
      onPress={() => onSelect(day.date)}
      hitSlop={CELL_HIT_SLOP}
      style={[
        styles.cell,
        styles.day,
        { backgroundColor: isDone ? c.accentText : c.surfaceAlt },
        hasBorder && { borderColor, borderStyle: day.isToday ? "solid" : "dashed" },
      ]}
    >
      <Text style={[styles.number, { color: isDone ? c.surface : c.textSecondary }]}>{day.dayOfMonth}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: { flex: 1, aspectRatio: 1 },
  day: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: tokens.borderRadius.md,
    borderWidth: BORDER_WIDTH,
    borderColor: "transparent",
  },
  number: getTextStyle("label"),
});
