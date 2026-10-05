import { StyleSheet, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";

const MIN_INPUT_HEIGHT = tokens.spacing[16] * 2;

interface NotesInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function NotesInput({ value, onChange }: Readonly<NotesInputProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Text style={[styles.label, { color: c.textSecondary }]}>{t("import.textLabel")}</Text>
      <TextInput
        accessibilityLabel={t("import.textLabel")}
        multiline
        textAlignVertical="top"
        autoCorrect={false}
        placeholder={t("import.placeholder")}
        placeholderTextColor={c.textSecondary}
        value={value}
        onChangeText={onChange}
        style={[styles.input, { color: c.text }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: tokens.spacing[2],
    padding: tokens.spacing[4],
    borderRadius: tokens.borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: getTextStyle("label"),
  input: { ...getTextStyle("bodySm"), minHeight: MIN_INPUT_HEIGHT },
});
