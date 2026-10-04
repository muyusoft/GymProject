# Reglas de dominio

Funciones puras, sin React ni base de datos, en la carpeta `utils/` del feature que las usa, con pruebas Vitest en `__tests__/` del mismo feature. Si dos features necesitan la misma, sube a `src/shared/utils/`. Máximo 20 líneas por función y 3 parámetros (usa un objeto si hacen falta más). "Regla de producto" = decisión nuestra, ajustable con el uso real.

## Unidades (`src/shared/utils/weight.utils.ts`)

- 1 lb = 0.45359237 kg. Convertir solo al mostrar o comparar.
- Las sugerencias de peso se redondean al salto disponible del equipo (`equipment_increments`).
- Mostrar con un decimal como máximo y el separador del idioma (82,5 kg en español; 82.5 kg en inglés).

## Subir peso (`features/workout/utils/progression.utils.ts`) — regla de producto

- Si en las 2 últimas sesiones de ese ejercicio se completaron todas las series con las reps objetivo, sugerir: peso actual + salto mínimo del equipo, en la misma unidad.
- Si el usuario registra RPE (opcional), no sugerir subir si el RPE medio de la última sesión fue 9 o más.
- La sugerencia es descartable y nunca cambia el plan sin confirmación.

## Deload (`features/workout/utils/deload.utils.ts`) — regla de producto

Si un ejercicio no mejora peso ni reps durante 3 semanas, sugerir una semana al 60% del peso.

## 1RM y récords (`features/progress/utils/one-rep-max.utils.ts`)

- 1RM estimado con la fórmula de Epley: peso × (1 + reps / 30), con la mejor serie de la sesión.
- Récord = nueva mejor marca de 1RM estimado, o más peso con las mismas reps. Solo cuenta con series completadas.

## Series por músculo (`features/muscles/utils/volume.utils.ts`)

Por semana, cada serie completada suma 1 a cada grupo principal del ejercicio y 0.5 a cada secundario (método fraccional de Pelland et al., el que mejor predijo resultados).

## Recuperación (`features/muscles/utils/recovery.utils.ts`) — inspirada en evidencia, calibrar con uso real

- Horas requeridas por grupo tras una sesión: 48 si fue principal, 24 si fue secundario; +24 si alguna serie tuvo RPE 9 o más (Morán-Navarro et al. 2017: al fallo la recuperación tardó unas 48 h; sin fallo, unas 6 h).
- Porcentaje = horas transcurridas / horas requeridas, tope 100%. Si el grupo se trabajó en varias sesiones, cuenta la más exigente pendiente.
- Estado: menos de 50% = recién trabajado; 50 a 99% = recuperando; 100% = listo.
- Siempre mostrar el estado en texto junto al color.

## Duración estimada (`features/workout/utils/duration.utils.ts`)

Suma de series × (40 s por serie + descanso). Regla de producto.

## Parser de notas (`features/notes-import/utils/`)

Dividido para respetar los límites: `day-header.utils.ts` (encabezados), `line.utils.ts` (una línea → partes), `load-type.utils.ts` (modificadores), `duration.utils.ts` ("1m30s" → segundos), `normalize.utils.ts` (erratas y limpieza), `match.utils.ts` (nombre → ejercicio) y `parse-notes.utils.ts` (orquesta). Casos de prueba: `src/features/notes-import/__tests__/fixtures/notes-week-2026-09-28.txt` (39 ejercicios en 5 días); la prueba principal verifica los 39.

- Encabezado de día: día de la semana + fecha ("Lunes 28 septiembre", "Jueves 01 octubre").
- Línea: `- nombre: [modificador] peso unidad [modificador] N series de M[, ] descansos [de] XmYs`.
- Peso: número con punto decimal y unidad `lb` o `kg`, pegada o con espacio ("30lb", "50 kg").
- Modificadores de carga: "en cada brazo", "para cada brazo", "por brazo" → `per_arm`; "total" → `total`; "en discos", "total en discos" → `plates`; "barra de" → `total`.
- Por tiempo: "3 series de 1m30s con descansos de 2m" → `time`, seconds = 90, restSec = 120.
- Sin peso: "4 series de 20" → `bodyweight`.
- Tolerar: "presa" (press), "peck" (pec), "el polea" (en polea), comas sueltas, dobles espacios, mayúsculas y texto entre paréntesis (se guarda como nota).
- Nombre → ejercicio: alias exacto, luego similitud; si la confianza es baja, marcar para confirmar (ej. "Copa con mancuerna" → ¿extensión de tríceps sobre la cabeza?; "Press inclinado: total 120kg en discos" en día de pierna → ¿prensa inclinada?).
