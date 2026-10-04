import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { toIsoDate } from "@/shared/utils/week.utils";
import type { WeekColumn } from "../types/muscles.types";
import type { PendingDay } from "../utils/consistency.utils";
import { formatShortDate } from "../utils/date-label.utils";

const PENDING_BORDER_WIDTH = 2;
/** Las celdas son chicas: el área táctil se amplía para llegar a 44. */
const CELL_HIT_SLOP = tokens.spacing[2];

interface ConsistencyGridProps {
  columns: readonly WeekColumn[];
  streak: number;
  pending: PendingDay | null;
  /** Abre el resumen del día de una sesión hecha. */
  onSelectDate: (date: string) => void;
}

/** 12 semanas: una columna por semana y una celda por sesión (hecha, pendiente o vacía), con el resumen en texto. */
export function ConsistencyGrid({ columns, streak, pending, onSelectDate }: ConsistencyGridProps) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const first = columns[0]?.weekStart;
  const doneCount = columns.reduce((sum, column) => sum + column.cells.filter((cell) => cell === "done").length, 0);

  const footer = pending
    ? t(pending.isToday ? "muscles.consistency.todayMissing" : "muscles.consistency.missing", {
        weekday: t(`weekday.long.${pending.weekday}`).toLowerCase(),
      })
    : t("muscles.consistency.complete");

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: c.textSecondary }]}>{t("muscles.consistency.title")}</Text>
        <Text style={[styles.label, { color: c.reward }]}>{t("muscles.consistency.streak", { count: streak })}</Text>
      </View>
      <View accessibilityLabel={t("muscles.consistency.a11y", { count: doneCount })} style={[styles.card, { backgroundColor: c.surface }]}>
        <View style={styles.grid}>
          {columns.map((column) => (
            <View key={toIsoDate(column.weekStart)} style={styles.column}>
              {column.cells.map((cell, row) => {
                const date = cell === "done" ? column.dates[row] : undefined;
                return (
                  <Pressable
                    key={`${toIsoDate(column.weekStart)}-${row}`}
                    accessibilityRole={date ? "button" : undefined}
                    accessibilityLabel={date ? t("daySummary.openDate", { date: formatShortDate(date, i18n.language) }) : undefined}
                    importantForAccessibility={date ? "yes" : "no"}
                    disabled={!date}
                    onPress={date ? () => onSelectDate(date) : undefined}
                    hitSlop={CELL_HIT_SLOP}
                    style={[
                      styles.cell,
                      cell === "done" && { backgroundColor: c.accentText },
                      cell === "pending" && { borderColor: c.accentText, borderWidth: PENDING_BORDER_WIDTH },
                      cell === "empty" && { backgroundColor: c.surfaceAlt },
                    ]}
                  />
                );
              })}
            </View>
          ))}
        </View>
        <View style={styles.footer}>
          <Text style={[styles.note, { color: c.textSecondary }]}>
            {first ? new Intl.DateTimeFormat(i18n.language, { month: "short" }).format(first) : ""}
          </Text>
          <Text style={[styles.note, { color: c.textSecondary }]}>{footer}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: tokens.spacing[2] },
  header: { flexDirection: "row", justifyContent: "space-between" },
  label: getTextStyle("label"),
  card: { gap: tokens.spacing[3], padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg },
  grid: { flexDirection: "row", gap: tokens.spacing[1] },
  column: { flex: 1, gap: tokens.spacing[1] },
  cell: { aspectRatio: 1, borderRadius: tokens.borderRadius.sm },
  footer: { flexDirection: "row", justifyContent: "space-between" },
  note: getTextStyle("bodySm"),
});
