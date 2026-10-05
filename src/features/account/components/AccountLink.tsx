import { Pressable, StyleSheet, Text } from "react-native";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";

interface AccountLinkProps {
  label: string;
  /** Texto normal antes del enlace: "¿No tienes cuenta?". */
  prefix?: string;
  align?: "center" | "flex-end";
  onPress: () => void;
}

/** Enlace de texto subrayado, con área táctil completa. */
export function AccountLink({ label, prefix, align = "center", onPress }: Readonly<AccountLinkProps>) {
  const { c } = useOverloadTheme();

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={prefix === undefined ? label : `${prefix} ${label}`}
      onPress={onPress}
      style={[styles.link, { alignSelf: align }]}
    >
      <Text style={[styles.text, { color: c.textSecondary }]}>
        {prefix !== undefined && `${prefix} `}
        <Text style={[styles.label, { color: c.text }]}>{label}</Text>
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: { minHeight: tokens.dimensions.minTouch, justifyContent: "center" },
  text: { ...getTextStyle("body"), textAlign: "center" },
  label: { fontFamily: tokens.typography.fontFamily.sansSemibold, textDecorationLine: "underline" },
});
