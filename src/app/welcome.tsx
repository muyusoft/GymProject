import { WelcomeScreen } from "@/features/account";
import { AppLayout, EDGES_WITHOUT_BOTTOM } from "@/shared/layouts";

export default function WelcomeRoute() {
  return (
    <AppLayout edges={EDGES_WITHOUT_BOTTOM}>
      <WelcomeScreen />
    </AppLayout>
  );
}
