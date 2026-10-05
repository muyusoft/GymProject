import { useTranslation } from "react-i18next";
import { getExerciseName } from "@/shared/utils/exercise-name.utils";
import { formatWeight } from "@/shared/utils/weight.utils";
import type { HintKind, ProgressionHintData } from "../types/workout.types";
import { ProgressionHint } from "@/shared/components";

interface TodayHintsProps {
  hints: readonly ProgressionHintData[];
  onDismiss: (kind: HintKind) => void;
}

export function TodayHints({ hints, onDismiss }: Readonly<TodayHintsProps>) {
  const { t, i18n } = useTranslation();
  const weight = (value: number, unit: ProgressionHintData["unit"]) =>
    formatWeight({ value, unit, locale: i18n.language });

  return (
    <>
      {hints.map((hint) => (
        <ProgressionHint
          key={hint.kind}
          kind={hint.kind}
          message={t(`hint.${hint.kind}`, {
            name: getExerciseName(hint, i18n.language),
            sets: hint.sets,
            reps: hint.reps,
            current: weight(hint.currentWeight, hint.unit),
            next: weight(hint.nextWeight, hint.unit),
          })}
          onDismiss={() => onDismiss(hint.kind)}
        />
      ))}
    </>
  );
}
