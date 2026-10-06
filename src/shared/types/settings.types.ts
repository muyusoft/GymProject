export const SETTING_KEYS = {
  seeded: "seeded",
  language: "language",
  weightUnit: "weightUnit",
  theme: "theme",
  progressionSuggestions: "progressionSuggestions",
  trackRpe: "trackRpe",
  autoDeload: "autoDeload",
  reminderEnabled: "reminderEnabled",
  reminderHour: "reminderHour",
  reminderMinute: "reminderMinute",
  heightCm: "heightCm",
  weighInFrequency: "weighInFrequency",
  weighInReminderEnabled: "weighInReminderEnabled",
  weighInReminderHour: "weighInReminderHour",
  weighInReminderMinute: "weighInReminderMinute",
  weighInWeekday: "weighInWeekday",
  onboardingDone: "onboardingDone",
  /** Versión de la preparación para sincronizar (ids estables) ya aplicada a esta instalación. */
  syncPrep: "syncPrep",
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

export const LANGUAGES = ["es", "en"] as const;
export type Language = (typeof LANGUAGES)[number];

export const WEIGH_IN_FREQUENCIES = ["daily", "weekly"] as const;
export type WeighInFrequency = (typeof WEIGH_IN_FREQUENCIES)[number];
