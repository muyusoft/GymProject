import { useEffect } from "react";
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";
import { getExerciseName } from "@/shared/utils/exercise-name.utils";
import { oneRepMaxKg } from "@/shared/utils/one-rep-max.utils";
import { convertWeight, formatWeight } from "@/shared/utils/weight.utils";
import type { RecordNotice } from "../types/workout.types";

const VISIBLE_MS = 4000;
const ICON_SIZE = 24;

interface RecordToastProps {
  /** El récord recién batido; null no muestra nada. */
  notice: RecordNotice | null;
  onDismiss: () => void;
}

/** "Récord de peso" o "récord de fuerza", con la serie (y su 1RM estimado si es de fuerza) para que se entienda por qué. */
function useNoticeText(notice: RecordNotice | null): { title: string; message: string } | null {
  const { t, i18n } = useTranslation();
  if (!notice) return null;
  const { set, kind, exercise } = notice;
  const locale = i18n.language;
  const performed = `${formatWeight({ value: set.weight, unit: set.unit, locale })} × ${set.reps}`;
  const oneRepMax = Math.round(convertWeight(oneRepMaxKg(set), "kg", set.unit));
  return {
    title: t(`session.newRecord.title.${kind}`),
    message: t(`session.newRecord.body.${kind}`, {
      set: performed,
      oneRepMax: formatWeight({ value: oneRepMax, unit: set.unit, locale }),
      exercise: getExerciseName(exercise, locale),
    }),
  };
}

/**
 * Aviso breve al batir un récord: explica la etiqueta "Récord" justo cuando aparece, y qué se superó.
 * Se cierra solo o al tocarlo; el lector de pantalla lo anuncia.
 */
export function RecordToast({ notice, onDismiss }: Readonly<RecordToastProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const text = useNoticeText(notice);
  const announcement = text ? `${text.title} ${text.message}` : "";

  useEffect(() => {
    if (!announcement) return undefined;
    AccessibilityInfo.announceForAccessibility(announcement);
    const timeout = setTimeout(onDismiss, VISIBLE_MS);
    return () => clearTimeout(timeout);
  }, [announcement, onDismiss]);

  if (!text) return null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("session.newRecord.dismiss")}
      onPress={onDismiss}
      style={[styles.toast, { backgroundColor: c.reward }]}
    >
      <IconRenderer name="trophy" size={ICON_SIZE} color={c.surface} />
      <View style={styles.texts}>
        <Text style={[styles.title, { color: c.surface }]}>{text.title}</Text>
        <Text style={[styles.body, { color: c.surface }]}>{text.message}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toast: {
    minHeight: tokens.dimensions.minTouch,
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[3],
    marginTop: tokens.spacing[3],
    padding: tokens.spacing[4],
    borderRadius: tokens.borderRadius.lg,
  },
  texts: { flex: 1 },
  title: getTextStyle("title"),
  body: getTextStyle("bodySm"),
});
