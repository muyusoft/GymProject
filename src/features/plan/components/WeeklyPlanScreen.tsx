import { router } from "expo-router";
import { AsyncStateView } from "@/shared/components";
import { useWeeklyPlan } from "../hooks/use-weekly-plan";
import { EmptyPlan } from "./EmptyPlan";
import { WeeklyPlanContent } from "./WeeklyPlanContent";

export function WeeklyPlanScreen() {
  const { status, plan, reload, startPlan, isStarting, hasError } = useWeeklyPlan();

  const handleCreate = async () => {
    if (await startPlan()) router.push("/plan/edit");
  };

  return (
    <AsyncStateView status={status} onRetry={() => void reload()}>
      {plan ? (
        <WeeklyPlanContent plan={plan} />
      ) : (
        <EmptyPlan isCreating={isStarting} hasError={hasError} onCreate={() => void handleCreate()} />
      )}
    </AsyncStateView>
  );
}
