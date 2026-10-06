@AGENTS.md

# Overload

App de gimnasio personal de Muyusoft, construida sobre muyusoft-template. Reemplaza la nota diaria del gym: arma la sesión del día desde un plan semanal, registra cada serie con un toque, sugiere cuándo subir peso y muestra qué músculos se trabajaron y cuánto llevan recuperándose. Las reglas de AGENTS.md aplican siempre; lo de abajo solo agrega lo propio de este proyecto.

## Lo que cambia respecto al template

- **Offline primero.** La app lee y escribe solo en SQLite (expo-sqlite + drizzle-orm) en `src/shared/db/`; ninguna pantalla espera a la red. Supabase es la copia en la nube por usuario: cuentas y una sincronización en segundo plano (`src/shared/services/sync/`) que sube y baja cambios sin bloquear la pantalla. No uses `http-client`, los servicios de auth del template ni `persistedStore` para datos de Overload.
- **Postgres se cambia solo con migraciones.** Todo ajuste de Supabase (tablas, políticas, triggers, funciones) es un archivo SQL nuevo en `supabase/migrations/`, versionado en git. Nunca se cambia desde el panel web ni se edita una migración ya aplicada.
- **Design system propio.** `src/design/tokens.*` contiene Overload, no Minga. Tema oscuro por defecto.
- **Figura muscular** con react-native-body-highlighter, envuelta en `src/shared/components/BodyMap.tsx`.
- **Idioma inicial** desde expo-localization; el usuario puede cambiarlo en Ajustes.

## Features

| Feature        | Qué contiene                                                                                     | Rutas                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `workout`      | Hoy, sesión en vivo, cronómetro, regla de subir peso                                             | `src/app/(tabs)/index.tsx`, `src/app/session/[id].tsx`                             |
| `plan`         | Plan semanal, editar día, configurar ejercicio                                                   | `src/app/(tabs)/routines.tsx`, `src/app/plan/**`, `src/app/exercise/configure.tsx` |
| `catalog`      | Catálogo, biblioteca, ficha del ejercicio (fotos, pasos, músculos), semillas y mapeo de músculos | `src/app/library.tsx`, `src/app/exercise/info/[id].tsx`                            |
| `notes-import` | Parser de notas e importación                                                                    | `src/app/import.tsx`                                                               |
| `progress`     | Historial, 1RM, récords, volumen                                                                 | `src/app/(tabs)/progress.tsx`, `src/app/exercise/[id].tsx`                         |
| `muscles`      | Recuperación, músculos por ejercicio, series por músculo                                         | `src/app/recovery.tsx`, `src/app/muscles.tsx`, `src/app/progress/muscles.tsx`      |
| `body`         | Peso corporal, media de 7 días, cambio semanal, IMC                                              | `src/app/body.tsx`                                                                 |
| `settings`     | Idioma, unidad, saltos de peso, interruptores                                                    | `src/app/(tabs)/settings.tsx`                                                      |
| `onboarding`   | Introducción de primera apertura (cinco tarjetas)                                                | `src/app/intro.tsx`                                                                |
| `account`      | Bienvenida y cuenta con Supabase Auth (correo y contraseña)                                      | `src/app/welcome.tsx`, `src/app/account/**`                                        |

## Documentación del proyecto (léela según la tarea, no toda a la vez)

- `docs/overload/design-system.md` — antes de tocar estilos.
- `docs/overload/components.md` — antes de crear o cambiar un componente.
- `docs/overload/screens.md` — antes de construir una pantalla (pide la captura del mockup).
- `docs/overload/data-model.md` — antes de tocar la base de datos.
- `docs/overload/backend-and-database.md` — cómo se guardan y leen los datos, migraciones de SQLite y de Supabase, seed, transacciones, respaldo y preparación para sincronizar.
- `docs/overload/domain-rules.md` — antes de tocar unidades, progresión, recuperación, series o el parser.
- `docs/overload/muscle-map.md` — antes de tocar músculos, la figura o el catálogo.
- `docs/overload/phases.md` — el plan por fases y sus criterios de aceptación.

## Reglas propias de Overload

1. Los pesos se guardan en la unidad registrada (lb o kg) y se convierten solo al mostrar o comparar (1 lb = 0.45359237 kg), con `@/shared/utils/weight.utils`.
2. Los músculos que se pintan salen de `exercise_muscles`, generada desde `src/features/catalog/data/muscle-map.json`. Nunca agregues músculos sin fuente: si un patrón no tiene dato, no se pinta.
3. Ningún estado se comunica solo por color; siempre con texto o icono.
4. Controles principales de 48 de alto (`tokens.dimensions.minTouch`); registrar una serie no debe requerir el teclado.
5. Ember (`semantic.reward`) solo para récords y rachas; volt (`semantic.accent`) solo para acción primaria, serie hecha y sugerencia de subir peso.
