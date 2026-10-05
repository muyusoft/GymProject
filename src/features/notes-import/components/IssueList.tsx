import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import IconRenderer from "@/shared/icons/icon-renderer";
import type { ParseIssue } from "../types/notes-import.types";

const ICON_SIZE = 20;

interface IssueListProps {
  issues: readonly ParseIssue[];
}

/** Las líneas que no se pudieron usar, con su texto y el motivo: nada se pierde sin aviso. */
export function IssueList({ issues }: Readonly<IssueListProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  if (issues.length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.danger }]}>
      <View style={styles.title}>
        <IconRenderer name="triangle-alert" size={ICON_SIZE} color={c.danger} />
        <Text style={[styles.titleLabel, { color: c.danger }]}>{t("import.issues.title", { count: issues.length })}</Text>
      </View>
      {issues.map((issue) => (
        <View key={issue.lineNumber}>
          <Text style={[styles.raw, { color: c.text }]}>{issue.raw}</Text>
          <Text style={[styles.reason, { color: c.textSecondary }]}>{t(`import.issues.${issue.reason}`)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: tokens.spacing[3],
    padding: tokens.spacing[4],
    borderRadius: tokens.borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  title: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[2] },
  titleLabel: { ...getTextStyle("label"), flex: 1 },
  raw: getTextStyle("bodySm"),
  reason: getTextStyle("bodySm"),
});
