import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Chip } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import IconRenderer from "@/shared/icons/icon-renderer";
import { getExerciseName } from "@/shared/utils/exercise-name.utils";
import type { LineMatch, MatchDecision, ParsedLine } from "../types/notes-import.types";
import { formatDetectedMeta } from "../utils/detected-meta.utils";

const BADGE_ICON_SIZE = 20;
const PENDING_BORDER_WIDTH = 2;

interface DetectedRowProps {
  line: ParsedLine;
  match: LineMatch;
  decision: MatchDecision | undefined;
  onDecide: (decision: MatchDecision) => void;
}

/** Reconocida (check), dudosa (?, pide confirmar) o nueva (+): el estado va en icono y en texto, no solo en color. */
export function DetectedRow({ line, match, decision, onDecide }: Readonly<DetectedRowProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const isPending = match.status === "confirm" && decision === undefined;
  const isLinked = match.status === "matched" || decision === "link";
  const suggested = match.candidate ? getExerciseName(match.candidate, i18n.language) : "";
  const title = isLinked && match.candidate ? suggested : line.name;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: c.surface, borderColor: isPending ? c.info : c.surface },
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.badge, { backgroundColor: isLinked ? c.accent : c.surfaceAlt }]}>
          {isPending ? (
            <Text style={[styles.question, { color: c.info }]}>?</Text>
          ) : (
            <IconRenderer name={isLinked ? "check" : "plus"} size={BADGE_ICON_SIZE} color={isLinked ? c.onAccent : c.text} />
          )}
        </View>
        <View style={styles.texts}>
          <Text style={[styles.name, { color: c.text }]}>{title}</Text>
          <Text style={[styles.meta, { color: c.textSecondary }]}>
            {formatDetectedMeta({ line, locale: i18n.language, t: (key) => t(key) })}
          </Text>
          {!!(line.note) && <Text style={[styles.meta, { color: c.textSecondary }]}>{line.note}</Text>}
          {match.status === "unknown" && (
            <Text style={[styles.meta, { color: c.textSecondary }]}>{t("import.newExercise")}</Text>
          )}
          {decision === "keep" && (
            <Text style={[styles.meta, { color: c.textSecondary }]}>{t("import.newExercise")}</Text>
          )}
        </View>
      </View>
      {match.status === "confirm" && (
        <View style={styles.confirm}>
          <Text style={[styles.ask, { color: c.text }]}>{t("import.question", { name: suggested })}</Text>
          <View style={styles.actions}>
            <Chip label={t("import.link")} selected={decision === "link"} onPress={() => onDecide("link")} />
            <Chip label={t("import.keep")} selected={decision === "keep"} onPress={() => onDecide("keep")} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: tokens.spacing[3],
    padding: tokens.spacing[3],
    borderRadius: tokens.borderRadius.md,
    borderWidth: PENDING_BORDER_WIDTH,
  },
  row: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[3] },
  badge: {
    width: tokens.spacing[8],
    height: tokens.spacing[8],
    borderRadius: tokens.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  question: getTextStyle("title"),
  texts: { flex: 1 },
  name: getTextStyle("title"),
  meta: getTextStyle("bodySm"),
  confirm: { gap: tokens.spacing[2] },
  ask: getTextStyle("body"),
  actions: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[2] },
});
