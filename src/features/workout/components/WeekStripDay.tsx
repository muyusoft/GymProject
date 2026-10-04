import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import type { WeekStripDay as WeekStripDayData } from "../types/workout.types";

const DOT_SIZE = tokens.spacing[2];
const DOT_BORDER = 1;

interface WeekStripDayProps {
  day: WeekStripDayData;
  /** Solo los días con sesión hecha se pueden abrir para ver el resumen. */
  onPress?: () => void;
}

/** El estado se ve por la forma del punto (lleno, hueco, ninguno) y se anuncia con texto. */
export function WeekStripDay({ day, onPress }: WeekStripDayProps) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const textColor = day.isToday ? c.onAccent : c.text;

  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={`${t(`weekday.long.${day.weekday}`)} ${day.date.getDate()}, ${t(`today.status.${day.status}`)}`}
      accessibilityHint={onPress ? t("daySummary.openHint") : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={[styles.day, day.isToday && { backgroundColor: c.accent }]}
    >
      <Text style={[styles.weekday, { color: day.isToday ? c.onAccent : c.textSecondary }]}>
        {t(`weekday.short.${day.weekday}`)}
      </Text>
      <Text style={[styles.number, { color: textColor }]}>{day.date.getDate()}</Text>
      <View
        style={[
          styles.dot,
          day.status === "done" && { backgroundColor: day.isToday ? c.onAccent : c.accentText },
          day.status === "planned" && { borderColor: day.isToday ? c.onAccent : c.textSecondary },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  day: {
    flex: 1,
    alignItems: "center",
    gap: tokens.spacing[1],
    paddingVertical: tokens.spacing[2],
    borderRadius: tokens.borderRadius.full,
  },
  weekday: getTextStyle("label"),
  number: getTextStyle("numeric"),
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: tokens.borderRadius.full,
    borderWidth: DOT_BORDER,
    borderColor: "transparent",
  },
});
