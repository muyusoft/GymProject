import { ProgressScreen } from "@/features/progress";
import { AppLayout, EDGES_WITHOUT_BOTTOM } from "@/shared/layouts";

export default function ProgressTab() {
  return (
    <AppLayout edges={EDGES_WITHOUT_BOTTOM}>
      <ProgressScreen />
    </AppLayout>
  );
}
