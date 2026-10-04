import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Badge } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import IconRenderer from "@/shared/icons/icon-renderer";
import type { DaySummary } from "../types/plan.types";

const TODAY_BORDER_WIDTH = 2;
const CHECK_ICON_SIZE = 20;

interface DayCardProps {
  day: DaySummary;
  dayNumber: number;
  onPress: () => void;
}

export function DayCard({ day, dayNumber, onPress }: Readonly<DayCardProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const weekdayLabel = t("weekday.long." + day.weekday);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${weekdayLabel} ${dayNumber}, ${day.name}`}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: c.surface,
          borderColor: day.isToday ? c.accent : c.surface,
        },
      ]}
    >
      <View style={styles.date}>
        <Text style={[styles.weekday, { color: day.isToday ? c.accentText : c.textSecondary }]}>
          {t(`weekday.short.${day.weekday}`)}
        </Text>
        <Text style={[styles.number, { color: c.text }]}>{dayNumber}</Text>
      </View>
      <View style={styles.texts}>
        <Text style={[styles.name, { color: c.text }]}>{day.name}</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          {t("plan.daySubtitle", { count: day.exerciseCount, minutes: day.durationMinutes })}
        </Text>
      </View>
      {day.isDone && (
        <View
          accessibilityLabel={t("plan.done")}
          style={[styles.check, { backgroundColor: c.accent }]}
        >
          <IconRenderer name="check" size={CHECK_ICON_SIZE} color={c.onAccent} />
        </View>
      )}
      {day.isToday && !day.isDone && <Badge label={t("plan.today")} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: tokens.dimensions.minTouch,
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[4],
    padding: tokens.spacing[4],
    borderRadius: tokens.borderRadius.lg,
    borderWidth: TODAY_BORDER_WIDTH,
  },
  date: { alignItems: "center", minWidth: tokens.spacing[10] },
  weekday: getTextStyle("label"),
  number: getTextStyle("numeric"),
  texts: { flex: 1 },
  name: getTextStyle("title"),
  subtitle: getTextStyle("bodySm"),
  check: {
    width: tokens.spacing[8],
    height: tokens.spacing[8],
    borderRadius: tokens.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
});
