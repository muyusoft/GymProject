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
  introSeen: "introSeen",
  /** Versión de la preparación para sincronizar (ids estables) ya aplicada a esta instalación. */
  syncPrep: "syncPrep",
  /** Sincronización: cuenta enlazada a este teléfono y hasta dónde se subió y se bajó. */
  syncUserId: "syncUserId",
  syncPushedAt: "syncPushedAt",
  syncPulledAt: "syncPulledAt",
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

export const LANGUAGES = ["es", "en"] as const;
export type Language = (typeof LANGUAGES)[number];

export const WEIGH_IN_FREQUENCIES = ["daily", "weekly"] as const;
export type WeighInFrequency = (typeof WEIGH_IN_FREQUENCIES)[number];
