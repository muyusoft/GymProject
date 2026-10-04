import { useLocalSearchParams } from "expo-router";
import { LibraryScreen } from "@/features/catalog";
import { AppLayout } from "@/shared/layouts";

export default function LibraryRoute() {
  const { dayId } = useLocalSearchParams<{ dayId?: string }>();

  return (
    <AppLayout>
      <LibraryScreen dayId={dayId} />
    </AppLayout>
  );
}
