import { useLocalSearchParams } from "expo-router";
import { ExerciseConfigSheet } from "@/features/plan";
import { ModalLayout } from "@/shared/layouts";

export default function ExerciseConfigureRoute() {
  const { planExerciseId } = useLocalSearchParams<{ planExerciseId: string }>();

  return (
    <ModalLayout>
      <ExerciseConfigSheet planExerciseId={planExerciseId} />
    </ModalLayout>
  );
}
