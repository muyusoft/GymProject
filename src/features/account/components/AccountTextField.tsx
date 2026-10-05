import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { InlineError } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";

const ICON_SIZE = 20;

const FIELD_PRESETS = {
  name: { autoComplete: "given-name", autoCapitalize: "words", keyboardType: "default", isSecret: false },
  email: { autoComplete: "email", autoCapitalize: "none", keyboardType: "email-address", isSecret: false },
  password: { autoComplete: "current-password", autoCapitalize: "none", keyboardType: "default", isSecret: true },
  newPassword: { autoComplete: "new-password", autoCapitalize: "none", keyboardType: "default", isSecret: true },
} as const;

interface AccountTextFieldProps {
  kind: keyof typeof FIELD_PRESETS;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Mensaje bajo el campo; con él, el borde pasa a color de error. */
  error?: string;
}

export function AccountTextField({ kind, label, value, onChange, placeholder, error }: Readonly<AccountTextFieldProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const preset = FIELD_PRESETS[kind];
  const [isFocused, setIsFocused] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  let borderColor = c.border;
  if (isFocused) borderColor = c.text;
  if (error !== undefined) borderColor = c.danger;

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: c.text }]}>{label}</Text>
      <View style={[styles.box, { backgroundColor: c.surfaceAlt, borderColor }]}>
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoComplete={preset.autoComplete}
          autoCapitalize={preset.autoCapitalize}
          autoCorrect={false}
          keyboardType={preset.keyboardType}
          secureTextEntry={preset.isSecret && isHidden}
          placeholderTextColor={c.textSecondary}
          {...(placeholder !== undefined && { placeholder })}
          style={[styles.input, { color: c.text }]}
        />
        {preset.isSecret && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(isHidden ? "account.fields.showPassword" : "account.fields.hidePassword")}
            onPress={() => setIsHidden((hidden) => !hidden)}
            style={styles.reveal}
          >
            <IconRenderer name={isHidden ? "eye" : "eye-off"} size={ICON_SIZE} color={c.textSecondary} />
          </Pressable>
        )}
      </View>
      {error !== undefined && <InlineError message={error} />}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: tokens.spacing[2] },
  label: { ...getTextStyle("bodySm"), fontFamily: tokens.typography.fontFamily.sansSemibold },
  box: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: tokens.dimensions.minTouch,
    borderRadius: tokens.borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  input: {
    ...getTextStyle("body"),
    flex: 1,
    minHeight: tokens.dimensions.minTouch,
    paddingHorizontal: tokens.spacing[4],
  },
  reveal: {
    width: tokens.dimensions.minTouch,
    height: tokens.dimensions.minTouch,
    alignItems: "center",
    justifyContent: "center",
  },
});
