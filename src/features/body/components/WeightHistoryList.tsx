import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { ListRow } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";
import { formatWeight } from "@/shared/utils/weight.utils";
import type { BodyWeightEntry } from "../types/body.types";
import { formatDayMonth } from "../utils/body-date.utils";

const ICON_SIZE = 20;

interface WeightHistoryListProps {
  /** Del más nuevo al más viejo; la pantalla ya los limita a los últimos. */
  entries: readonly BodyWeightEntry[];
  onDelete: (id: string) => void;
}

/** Los últimos registros, cada uno en la unidad en que se guardó, con su botón de borrar. */
export function WeightHistoryList({ entries, onDelete }: Readonly<WeightHistoryListProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const locale = i18n.language;

  return (
    <View style={styles.list}>
      <Text style={[styles.label, { color: c.textSecondary }]}>{t("body.history.title")}</Text>
      {entries.map((entry) => {
        const date = formatDayMonth(entry.date, locale);
        return (
          <ListRow
            key={entry.id}
            title={formatWeight({ value: entry.weight, unit: entry.unit, locale })}
            subtitle={date}
            trailing={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("body.history.delete", { date })}
                onPress={() => onDelete(entry.id)}
                style={styles.remove}
              >
                <IconRenderer name="trash" size={ICON_SIZE} color={c.textSecondary} />
              </Pressable>
            }
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: tokens.spacing[2] },
  label: getTextStyle("label"),
  remove: {
    width: tokens.dimensions.minTouch,
    height: tokens.dimensions.minTouch,
    alignItems: "center",
    justifyContent: "center",
  },
});
