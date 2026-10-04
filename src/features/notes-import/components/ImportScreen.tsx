import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { AsyncStateView, Button, InlineError, ScreenHeader } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { useImportNotes } from "../hooks/use-import-notes";
import { DetectedDaySection } from "./DetectedDaySection";
import { ImportSummary } from "./ImportSummary";
import { IssueList } from "./IssueList";
import { NotesInput } from "./NotesInput";

export function ImportScreen() {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const form = useImportNotes();
  const hasText = form.text.trim() !== "";
  const canImport = form.importableCount > 0 && form.pendingCount === 0;

  const buttonLabel =
    form.pendingCount > 0
      ? t("import.pending", { count: form.pendingCount })
      : t("import.cta", { count: form.importableCount });

  return (
    <AsyncStateView status={form.status} onRetry={() => void form.reload()}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ScreenHeader eyebrow={t("import.eyebrow")} onBack={() => router.back()} />
          <Text style={[styles.title, { color: c.text }]}>{t("import.title")}</Text>
          <NotesInput value={form.text} onChange={form.setText} />
          {!hasText && <Text style={[styles.hint, { color: c.textSecondary }]}>{t("import.hint")}</Text>}
          {form.reviews.map((review, dayIndex) => (
            <DetectedDaySection
              key={`${review.day.headerText}-${dayIndex}`}
              review={review}
              dayIndex={dayIndex}
              decisions={form.decisions}
              onDecide={form.decide}
            />
          ))}
          <IssueList issues={form.issues} />
          <ImportSummary reviews={form.reviews} />
        </ScrollView>
        <View style={styles.footer}>
          {form.hasError && <InlineError message={t("common.saveError")} />}
          <Button
            label={buttonLabel}
            block
            disabled={!canImport}
            loading={form.isImporting}
            onPress={() => void form.submit()}
          />
        </View>
      </View>
    </AsyncStateView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { gap: tokens.spacing[4], padding: tokens.dimensions.screenGutter },
  title: getTextStyle("displayLg"),
  hint: getTextStyle("bodySm"),
  footer: { gap: tokens.spacing[3], padding: tokens.dimensions.screenGutter },
});
