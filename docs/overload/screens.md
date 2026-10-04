# Pantallas y navegación

Mockups de referencia: canvas "Overload — Mockups". Al construir una pantalla, adjunta a Claude Code una captura del mockup correspondiente.

Las rutas de `src/app/` son delgadas, como pide el template: envuelven la pantalla en `AppLayout` (o `ModalLayout` para modales), leen parámetros y renderizan un componente de pantalla exportado por el feature (por ejemplo `TodayScreen` desde `@/features/workout`). La lógica vive en hooks del feature.

| Pantalla | Ruta | Feature y componente | Layout | Fase | Notas |
| --- | --- | --- | --- | --- | --- |
| Hoy | `src/app/(tabs)/index.tsx` | workout → `TodayScreen` | AppLayout | 3 | WeekStrip, tarjeta del entreno del día, sugerencia, lista de ejercicios |
| Sesión en vivo | `src/app/session/[id].tsx` | workout → `SessionScreen` | AppLayout | 3 | Progreso de la sesión, ExerciseCard con SetRows, siguiente ejercicio, RestTimer |
| Rutina semanal | `src/app/(tabs)/routines.tsx` | plan → `WeeklyPlanScreen` | AppLayout | 2 | Días del plan con estado de la semana |
| Editar plan semanal | `src/app/plan/edit.tsx` | plan → `PlanEditorScreen` | AppLayout | 2 | Nombre, "Repetir cada semana", días, importar notas |
| Editar día | `src/app/plan/day/[id].tsx` | plan → `DayEditorScreen` | AppLayout | 2 | Valores por defecto (4 × 12, 1:30), lista reordenable, + Ejercicio |
| Configurar ejercicio | `src/app/exercise/configure.tsx` | plan → `ExerciseConfigSheet` | ModalLayout | 2 | Tipo de carga, unidad, peso, series, reps, descanso, regla de subir peso |
| Biblioteca | `src/app/library.tsx` | catalog → `LibraryScreen` | AppLayout | 2 | Búsqueda es/en, filtros de músculo y equipo, "En tu plan" primero |
| Importar desde notas | `src/app/import.tsx` | notes-import → `ImportScreen` | AppLayout | 4 | Pegar, revisar detectados, confirmar dudosos |
| Progreso | `src/app/(tabs)/progress.tsx` | progress → `ProgressScreen` | AppLayout | 5 | 1RM, volumen, sesiones, récords, medidas |
| Historial de ejercicio | `src/app/exercise/[id].tsx` | progress → `ExerciseHistoryScreen` | AppLayout | 5 | 1RM, mejor serie, gráfica, sesiones |
| Mapa muscular y constancia | `src/app/progress/muscles.tsx` | muscles → `MuscleVolumeScreen` | AppLayout | 6 | Series por músculo (1 y 0.5), calendario de 12 semanas |
| Recuperación muscular | `src/app/recovery.tsx` | muscles → `RecoveryScreen` | AppLayout | 6 | BodyMap en modo recuperación + lista por estado |
| Músculos por ejercicio | `src/app/muscles.tsx` | muscles → `ExerciseMusclesScreen` | AppLayout | 6 | Chips de ejercicios, BodyMap en modo ejercicio, fuente visible |
| Perfil y ajustes | `src/app/(tabs)/settings.tsx` | settings → `SettingsScreen` | AppLayout | 2 | Idioma, unidad, saltos de peso, interruptores, recordatorios, exportar |

## Navegación

- `src/app/(tabs)/_layout.tsx` define cuatro tabs con `TabBar`: Hoy, Rutinas, Progreso, Perfil (la ruta es `settings`; la etiqueta sale de `tabs.profile`).
- `src/app/_layout.tsx` (template) carga i18n, fuentes y la base de datos (migraciones) antes de ocultar el splash, y registra el `Stack` con `(tabs)` y las rutas de arriba.
- `src/app/playground/` se conserva solo en desarrollo (`__DEV__`) y suma la sección de Overload. Reemplaza al `/dev/components` del kit anterior.
- `src/app/explore.tsx` y la pantalla de inicio del template se eliminan en la Fase 0.
- Los componentes de pantalla no pasan de 150 líneas: divide en secciones dentro de `components/` del feature.
