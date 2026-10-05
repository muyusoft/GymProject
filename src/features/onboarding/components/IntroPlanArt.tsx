import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Badge } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";

interface SampleDay {
  weekday: number;
  name: "chest" | "back" | "rest" | "legs";
  exercises?: number;
  minutes?: number;
  isToday?: boolean;
}

const SAMPLE_DAYS: readonly SampleDay[] = [
  { weekday: 0, name: "chest", exercises: 5, minutes: 55, isToday: true },
  { weekday: 1, name: "back", exercises: 6, minutes: 60 },
  { weekday: 2, name: "rest" },
  { weekday: 3, name: "legs", exercises: 5, minutes: 65 },
];

function DayRow({ day }: Readonly<{ day: SampleDay }>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const isRest = day.exercises === undefined;
  const nameColor = isRest ? c.textSecondary : c.text;

  return (
    <View style={[styles.row, { backgroundColor: c.surface, borderColor: day.isToday ? c.text : c.surface }]}>
      <Text style={[styles.weekday, { color: nameColor }]}>{t(`weekday.short.${day.weekday}`)}</Text>
      <View style={styles.texts}>
        <Text style={[styles.name, { color: nameColor }]}>{t(`intro.samples.days.${day.name}`)}</Text>
        {!isRest && (
          <Text style={[styles.meta, { color: c.textSecondary }]}>
            {t("intro.samples.dayMeta", { count: day.exercises, minutes: day.minutes })}
          </Text>
        )}
      </View>
      {day.isToday && <Badge label={t("intro.samples.today")} />}
    </View>
  );
}

/** Ilustración del paso 1: unos días del plan semanal, con el de hoy marcado. */
export function IntroPlanArt() {
  const { t } = useTranslation();

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={t("intro.art.plan")} style={styles.list}>
      {SAMPLE_DAYS.map((day) => (
        <DayRow key={day.weekday} day={day} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: tokens.spacing[2] },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[3],
    minHeight: tokens.spacing[16],
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
    borderRadius: tokens.borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  weekday: { ...getTextStyle("label"), width: tokens.spacing[10] },
  texts: { flex: 1 },
  name: { ...getTextStyle("body"), fontFamily: tokens.typography.fontFamily.sansSemibold },
  meta: getTextStyle("bodySm"),
});
