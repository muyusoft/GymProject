import { useLocalSearchParams } from "expo-router";
import { DaySummaryScreen } from "@/features/muscles";
import { AppLayout } from "@/shared/layouts";

export default function DaySummaryRoute() {
  const { date } = useLocalSearchParams<{ date: string }>();

  return (
    <AppLayout>
      <DaySummaryScreen date={date} />
    </AppLayout>
  );
}
