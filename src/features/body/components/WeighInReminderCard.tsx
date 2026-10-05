import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Chip, InlineError, Stepper, Toggle } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { formatReminderTime } from "@/shared/utils/reminder.utils";
import { MAX_HOUR, MAX_MINUTE } from "@/shared/utils/settings-values.utils";
import { WEEKDAY_COUNT } from "@/shared/utils/week.utils";
import { useWeighInReminder } from "../hooks/use-weigh-in-reminder";

const MINUTE_STEP = 15;
const LAST_MINUTE_OPTION = MAX_MINUTE - (MAX_MINUTE % MINUTE_STEP);
const WEEKDAYS = Array.from({ length: WEEKDAY_COUNT }, (_, weekday) => weekday);

/** Aviso para pesarse: cada día, o una vez por semana el día elegido. Todo se ajusta con botones, sin teclado. */
export function WeighInReminderCard() {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const reminder = useWeighInReminder();
  const isWeekly = reminder.frequency === "weekly";
  const time = formatReminderTime(reminder.hour, reminder.minute);
  const description = isWeekly
    ? t("body.reminder.whenWeekly", { day: t(`weekday.long.${reminder.weekday}`), time })
    : t("body.reminder.whenDaily", { time });

  return (
    <View style={[styles.card, { backgroundColor: c.surface }]}>
      <Toggle
        label={t("body.reminder.label")}
        description={description}
        value={reminder.isEnabled}
        onChange={(value) => void reminder.toggle(value)}
      />
      {reminder.isDenied && <InlineError message={t("settings.reminder.denied")} />}
      {reminder.hasError && <InlineError message={t("common.saveError")} />}
      {reminder.isEnabled && (
        <>
          {isWeekly && (
            <>
              <Text style={[styles.label, { color: c.textSecondary }]}>{t("body.reminder.day")}</Text>
              <View style={styles.days}>
                {WEEKDAYS.map((weekday) => (
                  <Chip
                    key={weekday}
                    label={t(`weekday.short.${weekday}`)}
                    selected={weekday === reminder.weekday}
                    onPress={() => reminder.setWeekday(weekday)}
                  />
                ))}
              </View>
            </>
          )}
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: tokens.spacing[3], padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg },
  label: getTextStyle("label"),
  days: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[2] },
});
