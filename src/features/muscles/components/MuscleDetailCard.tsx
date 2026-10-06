import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Button } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { getExerciseName } from "@/shared/utils/exercise-name.utils";
import { muscleLabelKey } from "@/shared/utils/muscle-label.utils";
import type { DayExerciseMuscles, MuscleLink } from "../types/muscles.types";
import { summarizeLinks } from "../utils/exercise-muscles.utils";
import { SourcesSheet } from "./SourcesSheet";

interface MuscleDetailCardProps {
  exercise: DayExerciseMuscles;
}

/** Qué músculos trabaja el ejercicio; las fuentes del dato se abren aparte. Sin dato dice que no se pinta nada. */
export function MuscleDetailCard({ exercise }: MuscleDetailCardProps) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const { primary, secondary } = summarizeLinks(exercise.links);
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);

  const names = (links: readonly MuscleLink[]) =>
    links
      .map(
        (link) =>
          `${t(muscleLabelKey(link))}${link.basis === "described" ? ` (${t("muscles.described")})` : ""}`,
      )
      .join(", ");

  return (
    <View style={[styles.card, { backgroundColor: c.surface }]}>
      <Text style={[styles.title, { color: c.text }]}>
        {getExerciseName(exercise, i18n.language)}
      </Text>
      {exercise.links.length === 0 ? (
        <Text style={[styles.text, { color: c.textSecondary }]}>
          {t("muscles.noData")}
        </Text>
      ) : (
        <>
          <Text style={[styles.text, { color: c.textSecondary }]}>
            <Text
              style={[styles.strong, { color: c.accentText }]}
            >{`${t("muscles.primary")}: `}</Text>
            {names(primary) || t("muscles.none")}
          </Text>
          {secondary.length > 0 && (
            <Text style={[styles.text, { color: c.textSecondary }]}>
              <Text
                style={[styles.strong, { color: c.text }]}
              >{`${t("muscles.secondaries")}: `}</Text>
              {names(secondary)}
            </Text>
          )}
          {exercise.sources.length > 0 && (
            <Button
              variant="secondary"
              icon="info"
              label={t("muscles.sources.button", {
                count: exercise.sources.length,
              })}
              onPress={() => setIsSourcesOpen(true)}
            />
          )}
          <SourcesSheet
            isVisible={isSourcesOpen}
            sources={exercise.sources}
            onClose={() => setIsSourcesOpen(false)}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: tokens.spacing[2],
    padding: tokens.spacing[4],
    borderRadius: tokens.borderRadius.lg,
  },
  title: getTextStyle("title"),
  text: getTextStyle("body"),
  strong: {
    ...getTextStyle("body"),
    fontFamily: tokens.typography.fontFamily.sansSemibold,
  },
});
