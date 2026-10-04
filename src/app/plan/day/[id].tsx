import { useLocalSearchParams } from "expo-router";
import { DayEditorScreen } from "@/features/plan";
import { AppLayout } from "@/shared/layouts";

export default function PlanDayRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <AppLayout>
      <DayEditorScreen dayId={id} />
    </AppLayout>
  );
}
