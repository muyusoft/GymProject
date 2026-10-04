module.exports = {
  presets: ["babel-preset-expo"],
  // Importa las migraciones .sql que genera drizzle-kit como texto.
  plugins: [["inline-import", { extensions: [".sql"] }]],
};
