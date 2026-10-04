# Preparar el repositorio de Overload

Pasos que corres tú, una sola vez, antes de la Fase 0. Claude Code no instala ni hace commits (regla de AGENTS.md).

## 1. Crear el repo desde el template

En GitHub: **Use this template** sobre `muyusoft/muyusoft-template` → nuevo repo `overload`. Clónalo y abre la carpeta en VS Code.

## 2. Copiar el kit

Copia el contenido de esta carpeta en la raíz del repo. Reemplaza estos archivos del template:

- `AGENTS.md` (solo cambia la línea del design system Minga y la nota de SVG)
- `src/design/tokens.json` y `src/design/tokens.ts`
- `src/locales/en/translation.json` y `src/locales/es/translation.json` (incluyen las claves del template)

Y agrega: `CLAUDE.md`, `SETUP.md`, `docs/overload/`, `src/features/catalog/data/` y `src/features/notes-import/__tests__/fixtures/`.

## 3. Renombrar

- `package.json`: `"name": "overload"`.
- `app.json`: `name` → `Overload`, `slug` → `overload`, `scheme` → `overload`, `userInterfaceStyle` → `dark`.

## 4. Instalar dependencias

```bash
npx expo install expo-sqlite expo-localization expo-haptics expo-notifications @expo-google-fonts/barlow @expo-google-fonts/barlow-condensed
npm install drizzle-orm react-native-body-highlighter
npm install -D drizzle-kit babel-plugin-inline-import
```

`babel-plugin-inline-import` permite importar las migraciones `.sql` de drizzle-kit; Claude Code te dirá qué agregar a `babel.config.cjs` y `metro.config.cjs` en la Fase 2.

## 5. Limpiar lo que el template trae y Overload no usa

- `package-lock.json` todavía arrastra paquetes de Jest: bórralo y corre `npm install` para regenerarlo.
- Husky: `npm install` corre `prepare` y activa los hooks. Comprueba con `ls .husky/_`. Las ramas deben seguir el formato `feat/descripcion` (o `fix/`, `docs/`, etc.).
- Tailwind está configurado pero no hace nada: no lo uses en Overload (puedes quitar `tailwindcss`, `tailwind.config.ts` y `use-tailwind.ts` en un commit `chore`).
- `axios`, `expo-auth-session`, `expo-secure-store` y el store de auth no se usan en el MVP offline; déjalos hasta que Claude Code confirme que nada los importa.

## 6. Catálogo de ejercicios

Descarga `dist/exercises.json` de [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (dominio público) en `src/features/catalog/data/free-exercise-db.json`. En la Fase 2, Claude Code escribe el script que lo une con `common-exercises.json` y genera la semilla.

## 7. Verificar

```bash
npx tsc --noEmit
npx vitest run
npm run lint
npx expo start
```

Si todo pasa: `git checkout -b chore/overload-kit`, commit `chore: add overload kit and design tokens`, y empieza la Fase 0 de `docs/overload/phases.md`.

## Referencias

- Mockups: canvas "Overload — Mockups". Design system: artifact "Overload Design System".
- react-native-body-highlighter (MIT): conserva su aviso de licencia.
