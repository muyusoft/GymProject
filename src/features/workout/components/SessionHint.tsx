import { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatWeight } from "@/shared/utils/weight.utils";
import type { SessionExercise } from "../types/workout.types";
import { ProgressionHint } from "@/shared/components";

type HintVariant = "increase" | "preview" | "deload";

function pickVariant({ insight }: SessionExercise): { variant: HintVariant; weight: number } | null {
  if (insight.increase !== null) return { variant: "increase", weight: insight.increase };
  if (insight.preview !== null) return { variant: "preview", weight: insight.preview };
  if (insight.deload !== null) return { variant: "deload", weight: insight.deload };
  return null;
}

interface SessionHintProps {
  exercise: SessionExercise;
}

/** Sugerencia del ejercicio en pantalla; descartable, y no cambia el plan. */
export function SessionHint({ exercise }: Readonly<SessionHintProps>) {
  const { t, i18n } = useTranslation();
  const [dismissed, setDismissed] = useState<ReadonlySet<string>>(new Set());
  const picked = pickVariant(exercise);
  const key = `${exercise.exerciseId}:${picked?.variant}`;
  if (!picked || dismissed.has(key)) return null;

  const { template } = exercise;
  const next = formatWeight({ value: picked.weight, unit: template.unit, locale: i18n.language });
  const current = formatWeight({ value: template.targetWeight ?? 0, unit: template.unit, locale: i18n.language });

  return (
    <ProgressionHint
      kind={picked.variant === "deload" ? "deload" : "increase"}
      message={t(`hint.${picked.variant}`, {
        name: i18n.language === "es" ? exercise.nameEs : exercise.nameEn,
        sets: template.sets,
        reps: template.reps ?? 0,
        current,
        next,
      })}
      onDismiss={() => setDismissed((previous) => new Set(previous).add(key))}
    />
  );
}
