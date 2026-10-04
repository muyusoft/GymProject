import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { logger } from "@/config/logger";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { getExerciseName } from "@/shared/utils/exercise-name.utils";
import { muscleLabelKey } from "@/shared/utils/muscle-label.utils";
import type { DayExerciseMuscles, MuscleLink } from "../types/muscles.types";
import { summarizeLinks } from "../utils/exercise-muscles.utils";

interface MuscleDetailCardProps {
  exercise: DayExerciseMuscles;
}

/** Qué músculos trabaja el ejercicio y de dónde sale el dato; sin dato dice que no se pinta nada. */
export function MuscleDetailCard({ exercise }: MuscleDetailCardProps) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const { primary, secondary } = summarizeLinks(exercise.links);

  const names = (links: readonly MuscleLink[]) =>
    links
      .map((link) => `${t(muscleLabelKey(link))}${link.basis === "described" ? ` (${t("muscles.described")})` : ""}`)
      .join(", ");

  const openSource = (url: string) => {
    Linking.openURL(url).catch((error: unknown) => logger.error("Failed to open source", { error, url }));
  };

  return (
    <View style={[styles.card, { backgroundColor: c.surface }]}>
      <Text style={[styles.title, { color: c.text }]}>{getExerciseName(exercise, i18n.language)}</Text>
      {exercise.links.length === 0 ? (
        <Text style={[styles.text, { color: c.textSecondary }]}>{t("muscles.noData")}</Text>
      ) : (
        <>
          <Text style={[styles.text, { color: c.textSecondary }]}>
            <Text style={[styles.strong, { color: c.accentText }]}>{`${t("muscles.primary")}: `}</Text>
            {names(primary) || t("muscles.none")}
          </Text>
          {secondary.length > 0 && (
            <Text style={[styles.text, { color: c.textSecondary }]}>
              <Text style={[styles.strong, { color: c.text }]}>{`${t("muscles.secondaries")}: `}</Text>
              {names(secondary)}
            </Text>
          )}
          <View style={styles.sources}>
            {exercise.sources.map((source) => (
              <Pressable
                key={source.id}
                accessibilityRole="link"
                accessibilityLabel={`${t("muscles.source")}: ${source.citation}`}
                onPress={() => openSource(source.url)}
                style={styles.source}
              >
                <Text style={[styles.sourceText, { color: c.info }]}>{`${t("muscles.source")}: ${source.citation}`}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: tokens.spacing[2], padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg },
  title: getTextStyle("title"),
  text: getTextStyle("body"),
  strong: { ...getTextStyle("body"), fontFamily: tokens.typography.fontFamily.sansSemibold },
  sources: { gap: tokens.spacing[1] },
  source: { minHeight: tokens.dimensions.minTouch, justifyContent: "center" },
  sourceText: getTextStyle("bodySm"),
});
