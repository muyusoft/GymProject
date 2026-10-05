import { router } from "expo-router";
import { ScrollView, StyleSheet, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { AsyncStateView, Button, EmptyState, ScreenHeader } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { getExerciseName } from "@/shared/utils/exercise-name.utils";
import { useExerciseInfo } from "../hooks/use-exercise-info";
import { pickSteps } from "../utils/exercise-info.utils";
import { ExerciseImages } from "./ExerciseImages";
import { ExerciseInfoMuscles } from "./ExerciseInfoMuscles";
import { ExerciseSteps } from "./ExerciseSteps";

interface ExerciseInfoScreenProps {
  exerciseId: string;
}

/** La ficha de un ejercicio: cómo se ve, cómo se hace y qué músculos trabaja. */
export function ExerciseInfoScreen({ exerciseId }: Readonly<ExerciseInfoScreenProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const { status, data, reload } = useExerciseInfo(exerciseId);
  const name = data ? getExerciseName(data, i18n.language) : "";

  return (
    <AsyncStateView status={status} onRetry={() => void reload()}>
      {data ? (
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader eyebrow={t(`equipment.${data.equipment}`)} onBack={() => router.back()} />
          <Text style={[styles.title, { color: c.text }]}>{name}</Text>
          <ExerciseImages urls={data.imageUrls} name={name} />
          <ExerciseSteps content={pickSteps({ language: i18n.language, stepsEs: data.stepsEs, stepsEn: data.stepsEn })} />
          <ExerciseInfoMuscles muscles={data.muscles} />
          <Button
            variant="secondary"
            label={t("exerciseInfo.history")}
            icon="history"
            block
            onPress={() => router.push({ pathname: "/exercise/[id]", params: { id: data.id } })}
          />
          <Text style={[styles.credit, { color: c.textSecondary }]}>{t("exerciseInfo.credit")}</Text>
        </ScrollView>
      ) : (
        <EmptyState title={t("exerciseInfo.notFound")} />
      )}
    </AsyncStateView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: tokens.spacing[4],
    padding: tokens.dimensions.screenGutter,
    paddingBottom: tokens.spacing[12],
  },
  title: getTextStyle("displayLg"),
  credit: getTextStyle("bodySm"),
});
