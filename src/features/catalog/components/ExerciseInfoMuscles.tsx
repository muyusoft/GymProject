import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { BodyMap } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import type { MuscleRole } from "@/shared/types/training.types";
import type { GroupPaintMap } from "@/shared/utils/body-map.utils";
import { muscleLabelKey } from "@/shared/utils/muscle-label.utils";
import type { InfoMuscle } from "../types/exercise-info.types";

const LIST_SEPARATOR = ", ";

interface ExerciseInfoMusclesProps {
  muscles: readonly InfoMuscle[];
}

/** Los músculos con fuente, en la figura y en texto. Sin datos no se pinta nada y se dice. */
export function ExerciseInfoMuscles({ muscles }: Readonly<ExerciseInfoMusclesProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const names = (role: MuscleRole) =>
    muscles
      .filter((muscle) => muscle.role === role)
      .map((muscle) => t(muscleLabelKey(muscle)))
      .join(LIST_SEPARATOR) || t("muscles.none");
  const paint: GroupPaintMap = Object.fromEntries(
    muscles.map(({ group, view, role }) => [group, { color: role === "primary" ? c.musclePrimary : c.muscleSecondary, view }]),
  );

  return (
    <View style={[styles.card, { backgroundColor: c.surface }]}>
      <Text style={[styles.label, { color: c.textSecondary }]}>{t("exerciseInfo.muscles.title")}</Text>
      {muscles.length === 0 ? (
        <Text style={[styles.text, { color: c.textSecondary }]}>{t("muscles.noData")}</Text>
      ) : (
        <>
          <BodyMap mode="exercise" groups={paint} />
          <Text style={[styles.text, { color: c.text }]}>{t("exerciseInfo.muscles.primary", { names: names("primary") })}</Text>
          <Text style={[styles.text, { color: c.text }]}>{t("exerciseInfo.muscles.secondary", { names: names("secondary") })}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: tokens.spacing[3], padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg },
  label: getTextStyle("label"),
  text: getTextStyle("body"),
});
