import { router } from "expo-router";
import { useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { tokens } from "@/design/tokens";
import { AsyncStateView, Button, EmptyState, InlineError } from "@/shared/components";
import type { PlanExerciseDetail } from "@/shared/db/queries/plan-exercise.queries";
import { useDayEditor } from "../hooks/use-day-editor";
import { DayEditorHeader } from "./DayEditorHeader";
import { DayExerciseRow } from "./DayExerciseRow";

interface DayEditorScreenProps {
  dayId: string;
}

const keyOf = (entry: PlanExerciseDetail) => entry.planExercise.id;

export function DayEditorScreen({ dayId }: DayEditorScreenProps) {
  const { t } = useTranslation();
  const editor = useDayEditor(dayId);
  const { detail, move } = editor;
  const count = detail?.exercises.length ?? 0;

  const handleOpen = useCallback((planExerciseId: string) => {
    router.push({ pathname: "/exercise/configure", params: { planExerciseId } });
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: PlanExerciseDetail; index: number }) => (
      <DayExerciseRow entry={item} index={index} count={count} onPress={handleOpen} onMove={move} />
    ),
    [count, handleOpen, move],
  );

  return (
    <AsyncStateView status={editor.status} onRetry={() => void editor.reload()}>
      {detail && (
        <View style={styles.screen}>
          <FlatList
            data={detail.exercises}
            keyExtractor={keyOf}
            renderItem={renderItem}
            ItemSeparatorComponent={Separator}
            ListHeaderComponent={<DayEditorHeader detail={detail} draft={editor.draft} />}
            ListEmptyComponent={<EmptyState title={t("plan.day.empty")} />}
            contentContainerStyle={styles.content}
          />
          <View style={styles.footer}>
            {editor.hasError && <InlineError message={t("common.saveError")} />}
            <View style={styles.buttons}>
              <Button
                variant="secondary"
                label={t("plan.day.addExercise")}
                onPress={() => router.push({ pathname: "/library", params: { dayId } })}
              />
              <Button
                label={t("plan.day.save")}
                loading={editor.isSaving}
                onPress={() => void editor.save()}
              />
            </View>
          </View>
        </View>
      )}
    </AsyncStateView>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: tokens.dimensions.screenGutter },
  separator: { height: tokens.spacing[2] },
  footer: { gap: tokens.spacing[3], padding: tokens.dimensions.screenGutter },
  buttons: { flexDirection: "row", justifyContent: "space-between", gap: tokens.spacing[3] },
});
