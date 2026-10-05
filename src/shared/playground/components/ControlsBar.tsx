import { View, Pressable, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { useThemeStore, useAuthStore } from "@/shared/store";
import { tokens } from "@/design/tokens";
import { styles } from "../styles/playground.styles";
import type { PlaygroundColors } from "../types/playground.types";

interface ControlsBarProps {
  colors: PlaygroundColors;
}

const MOCK_USER = {
  id: "123",
  email: "test@example.com",
  name: "Test User",
};

export function ControlsBar({ colors }: Readonly<ControlsBarProps>) {
  const { i18n } = useTranslation();
  const { theme, setTheme } = useThemeStore();
  const { user, setUser } = useAuthStore();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleLanguage = () => {
    void i18n.changeLanguage(i18n.language === "en" ? "es" : "en");
  };

  const toggleAuth = () => {
    setUser(user ? null : MOCK_USER);
  };

  return (
    <View
      style={[
        styles.controls,
        {
          backgroundColor: colors.sectionBg,
          borderColor: colors.borderColor,
        },
      ]}
    >
      <Pressable
        onPress={toggleTheme}
        style={[
          styles.button,
          {
            backgroundColor: colors.accentColor,
            paddingHorizontal: tokens.spacing[4],
          },
        ]}
      >
        <Text
          style={[
            styles.buttonText,
            { fontSize: tokens.typography.fontSize.base },
          ]}
        >
          {theme === "dark" ? "🌙" : "☀️"} {theme}
        </Text>
      </Pressable>

      <Pressable
        onPress={toggleLanguage}
        style={[
          styles.button,
          {
            backgroundColor: colors.accentColor,
            paddingHorizontal: tokens.spacing[4],
          },
        ]}
      >
        <Text
          style={[
            styles.buttonText,
            { fontSize: tokens.typography.fontSize.base },
          ]}
        >
          {i18n.language.toUpperCase()}
        </Text>
      </Pressable>

      <Pressable
        onPress={toggleAuth}
        style={[
          styles.button,
          {
            backgroundColor: user
              ? tokens.colors.error[500]
              : tokens.colors.success[500],
            paddingHorizontal: tokens.spacing[4],
          },
        ]}
      >
        <Text
          style={[
            styles.buttonText,
            { fontSize: tokens.typography.fontSize.base },
          ]}
        >
          {user ? "Logout" : "Login"}
        </Text>
      </Pressable>
    </View>
  );
}
