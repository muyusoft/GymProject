import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";
import type { DaySummary } from "../types/plan.types";
import type { WeekNote } from "../utils/week-note.utils";

const ICON_SIZE = 16;

interface WeekShiftNoteProps {
  note: WeekNote;
  days: readonly DaySummary[];
}

/** Debajo de un día del plan: qué cambió esta semana por un día perdido. El plan no cambia. */
export function WeekShiftNote({ note, days }: Readonly<WeekShiftNoteProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const sentenceDay = (weekday: number) => t(`weekday.sentence.${weekday}`);

  let lines: string[];
  if (note.kind === "holds") {
    const day = days.find((candidate) => candidate.id === note.dayId)?.name ?? "";
    const holds = t("plan.week.holds", { day, weekday: sentenceDay(note.fromWeekday) });
    lines = note.isOwnDayLost ? [holds, t("plan.week.ownLost")] : [holds];
  } else if (note.kind === "movedTo") {
    lines = [t("plan.week.movedTo", { weekday: sentenceDay(note.weekday) })];
  } else {
    lines = [t("plan.week.skipped")];
  }

  return (
    <View style={styles.row}>
      <IconRenderer
        name={note.kind === "skipped" ? "skip-forward" : "repeat"}
        size={ICON_SIZE}
        color={c.textSecondary}
      />
      <View style={styles.texts}>
        {lines.map((line) => (
          <Text key={line} style={[styles.text, { color: c.textSecondary }]}>
            {line}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: tokens.spacing[2],
    paddingHorizontal: tokens.spacing[4],
  },
  texts: { flex: 1 },
  text: getTextStyle("bodySm"),
});
