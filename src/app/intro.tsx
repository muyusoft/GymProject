import { useLocalSearchParams } from "expo-router";
import { IntroScreen } from "@/features/onboarding";
import { AppLayout, EDGES_WITHOUT_BOTTOM } from "@/shared/layouts";

export default function IntroRoute() {
  const { replay } = useLocalSearchParams<{ replay?: string }>();
  return (
    <AppLayout edges={EDGES_WITHOUT_BOTTOM}>
      <IntroScreen isReplay={replay === "1"} />
    </AppLayout>
  );
}
