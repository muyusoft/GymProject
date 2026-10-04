import { create } from "zustand";
import i18n from "@/config/i18n";
import { saveSetting, getAllSettings } from "@/shared/db/queries/settings.queries";
import { syncReminders } from "@/shared/services/reminders.service";
import type { Language } from "@/shared/types/settings.types";
import {
  parseSettings,
  serializeSetting,
  type AppSettingKey,
  type AppSettings,
} from "@/shared/utils/settings-values.utils";
import { useThemeStore } from "./theme.store";

/** El texto de los avisos depende del idioma y su horario del recordatorio. */
const REMINDER_KEYS: readonly AppSettingKey[] = ["language", "reminderEnabled", "reminderHour", "reminderMinute"];

interface SettingsState extends AppSettings {
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  update: <K extends AppSettingKey>(key: K, value: AppSettings[K]) => Promise<void>;
}

function currentLanguage(): Language {
  return i18n.language === "es" ? "es" : "en";
}

/** Idioma y tema viven fuera del store (i18next y el store de tema); aquí se sincronizan. */
function applySideEffects(settings: Pick<AppSettings, "language" | "theme">): void {
  void i18n.changeLanguage(settings.language);
  useThemeStore.getState().setTheme(settings.theme);
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...parseSettings({}, "en"),
  isHydrated: false,

  hydrate: async () => {
    const settings = parseSettings(await getAllSettings(), currentLanguage());
    applySideEffects(settings);
    set({ ...settings, isHydrated: true });
  },

  update: async (key, value) => {
    await saveSetting(key, serializeSetting(value));
    set((state) => ({ ...state, [key]: value }));
    applySideEffects(get());
    if (REMINDER_KEYS.includes(key)) void syncReminders();
  },
}));
