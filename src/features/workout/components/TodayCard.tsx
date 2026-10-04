import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import IconRenderer from "@/shared/icons/icon-renderer";
import type { TodayView } from "../types/workout.types";

const ICON_SIZE = 20;

interface TodayCardProps {
  dayName: string;
  today: TodayView;
  isStarting: boolean;
  onStart: () => void;
}

/** Tarjeta volt: la acción primaria de Hoy. Terminado el entreno, muestra el estado en vez del botón. */
export function TodayCard({ dayName, today, isStarting, onStart }: TodayCardProps) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const { exercises, activeSessionId, isDoneToday } = today;

  return (
    <View style={[styles.card, { backgroundColor: c.accent }]}>
      <Text style={[styles.eyebrow, { color: c.onAccent }]}>
        {t("today.eyebrow", { minutes: today.durationMinutes })}
      </Text>
      <Text style={[styles.title, { color: c.onAccent }]}>{dayName}</Text>
      <View style={styles.stats}>
        <Text style={[styles.stat, { color: c.onAccent }]}>
          {t("today.stats.exercises", { count: exercises.length })}
        </Text>
        <Text style={[styles.stat, { color: c.onAccent }]}>
          {t("today.stats.sets", { count: today.totalSets })}
        </Text>
        <Text style={[styles.stat, { color: c.onAccent }]}>
          {t("today.stats.done", { done: today.completedExercises, total: exercises.length })}
        </Text>
      </View>
      {isDoneToday ? (
        <View style={styles.done}>
          <IconRenderer name="circle-check" size={ICON_SIZE} color={c.onAccent} />
          <Text style={[styles.stat, { color: c.onAccent }]}>{t("today.doneToday")}</Text>
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t(activeSessionId ? "today.continueSession" : "today.startSession")}
          accessibilityState={{ busy: isStarting }}
          disabled={isStarting}
          onPress={onStart}
          style={[styles.button, { backgroundColor: c.onAccent }]}
        >
          {isStarting ? (
            <ActivityIndicator color={c.accent} />
          ) : (
            <>
              <IconRenderer name="play" size={ICON_SIZE} color={c.accent} />
              <Text style={[styles.buttonLabel, { color: c.accent }]}>
                {t(activeSessionId ? "today.continueSession" : "today.startSession")}
              </Text>
            </>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: tokens.spacing[3], padding: tokens.spacing[6], borderRadius: tokens.borderRadius.lg },
  eyebrow: getTextStyle("label"),
  title: getTextStyle("displayLg"),
  stats: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[4] },
  stat: getTextStyle("body"),
  done: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[2] },
  button: {
    minHeight: tokens.dimensions.minTouch,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacing[2],
    borderRadius: tokens.borderRadius.md,
  },
  buttonLabel: { ...getTextStyle("title") },
});
