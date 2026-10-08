import { WeeklyPlanScreen } from "@/features/plan";
import { AppLayout, EDGES_WITHOUT_BOTTOM } from "@/shared/layouts";

export default function RoutinesTab() {
  return (
    <AppLayout edges={EDGES_WITHOUT_BOTTOM}>
      <WeeklyPlanScreen />
    </AppLayout>
  );
}
