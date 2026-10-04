import { useLocalSearchParams } from "expo-router";
import { ExerciseHistoryScreen } from "@/features/progress";
import { AppLayout } from "@/shared/layouts";

export default function ExerciseHistoryRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <AppLayout>
      <ExerciseHistoryScreen exerciseId={id} />
    </AppLayout>
  );
}
