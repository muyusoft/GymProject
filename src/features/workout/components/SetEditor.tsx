import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { tokens } from "@/design/tokens";
import { Button, SegmentedControl, Stepper } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { formatClock } from "@/shared/utils/duration.utils";
import { WEIGHT_UNITS } from "@/shared/types/training.types";
import { formatNumber } from "@/shared/utils/weight.utils";
import type { SetPatch } from "../services/session-write.service";
import type { ExerciseTemplate, SessionSet } from "../types/workout.types";
import { isTimed, SET_LIMITS, usesWeight } from "../utils/set-display.utils";

interface SetEditorProps {
  set: SessionSet;
  template: ExerciseTemplate;
  onChange: (patch: SetPatch) => void;
  onClose: () => void;
}

/**
 * Peso (± salto del equipo) y reps (± 1) con botones: registrar una serie nunca pide el teclado.
 * El selector lb / kg cambia la unidad de todas las series pendientes del ejercicio, no solo de esta.
 */
export function SetEditor({
  set,
  template,
  onChange,
  onClose,
}: Readonly<SetEditorProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const unitOptions = WEIGHT_UNITS.map((unit) => ({
    value: unit,
    label: t(`common.${unit}`),
  }));

  return (
    <View style={[styles.panel, { backgroundColor: c.surfaceAlt }]}>
      {usesWeight(set.loadType) && (
        <SegmentedControl
          options={unitOptions}
          value={set.unit}
          onChange={(unit) => onChange({ unit })}
        />
      )}
      {usesWeight(set.loadType) && (
        <Stepper
          value={set.weight ?? 0}
          step={template.weightSteps[set.unit]}
          {...SET_LIMITS.weight}
          unit={set.unit}
          formatValue={(value) => formatNumber(value, i18n.language)}
          onChange={(weight) => onChange({ weight })}
        />
      )}
      {isTimed(set.loadType) ? (
        <Stepper
          value={set.seconds ?? SET_LIMITS.seconds.min}
          {...SET_LIMITS.seconds}
          unit=""
          formatValue={formatClock}
          onChange={(seconds) => onChange({ seconds })}
        />
      ) : (
        <Stepper
          value={set.reps ?? SET_LIMITS.reps.min}
          {...SET_LIMITS.reps}
          unit={t("session.repsUnit")}
          onChange={(reps) => onChange({ reps })}
        />
      )}
      <Button
        variant="ghost"
        label={t("session.editorDone")}
        block
        onPress={onClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: tokens.spacing[3],
    padding: tokens.spacing[3],
    borderRadius: tokens.borderRadius.md,
  },
});
