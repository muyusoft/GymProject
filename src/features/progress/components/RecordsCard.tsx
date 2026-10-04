import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { getExerciseName } from "@/shared/utils/exercise-name.utils";
import { formatWeight } from "@/shared/utils/weight.utils";
import type { RecentRecord } from "../utils/records-list.utils";

interface RecordsCardProps {
  records: readonly RecentRecord[];
}

/** Récords recientes en ember; tocar uno abre el historial de ese ejercicio. */
export function RecordsCard({ records }: RecordsCardProps) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();

  return (
    <View style={[styles.card, { backgroundColor: c.surface }]}>
      <Text style={[styles.title, { color: c.textSecondary }]}>{t("progress.records.title")}</Text>
      {records.length === 0 && (
        <Text style={[styles.empty, { color: c.textSecondary }]}>{t("progress.records.empty")}</Text>
      )}
      {records.map((record) => {
        const name = getExerciseName(record, i18n.language);
        const mark = `${formatWeight({ value: record.weight, unit: record.unit, locale: i18n.language })} × ${record.reps}`;
        return (
          <Pressable
            key={record.exerciseId}
            accessibilityRole="button"
            accessibilityLabel={`${name}, ${t("progress.record")} ${mark}`}
            onPress={() => router.push({ pathname: "/exercise/[id]", params: { id: record.exerciseId } })}
            style={styles.row}
          >
            <Text style={[styles.name, { color: c.text }]}>{name}</Text>
            <Text style={[styles.mark, { color: c.reward }]}>{mark}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: tokens.spacing[2], padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg },
  title: getTextStyle("label"),
  empty: getTextStyle("bodySm"),
  row: {
    minHeight: tokens.dimensions.minTouch,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacing[3],
  },
  name: { ...getTextStyle("title"), flex: 1 },
  mark: getTextStyle("title"),
});
