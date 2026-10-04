import "@/config/i18n";
import { logger } from "@/config/logger";

import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { catalogSeedData } from "@/features/catalog";
import { BootError, ErrorBoundary } from "@/shared/components";
import { useAppBootstrap } from "@/shared/hooks/use-app-bootstrap";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";

SplashScreen.preventAutoHideAsync();

// Inicializar logger global
logger.info("App initialized");

export default function RootLayout() {
  const { mode } = useOverloadTheme();
  const { isReady, error } = useAppBootstrap(catalogSeedData);

  useEffect(() => {
    if (isReady || error) SplashScreen.hideAsync();
  }, [isReady, error]);

  if (error) return <BootError />;
  if (!isReady) return null;

  return (
    <ErrorBoundary>
      <ThemeProvider value={mode === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="exercise/configure" options={{ presentation: "modal" }} />
          <Stack.Screen
            name="playground"
            options={{ title: "🎮 Playground", headerShown: true }}
          />
        </Stack>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
