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
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

export const LANGUAGES = ["es", "en"] as const;
export type Language = (typeof LANGUAGES)[number];
