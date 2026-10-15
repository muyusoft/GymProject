import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { tokens } from "@/design/tokens";
import { Button, EmptyState, InlineError } from "@/shared/components";

interface EmptyPlanProps {
  isCreating: boolean;
  hasError: boolean;
  onCreate: () => void;
}

export function EmptyPlan({
  isCreating,
  hasError,
  onCreate,
}: Readonly<EmptyPlanProps>) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <EmptyState
        title={t("plan.empty.title")}
        body={t("plan.empty.body")}
        action={
          <Button
            label={t("plan.empty.forMe")}
            icon="lightbulb"
            onPress={() => router.push("/plan/wizard")}
          />
        }
      >
        <View style={styles.others}>
          <Button
            variant="secondary"
            label={t("plan.empty.create")}
            block
            loading={isCreating}
            onPress={onCreate}
          />
          <Button
            variant="secondary"
            label={t("plan.importNotes")}
            icon="clipboard"
            block
            disabled={isCreating}
            onPress={() => router.push("/import")}
          />
          {hasError && <InlineError message={t("common.saveError")} />}
        </View>
      </EmptyState>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
  others: { alignSelf: "stretch", gap: tokens.spacing[2] },
});
