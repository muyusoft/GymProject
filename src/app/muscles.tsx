import { useLocalSearchParams } from "expo-router";
import { ExerciseMusclesScreen } from "@/features/muscles";
import { AppLayout } from "@/shared/layouts";

export default function MusclesRoute() {
  const { dayId } = useLocalSearchParams<{ dayId?: string }>();

  return (
    <AppLayout>
      <ExerciseMusclesScreen dayId={dayId} />
    </AppLayout>
  );
}
