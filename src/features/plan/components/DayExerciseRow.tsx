import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { tokens } from "@/design/tokens";
import { Badge, ListRow } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";
import type { PlanExerciseDetail } from "@/shared/db/queries/plan-exercise.queries";
import { getExerciseName } from "@/shared/utils/exercise-name.utils";
import type { ReorderDirection } from "../types/plan.types";
import { formatExerciseSubtitle } from "../utils/exercise-subtitle.utils";
import { ReorderButtons } from "./ReorderButtons";

const ICON_SIZE = 20;

interface DayExerciseRowProps {
  entry: PlanExerciseDetail;
  index: number;
  count: number;
  onPress: (planExerciseId: string) => void;
  onMove: (planExerciseId: string, direction: ReorderDirection) => void;
  onSwap: (entry: PlanExerciseDetail) => void;
}

export function DayExerciseRow({ entry, index, count, onPress, onMove, onSwap }: Readonly<DayExerciseRowProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const { planExercise, exercise } = entry;
  const name = getExerciseName(exercise, i18n.language);

  return (
    <ListRow
      title={name}
      subtitle={formatExerciseSubtitle({
        exercise: planExercise,
        t: (key) => t(key),
        locale: i18n.language,
      })}
      onPress={() => onPress(planExercise.id)}
      trailing={
        <View style={styles.trailing}>
          {planExercise.loadType === "time" && <Badge label={t("plan.timeBadge")} tone="info" />}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("substitute.title", { name })}
            onPress={() => onSwap(entry)}
            style={styles.action}
          >
            <IconRenderer name="arrow-right-left" size={ICON_SIZE} color={c.textSecondary} />
          </Pressable>
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
  action: {
    width: tokens.dimensions.minTouch,
    height: tokens.dimensions.minTouch,
    alignItems: "center",
    justifyContent: "center",
  },
});
