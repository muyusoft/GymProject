import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import type { GroupRecovery, RecoveryState } from "../types/muscles.types";
import { joinGroupNames } from "../utils/group-labels.utils";
import { recoveryLines, stateColors, type RecoveryLine } from "../utils/recovery-view.utils";
import { RecoveryLineItem } from "./RecoveryLineItem";

const DOT_SIZE = tokens.spacing[3];
const READY_AFTER_HOURS = 72;

interface RecoveryRowProps {
  state: RecoveryState;
  items: readonly GroupRecovery[];
  now: number;
  onSelectLine: (line: RecoveryLine) => void;
}

/** Una fila de la lista: el estado con su color y, siempre, el texto con los grupos, cuándo se trabajaron y cuándo estarán listos. */
export function RecoveryRow({ state, items, now, onSelectLine }: Readonly<RecoveryRowProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const color = stateColors(c)[state];
  const isReady = state === "ready";
  const lines = isReady ? [] : recoveryLines(items, { now, withPercent: state === "recovering" });

  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <View style={styles.title}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <Text style={[styles.state, { color: c.text }]}>{t(`recovery.${state}`)}</Text>
        </View>
        {isReady && (
          <Text style={[styles.text, { color: c.textSecondary }]}>
            {t("recovery.readyAfter", { hours: READY_AFTER_HOURS })}
          </Text>
        )}
      </View>
      {items.length === 0 && <Text style={[styles.text, { color: c.textSecondary }]}>{t("recovery.none")}</Text>}
      {/* Listo no necesita fecha por grupo: basta con decir desde cuántas horas se considera listo. */}
      {isReady && items.length > 0 && (
        <Text style={[styles.text, { color: c.textSecondary }]}>
          {joinGroupNames(items.map((item) => item.group), (key) => t(key))}
        </Text>
      )}
      {lines.map((line) => (
        <RecoveryLineItem key={line.key} line={line} color={color} now={now} onPress={onSelectLine} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: tokens.spacing[2] },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: tokens.spacing[3] },
  title: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[2] },
  dot: { width: DOT_SIZE, height: DOT_SIZE, borderRadius: tokens.borderRadius.full },
  state: getTextStyle("title"),
  text: getTextStyle("bodySm"),
});
