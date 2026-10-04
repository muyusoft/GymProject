import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import IconRenderer from "@/shared/icons/icon-renderer";
import type { DayReview } from "../utils/import-plan.utils";

const ICON_SIZE = 20;

interface ImportSummaryProps {
  reviews: readonly DayReview[];
}

/** Dónde va a quedar lo importado: sesión con fecha y plantilla del día de la semana. */
export function ImportSummary({ reviews }: ImportSummaryProps) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const dated = reviews.filter(({ day }) => day.header && day.date);
  const [only] = dated;
  if (!only || !only.day.header || !only.day.date) return null;

  const message =
    dated.length === 1
      ? t("import.summary.single", {
          date: new Intl.DateTimeFormat(i18n.language, { weekday: "short", day: "numeric", month: "short" }).format(only.day.date),
          weekday: t(`weekday.long.${only.day.header.weekday}`),
        })
      : t("import.summary.multi", { count: dated.length });

  return (
    <View style={[styles.card, { backgroundColor: c.surface }]}>
      <IconRenderer name="info" size={ICON_SIZE} color={c.info} />
      <Text style={[styles.text, { color: c.textSecondary }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[3],
    padding: tokens.spacing[4],
    borderRadius: tokens.borderRadius.md,
  },
  text: { ...getTextStyle("bodySm"), flex: 1 },
});
