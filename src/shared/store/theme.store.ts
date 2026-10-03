import { create } from "zustand";
import { persistedStore } from "./middleware";

type Theme = "light" | "dark" | "auto";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>(
  persistedStore("theme", (set) => ({
    theme: "auto",
    setTheme: (theme) => set({ theme }),
  })),
);
