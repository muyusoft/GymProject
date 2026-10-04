import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import IconRenderer from "@/shared/icons/icon-renderer";
import type { BalanceInsight } from "../utils/muscle-volume.utils";

const ICON_SIZE = 20;

interface BalanceCardProps {
  balance: BalanceInsight;
}

export function BalanceCard({ balance }: BalanceCardProps) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const name = (group: BalanceInsight["top"]) => t(`muscles.group.${group}`).toLowerCase();

  return (
    <View style={[styles.card, { backgroundColor: c.surface }]}>
      <IconRenderer name="info" size={ICON_SIZE} color={c.info} />
      <Text style={[styles.text, { color: c.textSecondary }]}>
        {t("muscles.volume.balance", {
          top: t(`muscles.group.${balance.top}`),
          ratio: balance.ratio,
          low: balance.low.map(name).join(` ${t("muscles.volume.and")} `),
        })}
      </Text>
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
  text: { ...getTextStyle("body"), flex: 1 },
});
