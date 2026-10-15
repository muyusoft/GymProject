import { router } from "expo-router";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useActionRunner } from "@/shared/hooks/use-action-runner";
import { useFocusResource, type ResourceStatus } from "@/shared/hooks/use-focus-resource";
import { useSettingsStore } from "@/shared/store";
import { DAY_TEMPLATES, type CatalogExercise, type DayTemplate, type GeneratedPlan, type PlanAnswers } from "../types/plan-generator.types";
import { loadGeneratorCatalog, saveGeneratedPlan } from "../services/plan-generator.service";
import { generatePlan } from "../utils/plan-generator/generate-plan";

interface PlanPreview {
  status: ResourceStatus;
  reload: () => Promise<void>;
  plan: GeneratedPlan | null;
  catalog: readonly CatalogExercise[];
  /** Guarda el plan que se ve (con los cambios de ejercicio que haya hecho la persona). */
  save: (plan: GeneratedPlan) => Promise<void>;
  isSaving: boolean;
  hasError: boolean;
}

/** El plan que sale de las respuestas, y guardarlo. Al guardarlo vuelve a Rutinas, que ya lo muestra. */
export function usePlanPreview(answers: PlanAnswers): PlanPreview {
  const { t } = useTranslation();
  const unit = useSettingsStore((state) => (state.weightUnit === "kg" ? "kg" : "lb"));
  const { status, data, reload } = useFocusResource(loadGeneratorCatalog);
  const plan = useMemo(() => (data ? generatePlan(answers, data) : null), [answers, data]);
  const { run, isRunning, hasError } = useActionRunner();

  const save = useCallback(async (plan: GeneratedPlan) => {
    const dayNames = Object.fromEntries(
      DAY_TEMPLATES.map((template) => [template, t(`plan.wizard.days.${template}`)]),
    ) as Record<DayTemplate, string>;
    const isSaved = await run(() =>
      saveGeneratedPlan({ plan, planName: t("plan.defaultName"), dayNames, unit }),
    );
    if (!isSaved) return;
    // Se recuerdan el equipo y el tiempo: el asistente arranca con ellos y el calentamiento se ajusta al tiempo.
    const settings = useSettingsStore.getState();
    void settings.update("equipment", answers.equipment);
    void settings.update("sessionMinutes", answers.minutes);
    router.back();
  }, [run, t, unit, answers.equipment, answers.minutes]);

  return { status, reload, plan, catalog: data ?? [], save, isSaving: isRunning, hasError };
}
