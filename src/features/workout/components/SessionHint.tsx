import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ProgressionHint } from "@/shared/components";
import { formatWeight } from "@/shared/utils/weight.utils";
import type { SessionExercise } from "../types/workout.types";
import {
  pickSessionHint,
  type SessionHintChoice,
} from "../utils/session-hint.utils";

interface SessionHintProps {
  exercise: SessionExercise;
  /** Aceptar la sugerencia: cambia el peso de las series pendientes del ejercicio. */
  onApply: (choice: SessionHintChoice) => void;
}

/** Sugerencia del ejercicio en pantalla. Es una propuesta: se acepta o se deja para otro día, y no cambia el plan. */
export function SessionHint({ exercise, onApply }: Readonly<SessionHintProps>) {
  const { t, i18n } = useTranslation();
  const [dismissed, setDismissed] = useState<ReadonlySet<string>>(new Set());
  const choice = pickSessionHint(exercise);
  const key = `${exercise.exerciseId}:${choice?.variant}`;
  if (!choice || dismissed.has(key)) return null;

  const { template } = exercise;
  const format = (value: number) =>
    formatWeight({ value, unit: template.unit, locale: i18n.language });
  const next = format(choice.weight);

  return (
    <ProgressionHint
      kind={choice.variant === "deload" ? "deload" : "increase"}
      message={t(`hint.${choice.variant}`, {
        name: i18n.language === "es" ? exercise.nameEs : exercise.nameEn,
        sets: template.sets,
        reps: template.reps ?? 0,
        current: format(template.targetWeight ?? 0),
        next,
      })}
      onDismiss={() => setDismissed((previous) => new Set(previous).add(key))}
      {...(choice.canApply && {
        action: {
          label: t(
            choice.variant === "deload"
              ? "hint.acceptDeload"
              : "hint.acceptIncrease",
            { weight: next },
          ),
          onPress: () => onApply(choice),
        },
      })}
    />
  );
}
