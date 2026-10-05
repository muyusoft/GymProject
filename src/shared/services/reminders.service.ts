import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import i18n from "@/config/i18n";
import { logger } from "@/config/logger";
import { getAllSettings } from "@/shared/db/queries/settings.queries";
import { findActivePlan, listPlanDays } from "@/shared/db/queries/plan.queries";
import { buildReminderSlots } from "@/shared/utils/reminder.utils";
import { parseSettings } from "@/shared/utils/settings-values.utils";

const CHANNEL_ID = "workout-reminders";

/** Una sola vez al arrancar: cómo se muestra un aviso con la app abierta y el canal de Android. */
export async function configureNotifications(): Promise<void> {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: i18n.t("reminder.channel"),
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
  } catch (error) {
    logger.error("Failed to configure notifications", { error });
  }
}

/** Pide el permiso del sistema (solo al activar el recordatorio); true si ya está concedido. */
export async function requestReminderPermission(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    return (await Notifications.requestPermissionsAsync()).granted;
  } catch (error) {
    logger.error("Failed to request notification permission", { error });
    return false;
  }
}

/**
 * Deja programados los avisos según Ajustes y el plan: uno semanal por día de entreno, a la hora elegida.
 * Se llama al arrancar y cada vez que cambian el recordatorio, el idioma o los días del plan.
 * Un fallo se registra y nunca rompe la pantalla que lo pidió.
 */
export async function syncReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const settings = parseSettings(await getAllSettings(), "en");
    if (!settings.reminderEnabled) return;
    if (!(await Notifications.getPermissionsAsync()).granted) return;

    const plan = await findActivePlan();
    const days = plan ? await listPlanDays(plan.id) : [];
    const slots = buildReminderSlots({ days, hour: settings.reminderHour, minute: settings.reminderMinute });
    await Promise.all(
      slots.map((slot) =>
        Notifications.scheduleNotificationAsync({
          content: { title: i18n.t("reminder.title"), body: i18n.t("reminder.body", { day: slot.dayName }) },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: slot.weekday,
            hour: slot.hour,
            minute: slot.minute,
            channelId: CHANNEL_ID,
          },
        }),
      ),
    );
  } catch (error) {
    logger.error("Failed to sync reminders", { error });
  }
}
