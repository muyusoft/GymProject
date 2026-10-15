import { useLocalSearchParams } from "expo-router";
import { StretchScreen } from "@/features/workout";
import { AppLayout } from "@/shared/layouts";

export default function StretchRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <AppLayout>
      <StretchScreen sessionId={id} />
    </AppLayout>
  );
}
