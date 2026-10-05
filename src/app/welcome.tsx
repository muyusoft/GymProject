import { WelcomeScreen } from "@/features/account";
import { AppLayout } from "@/shared/layouts";

export default function WelcomeRoute() {
  return (
    <AppLayout>
      <WelcomeScreen />
    </AppLayout>
  );
}
