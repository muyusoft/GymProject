import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { ExerciseInfoButton, ListRow } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import IconRenderer from "@/shared/icons/icon-renderer";
import { getExerciseName } from "@/shared/utils/exercise-name.utils";
import { formatWeight } from "@/shared/utils/weight.utils";
import type { LibraryExercise } from "../types/catalog.types";
import { muscleLabelKey } from "@/shared/utils/muscle-label.utils";

const ADD_ICON_SIZE = 20;

interface LibraryListRowProps {
  exercise: LibraryExercise;
  /** Hay un día de destino y este ejercicio aún no está en él. */
  canAdd: boolean;
  onAdd: (exerciseId: string) => void;
}

export function LibraryListRow({
  exercise,
  canAdd,
  onAdd,
}: Readonly<LibraryListRowProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const name = getExerciseName(exercise, i18n.language);

  const subtitle = [
    exercise.primary[0] ? t(muscleLabelKey(exercise.primary[0])) : null,
    t(`equipment.${exercise.equipment}`),
    exercise.plan?.weekdays
      .map((weekday) => t(`weekday.short.${weekday}`).toUpperCase())
      .join(", "),
  ]
    .filter(Boolean)
    .join(" · ");

  const { plan } = exercise;
  // Se puede agregar aunque el ejercicio ya esté en otro día; sin botón, se muestra su peso en el plan.
  const action = canAdd ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("library.add", { name })}
      onPress={() => onAdd(exercise.id)}
      style={[styles.add, { backgroundColor: c.surfaceAlt }]}
    >
      <IconRenderer name="plus" size={ADD_ICON_SIZE} color={c.accentText} />
    </Pressable>
  ) : (
    plan &&
    plan.targetWeight !== null && (
      <Text style={[styles.weight, { color: c.textSecondary }]}>
        {formatWeight({
          value: plan.targetWeight,
          unit: plan.unit,
          locale: i18n.language,
        })}
      </Text>
    )
  );

  const trailing = (
    <View style={styles.trailing}>
      <ExerciseInfoButton exerciseId={exercise.id} name={name} />
      {action}
    </View>
  );

  return <ListRow title={name} subtitle={subtitle} trailing={trailing} />;
}

const styles = StyleSheet.create({
  trailing: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[2],
  },
  weight: getTextStyle("title"),
  add: {
    width: tokens.dimensions.minTouch,
    height: tokens.dimensions.minTouch,
    borderRadius: tokens.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
