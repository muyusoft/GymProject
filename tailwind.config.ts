import type { Config } from "tailwindcss";
import { tokens } from "./src/design/tokens";

export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: tokens.colors.primary,
        secondary: tokens.colors.secondary,
        success: tokens.colors.success,
        error: tokens.colors.error,
        warning: tokens.colors.warning,
        neutral: tokens.colors.neutral,
      },
      spacing: tokens.spacing,
      fontSize: tokens.typography.fontSize,
      borderRadius: tokens.borderRadius,
    },
  },
  plugins: [],
} satisfies Config;
