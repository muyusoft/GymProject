import { useLocalSearchParams } from "expo-router";
import { ExerciseInfoScreen } from "@/features/catalog";
import { AppLayout } from "@/shared/layouts";

export default function ExerciseInfoRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <AppLayout>
      <ExerciseInfoScreen exerciseId={id} />
    </AppLayout>
  );
}
