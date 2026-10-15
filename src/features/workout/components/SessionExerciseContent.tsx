import type { useSession } from "../hooks/use-session";
import type { RampPlan } from "../hooks/use-ramp-sets";
import type { SessionExercise } from "../types/workout.types";
import { EffortPrompt } from "./EffortPrompt";
import { ExerciseCard } from "./ExerciseCard";
import { PlanRepsPrompt } from "./PlanRepsPrompt";
import { RampSetsCard } from "./RampSetsCard";
import { SessionHint } from "./SessionHint";

interface SessionExerciseContentProps {
  session: ReturnType<typeof useSession>;
  exercise: SessionExercise;
  ramp: RampPlan | null;
  onHideRamp: () => void;
  onSubstitute: (exercise: SessionExercise) => void;
}

/** El ejercicio actual de la sesión: sugerencia, aproximación, series y preguntas al terminarlo. */
export function SessionExerciseContent({
  session,
  exercise,
  ramp,
  onHideRamp,
  onSubstitute,
}: Readonly<SessionExerciseContentProps>) {
  return (
    <>
      <SessionHint
        key={exercise.exerciseId}
        exercise={exercise}
        onApply={(choice) => session.applyHint(exercise, choice)}
      />
      {ramp && <RampSetsCard plan={ramp} onHide={onHideRamp} />}
      <ExerciseCard
        exercise={exercise}
        editingSetId={session.editingSetId}
        onToggleSet={(set) => session.toggleSet(exercise, set)}
        onEditSet={session.setEditingSetId}
        onChangeSet={(setId, patch) => session.changeSet(exercise, setId, patch)}
        onAddSet={() => void session.appendSet(exercise)}
        onSubstitute={() => onSubstitute(exercise)}
      />
      <EffortPrompt exercise={exercise} onRate={(level) => session.rateEffort(exercise, level)} />
      <PlanRepsPrompt key={exercise.slot.planExerciseId} exercise={exercise} onUpdated={session.reload} />
    </>
  );
}
