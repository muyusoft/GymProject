import { StyleSheet, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import IconRenderer from "@/shared/icons/icon-renderer";

const ICON_SIZE = 20;

interface LibrarySearchFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function LibrarySearchField({ value, onChange }: LibrarySearchFieldProps) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();

  return (
    <View style={[styles.field, { backgroundColor: c.surface }]}>
      <IconRenderer name="search" size={ICON_SIZE} color={c.textSecondary} />
      <TextInput
        accessibilityLabel={t("library.searchLabel")}
        placeholder={t("library.searchPlaceholder")}
        placeholderTextColor={c.textSecondary}
        value={value}
        onChangeText={onChange}
        autoCorrect={false}
        style={[styles.input, { color: c.text }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: tokens.dimensions.minTouch,
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[4],
    borderRadius: tokens.borderRadius.md,
  },
  input: { ...getTextStyle("body"), flex: 1 },
});
