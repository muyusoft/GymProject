import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Badge, ListRow } from "@/shared/components";
import type { PlanExerciseDetail } from "@/shared/db/queries/plan-exercise.queries";
import { getExerciseName } from "@/shared/utils/exercise-name.utils";
import type { ReorderDirection } from "../types/plan.types";
import { formatExerciseSubtitle } from "../utils/exercise-subtitle.utils";
import { ReorderButtons } from "./ReorderButtons";

interface DayExerciseRowProps {
  entry: PlanExerciseDetail;
  index: number;
  count: number;
  onPress: (planExerciseId: string) => void;
  onMove: (planExerciseId: string, direction: ReorderDirection) => void;
}

export function DayExerciseRow({ entry, index, count, onPress, onMove }: Readonly<DayExerciseRowProps>) {
  const { t, i18n } = useTranslation();
  const { planExercise, exercise } = entry;

  return (
    <ListRow
      title={getExerciseName(exercise, i18n.language)}
      subtitle={formatExerciseSubtitle({
        exercise: planExercise,
        t: (key) => t(key),
        locale: i18n.language,
      })}
      onPress={() => onPress(planExercise.id)}
      trailing={
        <View style={styles.trailing}>
          {planExercise.loadType === "time" && <Badge label={t("plan.timeBadge")} tone="info" />}
          <ReorderButtons
            canMoveUp={index > 0}
            canMoveDown={index < count - 1}
            onMove={(direction) => onMove(planExercise.id, direction)}
          />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  trailing: { flexDirection: "row", alignItems: "center" },
});
