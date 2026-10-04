import { StyleSheet, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { InlineError, Stepper, Toggle } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { formatReminderTime } from "@/shared/utils/reminder.utils";
import { MAX_HOUR, MAX_MINUTE } from "@/shared/utils/settings-values.utils";
import { useReminder } from "../hooks/use-reminder";
import { SettingsSection } from "./SettingsSection";

const MINUTE_STEP = 15;
const LAST_MINUTE_OPTION = MAX_MINUTE - (MAX_MINUTE % MINUTE_STEP);

/** Un aviso cada día de entreno del plan, a la hora elegida; la hora se ajusta con botones, sin teclado. */
export function ReminderSection() {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const reminder = useReminder();

  const days = reminder.weekdays.map((weekday) => t(`weekday.short.${weekday}`)).join(", ");
  const description =
    reminder.weekdays.length > 0
      ? t("settings.reminder.when", { days, time: formatReminderTime(reminder.hour, reminder.minute) })
      : t("settings.reminder.noDays");

  return (
    <SettingsSection title={t("settings.sections.reminders")}>
      <Toggle
        label={t("settings.reminder.label")}
        description={description}
        value={reminder.isEnabled}
        onChange={(value) => void reminder.toggle(value)}
      />
      {reminder.isDenied && <InlineError message={t("settings.reminder.denied")} />}
      {reminder.hasError && <InlineError message={t("common.saveError")} />}
      {reminder.isEnabled && (
        <>
          <Text style={[styles.label, { color: c.textSecondary }]}>{t("settings.reminder.hour")}</Text>
          <Stepper value={reminder.hour} step={1} min={0} max={MAX_HOUR} unit="h" onChange={reminder.setHour} />
          <Text style={[styles.label, { color: c.textSecondary }]}>{t("settings.reminder.minute")}</Text>
          <Stepper
            value={reminder.minute}
            step={MINUTE_STEP}
            min={0}
            max={LAST_MINUTE_OPTION}
            unit="min"
            onChange={reminder.setMinute}
          />
        </>
      )}
    </SettingsSection>
  );
}

const styles = StyleSheet.create({
  label: { ...getTextStyle("label"), marginTop: tokens.spacing[1] },
});
