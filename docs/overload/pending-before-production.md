# Pendiente antes de producción

Lo que hoy existe solo para probar la app y que hay que decidir (quitar, mantener o convertir en feature) antes de publicarla. Al cerrar un punto, bórralo de esta lista.

## Solo en desarrollo (`__DEV__`)

Se ven en Expo Go y en builds de desarrollo; el build de producción no los muestra. Aun así, hay que revisarlos antes de publicar.

- **Reiniciar entreno de hoy** (`src/features/workout/components/ResetTodayButton.tsx`, `services/session-reset.service.ts`, `hooks/use-reset-today.ts`, claves `today.devReset.*`). Está en Hoy cuando ya hay una sesión de hoy, abierta o terminada. Borra esa sesión y sus series, incluido el historial, y deja el plan igual. La versión para usuarios ya existe ("Reabrir entreno", sin borrar nada), así que antes de publicar lo esperado es **quitarlo**: borrar los tres archivos, su uso en `TodayScreen.tsx`, las claves en `es` y `en` y este punto.
- **Ver la introducción otra vez** (enlace en `WelcomeScreen.tsx`, clave `account.welcome.devIntro`). Revisar si se queda solo en desarrollo.

## Para revisar

- **Ruta `/playground`** (`src/app/playground/`, registrada en `src/app/_layout.tsx`). Viene del template, no tiene enlace en la app pero se puede abrir con un enlace directo en producción. Decidir si se protege con `__DEV__` o se quita.
