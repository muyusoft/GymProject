import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Button, EmptyState } from "@/shared/components";

interface EmptyTodayProps {
  reason: "noPlan" | "rest";
}

/** Sin plan o día de descanso: dice por qué no hay entreno y, sin plan, lleva a crearlo. */
export function EmptyToday({ reason }: Readonly<EmptyTodayProps>) {
  const { t } = useTranslation();

  return (
    <EmptyState
      title={t(`today.empty.${reason}.title`)}
      body={t(`today.empty.${reason}.body`)}
      {...(reason === "noPlan" && {
        action: <Button label={t("today.empty.noPlan.action")} onPress={() => router.push("/routines")} />,
      })}
    />
  );
}
