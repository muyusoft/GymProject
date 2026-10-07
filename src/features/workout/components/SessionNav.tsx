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
  onCancel: () => void;
}

/**
 * Bajo el ejercicio actual, en el orden del entreno: el salto al anterior, el salto al siguiente y, cuando
 * ya no queda nada por hacer (o se completó el último ejercicio), "Terminar entreno". Al final, siempre,
 * "Cancelar entreno" para una sesión empezada por error.
 */
export function SessionNav({
  exercises,
  current,
  onGoTo,
  onFinish,
  onCancel,
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
      {previous && (
        <ExerciseNavCard
          direction="previous"
          exercise={previous}
          onPress={() => onGoTo(current - 1)}
        />
      )}
      {next && (
        <ExerciseNavCard
          direction="next"
          exercise={next}
          onPress={() => onGoTo(current + 1)}
        />
      )}
      {canFinish && (
        <Button
          label={t("session.finishWorkout")}
          icon="check"
          block
          onPress={onFinish}
        />
      )}
      <Button
        variant="danger"
        label={t("session.cancel")}
        icon="x"
        block
        onPress={onCancel}
      />
    </>
  );
}
