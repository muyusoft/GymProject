# Fases

Cómo trabajar cada fase con Claude Code:

1. Rama nueva con el formato del template (`feat/<descripcion>`), creada por ti.
2. Pega el prompt de la fase. Claude Code escribe el código y **propone** los comandos (instalar, `npx tsc --noEmit`, `npx vitest run`, `npm run lint`) y el mensaje de commit (Conventional Commits); no los ejecuta. Tú los corres y le pegas la salida si algo falla.
3. Revisa los criterios de aceptación en el dispositivo antes de hacer commit.

`npm test` abre Vitest en modo watch; para una corrida única usa `npx vitest run`.

## Fase 0 — Preparar el template

**Prompt:** "Lee CLAUDE.md, AGENTS.md y SETUP.md. Haz los cambios de código de la Fase 0: elimina la pantalla de inicio y `explore.tsx` del template, crea `src/app/(tabs)/_layout.tsx` con cuatro tabs vacías (Hoy, Rutinas, Progreso, Perfil) usando i18n, haz que `AppLayout` use `semantic.background`, toma el idioma inicial de expo-localization en `src/config/i18n.ts` (es o en, respaldo en), y carga Barlow y Barlow Condensed en `src/app/_layout.tsx`. Propón los comandos de instalación y verificación."

**Acepta si:** la app abre en oscuro con cuatro tabs traducidas; con el teléfono en español los textos salen en español; `npx tsc --noEmit` y `npx vitest run` pasan; el playground sigue abriendo.

## Fase 1 — Design system y componentes compartidos

**Prompt:** "Lee docs/overload/design-system.md y components.md. Crea `useOverloadTheme()` y los componentes compartidos (Button, Stepper, Chip, Toggle, SegmentedControl, ListRow, TabBar). Verifica que la galería de iconos del playground muestre los 51 iconos de Overload. Agrega una sección Overload al playground con todos los estados de los componentes y una prueba por componente con lógica. Respeta los límites de AGENTS.md."

**Acepta si:** el playground muestra cada componente en todos sus estados en oscuro y claro; ningún archivo tiene colores o tamaños literales; los botones con solo icono tienen `accessibilityLabel`.

## Fase 2 — Base de datos, catálogo y plan

**Prompt:** "Lee docs/overload/data-model.md y muscle-map.md. Crea `src/shared/db` (cliente, esquema, migraciones, seed) y las consultas compartidas. El seed carga free-exercise-db más `common-exercises.json` y genera `exercise_muscles` solo desde `muscle-map.json`. Luego construye los features `catalog`, `plan` y `settings` con sus pantallas (screens.md, Fase 2). Te adjunto capturas de Rutina semanal, Editar plan, Editar día, Configurar ejercicio, Biblioteca y Perfil."

**Acepta si:** puedes crear tu plan de 5 días a mano; la Biblioteca busca en español e inglés; cambiar idioma, unidad y tema en Ajustes persiste al cerrar la app; ningún ejercicio tiene músculos que no salgan de `muscle-map.json`.

## Fase 3 — Hoy y sesión en vivo

**Prompt:** "Lee docs/overload/components.md (SetRow, ExerciseCard, RestTimer, WeekStrip, ProgressionHint) y domain-rules.md (unidades, subir peso, deload, duración). Escribe primero las utils con sus pruebas y luego el feature `workout` con Hoy y Sesión en vivo. Te adjunto capturas de Hoy y Sesión."

**Acepta si:** registras una sesión completa con una mano y sin teclado; el cronómetro sigue bien tras bloquear la pantalla; al completar 2 sesiones con todas las reps aparece la sugerencia de subir peso con el salto del equipo.

## Fase 4 — Importar desde notas

**Prompt:** "Lee la sección del parser en docs/overload/domain-rules.md. Escribe el parser dividido en las utils indicadas, con la prueba sobre `notes-week-2026-09-28.txt` primero (debe detectar los 39 ejercicios con peso, unidad, tipo de carga, series, reps o tiempo y descanso). Luego la pantalla Importar desde notas. Te adjunto la captura."

**Acepta si:** pegar tus notas de la semana crea el plan con 39 ejercicios; los nombres dudosos se piden confirmar; ninguna línea se pierde sin aviso.

## Fase 5 — Progreso

**Prompt:** "Lee docs/overload/domain-rules.md (1RM y récords). Escribe las utils con pruebas y el feature `progress` con Progreso e Historial de ejercicio. Te adjunto las capturas."

**Acepta si:** el 1RM estimado coincide con Epley a mano; un récord se marca en ember en la sesión y aparece en Progreso; las bajadas se muestran en gris.

## Fase 6 — Músculos y recuperación

**Prompt:** "Lee docs/overload/muscle-map.md y domain-rules.md (series por músculo y recuperación). Crea `BodyMap` en shared, las utils con pruebas y el feature `muscles` con Recuperación, Músculos por ejercicio y Mapa muscular. Te adjunto las capturas."

**Acepta si:** cada estado tiene texto además de color; el deltoides se pinta por vista; cada ejercicio muestra su fuente; un ejercicio sin dato no pinta nada.

## Fase 7 — Pulido, respaldo y uso real

**Prompt:** "Revisa accesibilidad (etiquetas, contraste en claro, tamaño de fuente del sistema), estados vacíos con el motivo de discos, exportar e importar los datos a JSON desde Ajustes y recordatorios con expo-notifications. Propón las pruebas que falten."

**Acepta si:** la app funciona con letra grande del sistema; exportar y volver a importar deja los mismos datos; no hay textos sin traducir (`npx vitest run` incluye una prueba que compara las claves de es y en). Después usas la app 2 semanas sin notas, anotas lo que molesta y lo conviertes en tareas para Claude Code; solo entonces se abre la fase 2 del roadmap.
