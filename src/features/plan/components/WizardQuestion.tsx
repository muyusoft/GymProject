import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";

interface WizardQuestionProps {
  eyebrow: string;
  title: string;
  children: ReactNode;
}

/** Un paso del asistente: la pregunta y sus opciones. */
export function WizardQuestion({ eyebrow, title, children }: Readonly<WizardQuestionProps>) {
  const { c } = useOverloadTheme();

  return (
    <View style={styles.step}>
      <View>
        <Text style={[styles.eyebrow, { color: c.textSecondary }]}>{eyebrow}</Text>
        <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  step: { gap: tokens.spacing[4] },
  eyebrow: getTextStyle("label"),
  title: { ...getTextStyle("displayLg"), textTransform: "uppercase" },
});
