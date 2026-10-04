import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { AsyncStateView, Button, InlineError } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { toIsoDate } from "@/shared/utils/week.utils";
import { useToday } from "../hooks/use-today";
import { EmptyToday } from "./EmptyToday";
import { TodayCard } from "./TodayCard";
import { TodayExerciseList } from "./TodayExerciseList";
import { TodayHints } from "./TodayHints";
import { WeekStrip } from "./WeekStrip";

export function TodayScreen() {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const { status, today, reload, hints, dismissHint, start, isStarting, hasError } = useToday();

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
          <WeekStrip
            days={today.weekStrip}
            onSelectDay={(date) => router.push({ pathname: "/day/[date]", params: { date: toIsoDate(date) } })}
          />
          {today.day ? (
            <>
              <TodayCard dayName={today.day.name} today={today} isStarting={isStarting} onStart={() => void start()} />
              {hasError && <InlineError message={t("common.saveError")} />}
              <TodayHints hints={hints} onDismiss={dismissHint} />
              <TodayExerciseList exercises={today.exercises} />
            </>
          ) : (
            <EmptyToday reason={today.hasPlan ? "rest" : "noPlan"} />
          )}
          <Button variant="secondary" label={t("today.recovery")} icon="body" block onPress={() => router.push("/recovery")} />
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
