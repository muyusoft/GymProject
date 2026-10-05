import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { AsyncStateView, EmptyState, ScreenHeader } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { useMuscleMap } from "../hooks/use-muscle-map";
import { volumeTier } from "../utils/muscle-volume.utils";
import { BalanceCard } from "./BalanceCard";
import { ConsistencyCalendar } from "./ConsistencyCalendar";
import { VolumeTile } from "./VolumeTile";

export function MuscleVolumeScreen() {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const { status, reload, view } = useMuscleMap();

  const week = view
    ? new Intl.DateTimeFormat(i18n.language, { day: "numeric", month: "short" }).format(view.weekStart)
    : "";
  const worked = view?.ranking.filter((item) => item.sets > 0) ?? [];

  return (
    <AsyncStateView status={status} onRetry={() => void reload()}>
      {view && (
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader eyebrow={t("muscles.volume.eyebrow", { week })} onBack={() => router.back()} />
          <View style={styles.heading}>
            <Text style={[styles.title, { color: c.text }]}>{t("muscles.volume.title")}</Text>
            <Text style={[styles.description, { color: c.textSecondary }]}>{t("muscles.volume.description")}</Text>
          </View>
          {worked.length === 0 ? (
            <EmptyState title={t("muscles.volume.empty")} />
          ) : (
            <View style={styles.grid}>
              {worked.map((item) => (
                <VolumeTile key={item.group} group={item.group} sets={item.sets} tier={volumeTier(item.sets, view.maxSets)} />
              ))}
            </View>
          )}
          {view.balance && <BalanceCard balance={view.balance} />}
          <ConsistencyCalendar
            sessionDates={view.sessionDates}
            plannedWeekdays={view.plannedWeekdays}
            today={view.today}
            streak={view.streak}
            pending={view.pending}
            onSelectDate={(date) => router.push({ pathname: "/day/[date]", params: { date } })}
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
  heading: { gap: tokens.spacing[1] },
  title: getTextStyle("displayLg"),
  description: getTextStyle("bodySm"),
  grid: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[3] },
});
