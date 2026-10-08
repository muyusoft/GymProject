import { TodayScreen } from "@/features/workout";
import { AppLayout, EDGES_WITHOUT_BOTTOM } from "@/shared/layouts";

export default function TodayTab() {
  return (
    <AppLayout edges={EDGES_WITHOUT_BOTTOM}>
      <TodayScreen />
    </AppLayout>
  );
}
