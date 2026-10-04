import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { AsyncStateView, BodyMap, ScreenHeader } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { useRecovery } from "../hooks/use-recovery";
import { recoveryPaint, stateColors } from "../utils/recovery-view.utils";
import { MapLegend } from "./MapLegend";
import { RecoveryInsight } from "./RecoveryInsight";
import { RecoveryRow } from "./RecoveryRow";

export function RecoveryScreen() {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const { status, reload, data, states, insight } = useRecovery();
  const colors = stateColors(c);

  const date = data
    ? new Intl.DateTimeFormat(i18n.language, { weekday: "long", day: "numeric", month: "short" }).format(data.now)
    : "";

  return (
    <AsyncStateView status={status} onRetry={() => void reload()}>
      {data && states && (
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader
            eyebrow={t("recovery.eyebrow", { date })}
            onBack={() => router.back()}
            trailing={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("recovery.byExercise")}
                onPress={() => router.push("/muscles")}
                style={styles.link}
              >
                <Text style={[styles.linkLabel, { color: c.accentText }]}>{t("recovery.byExercise")}</Text>
              </Pressable>
            }
          />
          <Text style={[styles.title, { color: c.text }]}>{t("recovery.title")}</Text>
          <MapLegend
            items={[
              { key: "worked", color: colors.worked, label: t("recovery.worked") },
              { key: "recovering", color: colors.recovering, label: t("recovery.recovering") },
              { key: "ready", color: colors.ready, label: t("recovery.ready") },
            ]}
          />
          <BodyMap mode="recovery" groups={recoveryPaint(data.recoveries, c)} />
          <View style={[styles.card, { backgroundColor: c.surface }]}>
            <RecoveryRow state="worked" items={states.worked} now={data.now} />
            <RecoveryRow state="recovering" items={states.recovering} now={data.now} />
            <RecoveryRow state="ready" items={states.ready} now={data.now} />
          </View>
          {insight && <RecoveryInsight insight={insight} />}
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
  title: getTextStyle("displayLg"),
  link: { minHeight: tokens.dimensions.minTouch, justifyContent: "center" },
  linkLabel: getTextStyle("title"),
  card: { gap: tokens.spacing[4], padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg },
});
