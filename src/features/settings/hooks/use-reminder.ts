import { useCallback, useState } from "react";
import { useActionRunner } from "@/shared/hooks/use-action-runner";
import { useFocusResource } from "@/shared/hooks/use-focus-resource";
import { requestReminderPermission } from "@/shared/services/reminders.service";
import { useSettingsStore } from "@/shared/store";
import { loadPlanWeekdays } from "../services/settings.service";

interface ReminderState {
  isEnabled: boolean;
  hour: number;
  minute: number;
  /** Días con entreno en el plan; el aviso sale esos días. */
  weekdays: number[];
  /** El sistema no dio permiso de notificaciones: el recordatorio queda apagado y se explica por qué. */
  isDenied: boolean;
  hasError: boolean;
  toggle: (value: boolean) => Promise<void>;
  setHour: (hour: number) => void;
  setMinute: (minute: number) => void;
}

export function useReminder(): ReminderState {
  const isEnabled = useSettingsStore((state) => state.reminderEnabled);
  const hour = useSettingsStore((state) => state.reminderHour);
  const minute = useSettingsStore((state) => state.reminderMinute);
  const update = useSettingsStore((state) => state.update);
  const { data } = useFocusResource(loadPlanWeekdays);
  const [isDenied, setIsDenied] = useState(false);
  const { run, hasError } = useActionRunner();

  const toggle = useCallback(
    async (value: boolean) => {
      const isGranted = value ? await requestReminderPermission() : true;
      setIsDenied(!isGranted);
      if (isGranted) await run(() => update("reminderEnabled", value));
    },
    [run, update],
  );

  return {
    isEnabled,
    hour,
    minute,
    weekdays: data ?? [],
    isDenied,
    hasError,
    toggle,
    setHour: (value) => void run(() => update("reminderHour", value)),
    setMinute: (value) => void run(() => update("reminderMinute", value)),
  };
}
