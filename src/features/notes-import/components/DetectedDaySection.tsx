import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import type { MatchDecision } from "../types/notes-import.types";
import { decisionKey, type DayReview, type Decisions } from "../utils/import-plan.utils";
import { DetectedRow } from "./DetectedRow";

const COLLAPSED_RECOGNIZED = 3;

interface DetectedDaySectionProps {
  review: DayReview;
  dayIndex: number;
  decisions: Decisions;
  onDecide: (dayIndex: number, lineNumber: number, decision: MatchDecision) => void;
}

/** Muestra siempre lo dudoso y lo nuevo; lo reconocido se pliega tras las primeras líneas. */
export function DetectedDaySection({ review, dayIndex, decisions, onDecide }: Readonly<DetectedDaySectionProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const { day, matches } = review;

  let recognizedShown = 0;
  const rows = day.lines.map((line, index) => ({ line, match: matches[index] ?? { status: "unknown" as const, candidate: null } }));
  const visible = rows.filter(({ match }) => {
    if (match.status !== "matched" || isExpanded) return true;
    recognizedShown += 1;
    return recognizedShown <= COLLAPSED_RECOGNIZED;
  });
  const hidden = rows.length - visible.length;
  const weekday = day.header ? t(`weekday.long.${day.header.weekday}`) : day.headerText;

  return (
    <View style={styles.section}>
      <Text style={[styles.heading, { color: c.accentText }]}>
        {`${t("import.detected", { count: rows.length })} · ${weekday}`}
      </Text>
      {visible.map(({ line, match }) => (
        <DetectedRow
          key={line.lineNumber}
          line={line}
          match={match}
          decision={decisions[decisionKey(dayIndex, line.lineNumber)]}
          onDecide={(decision) => onDecide(dayIndex, line.lineNumber, decision)}
        />
      ))}
      {hidden > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("import.moreRecognized", { count: hidden })}
          onPress={() => setIsExpanded(true)}
          style={styles.more}
        >
          <Text style={[styles.moreLabel, { color: c.textSecondary }]}>
            {t("import.moreRecognized", { count: hidden })}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: tokens.spacing[2] },
  heading: getTextStyle("label"),
  more: { minHeight: tokens.dimensions.minTouch, justifyContent: "center" },
  moreLabel: getTextStyle("bodySm"),
});
