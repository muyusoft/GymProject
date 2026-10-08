import { SettingsScreen } from "@/features/settings";
import { AppLayout, EDGES_WITHOUT_BOTTOM } from "@/shared/layouts";

export default function SettingsTab() {
  return (
    <AppLayout edges={EDGES_WITHOUT_BOTTOM}>
      <SettingsScreen />
    </AppLayout>
  );
}
