import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";

interface IntroCardProps {
  children: ReactNode;
  /** Borde de color para destacar la tarjeta (por ejemplo, la sugerencia de subir peso). */
  outline?: string;
}

export function IntroCard({ children, outline }: Readonly<IntroCardProps>) {
  const { c } = useOverloadTheme();

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: outline ?? c.surface }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: tokens.borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
    padding: tokens.spacing[4],
    gap: tokens.spacing[3],
  },
});
