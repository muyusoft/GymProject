import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { AsyncStateView, InlineError } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { useSession } from "../hooks/use-session";
import { sessionProgress } from "../utils/session-stats.utils";
import { ExerciseCard } from "./ExerciseCard";
import { NextExerciseCard } from "./NextExerciseCard";
import { RestTimer } from "./RestTimer";
import { SessionHeader } from "./SessionHeader";
import { SessionHint } from "./SessionHint";

interface SessionScreenProps {
  sessionId: string;
}

export function SessionScreen({ sessionId }: Readonly<SessionScreenProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const session = useSession(sessionId);
  const { view, current, timer } = session;
  const exercise = view?.exercises[current];
  const next = view?.exercises[current + 1];

  return (
    <AsyncStateView status={session.status} onRetry={() => void session.reload()}>
      {view && !exercise && (
        <Text style={[styles.empty, { color: c.textSecondary }]}>{t("session.empty")}</Text>
      )}
      {view && exercise && (
        <View style={styles.screen}>
          <View style={styles.header}>
            <SessionHeader
              eyebrow={t("session.eyebrow", { day: view.dayName, index: current + 1, total: view.exercises.length })}
              startedAt={view.startedAt}
              endedAt={view.endedAt}
              progress={sessionProgress(view.exercises)}
              onBack={() => router.back()}
              onFinish={session.finish}
            />
          </View>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <SessionHint key={exercise.exerciseId} exercise={exercise} />
            <ExerciseCard
              exercise={exercise}
              editingSetId={session.editingSetId}
              onToggleSet={(set) => session.toggleSet(exercise, set)}
              onEditSet={session.setEditingSetId}
              onChangeSet={(setId, patch) => session.changeSet(exercise, setId, patch)}
              onAddSet={() => void session.appendSet(exercise)}
            />
            {next && <NextExerciseCard exercise={next} onPress={() => session.goTo(current + 1)} />}
            {session.hasError && <InlineError message={t("common.saveError")} />}
          </ScrollView>
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
  empty: { ...getTextStyle("body"), textAlign: "center", padding: tokens.spacing[6] },
});
