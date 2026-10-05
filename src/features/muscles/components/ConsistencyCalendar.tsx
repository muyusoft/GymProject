import { addMonths, isAfter, startOfMonth } from "date-fns";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";
import { toIsoDate, WEEKDAY_COUNT } from "@/shared/utils/week.utils";
import { buildConsistencyMonth, firstConsistencyMonth, isCurrentMonth, type PendingDay } from "../utils/consistency.utils";
import { ConsistencyDayCell } from "./ConsistencyDayCell";

const ICON_SIZE = 24;
const DISABLED_OPACITY = 0.4;
const WEEKDAYS = Array.from({ length: WEEKDAY_COUNT }, (_, weekday) => weekday);

interface ConsistencyCalendarProps {
  /** Fechas yyyy-MM-dd de todas las sesiones terminadas. */
  sessionDates: readonly string[];
  plannedWeekdays: readonly number[];
  today: Date;
  streak: number;
  pending: PendingDay | null;
  /** Abre el resumen del día de una sesión hecha. */
  onSelectDate: (date: string) => void;
}

/** Constancia como calendario: un mes a la vista, con flechas para ir a meses anteriores hasta la primera sesión. */
export function ConsistencyCalendar({ sessionDates, plannedWeekdays, today, streak, pending, onSelectDate }: Readonly<ConsistencyCalendarProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const [month, setMonth] = useState(() => startOfMonth(today));
  const calendar = useMemo(
    () => buildConsistencyMonth({ month, sessionDates, plannedWeekdays, today }),
    [month, sessionDates, plannedWeekdays, today],
  );
  const canGoBack = isAfter(month, firstConsistencyMonth(sessionDates, today));
  const canGoForward = !isCurrentMonth(month, today);
  const monthName = new Intl.DateTimeFormat(i18n.language, { month: "long", year: "numeric" }).format(month);
  const footer = (() => {
    if (!pending) {
      return t("muscles.consistency.complete");
    }

    const weekday = t(`weekday.long.${pending.weekday}`).toLowerCase();

    if (pending.isToday) {
      return t("muscles.consistency.todayMissing", { weekday });
    }

    return t("muscles.consistency.missing", { weekday });
  })();

  const arrow = (direction: -1 | 1, isEnabled: boolean) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t(direction === -1 ? "muscles.consistency.previous" : "muscles.consistency.next")}
      accessibilityState={{ disabled: !isEnabled }}
      disabled={!isEnabled}
      onPress={() => setMonth((current) => addMonths(current, direction))}
      style={[styles.arrow, { opacity: isEnabled ? 1 : DISABLED_OPACITY }]}
    >
      <IconRenderer name={direction === -1 ? "chevron-left" : "chevron-right"} size={ICON_SIZE} color={c.text} />
    </Pressable>
  );

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: c.textSecondary }]}>{t("muscles.consistency.title")}</Text>
        <Text style={[styles.label, { color: c.reward }]}>{t("muscles.consistency.streak", { count: streak })}</Text>
      </View>
      <View style={[styles.card, { backgroundColor: c.surface }]}>
        <View style={styles.nav}>
          {arrow(-1, canGoBack)}
          <View style={styles.month}>
            <Text accessibilityRole="header" style={[styles.monthName, { color: c.text }]}>{monthName}</Text>
            <Text style={[styles.note, { color: c.textSecondary }]}>
              {t("muscles.consistency.monthCount", { count: calendar.doneCount })}
            </Text>
          </View>
          {arrow(1, canGoForward)}
        </View>
        <View style={styles.row}>
          {WEEKDAYS.map((weekday) => (
            <Text key={weekday} style={[styles.weekday, { color: c.textSecondary }]}>{t(`weekday.short.${weekday}`)}</Text>
          ))}
        </View>
        {calendar.rows.map((week, rowIndex) => (
          // Las filas de un mes no tienen id y su orden es fijo: la posición es su identidad.
          <View key={`${toIsoDate(month)}-${rowIndex}`} style={styles.row}>
            {week.map((day, weekday) => (
              <ConsistencyDayCell key={day?.date ?? `gap-${weekday}`} day={day} onSelect={onSelectDate} />
            ))}
          </View>
        ))}
        {isCurrentMonth(month, today) && <Text style={[styles.note, { color: c.textSecondary }]}>{footer}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: tokens.spacing[2] },
  header: { flexDirection: "row", justifyContent: "space-between" },
  label: getTextStyle("label"),
  card: { gap: tokens.spacing[2], padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg },
  nav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  month: { alignItems: "center" },
  monthName: { ...getTextStyle("title"), textTransform: "capitalize" },
  arrow: {
    width: tokens.dimensions.minTouch,
    height: tokens.dimensions.minTouch,
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row", gap: tokens.spacing[2] },
  weekday: { ...getTextStyle("label"), flex: 1, textAlign: "center" },
  note: getTextStyle("bodySm"),
});
