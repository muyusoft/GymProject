import { router } from "expo-router";
import { useActionRunner } from "@/shared/hooks/use-action-runner";
import { useSettingsStore } from "@/shared/store";

interface StartApp {
  start: () => void;
  isStarting: boolean;
  hasError: boolean;
}

/** "Empezar": marca la introducción como vista y entra a la app sin cuenta. */
export function useStartApp(): StartApp {
  const update = useSettingsStore((state) => state.update);
  const { run, isRunning, hasError } = useActionRunner();

  const start = () => {
    void run(() => update("onboardingDone", true)).then((isSaved) => {
      if (isSaved) router.replace("/");
    });
  };

  return { start, isStarting: isRunning, hasError };
}
