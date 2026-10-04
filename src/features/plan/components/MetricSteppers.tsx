import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Stepper } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { formatClock } from "@/shared/utils/duration.utils";
import {
  CONFIG_LIMITS,
  loadTypeUsesTime,
  type ConfigDraft,
} from "../utils/exercise-config.utils";

interface MetricSteppersProps {
  draft: ConfigDraft;
  onChange: (patch: Partial<ConfigDraft>) => void;
}

export function MetricSteppers({ draft, onChange }: MetricSteppersProps) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const isTimed = loadTypeUsesTime(draft.loadType);

  return (
    <View style={styles.group}>
      <Text style={[styles.label, { color: c.textSecondary }]}>{t("plan.config.sets")}</Text>
      <Stepper {...CONFIG_LIMITS.sets} value={draft.sets} unit="" onChange={(sets) => onChange({ sets })} />
      <Text style={[styles.label, { color: c.textSecondary }]}>
        {t(isTimed ? "plan.config.seconds" : "plan.config.reps")}
      </Text>
      {isTimed ? (
        <Stepper
          {...CONFIG_LIMITS.seconds}
          value={draft.seconds}
          unit=""
          formatValue={formatClock}
          onChange={(seconds) => onChange({ seconds })}
        />
      ) : (
        <Stepper {...CONFIG_LIMITS.reps} value={draft.reps} unit="" onChange={(reps) => onChange({ reps })} />
      )}
      <Text style={[styles.label, { color: c.textSecondary }]}>{t("plan.config.rest")}</Text>
      <Stepper
        {...CONFIG_LIMITS.restSec}
        value={draft.restSec}
        unit=""
        formatValue={formatClock}
        onChange={(restSec) => onChange({ restSec })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: tokens.spacing[2] },
  label: getTextStyle("label"),
});
