import { addMonths, isAfter, isBefore, isSameDay, startOfDay, startOfMonth } from "date-fns";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";
import { buildMonthGrid, toIsoDate, WEEKDAY_COUNT } from "@/shared/utils/week.utils";
import { CalendarDayCell } from "./CalendarDayCell";

const ICON_SIZE = 24;
const DISABLED_OPACITY = 0.4;
const WEEKDAYS = Array.from({ length: WEEKDAY_COUNT }, (_, weekday) => weekday);

interface CalendarSheetProps {
  isVisible: boolean;
  today: Date;
  /** El primer día al que se puede saltar: el lunes de la semana de la primera sesión. */
  firstDate: Date;
  trainedDates: ReadonlySet<string>;
  onSelect: (date: Date) => void;
  onClose: () => void;
}

type CalendarMonthProps = Omit<CalendarSheetProps, "isVisible" | "onClose">;

function CalendarMonth({ today, firstDate, trainedDates, onSelect }: Readonly<CalendarMonthProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const [month, setMonth] = useState(() => startOfMonth(today));
  const title = new Intl.DateTimeFormat(i18n.language, { month: "long", year: "numeric" }).format(month);
  const canGoBack = isAfter(month, startOfMonth(firstDate));
  const canGoForward = isBefore(month, startOfMonth(today));
  const isOutOfRange = (date: Date) => isAfter(startOfDay(date), startOfDay(today)) || isBefore(date, startOfDay(firstDate));

  const arrow = (direction: -1 | 1, isEnabled: boolean) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t(direction === -1 ? "today.calendar.previous" : "today.calendar.next")}
      accessibilityState={{ disabled: !isEnabled }}
      disabled={!isEnabled}
      onPress={() => setMonth((current) => addMonths(current, direction))}
      style={[styles.arrow, { opacity: isEnabled ? 1 : DISABLED_OPACITY }]}
    >
      <IconRenderer name={direction === -1 ? "chevron-left" : "chevron-right"} size={ICON_SIZE} color={c.text} />
    </Pressable>
  );

  return (
    <>
      <View style={styles.header}>
        {arrow(-1, canGoBack)}
        <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>{title}</Text>
        {arrow(1, canGoForward)}
      </View>
      <View style={styles.row}>
        {WEEKDAYS.map((weekday) => (
          <Text key={weekday} style={[styles.weekday, { color: c.textSecondary }]}>{t(`weekday.short.${weekday}`)}</Text>
        ))}
      </View>
      {buildMonthGrid(month).map((week, rowIndex) => (
        // Las filas de un mes no tienen id y su orden es fijo: la posición es su identidad.
        <View key={`${toIsoDate(month)}-${rowIndex}`} style={styles.row}>
          {week.map((date, weekday) => (
            <CalendarDayCell
              key={date ? toIsoDate(date) : `gap-${weekday}`}
              date={date}
              isTrained={date !== null && trainedDates.has(toIsoDate(date))}
              isToday={date !== null && isSameDay(date, today)}
              isDisabled={date !== null && isOutOfRange(date)}
              onSelect={onSelect}
            />
          ))}
        </View>
      ))}
      <Text style={[styles.legend, { color: c.textSecondary }]}>{t("today.calendar.legend")}</Text>
    </>
  );
}

/** Un mes a la vista para saltar a un día: los días con entreno llevan un punto; los futuros no se pueden elegir. */
export function CalendarSheet({ isVisible, onClose, ...month }: Readonly<CalendarSheetProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("today.calendar.close")}
        onPress={onClose}
        style={[styles.backdrop, { backgroundColor: c.overlay }]}
      />
      <View style={[styles.sheet, { backgroundColor: c.surface }]}>{isVisible && <CalendarMonth {...month} />}</View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  sheet: {
    gap: tokens.spacing[2],
    padding: tokens.spacing[6],
    borderTopLeftRadius: tokens.borderRadius.lg,
    borderTopRightRadius: tokens.borderRadius.lg,
  },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { ...getTextStyle("title"), textTransform: "capitalize" },
  arrow: {
    width: tokens.dimensions.minTouch,
    height: tokens.dimensions.minTouch,
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row", gap: tokens.spacing[1] },
  weekday: { ...getTextStyle("label"), flex: 1, textAlign: "center" },
  legend: getTextStyle("bodySm"),
});
