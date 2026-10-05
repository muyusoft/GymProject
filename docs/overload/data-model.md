# Modelo de datos

SQLite con expo-sqlite y Drizzle en `src/shared/db/`: `client.ts` (abre la base y aplica migraciones), `schema/` (un archivo por grupo de tablas para respetar el límite de 200 líneas), `migrations/` (generadas con drizzle-kit) y `seed.ts`. El acceso a datos de cada feature va en su carpeta `services/` (por ejemplo `features/workout/services/session.service.ts`); los componentes nunca consultan la base directamente. Las consultas que usan dos o más features (ejercicios, músculos por ejercicio, ajustes) van en `src/shared/db/queries/`, porque un feature no puede importar de otro. Todas las tablas usan `id` UUID y `updatedAt` (para sincronizar con un backend después del MVP). Los pesos se guardan en la unidad registrada.

| Tabla | Columnas | Para qué |
| --- | --- | --- |
| exercises | id, sourceId (id de free-exercise-db), nameEs, nameEn, instructionsEs, instructionsEn, pattern, equipment, defaultLoadType, aliases (JSON), evidenceLevel, status (`claude_draft` \| `sourced` \| `reviewed`), reviewedBy, reviewedAt, updatedAt | Catálogo |
| exercise_muscles | id, exerciseId, muscleGroup, view (`front` \| `back` \| `both`), role (`primary` \| `secondary`), basis (`measured` \| `described`), sourceIds (JSON) | Qué grupos de la figura se pintan |
| sources | id, citation, url, year, strength (`strong` \| `medium` \| `weak`) | Fuentes que la app puede mostrar |
| plans | id, name, repeatsWeekly, updatedAt | Plan semanal |
| plan_days | id, planId, weekday (0 = lunes … 6 = domingo), name, order, defaultSets, defaultReps, defaultRestSec | Días del plan |
| plan_exercises | id, planDayId, exerciseId, order, sets, reps, seconds, restSec, targetWeight, unit (`lb` \| `kg`), loadType, progressionRule (JSON) | Plantilla de cada ejercicio en un día |
| sessions | id, planDayId, date, startedAt, endedAt, origin (`app` \| `import`) | Entreno realizado |
| set_logs | id, sessionId, exerciseId, setIndex, weight, unit, loadType, reps, seconds, rpe, completed, isPR | Cada serie |
| exercise_swaps | id, date (yyyy-MM-dd), planExerciseId, exerciseId, targetWeight, unit, loadType; única por (date, planExerciseId) | Sustitución de un ejercicio del plan solo para esa fecha |
| equipment_increments | id, equipment, unit, step | Saltos de peso del gym |
| body_weights | id, date (yyyy-MM-dd, única), weight, unit (`lb` \| `kg`) | Peso corporal: un registro por día; guardar otra vez el mismo día lo corrige |
| settings | key, value | Idioma, unidad preferida, sugerencias, RPE, deload, recordatorio, estatura (`heightCm`) y frecuencia de pesaje (`weighInFrequency`: `daily` \| `weekly`) |

## Valores permitidos

- `loadType`: `per_arm`, `total`, `plates`, `bodyweight`, `time`.
- `muscleGroup` (slugs de react-native-body-highlighter): `chest`, `deltoids`, `triceps`, `biceps`, `forearm`, `upper-back`, `trapezius`, `lower-back`, `abs`, `obliques`, `gluteal`, `quadriceps`, `hamstring`, `adductors`, `calves`.
- `pattern`: ver `src/features/catalog/data/muscle-map.json`.

## Reglas

- Un mismo ejercicio en dos días distintos comparte `exerciseId`, así su historial es uno solo.
- Borrar un ejercicio del plan no borra su historial.
- `seed.ts` corre una sola vez (marca en `settings`) y carga los ejercicios (free-exercise-db + `src/features/catalog/data/common-exercises.json`), genera `exercise_muscles` desde `muscle-map.json`, carga las fuentes y `equipment_increments` por defecto (mancuernas 2.5 lb, máquinas 5 lb y 2.5 kg, discos 2.5 kg); el usuario los ajusta en Ajustes.
- `settings` reemplaza a `persistedStore` del template (que hoy no guarda): idioma, unidad y tema se leen de aquí al arrancar.
