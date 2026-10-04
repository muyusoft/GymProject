import * as Haptics from "expo-haptics";
import { logger } from "@/config/logger";

/** La vibración es un extra: si el dispositivo no la soporta se registra y la app sigue. */
async function run(feedback: () => Promise<void>): Promise<void> {
  try {
    await feedback();
  } catch (error) {
    logger.warn("Haptic feedback failed", { error });
  }
}

export function tapFeedback(): Promise<void> {
  return run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

export function successFeedback(): Promise<void> {
  return run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}
