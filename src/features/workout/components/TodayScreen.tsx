import { router } from "expo-router";
import { useCallback } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { AsyncStateView, Button, InlineError } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { toIsoDate } from "@/shared/utils/week.utils";
import { useSubstitution } from "../hooks/use-substitution";
import { useToday } from "../hooks/use-today";
import type { TodayExercise } from "../types/workout.types";
import { EmptyToday } from "./EmptyToday";
import { SubstituteSheet } from "./SubstituteSheet";
import { TodayCard } from "./TodayCard";
import { TodayExerciseList } from "./TodayExerciseList";
import { TodayHints } from "./TodayHints";
import { WeekPager } from "./WeekPager";

const EMPTY_EXERCISES: readonly TodayExercise[] = [];

export function TodayScreen() {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const { status, today, reload, hints, dismissHint, start, isStarting, hasError } = useToday();

  const substitution = useSubstitution({
    date: toIsoDate(today?.today ?? new Date()),
    sessionId: today?.activeSessionId ?? null,
    exercises: today?.exercises ?? EMPTY_EXERCISES,
    onChanged: reload,
  });

  const openDay = useCallback(
    (day: Date) => router.push({ pathname: "/day/[date]", params: { date: toIsoDate(day) } }),
    [],
  );

  const date = today
    ? new Intl.DateTimeFormat(i18n.language, { weekday: "long", day: "numeric", month: "short" }).format(today.today)
    : "";

  return (
    <AsyncStateView status={status} onRetry={() => void reload()}>
      {today && (
        <ScrollView contentContainerStyle={styles.content}>
          <View>
            <Text style={[styles.eyebrow, { color: c.textSecondary }]}>{date}</Text>
            <Text style={[styles.greeting, { color: c.text }]}>{t("today.greeting")}</Text>
          </View>
          <WeekPager today={today.today} currentWeek={today.weekStrip} onSelectDay={openDay} />
          {today.day ? (
            <>
              <TodayCard dayName={today.day.name} today={today} isStarting={isStarting} onStart={() => void start()} />
              {hasError && <InlineError message={t("common.saveError")} />}
              <TodayHints hints={hints} onDismiss={dismissHint} />
              <TodayExerciseList exercises={today.exercises} onSubstitute={today.isDoneToday ? undefined : substitution.open} />
            </>
          ) : (
            <EmptyToday reason={today.hasPlan ? "rest" : "noPlan"} />
          )}
          <Button variant="secondary" label={t("today.recovery")} icon="body" block onPress={() => router.push("/recovery")} />
          <SubstituteSheet
            target={substitution.target}
            excludedIds={substitution.excludedIds}
            isApplying={substitution.isApplying}
            hasError={substitution.hasError}
            onApply={(substituteId, scope) => void substitution.apply(substituteId, scope)}
            onClose={substitution.close}
          />
        </ScrollView>
      )}
    </AsyncStateView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: tokens.spacing[4],
    padding: tokens.dimensions.screenGutter,
    paddingBottom: tokens.spacing[12],
  },
  eyebrow: getTextStyle("label"),
  greeting: getTextStyle("displayLg"),
});
