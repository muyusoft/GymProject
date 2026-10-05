import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { SegmentedControl } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";
import { useSettingsStore } from "@/shared/store";
import { WEIGH_IN_FREQUENCIES } from "@/shared/types/settings.types";
import type { LoggingState } from "../types/body.types";
import { MIN_DAILY_ENTRIES } from "../utils/body-weight.utils";

const ICON_SIZE = 20;

interface WeighInCardProps {
  logging: LoggingState;
}

/** Cada cuánto se pesa la persona, cómo va su registro y cómo pesarse para que los datos sirvan. */
export function WeighInCard({ logging }: Readonly<WeighInCardProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const frequency = useSettingsStore((state) => state.weighInFrequency);
  const update = useSettingsStore((state) => state.update);

  const options = WEIGH_IN_FREQUENCIES.map((value) => ({ value, label: t(`body.frequency.${value}`) }));
  const { status } = logging;
  const statusKey = status === "due" || status === "ok" ? `body.status.${status}.${frequency}` : `body.status.${status}`;
  const needsAttention = status === "stale" || status === "sparse";

  return (
    <View style={[styles.card, { backgroundColor: c.surface }]}>
      <Text style={[styles.label, { color: c.textSecondary }]}>{t("body.frequency.title")}</Text>
      <SegmentedControl options={options} value={frequency} onChange={(value) => void update("weighInFrequency", value)} />
      <View style={styles.status}>
        <IconRenderer name={needsAttention ? "triangle-alert" : "info"} size={ICON_SIZE} color={c.text} />
        <Text style={[styles.statusText, { color: c.text }]}>
          {t(statusKey, { days: logging.daysSinceLast ?? 0, min: MIN_DAILY_ENTRIES })}
        </Text>
      </View>
      <Text style={[styles.tip, { color: c.textSecondary }]}>{t(`body.tip.${frequency}`)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: tokens.spacing[3], padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg },
  label: getTextStyle("label"),
  status: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[2] },
  statusText: { ...getTextStyle("body"), flex: 1 },
  tip: getTextStyle("bodySm"),
});
