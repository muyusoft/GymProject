import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import type { GroupRecovery, RecoveryState } from "../types/muscles.types";
import { joinGroupNames } from "../utils/group-labels.utils";
import {
  groupByPercent,
  latestWorkedAt,
  relativeDay,
  stateColors,
} from "../utils/recovery-view.utils";

const DOT_SIZE = tokens.spacing[3];
const READY_AFTER_HOURS = 72;

interface RecoveryRowProps {
  state: RecoveryState;
  items: readonly GroupRecovery[];
  now: number;
}

/** Una fila de la lista: el estado con su color y, siempre, el texto con los grupos y cuándo se trabajaron. */
export function RecoveryRow({ state, items, now }: Readonly<RecoveryRowProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const workedAt = latestWorkedAt(items);
  const translate = (key: string) => t(key);

  const when = (() => {
    if (state === "ready")
      return t("recovery.readyAfter", { hours: READY_AFTER_HOURS });
    if (workedAt === null) return "";
    const day = new Intl.DateTimeFormat(i18n.language, {
      weekday: "short",
      day: "numeric",
    }).format(workedAt);
    const relative = relativeDay(workedAt, now);
    const label =
      relative.kind === "daysAgo"
        ? t("recovery.daysAgo", { count: relative.days })
        : t(`recovery.${relative.kind}`);
    return `${day} · ${label}`;
  })();

  const lines =
    state === "recovering"
      ? groupByPercent(items).map(
          (line) =>
            `${joinGroupNames(line.groups, translate)} · ${line.percent}%`,
        )
      : [
          joinGroupNames(
            items.map((item) => item.group),
            translate,
          ),
        ];

  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <View style={styles.title}>
          <View
            style={[styles.dot, { backgroundColor: stateColors(c)[state] }]}
          />
          <Text style={[styles.state, { color: c.text }]}>
            {t(`recovery.${state}`)}
          </Text>
        </View>
        <Text style={[styles.when, { color: c.textSecondary }]}>{when}</Text>
      </View>
      {items.length === 0 ? (
        <Text style={[styles.groups, { color: c.textSecondary }]}>
          {t("recovery.none")}
        </Text>
      ) : (
        lines.map((line) => (
          <Text key={line} style={[styles.groups, { color: c.textSecondary }]}>
            {line}
          </Text>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: tokens.spacing[1] },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: tokens.spacing[3],
  },
  title: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[2] },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: tokens.borderRadius.full,
  },
  state: getTextStyle("title"),
  when: getTextStyle("bodySm"),
  groups: getTextStyle("bodySm"),
});
