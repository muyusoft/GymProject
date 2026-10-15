import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Badge, EmptyState, ScreenHeader } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";
import { findMovement } from "../utils/find-movement.utils";
import { doseKey } from "../utils/movement-dose.utils";
import { MovementFigure } from "./MovementFigure";
import { MovementSources } from "./MovementSources";
import { MovementSteps } from "./MovementSteps";

const ICON_SIZE = 20;

interface MovementInfoScreenProps {
  movementId: string;
}

/** Ficha de un movimiento de calentamiento o estiramiento: para qué sirve, cómo se hace, un consejo y sus fuentes. */
export function MovementInfoScreen({ movementId }: Readonly<MovementInfoScreenProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const movement = findMovement(movementId);
  const goBack = () => router.back();

  if (!movement) {
    return (
      <View style={styles.content}>
        <ScreenHeader eyebrow={t("movementInfo.eyebrow")} onBack={goBack} />
        <EmptyState title={t("movementInfo.notFound")} />
      </View>
    );
  }

  const { key, count } = doseKey(movement.dose);
  const prefix = `movement.${movement.id}`;
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenHeader eyebrow={t("movementInfo.eyebrow")} onBack={goBack} />
      <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>{t(`${prefix}.name`)}</Text>
      <MovementFigure movementId={movement.id} />
      <View style={styles.tags}>
        <Badge tone="info" label={t(`movementInfo.kind.${movement.kind}`)} />
        <Badge label={t(movement.needsBand ? "warmup.band" : "warmup.noEquipment")} />
        <Badge label={t(`movement.dose.${key}`, { count })} />
      </View>
      <View style={styles.block}>
        <Text style={[styles.label, { color: c.textSecondary }]}>{t("movementInfo.purpose")}</Text>
        <Text style={[styles.body, { color: c.text }]}>{t(`${prefix}.purpose`)}</Text>
      </View>
      <MovementSteps movement={movement} />
      <View style={[styles.tip, { backgroundColor: c.surface }]}>
        <IconRenderer name="info" size={ICON_SIZE} color={c.info} />
        <Text style={[styles.tipText, { color: c.textSecondary }]}>{t(`${prefix}.tip`)}</Text>
      </View>
      <MovementSources sources={movement.sources} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: tokens.spacing[4], padding: tokens.dimensions.screenGutter },
  title: getTextStyle("displayLg"),
  tags: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[2] },
  block: { gap: tokens.spacing[1] },
  label: getTextStyle("label"),
  body: getTextStyle("body"),
  tip: { flexDirection: "row", gap: tokens.spacing[3], padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg },
  tipText: { ...getTextStyle("bodySm"), flex: 1 },
});
