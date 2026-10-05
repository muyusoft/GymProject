import { useCallback, useState } from "react";
import { useActionRunner } from "@/shared/hooks/use-action-runner";
import { requestReminderPermission } from "@/shared/services/reminders.service";
import { useSettingsStore } from "@/shared/store";
import type { WeighInFrequency } from "@/shared/types/settings.types";

interface WeighInReminderState {
  isEnabled: boolean;
  frequency: WeighInFrequency;
  /** Día del pesaje semanal: 0 = lunes … 6 = domingo. */
  weekday: number;
  hour: number;
  minute: number;
  /** El sistema no dio permiso de notificaciones: el recordatorio queda apagado y se explica por qué. */
  isDenied: boolean;
  hasError: boolean;
  toggle: (value: boolean) => Promise<void>;
  setWeekday: (weekday: number) => void;
  setHour: (hour: number) => void;
  setMinute: (minute: number) => void;
}

export function useWeighInReminder(): WeighInReminderState {
  const isEnabled = useSettingsStore((state) => state.weighInReminderEnabled);
  const frequency = useSettingsStore((state) => state.weighInFrequency);
  const weekday = useSettingsStore((state) => state.weighInWeekday);
  const hour = useSettingsStore((state) => state.weighInReminderHour);
  const minute = useSettingsStore((state) => state.weighInReminderMinute);
  const update = useSettingsStore((state) => state.update);
  const [isDenied, setIsDenied] = useState(false);
  const { run, hasError } = useActionRunner();

  const toggle = useCallback(
    async (value: boolean) => {
      const isGranted = value ? await requestReminderPermission() : true;
      setIsDenied(!isGranted);
      if (isGranted) await run(() => update("weighInReminderEnabled", value));
    },
    [run, update],
  );

  return {
    isEnabled,
    frequency,
    weekday,
    hour,
    minute,
    isDenied,
    hasError,
    toggle,
    setWeekday: (value) => void run(() => update("weighInWeekday", value)),
    setHour: (value) => void run(() => update("weighInReminderHour", value)),
    setMinute: (value) => void run(() => update("weighInReminderMinute", value)),
  };
}
