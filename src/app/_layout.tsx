import "@/config/i18n";
import { logger } from "@/config/logger";

import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { ErrorBoundary } from "@/shared/components";

SplashScreen.preventAutoHideAsync();

// Inicializar logger global
logger.info("App initialized");

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: "Home",
            }}
          />
          <Stack.Screen
            name="playground"
            options={{
              title: "🎮 Playground",
              headerShown: true,
            }}
          />
        </Stack>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
