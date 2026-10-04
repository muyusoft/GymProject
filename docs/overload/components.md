# Componentes

Todos toman colores de `useOverloadTheme()`, tipografía de `getTextStyle()`, medidas de `tokens.*` (ver `design-system.md`), iconos de `@/shared/icons` y textos de i18n. Respetan los límites del template: 150 líneas por componente, 7 props como máximo (agrupa en un objeto si hace falta), sin lógica de negocio dentro.

Cada componente compartido tiene su sección en el playground (`src/shared/playground/sections/OverloadSection.tsx`, o una sección por grupo si pasa de 200 líneas) con todos sus estados. Los componentes de feature se muestran ahí solo si no necesitan datos de la base.

## Dónde vive cada uno

| Componente | Ubicación | Por qué ahí |
| --- | --- | --- |
| Button, Stepper, Chip, Toggle, SegmentedControl, ListRow | `src/shared/components/` | Los usan dos o más features |
| BodyMap | `src/shared/components/BodyMap.tsx` | Lo usan `muscles` y `catalog` |
| TabBar | `src/shared/components/TabBar.tsx` | La usa el layout de `(tabs)` |
| SetRow, ExerciseCard, RestTimer, WeekStrip, ProgressionHint | `src/features/workout/components/` | Solo sesión y Hoy. Si `plan` necesita ProgressionHint, se sube a shared |
| StatTile | `src/features/progress/components/` | Solo Progreso |

Cada carpeta `components/` tiene su `index.ts` y el feature exporta lo público desde su `index.ts` raíz. Ningún feature importa de otro feature: lo compartido sube a `src/shared/`.

## Contratos

| Componente | Props principales | Estados | Pantalla del mockup |
| --- | --- | --- | --- |
| Button | `variant: 'primary' \| 'secondary' \| 'ghost' \| 'danger'`, `label`, `icon?: IconName`, `block?`, `loading?`, `onPress` | normal, presionado, deshabilitado, cargando | Todas |
| SetRow | `set: { index; weight; unit; reps?; seconds? }`, `status: 'pending' \| 'active' \| 'done'`, `isPR`, `onToggle`, `onEdit` | pendiente, activa, completada, PR | Sesión en vivo |
| ExerciseCard | `exercise`, `lastLog`, `sets[]`, `badge?`, `onSetToggle`, `onSetEdit` | en curso, completo, con PR | Sesión en vivo |
| StatTile | `label`, `value`, `unit`, `delta`, `trend[]` | sube, igual, baja (gris, nunca rojo) | Progreso |
| ProgressionHint | `kind: 'increase' \| 'deload'`, `message`, `value`, `onDismiss` | subir peso (accent), deload (info) | Hoy, Sesión, Rutina semanal |
| WeekStrip | `days[]` con `date`, `status: 'done' \| 'planned' \| 'rest'`, `isToday` | hoy, hecho, planificado, descanso | Hoy |
| RestTimer | `endsAt: number`, `onAdd(delta)`, `onSkip` | corriendo, terminado (vibra) | Sesión en vivo |
| TabBar | props de `Tabs` de expo-router | activo (icono accentText, texto text), inactivo | Tabs |
| Stepper | `value`, `step`, `min`, `max`, `unit`, `onChange` | normal, en el límite | Configurar ejercicio |
| SegmentedControl | `options[]`, `value`, `onChange` | seleccionado | Ajustes, Progreso |
| Chip | `label`, `selected`, `onPress` | seleccionado (accent), no seleccionado | Biblioteca, Configurar ejercicio |
| Toggle | `value`, `onChange`, `label`, `description?` | activado, desactivado | Ajustes, Editar plan |
| BodyMap | `mode: 'recovery' \| 'exercise'`, `groups: Record<MuscleGroup, { color: string; view?: 'front' \| 'back' \| 'both' }>`, `gender` | frente y espalda | Recuperación, Músculos por ejercicio |
| ListRow | `title`, `subtitle?`, `trailing?`, `onPress?`, `dragHandle?` | normal, arrastrando | Editar día, Biblioteca, Historial |

## Detalles que importan

- **SetRow:** el check mide 44 × 44 (`tokens.dimensions.setCheck`) dentro de un área táctil de 48. Tocar el check completa la serie, vibra (expo-haptics) y arranca el RestTimer. Tocar peso o reps abre un Stepper (± salto del equipo, ± 1 rep), nunca el teclado. En PR el número de serie se pinta en `reward`.
- **RestTimer:** flota sobre la sesión, anillo de progreso en `info`, botones −15 y +15. Recibe la hora de fin, no un contador, para que siga bien con la pantalla bloqueada.
- **ProgressionHint:** siempre descartable; dice el porqué y el qué ("Llevas 2 sesiones con 80 kg × 8. Prueba 82.5 kg").
- **BodyMap:** envuelve react-native-body-highlighter (MIT; conserva el aviso de licencia). El deltoides se pinta por vista: anterior solo en frente, posterior solo en espalda. Debajo siempre hay una lista con el estado en texto.
- **Iconos:** el kit trae su propio set de 51 iconos en `src/shared/icons/` (grilla de 24, trazo 2, `currentColor`) y reemplaza a los del template. Úsalos solo con `IconRenderer` y un `IconName`. Si falta uno, dibújalo con el mismo encabezado SVG y regístralo en `index.ts` (import, `AVAILABLE_ICONS` e `ICON_REGISTRY`). No instales librerías de iconos.
- **Accesibilidad:** `accessibilityLabel` en botones con solo icono; `accessibilityState` en Toggle, Chip y SetRow.
