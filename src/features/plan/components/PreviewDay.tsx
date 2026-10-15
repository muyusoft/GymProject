import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";
import { estimateDurationMinutes, formatClock } from "@/shared/utils/duration.utils";
import { getExerciseName } from "@/shared/utils/exercise-name.utils";
import { formatReps } from "@/shared/utils/progression-rule.utils";
import type { CatalogExercise, GeneratedDay, GeneratedExercise } from "../types/plan-generator.types";

const ICON_SIZE = 20;
const SWAP_ICON_SIZE = 16;

interface PreviewDayProps {
  day: GeneratedDay;
  catalog: readonly CatalogExercise[];
  isOpen: boolean;
  onToggle: () => void;
  /** Tocar un ejercicio abre las alternativas para cambiarlo. */
  onSwap: (index: number) => void;
}

function prescriptionText(exercise: GeneratedExercise): string {
  const amount =
    exercise.reps === null ? formatClock(exercise.seconds ?? 0) : formatReps(exercise.reps, exercise.repsMin);
  return `${exercise.sets} × ${amount}`;
}

/** Un día del plan propuesto; desplegado muestra sus ejercicios con series × reps. */
export function PreviewDay({ day, catalog, isOpen, onToggle, onSwap }: Readonly<PreviewDayProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const name = t(`plan.wizard.days.${day.template}`);
  const nameOf = (id: string) => {
    const exercise = catalog.find((candidate) => candidate.id === id);
    return exercise ? getExerciseName(exercise, i18n.language) : "";
  };

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: isOpen ? c.border : c.surface }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel={`${t(`weekday.long.${day.weekday}`)}, ${name}`}
        onPress={onToggle}
        style={styles.header}
      >
        <Text style={[styles.weekday, { color: c.text }]}>{t(`weekday.short.${day.weekday}`)}</Text>
        <View style={styles.texts}>
          <Text style={[styles.name, { color: c.text }]}>{name}</Text>
          <Text style={[styles.meta, { color: c.textSecondary }]}>
            {t("plan.daySubtitle", {
              count: day.exercises.length,
              minutes: estimateDurationMinutes(day.exercises),
            })}
          </Text>
        </View>
        <IconRenderer name={isOpen ? "chevron-up" : "chevron-down"} size={ICON_SIZE} color={c.textSecondary} />
      </Pressable>
      {isOpen &&
        day.exercises.map((exercise, index) => (
          <Pressable
            key={`${exercise.exerciseId}-${exercise.pattern}`}
            accessibilityRole="button"
            accessibilityLabel={t("plan.wizard.swap.action", { exercise: nameOf(exercise.exerciseId) })}
            onPress={() => onSwap(index)}
            style={styles.exercise}
          >
            <Text style={[styles.exerciseName, { color: c.text }]}>{nameOf(exercise.exerciseId)}</Text>
            <Text style={[styles.exerciseSets, { color: c.textSecondary }]}>{prescriptionText(exercise)}</Text>
            <IconRenderer name="arrow-right-left" size={SWAP_ICON_SIZE} color={c.textSecondary} />
          </Pressable>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: tokens.borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
    paddingBottom: tokens.spacing[2],
  },
  header: {
    minHeight: tokens.dimensions.minTouch,
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[4],
    paddingTop: tokens.spacing[2],
  },
  weekday: { ...getTextStyle("label"), width: tokens.spacing[10] },
  texts: { flex: 1 },
  name: { ...getTextStyle("body"), fontFamily: tokens.typography.fontFamily.sansSemibold },
  meta: getTextStyle("bodySm"),
  exercise: {
    minHeight: tokens.dimensions.minTouch,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacing[2],
    paddingLeft: tokens.spacing[16],
    paddingRight: tokens.spacing[4],
    paddingVertical: tokens.spacing[1],
  },
  exerciseName: { ...getTextStyle("bodySm"), flex: 1 },
  exerciseSets: getTextStyle("bodySm"),
});
