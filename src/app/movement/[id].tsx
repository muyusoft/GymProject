import { useLocalSearchParams } from "expo-router";
import { MovementInfoScreen } from "@/features/workout";
import { AppLayout } from "@/shared/layouts";

export default function MovementInfoRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <AppLayout>
      <MovementInfoScreen movementId={id} />
    </AppLayout>
  );
}
