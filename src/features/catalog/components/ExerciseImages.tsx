import { Image } from "expo-image";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";

/** Las fotos de free-exercise-db son apaisadas, de 3 por 2. */
const IMAGE_ASPECT_RATIO = 3 / 2;
const POSITION_KEYS = ["exerciseInfo.images.start", "exerciseInfo.images.end"] as const;

interface ExerciseImagesProps {
  urls: readonly string[];
  name: string;
}

/** Posición inicial y final. Se bajan una vez y quedan en el teléfono; sin conexión la primera vez, se avisa con texto. */
export function ExerciseImages({ urls, name }: Readonly<ExerciseImagesProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const [hasFailed, setHasFailed] = useState(false);

  if (urls.length === 0 || hasFailed) {
    return (
      <Text style={[styles.note, { color: c.textSecondary }]}>
        {t(hasFailed ? "exerciseInfo.images.failed" : "exerciseInfo.images.none")}
      </Text>
    );
  }

  return (
    <View style={styles.row}>
      {urls.map((url, position) => (
        <Image
          key={url}
          source={{ uri: url }}
          accessibilityLabel={t(POSITION_KEYS[position] ?? POSITION_KEYS[0], { name })}
          cachePolicy="disk"
          contentFit="cover"
          onError={() => setHasFailed(true)}
          style={[styles.image, { backgroundColor: c.surfaceAlt }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: tokens.spacing[2] },
  image: { flex: 1, aspectRatio: IMAGE_ASPECT_RATIO, borderRadius: tokens.borderRadius.md },
  note: getTextStyle("bodySm"),
});
