import { useLocalSearchParams } from "expo-router";
import { SessionScreen } from "@/features/workout";
import { AppLayout } from "@/shared/layouts";

export default function SessionRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <AppLayout>
      <SessionScreen sessionId={id} />
    </AppLayout>
  );
}
