import { useCallback, useState } from "react";
import { useSettingsStore } from "@/shared/store";
import type { PlanAnswers } from "../types/plan-generator.types";

export const WIZARD_STEPS = ["goal", "schedule", "focus", "equipment", "preview"] as const;
export type WizardStep = (typeof WIZARD_STEPS)[number];

/** Las preguntas, sin la vista previa: lo que cuenta la barra de progreso. */
export const QUESTION_COUNT = WIZARD_STEPS.length - 1;

/** Respuestas de partida: las más comunes, para que cada paso se pueda pasar con un toque. */
const DEFAULT_ANSWERS: Omit<PlanAnswers, "equipment"> = {
  goal: "muscle",
  days: 4,
  experience: "intermediate",
  focus: "balanced",
  minutes: 45,
};

interface PlanWizard {
  step: WizardStep;
  stepIndex: number;
  answers: PlanAnswers;
  answer: <K extends keyof PlanAnswers>(key: K, value: PlanAnswers[K]) => void;
  next: () => void;
  /** false si ya está en el primer paso (quien llama cierra el asistente). */
  back: () => boolean;
  restart: () => void;
}

export function usePlanWizard(): PlanWizard {
  const [stepIndex, setStepIndex] = useState(0);
  // El equipo arranca con el que se marcó la última vez (sin guardar: gimnasio completo).
  const savedEquipment = useSettingsStore((state) => state.equipment);
  const [answers, setAnswers] = useState<PlanAnswers>(() => ({ ...DEFAULT_ANSWERS, equipment: savedEquipment }));

  const answer = useCallback(<K extends keyof PlanAnswers>(key: K, value: PlanAnswers[K]) => {
    setAnswers((current) => ({ ...current, [key]: value }));
  }, []);

  const back = () => {
    if (stepIndex === 0) return false;
    setStepIndex(stepIndex - 1);
    return true;
  };

  return {
    step: WIZARD_STEPS[stepIndex] ?? "goal",
    stepIndex,
    answers,
    answer,
    next: () => setStepIndex((index) => Math.min(index + 1, WIZARD_STEPS.length - 1)),
    back,
    restart: () => setStepIndex(0),
  };
}
