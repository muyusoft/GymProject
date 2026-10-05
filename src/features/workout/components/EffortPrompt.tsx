import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Chip } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { useSettingsStore } from "@/shared/store";
import {
  EFFORT_LEVELS,
  effortOfSets,
  type EffortLevel,
} from "@/shared/utils/effort.utils";
import type { SessionExercise } from "../types/workout.types";
import { isExerciseDone } from "../utils/session-stats.utils";

interface EffortPromptProps {
  exercise: SessionExercise;
  /** null quita la respuesta. */
  onRate: (level: EffortLevel | null) => void;
}

/**
 * Al terminar todas las series de un ejercicio con repeticiones: cuántas quedaban en reserva.
 * Es opcional y de un toque; la respuesta ajusta cuándo se sugiere subir peso.
 */
export function EffortPrompt({
  exercise,
  onRate,
}: Readonly<EffortPromptProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const isEnabled = useSettingsStore((state) => state.trackRpe);

  if (
    !isEnabled ||
    exercise.template.reps === null ||
    !isExerciseDone(exercise)
  )
    return null;
  const selected = effortOfSets(exercise.sets);

  return (
    <View style={[styles.card, { backgroundColor: c.surface }]}>
      <View>
        <Text style={[styles.question, { color: c.text }]}>
          {t("session.effort.question")}
        </Text>
        <Text style={[styles.hint, { color: c.textSecondary }]}>
          {t("session.effort.hint")}
        </Text>
      </View>
      <View accessibilityRole="radiogroup" style={styles.options}>
        {EFFORT_LEVELS.map((level) => (
          <Chip
            key={level}
            label={t(`session.effort.levels.${level}`)}
            selected={selected === level}
            onPress={() => onRate(selected === level ? null : level)}
          />
        ))}
      </View>
      {selected !== null && (
        <Text style={[styles.hint, { color: c.textSecondary }]}>
          {t(`session.effort.outcome.${selected}`)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: tokens.spacing[3],
    padding: tokens.spacing[4],
    borderRadius: tokens.borderRadius.lg,
  },
  question: getTextStyle("title"),
  hint: getTextStyle("bodySm"),
  options: { gap: tokens.spacing[2] },
});
