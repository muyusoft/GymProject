const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", "supabase/functions/*"],
  },
  {
    files: ["**/*.cjs"],
    languageOptions: {
      globals: { __dirname: "readonly" },
    },
  },
]);
