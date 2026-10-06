import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import IconRenderer from "@/shared/icons/icon-renderer";
import { getExerciseName } from "@/shared/utils/exercise-name.utils";
import type { SessionExercise } from "../types/workout.types";

const CHEVRON_SIZE = 20;

interface ExerciseNavCardProps {
  direction: "next" | "previous";
  exercise: SessionExercise;
  onPress: () => void;
}

/** Salto al ejercicio siguiente o al anterior de la sesión. */
export function ExerciseNavCard({
  direction,
  exercise,
  onPress,
}: Readonly<ExerciseNavCardProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const { template } = exercise;
  const work = template.reps ?? template.seconds ?? 0;
  const label = t(direction === "next" ? "session.next" : "session.previous");
  const name = getExerciseName(exercise, i18n.language);
  const isNext = direction === "next";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${name}`}
      onPress={onPress}
      style={[styles.card, { backgroundColor: c.surface }]}
    >
      {!isNext && (
        <IconRenderer
          name="chevron-left"
          size={CHEVRON_SIZE}
          color={c.textSecondary}
        />
      )}
      <View style={styles.texts}>
        <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>
        <Text
          style={[styles.name, { color: c.text }]}
        >{`${name} · ${template.sets} × ${work}`}</Text>
      </View>
      {isNext && (
        <IconRenderer
          name="chevron-right"
          size={CHEVRON_SIZE}
          color={c.textSecondary}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: tokens.dimensions.minTouch,
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[3],
    padding: tokens.spacing[4],
    borderRadius: tokens.borderRadius.lg,
  },
  texts: { flex: 1, gap: tokens.spacing[1] },
  label: getTextStyle("label"),
  name: getTextStyle("title"),
});
