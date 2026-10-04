import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useActionRunner } from "@/shared/hooks/use-action-runner";
import { useFocusResource, type ResourceStatus } from "@/shared/hooks/use-focus-resource";
import { createPlan, loadWeeklyPlan } from "../services/plan.service";
import type { WeeklyPlan } from "../types/plan.types";

interface WeeklyPlanState {
  status: ResourceStatus;
  plan: WeeklyPlan | null;
  reload: () => Promise<void>;
  startPlan: () => Promise<boolean>;
  isStarting: boolean;
  hasError: boolean;
}

export function useWeeklyPlan(): WeeklyPlanState {
  const { t } = useTranslation();
  const loader = useCallback(() => loadWeeklyPlan(new Date()), []);
  const { status, data, reload } = useFocusResource(loader);
  const { run, isRunning, hasError } = useActionRunner();

  const startPlan = useCallback(async () => {
    const isCreated = await run(() => createPlan(t("plan.defaultName")));
    if (isCreated) await reload();
    return isCreated;
  }, [run, reload, t]);

  return { status, plan: data, reload, startPlan, isStarting: isRunning, hasError };
}
