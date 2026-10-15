import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useTranslation } from "react-i18next";
import { tokens } from "@/design/tokens";
import { useIllustrationTones } from "@/shared/hooks/use-illustration-tones";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { MovementIllustration } from "@/shared/icons";
import { illustrationFor } from "../utils/movement-illustration.utils";

// El dibujo ocupa el ancho de la pantalla menos los márgenes y el relleno de la tarjeta.
const HORIZONTAL_SPACE = tokens.dimensions.screenGutter * 2 + tokens.spacing[4] * 2;

interface MovementFigureProps {
  movementId: string;
}

/** La ilustración del movimiento en su tarjeta; sin ilustración no muestra nada. */
export function MovementFigure({ movementId }: Readonly<MovementFigureProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const tones = useIllustrationTones();
  const { width } = useWindowDimensions();
  const name = illustrationFor(movementId);
  if (!name) return null;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={t("movementInfo.figure", { name: t(`movement.${movementId}.name`) })}
      style={[styles.card, { backgroundColor: c.surface }]}
    >
      <MovementIllustration name={name} width={width - HORIZONTAL_SPACE} tones={tones} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: "center", padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg },
});
