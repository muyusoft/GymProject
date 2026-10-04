import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import type { ExerciseSession } from "../types/progress.types";
import { formatShortDate } from "../utils/date-format.utils";
import { formatSessionSummary } from "../utils/history-stats.utils";

interface SessionHistoryListProps {
  sessions: readonly ExerciseSession[];
}

export function SessionHistoryList({ sessions }: SessionHistoryListProps) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: c.textSecondary }]}>{t("history.sessions")}</Text>
      <View style={[styles.card, { backgroundColor: c.surface }]}>
        {sessions.map((session) => (
          <View key={session.sessionId} style={styles.row}>
            <View style={styles.texts}>
              <Text style={[styles.date, { color: c.text }]}>{formatShortDate(session.date, i18n.language)}</Text>
              {session.dayName && <Text style={[styles.day, { color: c.textSecondary }]}>{session.dayName}</Text>}
            </View>
            <Text style={[styles.summary, { color: c.text }]}>
              {formatSessionSummary({ session, locale: i18n.language })}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: tokens.spacing[2] },
  title: getTextStyle("label"),
  card: { gap: tokens.spacing[4], padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: tokens.spacing[3] },
  texts: { flex: 1 },
  date: getTextStyle("title"),
  day: getTextStyle("bodySm"),
  summary: getTextStyle("numeric"),
});
