import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Badge, Button, ExerciseInfoButton } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { getExerciseName } from "@/shared/utils/exercise-name.utils";
import type { SetPatch } from "../services/session-write.service";
import type { SessionExercise, SessionSet } from "../types/workout.types";
import { getSetStatuses } from "../utils/session-stats.utils";
import { formatTemplateSummary } from "../utils/template.utils";
import { SetEditor } from "./SetEditor";
import { SetRow } from "./SetRow";

interface ExerciseCardProps {
  exercise: SessionExercise;
  editingSetId: string | null;
  onToggleSet: (set: SessionSet) => void;
  onEditSet: (setId: string | null) => void;
  onChangeSet: (setId: string, patch: SetPatch) => void;
  onAddSet: () => void;
  onSubstitute: () => void;
}

export function ExerciseCard({
  exercise,
  editingSetId,
  onToggleSet,
  onEditSet,
  onChangeSet,
  onAddSet,
}: Readonly<ExerciseCardProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const statuses = getSetStatuses(exercise.sets);
  const doneCount = exercise.sets.filter((set) => set.completed).length;

  return (
    <View style={[styles.card, { backgroundColor: c.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.name, { color: c.text }]}>{getExerciseName(exercise, i18n.language)}</Text>
        <ExerciseInfoButton exerciseId={exercise.exerciseId} name={getExerciseName(exercise, i18n.language)} />
        <Badge label={`${doneCount}/${exercise.sets.length}`} />
      </View>
      <Text style={[styles.template, { color: c.textSecondary }]}>
        {t("session.template", { summary: formatTemplateSummary(exercise.template, i18n.language) })}
      </Text>
      {exercise.slot.isSubstituted && (
        <Text style={[styles.template, { color: c.textSecondary }]}>{t("substitute.active")}</Text>
      )}
      <View style={styles.columns}>
        <Text style={[styles.column, styles.indexColumn, { color: c.textSecondary }]}>{t("session.columns.set")}</Text>
        <Text style={[styles.column, { color: c.textSecondary }]}>{t("session.columns.weight")}</Text>
        <Text style={[styles.column, { color: c.textSecondary }]}>{t("session.columns.reps")}</Text>
      </View>
      {exercise.sets.map((set) => (
        <View key={set.id} style={styles.setBlock}>
          <SetRow
            set={set}
            status={statuses.get(set.id) ?? "pending"}
            onToggle={() => onToggleSet(set)}
            onEdit={() => onEditSet(editingSetId === set.id ? null : set.id)}
          />
          {editingSetId === set.id && (
            <SetEditor
              set={set}
              template={exercise.template}
              onChange={(patch) => onChangeSet(set.id, patch)}
              onClose={() => onEditSet(null)}
            />
          )}
        </View>
      ))}
      <Button variant="secondary" label={t("session.addSet")} block onPress={onAddSet} />
      <Button variant="ghost" label={t("session.substitute")} icon="arrow-right-left" block onPress={onSubstitute} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: tokens.spacing[3], padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: tokens.spacing[3] },
  name: { ...getTextStyle("title"), flex: 1 },
  template: getTextStyle("bodySm"),
  columns: { flexDirection: "row", paddingHorizontal: tokens.spacing[3] },
  column: { ...getTextStyle("label"), flex: 1 },
  indexColumn: { flex: 0, width: tokens.spacing[10] },
  setBlock: { gap: tokens.spacing[2] },
});
