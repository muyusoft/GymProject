import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Button, EmptyState, InlineError } from "@/shared/components";

interface EmptyPlanProps {
  isCreating: boolean;
  hasError: boolean;
  onCreate: () => void;
}

export function EmptyPlan({ isCreating, hasError, onCreate }: Readonly<EmptyPlanProps>) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <EmptyState title={t("plan.empty.title")} body={t("plan.empty.body")}>
        {hasError && <InlineError message={t("common.saveError")} />}
        <Button label={t("plan.empty.create")} loading={isCreating} onPress={onCreate} />
      </EmptyState>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
});
