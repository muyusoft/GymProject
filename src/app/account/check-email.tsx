import { useLocalSearchParams } from "expo-router";
import { CheckEmailScreen } from "@/features/account";
import { AppLayout } from "@/shared/layouts";

export default function CheckEmailRoute() {
  const { email } = useLocalSearchParams<{ email?: string }>();

  return (
    <AppLayout>
      <CheckEmailScreen email={email ?? ""} />
    </AppLayout>
  );
}
