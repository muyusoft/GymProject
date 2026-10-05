import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";

const DOT_SIZE = tokens.spacing[2];
const TODAY_BORDER = 1;
const DISABLED_OPACITY = 0.4;

interface CalendarDayCellProps {
  /** null deja el hueco de un día de otro mes. */
  date: Date | null;
  isTrained: boolean;
  isToday: boolean;
  isDisabled: boolean;
  onSelect: (date: Date) => void;
}

/** Un día del mes. El entreno hecho se ve con un punto y se anuncia con texto; hoy lleva borde. */
export function CalendarDayCell({ date, isTrained, isToday, isDisabled, onSelect }: Readonly<CalendarDayCellProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  if (!date) return <View style={styles.cell} />;

  const fullDate = new Intl.DateTimeFormat(i18n.language, { weekday: "long", day: "numeric", month: "long" }).format(date);
  const status = t(isTrained ? "today.status.done" : "today.status.none");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("today.calendar.day", { date: fullDate, status })}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={() => onSelect(date)}
      style={[styles.cell, styles.day, { borderColor: isToday ? c.text : "transparent", opacity: isDisabled ? DISABLED_OPACITY : 1 }]}
    >
      <Text style={[styles.number, { color: c.text }]}>{date.getDate()}</Text>
      <View style={[styles.dot, isTrained && { backgroundColor: c.accentText }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: { flex: 1, minHeight: tokens.dimensions.minTouch },
  day: {
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacing[1],
    borderWidth: TODAY_BORDER,
    borderRadius: tokens.borderRadius.md,
  },
  number: getTextStyle("body"),
  dot: { width: DOT_SIZE, height: DOT_SIZE, borderRadius: tokens.borderRadius.full },
});
