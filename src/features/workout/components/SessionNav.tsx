import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components";
import type { SessionExercise } from "../types/workout.types";
import { isExerciseDone, sessionProgress } from "../utils/session-stats.utils";
import { ExerciseNavCard } from "./ExerciseNavCard";

const COMPLETE = 1;

interface SessionNavProps {
  exercises: readonly SessionExercise[];
  current: number;
  onGoTo: (index: number) => void;
  onFinish: () => void;
}

/**
 * Bajo el ejercicio actual: "Terminar entreno" cuando ya no queda nada por hacer (o se completó el
 * último ejercicio), y los saltos al siguiente y al anterior.
 */
export function SessionNav({
  exercises,
  current,
  onGoTo,
  onFinish,
}: Readonly<SessionNavProps>) {
  const { t } = useTranslation();
  const exercise = exercises[current];
  const next = exercises[current + 1];
  const previous = exercises[current - 1];
  const isLastDone =
    exercise !== undefined && next === undefined && isExerciseDone(exercise);
  const canFinish = isLastDone || sessionProgress(exercises) === COMPLETE;

  return (
    <>
      {canFinish && (
        <Button
          label={t("session.finishWorkout")}
          icon="check"
          block
          onPress={onFinish}
        />
      )}
      {next && (
        <ExerciseNavCard
          direction="next"
          exercise={next}
          onPress={() => onGoTo(current + 1)}
        />
      )}
      {previous && (
        <ExerciseNavCard
          direction="previous"
          exercise={previous}
          onPress={() => onGoTo(current - 1)}
        />
      )}
    </>
  );
}
