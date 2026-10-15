import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { AsyncStateView, Button } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { useChecklist } from "../hooks/use-checklist";
import { useStretchTimer } from "../hooks/use-stretch-timer";
import { useStretches } from "../hooks/use-stretches";
import { totalMinutes } from "../utils/movement-dose.utils";
import { MovementRow } from "./MovementRow";
import { StretchTimerPanel } from "./StretchTimerPanel";

interface StretchScreenProps {
  sessionId: string;
}

const goHome = () => router.replace("/");

/** Al terminar el entreno: estiramientos opcionales para lo que se trabajó, con su cronómetro. */
export function StretchScreen({ sessionId }: Readonly<StretchScreenProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const { status, reload, movements } = useStretches(sessionId);
  const { doneIds, toggle, check } = useChecklist();
  const timer = useStretchTimer(check);
  const next = movements.find((movement) => !doneIds.has(movement.id)) ?? null;

  return (
    <AsyncStateView status={status} onRetry={() => void reload()}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titles}>
          <Text style={[styles.eyebrow, { color: c.textSecondary }]}>{t("stretch.eyebrow")}</Text>
          <Text style={[styles.title, { color: c.text }]}>{t("stretch.title")}</Text>
          <Text style={[styles.body, { color: c.textSecondary }]}>
            {t("stretch.minutes", { count: totalMinutes(movements) })}
          </Text>
        </View>
        <View>
          {movements.map((movement) => (
            <MovementRow key={movement.id} movement={movement} isDone={doneIds.has(movement.id)} onToggle={toggle} />
          ))}
        </View>
        <StretchTimerPanel
          active={timer.active}
          remaining={timer.remaining}
          next={next}
          onStart={timer.start}
          onStop={timer.stop}
        />
        <Text style={[styles.body, { color: c.textSecondary }]}>{t("stretch.note")}</Text>
        <Button
          variant={next ? "ghost" : "primary"}
          label={t(next ? "stretch.skip" : "stretch.done")}
          block
          onPress={goHome}
        />
      </ScrollView>
    </AsyncStateView>
  );
}

const styles = StyleSheet.create({
  content: { gap: tokens.spacing[4], padding: tokens.dimensions.screenGutter },
  titles: { gap: tokens.spacing[1] },
  eyebrow: getTextStyle("label"),
  title: getTextStyle("title"),
  body: getTextStyle("bodySm"),
});
