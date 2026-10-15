import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";
import type { GeneratedPlan, PlanAnswers } from "../types/plan-generator.types";

const ICON_SIZE = 20;

interface PreviewNoticesProps {
  plan: GeneratedPlan;
  answers: PlanAnswers;
}

/** Lo que conviene saber del plan: sesiones más cortas, patrones que el equipo no permite y el plan sin equipo. */
export function PreviewNotices({ plan, answers }: Readonly<PreviewNoticesProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const notices: string[] = [];
  if (answers.equipment.length === 0) notices.push(t("plan.wizard.preview.bodyweight"));
  if (plan.missingPatterns.length > 0) {
    const patterns = plan.missingPatterns.map((pattern) => t(`plan.wizard.patterns.${pattern}`)).join(", ");
    notices.push(t("plan.wizard.preview.missing", { patterns }));
  }
  if (plan.isShortOfTime) {
    notices.push(t(answers.experience === "beginner" ? "plan.wizard.preview.shortBeginner" : "plan.wizard.preview.short"));
  }
  if (notices.length === 0) return null;

  return (
    <View style={styles.list}>
      {notices.map((notice) => (
        <View key={notice} style={[styles.notice, { backgroundColor: c.surfaceAlt }]}>
          <IconRenderer name="info" size={ICON_SIZE} color={c.info} />
          <Text style={[styles.text, { color: c.textSecondary }]}>{notice}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: tokens.spacing[2] },
  notice: {
    flexDirection: "row",
    gap: tokens.spacing[3],
    padding: tokens.spacing[3],
    borderRadius: tokens.borderRadius.md,
  },
  text: { ...getTextStyle("bodySm"), flex: 1 },
});
