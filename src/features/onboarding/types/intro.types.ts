export const INTRO_STEPS = ["plan", "log", "progress", "muscles", "body"] as const;
export type IntroStep = (typeof INTRO_STEPS)[number];
