import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useActionRunner } from "@/shared/hooks/use-action-runner";
import { useFocusResource, type ResourceStatus } from "@/shared/hooks/use-focus-resource";
import { addDay, loadWeeklyPlan, savePlanSettings } from "../services/plan.service";
import type { PlanSettingsPatch, WeeklyPlan } from "../types/plan.types";

interface PlanEditorState {
  status: ResourceStatus;
  plan: WeeklyPlan | null;
  reload: () => Promise<void>;
  draft: PlanSettingsPatch | null;
  setName: (name: string) => void;
  setRepeatsWeekly: (repeatsWeekly: boolean) => void;
  save: () => Promise<void>;
  addDayAt: (weekday: number) => Promise<void>;
  isSaving: boolean;
  hasError: boolean;
}

/** El nombre y "se repite" son un borrador hasta "Guardar plan"; los días se guardan al instante. */
export function usePlanEditor(): PlanEditorState {
  const { t } = useTranslation();
  const loader = useCallback(() => loadWeeklyPlan(new Date()), []);
  const { status, data: plan, reload } = useFocusResource(loader);
  const [draft, setDraft] = useState<PlanSettingsPatch | null>(null);
  const { run, isRunning, hasError } = useActionRunner();

  useEffect(() => {
    if (plan && draft === null) {
      setDraft({ name: plan.name, repeatsWeekly: plan.repeatsWeekly });
    }
  }, [plan, draft]);

  const save = useCallback(async () => {
    if (!plan || !draft) return;
    const patch = { ...draft, name: draft.name.trim() || plan.name };
    if (await run(() => savePlanSettings(plan.id, patch))) router.back();
  }, [plan, draft, run]);

  const addDayAt = useCallback(
    async (weekday: number) => {
      if (!plan) return;
      let createdId = "";
      const name = t("plan.newDayName");
      const isCreated = await run(async () => {
        createdId = (await addDay({ planId: plan.id, weekday, name })).id;
      });
      if (isCreated) router.push({ pathname: "/plan/day/[id]", params: { id: createdId } });
    },
    [plan, run, t],
  );

  return {
    status,
    plan,
    reload,
    draft,
    setName: (name) => setDraft((current) => current && { ...current, name }),
    setRepeatsWeekly: (repeatsWeekly) =>
      setDraft((current) => current && { ...current, repeatsWeekly }),
    save,
    addDayAt,
    isSaving: isRunning,
    hasError,
  };
}
