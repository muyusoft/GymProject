import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { AsyncStateView, InlineError } from "@/shared/components";
import { toIsoDate } from "@/shared/utils/week.utils";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { useCancelSession } from "../hooks/use-cancel-session";
import { useSession } from "../hooks/use-session";
import { useSubstitution } from "../hooks/use-substitution";
import type { SessionExercise } from "../types/workout.types";
import { sessionProgress } from "../utils/session-stats.utils";
import { EffortPrompt } from "./EffortPrompt";
import { ExerciseCard } from "./ExerciseCard";
import { RestTimer } from "./RestTimer";
import { SessionHeader } from "./SessionHeader";
import { SessionHint } from "./SessionHint";
import { SessionNav } from "./SessionNav";
import { SubstituteSheet } from "./SubstituteSheet";

const EMPTY_EXERCISES: readonly SessionExercise[] = [];

interface SessionScreenProps {
  sessionId: string;
}

export function SessionScreen({ sessionId }: Readonly<SessionScreenProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const session = useSession(sessionId);
  const cancellation = useCancelSession(sessionId, session.view);
  const { view, current, timer } = session;
  const exercise = view?.exercises[current];
  const substitution = useSubstitution({
    date: toIsoDate(new Date(view?.startedAt ?? Date.now())),
    sessionId,
    exercises: view?.exercises ?? EMPTY_EXERCISES,
    onChanged: session.reload,
  });

  return (
    <AsyncStateView
      status={session.status}
      onRetry={() => void session.reload()}
    >
      {view && !exercise && (
        <Text style={[styles.empty, { color: c.textSecondary }]}>
          {t("session.empty")}
        </Text>
      )}
      {view && exercise && (
        <View style={styles.screen}>
          <View style={styles.header}>
            <SessionHeader
              eyebrow={t("session.eyebrow", {
                day: view.dayName,
                index: current + 1,
                total: view.exercises.length,
              })}
              startedAt={view.startedAt}
              endedAt={view.endedAt}
              progress={sessionProgress(view.exercises)}
              onBack={() => router.back()}
              onFinish={session.finish}
            />
          </View>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <SessionHint
              key={exercise.exerciseId}
              exercise={exercise}
              onApply={(choice) => session.applyHint(exercise, choice)}
            />
            <ExerciseCard
              exercise={exercise}
              editingSetId={session.editingSetId}
              onToggleSet={(set) => session.toggleSet(exercise, set)}
              onEditSet={session.setEditingSetId}
              onChangeSet={(setId, patch) =>
                session.changeSet(exercise, setId, patch)
              }
              onAddSet={() => void session.appendSet(exercise)}
              onSubstitute={() => substitution.open(exercise)}
            />
            <EffortPrompt
              exercise={exercise}
              onRate={(level) => session.rateEffort(exercise, level)}
            />
            <SessionNav
              exercises={view.exercises}
              current={current}
              onGoTo={session.goTo}
              onFinish={session.finish}
              onCancel={cancellation.cancel}
            />
            {(session.hasError || cancellation.hasError) && (
              <InlineError message={t("common.saveError")} />
            )}
          </ScrollView>
          <SubstituteSheet
            target={substitution.target}
            excludedIds={substitution.excludedIds}
            isApplying={substitution.isApplying}
            hasError={substitution.hasError}
            onApply={(substituteId, scope) =>
              void substitution.apply(substituteId, scope)
            }
            onClose={substitution.close}
          />
          {timer.rest && (
            <View style={styles.rest}>
              <RestTimer
                endsAt={timer.rest.endsAt}
                totalSec={timer.rest.totalSec}
                onAdd={timer.add}
                onSkip={timer.skip}
              />
            </View>
          )}
        </View>
      )}
    </AsyncStateView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { padding: tokens.dimensions.screenGutter },
  content: {
    gap: tokens.spacing[4],
    paddingHorizontal: tokens.dimensions.screenGutter,
    paddingBottom: tokens.spacing[6],
  },
  rest: { padding: tokens.dimensions.screenGutter },
  empty: {
    ...getTextStyle("body"),
    textAlign: "center",
    padding: tokens.spacing[6],
  },
});
