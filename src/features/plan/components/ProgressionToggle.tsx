import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { tokens } from "@/design/tokens";
import { Toggle } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { formatReps } from "@/shared/utils/progression-rule.utils";
import { formatNumber } from "@/shared/utils/weight.utils";
import type { ConfigDraft } from "../utils/exercise-config.utils";

interface ProgressionToggleProps {
  draft: ConfigDraft;
  step: number;
  onChange: (isEnabled: boolean) => void;
}

export function ProgressionToggle({
  draft,
  step,
  onChange,
}: Readonly<ProgressionToggleProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();

  return (
    <View style={[styles.card, { backgroundColor: c.surfaceAlt }]}>
      <Toggle
        label={t("plan.config.progression")}
        description={t("plan.config.progressionHint", {
          sets: draft.sets,
          reps: formatReps(
            draft.reps,
            draft.repsMin < draft.reps ? draft.repsMin : null,
          ),
          step: formatNumber(step, i18n.language),
          unit: draft.unit,
        })}
        value={draft.isProgressionEnabled}
        onChange={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg },
});
