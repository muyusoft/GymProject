import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Button, InlineError } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";
import type { MissedDayOffer } from "../types/workout.types";

const ICON_SIZE = 20;

interface MissedDayCardProps {
  offer: MissedDayOffer;
  isSaving: boolean;
  hasError: boolean;
  onDoToday: () => void;
  onKeepPlan: () => void;
}

/** Aviso sin urgencia: el último día de entreno quedó sin hacer y se puede hacer hoy o dejarlo pasar. */
export function MissedDayCard({
  offer,
  isSaving,
  hasError,
  onDoToday,
  onKeepPlan,
}: Readonly<MissedDayCardProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const weekday = t(`weekday.sentence.${offer.weekday}`);

  return (
    <View style={[styles.card, { backgroundColor: c.surface }]}>
      <View style={styles.eyebrowRow}>
        <IconRenderer name="history" size={ICON_SIZE} color={c.textSecondary} />
        <Text style={[styles.eyebrow, { color: c.textSecondary }]}>
          {t("today.missed.eyebrow", { weekday })}
        </Text>
      </View>
      <Text style={[styles.title, { color: c.text }]}>
        {t("today.missed.title", { day: offer.dayName })}
      </Text>
      <Text style={[styles.body, { color: c.textSecondary }]}>
        {t("today.missed.body")}
      </Text>
      {offer.lostDayName !== null && (
        <Text style={[styles.body, { color: c.text }]}>
          {t("today.missed.lost", { day: offer.lostDayName })}
        </Text>
      )}
      {hasError && <InlineError message={t("common.saveError")} />}
      <Button
        variant="secondary"
        icon="repeat"
        label={t("today.missed.doToday", { day: offer.dayName })}
        block
        loading={isSaving}
        onPress={onDoToday}
      />
      <Button
        variant="ghost"
        label={t("today.missed.keepPlan")}
        block
        disabled={isSaving}
        onPress={onKeepPlan}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: tokens.spacing[2],
    padding: tokens.spacing[4],
    borderRadius: tokens.borderRadius.lg,
  },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[2] },
  eyebrow: getTextStyle("label"),
  title: getTextStyle("title"),
  body: getTextStyle("bodySm"),
});
