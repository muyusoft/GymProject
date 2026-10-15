import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Button } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import type { Movement } from "../types/warmup.types";
import { totalMinutes } from "../utils/movement-dose.utils";
import { MovementRow } from "./MovementRow";

interface WarmupCardProps {
  movements: readonly Movement[];
  doneIds: ReadonlySet<string>;
  onToggle: (id: string) => void;
  /** Cierra el calentamiento y va al primer ejercicio; "saltar" y "listo" hacen lo mismo. */
  onClose: () => void;
}

/** Calentamiento opcional antes de la primera serie: movimientos dinámicos y de activación. */
export function WarmupCard({ movements, doneIds, onToggle, onClose }: Readonly<WarmupCardProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const doneCount = movements.filter((movement) => doneIds.has(movement.id)).length;

  return (
    <View style={[styles.card, { backgroundColor: c.surface }]}>
      <View style={styles.header}>
        <View style={styles.titles}>
          <Text style={[styles.eyebrow, { color: c.textSecondary }]}>{t("warmup.eyebrow")}</Text>
          <Text style={[styles.title, { color: c.text }]}>{t("warmup.title")}</Text>
          <Text style={[styles.body, { color: c.textSecondary }]}>
            {t("warmup.minutes", { count: totalMinutes(movements) })}
          </Text>
        </View>
        <Text
          accessibilityLabel={t("warmup.progress", { done: doneCount, total: movements.length })}
          style={[styles.counter, { color: c.text }]}
        >
          {doneCount}/{movements.length}
        </Text>
      </View>
      <View>
        {movements.map((movement) => (
          <MovementRow key={movement.id} movement={movement} isDone={doneIds.has(movement.id)} onToggle={onToggle} />
        ))}
      </View>
      <Text style={[styles.body, { color: c.textSecondary }]}>{t("warmup.note")}</Text>
      <View style={styles.actions}>
        <View style={styles.action}>
          <Button variant="ghost" label={t("warmup.skip")} block onPress={onClose} />
        </View>
        <View style={styles.mainAction}>
          <Button label={t("warmup.start")} block onPress={onClose} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: tokens.spacing[3], padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg },
  header: { flexDirection: "row", alignItems: "flex-start", gap: tokens.spacing[3] },
  titles: { flex: 1, gap: tokens.spacing[1] },
  eyebrow: getTextStyle("label"),
  title: getTextStyle("title"),
  body: getTextStyle("bodySm"),
  counter: getTextStyle("title"),
  actions: { flexDirection: "row", gap: tokens.spacing[2] },
  action: { flex: 1 },
  mainAction: { flex: 2 },
});
