import { useLocalSearchParams } from "expo-router";
import { CheckEmailScreen } from "@/features/account";
import { AppLayout } from "@/shared/layouts";

export default function CheckEmailRoute() {
  const { email, kind } = useLocalSearchParams<{
    email?: string;
    kind?: string;
  }>();

  return (
    <AppLayout>
      <CheckEmailScreen
        email={email ?? ""}
        kind={kind === "confirm" ? "confirm" : "reset"}
      />
    </AppLayout>
  );
}
