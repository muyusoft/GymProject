import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { formatWeight } from "@/shared/utils/weight.utils";

const SAMPLE_MINUTES = 55;
const SAMPLE_ONE_REP_MAX_KG = 92.5;
const SAMPLE_EXERCISES = [
  { id: "exercise-1", isDone: true },
  { id: "exercise-2", isDone: true },
  { id: "exercise-3", isDone: false },
  { id: "exercise-4", isDone: false },
  { id: "exercise-5", isDone: false },
] as const;
const SAMPLE_DONE = SAMPLE_EXERCISES.filter((exercise) => exercise.isDone).length;

/** Vista previa de la app en la bienvenida: el entreno de hoy, el progreso y la recuperación. */
export function WelcomePreview() {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const card = { backgroundColor: c.surface };

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={t("account.welcome.preview.label")} style={styles.grid}>
      <View style={[styles.card, card]}>
        <View style={styles.header}>
          <Text style={[styles.label, { color: c.textSecondary }]}>
            {t("account.welcome.preview.today", { minutes: SAMPLE_MINUTES })}
          </Text>
          <Text style={[styles.label, { color: c.text }]}>
            {t("account.welcome.preview.done", { done: SAMPLE_DONE, total: SAMPLE_EXERCISES.length })}
          </Text>
        </View>
        <Text style={[styles.title, { color: c.text }]}>{t("account.welcome.preview.day")}</Text>
        <View style={styles.segments}>
          {SAMPLE_EXERCISES.map((exercise) => (
            <View
              key={exercise.id}
              style={[styles.segment, { backgroundColor: exercise.isDone ? c.accentText : c.border }]}
            />
          ))}
        </View>
      </View>
      <View style={styles.row}>
        <View style={[styles.card, styles.half, card]}>
          <Text style={[styles.label, { color: c.textSecondary }]}>{t("account.welcome.preview.progress")}</Text>
          <Text style={[styles.value, { color: c.text }]}>
            {formatWeight({ value: SAMPLE_ONE_REP_MAX_KG, unit: "kg", locale: i18n.language })}
          </Text>
        </View>
        <View style={[styles.card, styles.half, card]}>
          <Text style={[styles.label, { color: c.textSecondary }]}>{t("account.welcome.preview.recovery")}</Text>
          <Text style={[styles.value, { color: c.text }]}>{t("account.welcome.preview.group")}</Text>
          <Text style={[styles.note, { color: c.textSecondary }]}>{t("account.welcome.preview.ready")}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: tokens.spacing[3] },
  row: { flexDirection: "row", gap: tokens.spacing[3] },
  card: { gap: tokens.spacing[2], padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg },
  half: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", gap: tokens.spacing[3] },
  label: getTextStyle("label"),
  title: getTextStyle("displayLg"),
  segments: { flexDirection: "row", gap: tokens.spacing[1] },
  segment: { flex: 1, height: tokens.spacing[2], borderRadius: tokens.borderRadius.full },
  value: getTextStyle("numeric"),
  note: getTextStyle("bodySm"),
});
