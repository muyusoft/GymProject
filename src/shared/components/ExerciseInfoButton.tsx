import { router } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";

const ICON_SIZE = 20;

interface ExerciseInfoButtonProps {
  exerciseId: string;
  /** Nombre del ejercicio, para la etiqueta de accesibilidad. */
  name: string;
  /** Algo que hacer antes de navegar (por ejemplo, ocultar una hoja que taparía la ficha). */
  onBeforeOpen?: (() => void) | undefined;
}

/** El icono de información que abre la ficha del ejercicio desde cualquier lista. */
export function ExerciseInfoButton({ exerciseId, name, onBeforeOpen }: Readonly<ExerciseInfoButtonProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("exerciseInfo.open", { name })}
      onPress={() => {
        onBeforeOpen?.();
        router.push({ pathname: "/exercise/info/[id]", params: { id: exerciseId } });
      }}
      style={styles.button}
    >
      <IconRenderer name="info" size={ICON_SIZE} color={c.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: tokens.dimensions.minTouch,
    height: tokens.dimensions.minTouch,
    alignItems: "center",
    justifyContent: "center",
  },
});
