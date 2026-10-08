import { IntroScreen } from "@/features/onboarding";
import { AppLayout, EDGES_WITHOUT_BOTTOM } from "@/shared/layouts";

export default function IntroRoute() {
  return (
    <AppLayout edges={EDGES_WITHOUT_BOTTOM}>
      <IntroScreen />
    </AppLayout>
  );
}
