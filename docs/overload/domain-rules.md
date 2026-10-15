# Reglas de dominio

Funciones puras, sin React ni base de datos, en la carpeta `utils/` del feature que las usa, con pruebas Vitest en `__tests__/` del mismo feature. Si dos features necesitan la misma, sube a `src/shared/utils/`. Máximo 20 líneas por función y 3 parámetros (usa un objeto si hacen falta más). "Regla de producto" = decisión nuestra, ajustable con el uso real.

## Unidades (`src/shared/utils/weight.utils.ts`)

- 1 lb = 0.45359237 kg. Convertir solo al mostrar o comparar.
- Las sugerencias de peso se redondean al salto disponible del equipo (`equipment_increments`).
- Mostrar con un decimal como máximo y el separador del idioma (82,5 kg en español; 82.5 kg en inglés).

## Subir peso (`features/workout/utils/progression.utils.ts`) — regla de producto

- Una sesión está completa si se hicieron todas las series planeadas con las reps objetivo. La sugerencia es siempre: peso actual + salto mínimo del equipo, en la misma unidad.
- **Pregunta de esfuerzo** (`src/shared/utils/effort.utils.ts`, ajuste `trackRpe`, activado por defecto): al terminar todas las series de un ejercicio con repeticiones, la sesión pregunta cuántas quedaban en reserva. Es opcional, de un toque y se guarda como RPE en las series del ejercicio: "me sobraron 3 o más" = 7, "me sobraron 1 o 2" = 8.5, "llegué al límite" = 10.
- Con respuesta en la última sesión: al límite (RPE medio 9 o más) no se sugiere subir; con repeticiones en reserva basta esa sola sesión completa.
- Sin respuesta, o con la pregunta apagada: hacen falta las 2 últimas sesiones completas al mismo peso.
- El interruptor "Sugerirme subir peso" de cada ejercicio (en `progressionRule`) apaga la sugerencia solo para ese ejercicio; el de Ajustes la apaga para todos.

## Rango de repeticiones (`features/workout/utils/rep-goal.utils.ts`) — regla de producto

- Cada ejercicio con repeticiones puede tener un rango (por ejemplo 8–12): `reps` es el tope y `progressionRule.repsMin` el mínimo. Sin `repsMin`, o si no queda por debajo de `reps`, el objetivo es fijo.
- Una sesión solo cuenta como completa para subir peso si todas las series llegan al tope.
- Con rango, las series de una sesión nueva arrancan con la meta de hoy: al subir de peso, el mínimo; al mismo peso que la última vez, una repetición más que su peor serie (entre el mínimo y el tope). Sin historial o con menos peso, el tope.
- El rango se muestra como `4 × 8–12` en el plan, en Hoy y en la sesión.
- La sugerencia es descartable y nunca cambia el plan sin confirmación.

## Peso con el que arranca una sesión (`features/workout/utils/last-performance.utils.ts`) — regla de producto

- Con historial del ejercicio, la sesión arranca con el peso más alto de la última sesión terminada, no con el del plan. El peso del plan solo es el punto de partida la primera vez.
- Una sugerencia de subir peso o de descarga no se aplica sola: el aviso del ejercicio en la sesión ofrece aceptarla ("Subir a 82.5 kg") o dejarla ("Ahora no"). Al aceptar cambia el peso de las series pendientes de ese ejercicio (con rango de reps, también las baja al mínimo); las ya hechas no se tocan. Si no se acepta, vuelve a ofrecerse la próxima sesión mientras se cumpla la regla. En Hoy el aviso solo informa.
- La sesión retoma también la unidad de la última vez (lb o kg), aunque el plan diga otra. No aplica a ejercicios sin peso.
- **Cambiar de unidad en la sesión:** el editor de una serie tiene un selector lb / kg que convierte todas las series pendientes del ejercicio y acerca el peso al salto del equipo en la nueva unidad. Las series ya hechas no cambian. Una sesión con series en las dos unidades no cuenta para sugerir subir peso.
- Hoy, la sesión y los avisos muestran ese mismo peso. La tarjeta del ejercicio en la sesión muestra "Último: peso × reps" (reps de la peor serie con ese peso).
- Cambiar el peso en el plan no afecta a un ejercicio que ya tiene historial: se cambia en la sesión.

## Peso y reps del plan desde el entreno (`features/plan/utils/last-weight.utils.ts`, `features/workout/utils/plan-reps.utils.ts`) — regla de producto

- Peso: el plan muestra el último peso real del ejercicio (su última sesión terminada, en cualquier día). El peso guardado en el plan solo es el punto de partida sin historial; no se reescribe.
- Reps: al terminar un ejercicio con todas las series a las mismas reps y distintas a las del plan, se pregunta si actualizar el plan: solo este día, todos los días con ese ejercicio, o no. No se pregunta con rango de reps, con un sustituto ni en ejercicios por tiempo.

## Deload (`features/workout/utils/deload.utils.ts`) — regla de producto

Si un ejercicio no mejora peso ni reps durante 3 semanas, sugerir una semana al 60% del peso.

## 1RM y récords (`features/progress/utils/one-rep-max.utils.ts`)

- 1RM estimado con la fórmula de Epley: peso × (1 + reps / 30), con la mejor serie de la sesión.
- Récord = nueva mejor marca de 1RM estimado, o más peso con las mismas reps. Solo cuenta con series completadas.

## Series por músculo (`features/muscles/utils/volume.utils.ts`)

Por semana, cada serie completada suma 1 a cada grupo principal del ejercicio y 0.5 a cada secundario (método fraccional de Pelland et al., el que mejor predijo resultados).

## Constancia (`features/muscles/utils/consistency.utils.ts`) — regla de producto

- Calendario de un mes, de lunes a domingo, con flechas para ir a meses anteriores hasta el de la primera sesión; no avanza más allá del mes actual.
- Cada día está hecho (hay una sesión terminada), pendiente (planeado esta semana, de hoy en adelante y aún sin hacer) o sin entreno. Dos sesiones el mismo día cuentan una vez.
- Hecho va relleno, pendiente con borde punteado y hoy con borde sólido; cada estado se anuncia también con texto. Tocar un día hecho abre su resumen.
- Racha: entrenos planeados seguidos sin saltarse ninguno; los descansos y el entreno de hoy aún sin hacer no la cortan.

## Recuperación (`features/muscles/utils/recovery.utils.ts`) — inspirada en evidencia, calibrar con uso real

- Horas requeridas por grupo tras una sesión: 48 si fue principal, 24 si fue secundario; +24 si alguna serie tuvo RPE 9 o más (Morán-Navarro et al. 2017: al fallo la recuperación tardó unas 48 h; sin fallo, unas 6 h).
- Porcentaje = horas transcurridas / horas requeridas, tope 100%. Si el grupo se trabajó en varias sesiones, cuenta la más exigente pendiente.
- Estado: menos de 50% = recién trabajado; 50 a 99% = recuperando; 100% = listo.
- Siempre mostrar el estado en texto junto al color.

## Peso corporal e IMC (`features/body/utils/`) — regla de producto

- El peso se guarda en la unidad registrada, uno por día. Se muestra en la unidad de Ajustes; con "según ejercicio", en la del último registro (kg si no hay).
- Media de 7 días: promedio de los registros de hoy y los 6 días anteriores. Las semanas anteriores son tramos de 7 días hacia atrás. Si la semana actual no tiene registros, se muestra la última que sí.
- Cambio semanal: (media de la semana más nueva − media de la más vieja) / semanas entre ellas, mirando las últimas 4 semanas. Hace falta tener registros en dos semanas distintas. Menos de 0.05 por semana se muestra como estable. Subir o bajar no es bueno ni malo: va en gris, con icono y texto.
- La persona elige pesarse a diario o cada semana. A diario: con menos de 3 registros en 7 días la media "aún no es fiable"; tras más de 7 días sin registrar, la tendencia "ya no es fiable". Cada semana: toca pesarse desde el día 7 y deja de ser fiable tras el día 14.
- IMC = peso (kg) / estatura (m)², con la media de 7 días. Rangos de la OMS: menos de 18.5 bajo peso, 18.5 a 24.9 normal, 25 a 29.9 sobrepeso, 30 o más obesidad. Es un extra: siempre va con la nota de que no distingue músculo de grasa y nunca en color de alarma.
- Recordatorio de pesaje (opcional, apagado por defecto, 7:00): a diario avisa todos los días; cada semana, solo el día elegido. Se programa junto con los avisos de entreno en `shared/services/reminders.service.ts`.
- Registrar no requiere teclado: un paso de 1 y un paso fino de 0.1 kg o 0.2 lb, partiendo del último peso.

## Sustituir un ejercicio (`features/workout/utils/substitutes.utils.ts`, `swap.utils.ts`) — regla de producto

- Sugerencias: primero los ejercicios con el mismo patrón de movimiento (`pattern`), luego los que comparten algún músculo principal de `exercise_muscles` (más compartidos, antes). Dentro de cada grupo, antes los que ya se registraron alguna vez. Máximo 8, con filtro por equipo.
- Un ejercicio sin patrón ni músculos con fuente no se sugiere; se puede elegir igual buscándolo por nombre.
- Nunca se ofrece el original, un ejercicio que ya está en el entreno de hoy, ni uno por tiempo a cambio de uno de repeticiones (o al revés).
- "Solo hoy" guarda la sustitución en `exercise_swaps` para esa fecha y no toca el plan. "También en el plan" cambia `plan_exercises` para las siguientes semanas.
- El sustituto conserva series, reps y descanso del plan. Su peso inicial es el de su último registro; sin historial queda vacío (no se convierte el peso del ejercicio original).
- Con la sesión abierta: las series ya hechas del ejercicio anterior se quedan en su historial y las pendientes se reemplazan por series del sustituto (las que faltan del plan, al menos una).
- El historial, los récords y los músculos trabajados van al ejercicio que realmente se hizo.

## Día perdido (`shared/utils/week-schedule.utils.ts`, `features/workout/utils/missed-day.utils.ts`) — regla de producto

- Hoy ofrece solo el último día de entreno anterior, dentro de la misma semana (lunes a domingo), si no se hizo y no tiene decisión. Ya empezado el entreno de hoy, no se ofrece.
- Hacerlo hoy: ese día pasa a hoy y los siguientes se corren un día cada uno; el primer descanso absorbe el corrimiento. Si no hay descanso antes del domingo, el último día se pierde esa semana (se avisa antes de aceptar).
- Seguir con el plan: queda anotado y no se vuelve a preguntar por ese día.
- El plan nunca cambia: los corrimientos valen solo para su semana y se muestran como texto en Hoy y en el plan semanal. Los recordatorios siguen el plan, no el corrimiento.

## Ficha del ejercicio (`features/catalog/utils/exercise-info.utils.ts`)

- Se abre con el icono de información (`ExerciseInfoButton`, en shared) desde sustitutos, la sesión, Hoy y la biblioteca.
- Fotos: dos por ejercicio (posición inicial y final), desde free-exercise-db con el `sourceId`; se descargan una vez y quedan en caché (expo-image). Un ejercicio propio no tiene fotos; si no cargan, se avisa con texto.
- Pasos: en español se usa la traducción de `data/instructions-es.json` (por `sourceId`); están traducidos los 871 ejercicios que traen instrucciones; si faltara alguno, se muestra en inglés con el aviso "aún sin traducir". Una traducción debe tener los mismos pasos que el original (lo verifica una prueba).
- Músculos: solo los de `exercise_muscles`, en la figura y en texto.

## Semanas pasadas en Hoy (`features/workout/utils/week-history.utils.ts`) — regla de producto

- La franja de Hoy se desliza por semanas completas (lunes a domingo), desde la semana de la primera sesión terminada hasta la actual; no avanza al futuro.
- En semanas pasadas un día está "hecho" (hay una sesión terminada en esa fecha) o "sin entreno". No se dice "planificado" porque el plan pudo cambiar desde entonces.
- El calendario muestra un mes con un punto en los días con entreno. Elegir un día lleva la franja a su semana y, si tuvo entreno, abre su resumen. No se pueden elegir días futuros ni anteriores a la primera semana.
- La tarjeta del entreno y la lista de ejercicios siempre muestran hoy.

## Nombre sugerido del día (`features/plan/utils/day-name.utils.ts`) — regla de producto

- Cada ejercicio suma sus series a los focos de sus músculos principales (`exercise_muscles`): pecho, espalda, hombro, pierna, bíceps, tríceps, brazos, core. Un ejercicio sin músculos con fuente no aporta.
- El nombre lleva los focos con al menos 20% de las series del día, del mayor al menor ("Pecho y tríceps"). Bíceps y tríceps juntos se nombran "Brazos".
- Con más de tres focos, o tan repartido que ninguno llega al 20%, se sugiere "Cuerpo completo".
- Es solo una sugerencia en el editor del día: nunca cambia el nombre sin que la persona la toque, y no aparece si ya coincide con el nombre actual.

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

## Crear un plan para mí (`features/plan/utils/plan-generator/`) — regla de producto con fuentes

Fase 1: solo gimnasio completo. El plan generado es un plan normal: se puede editar entero después.

**Respuestas:** objetivo (`muscle` | `strength` | `fat_loss` | `fitness`), días (2–6), experiencia (`beginner` | `intermediate` | `advanced`), prioridad (`balanced` | `lower` | `upper`). No se pregunta el género: la respuesta al entrenamiento de fuerza es muy parecida entre hombres y mujeres; lo que cambia es la preferencia, y esa se pregunta directo (prioridad).

**Tipo de rutina por días** (cada músculo unas 2 veces por semana; schoenfeld2016freq):

| Días | Rutina | Días de la semana |
| --- | --- | --- |
| 2 | Cuerpo completo A · B | lun, jue |
| 3 | Cuerpo completo A · B · C | lun, mié, vie |
| 4 | Torso A · Pierna A · Torso B · Pierna B | lun, mar, jue, vie |
| 5 | Torso · Pierna · Empuje · Tirón · Pierna B | lun, mar, mié, vie, sáb |
| 6 | Empuje · Tirón · Pierna, dos veces | lun a sáb |

**Días hechos de patrones** (los de `muscle-map.json`), compuestos primero:

- Cuerpo completo A: squat, horizontal_push, horizontal_pull, hinge_rdl, lateral_raise, core
- Cuerpo completo B: hip_thrust, vertical_push, vertical_pull, lunge, elbow_flexion, elbow_extension
- Cuerpo completo C: squat (otra variante), horizontal_push (inclinado), horizontal_pull (otra variante), knee_flexion, rear_delt, core
- Torso A: horizontal_push, horizontal_pull, vertical_push, vertical_pull, elbow_flexion, elbow_extension
- Torso B: vertical_pull, horizontal_push (inclinado), horizontal_pull, lateral_raise, rear_delt, elbow_extension
- Pierna A: squat, hinge_rdl, knee_flexion, knee_extension, calf_standing, core
- Pierna B: hip_thrust, lunge, knee_extension, knee_flexion, calf_seated, core
- Empuje: horizontal_push, vertical_push, fly, lateral_raise, elbow_extension
- Tirón: vertical_pull, horizontal_pull, rear_delt, shrug, elbow_flexion

Cada patrón se llena con un ejercicio del catálogo que tenga músculos con fuente en `exercise_muscles`; si no hay ninguno, el lugar se omite (nunca se inventa). Empezando: variantes guiadas o en máquina (prensa, press en máquina, jalón); con experiencia: barra libre (sentadilla, press banca, remo con barra). Un patrón que se repite en la semana usa otra variante.

**Series y reps por objetivo** (acsm2009, schoenfeld2021loading):

| Objetivo | Compuestos | Aislamiento | Descanso |
| --- | --- | --- | --- |
| Ganar músculo | 8–12 | 10–15 | 2:00 compuestos · 1:30 aislamiento (schoenfeld2016rest) |
| Ganar fuerza | 4–6 (empezando: 6–8) | 8–12 | 3:00 · 1:30 |
| Perder grasa | 8–12 | 10–15 | 1:30 · 1:00 |
| Ponerme en forma | 10–15 | 12–15 | 1:30 · 1:00 |

Perder grasa entrena como ganar músculo: en déficit, el entrenamiento de fuerza sirve para conservar el músculo; el peso corporal lo decide sobre todo la alimentación (helms2014). Los rangos se guardan como rango de reps, así que la progresión doble funciona desde el primer día.

**Series por ejercicio según experiencia:** empezando 2–3, algo de experiencia 3, avanzado 3–4 (ponerme en forma: una serie menos). Meta semanal por músculo, contando principal = 1 y secundario = 0,5 como en el resto de la app (pelland2024): empezando ~10, algo de experiencia 10–16, avanzado 14–20 (schoenfeld2017). Si un músculo queda por encima del tope, se quita una serie a su ejercicio de aislamiento.

**Prioridad:** a los ejercicios de la zona elegida se les suma una serie, y los días de esa zona ganan un ejercicio extra (piernas: hip_abduction o hip_thrust; tren superior: fly o elevación lateral). El resto del cuerpo se queda en el mínimo de su rango, no se elimina.

**Equipo** (`shared/types/equipment.types.ts`): la persona marca lo que tiene; cada ejercicio común dice qué combinaciones le sirven (`requires`) y solo se eligen los que se pueden hacer. Entre los posibles, primero los de carga (tienen progresión de peso); el peso corporal solo si no queda otra o en el core. Si un patrón no tiene ningún ejercicio, se usa su sustituto de músculos parecidos (`pattern-fallback.ts`: sin jalón, otro remo; sin extensión de rodilla, zancada…) y la vista previa avisa qué patrones faltan. Sin ningún equipo el plan es de peso corporal y se avisa que todavía no hay sugerencias de progreso.

**Tiempo por sesión** (30, 45, 60 o 75 min; por defecto 45), con la estimación de la app (40 s por serie más el descanso): si un día queda corto se le agregan complementos de su tipo de día y después series a los compuestos (hasta 3 empezando, 4 con algo de experiencia, 5 avanzado); si se pasa, se recortan series de aislamiento, después aislamientos (sin bajar de 3 ejercicios) y al final series de compuestos. Llenar nunca pasa el tope semanal por músculo: si por eso un día queda más corto, la vista previa lo explica (para quien empieza: más series todavía no suman).

**Cambiar un ejercicio en la vista previa** (`plan-generator/swap.ts`): las alternativas son los ejercicios del mismo patrón (mismos músculos con fuente) que se pueden hacer con el equipo y no están ya en ese día; el cambio conserva las series ya ajustadas.

**Pesos:** en 0 (en la unidad de Ajustes) para los ejercicios con peso; la primera sesión los define y desde ahí aplica el último peso real, la sugerencia de subir y los récords.

Fuentes (verificadas el 2026-10-14; son del generador, no de `exercise_muscles`):

- schoenfeld2016freq — Schoenfeld, Ogborn y Krieger, *Sports Med* 2016;46(11):1689–97. Más frecuencia, más crecimiento, pero los estudios no igualaban el volumen; con volumen igual la frecuencia importa poco (Schoenfeld, Grgic y Krieger, *J Sports Sci* 2019). Por eso "unas 2 veces por semana" es una forma práctica de repartir el volumen, no un requisito. https://pubmed.ncbi.nlm.nih.gov/27102172/
- schoenfeld2017 — Schoenfeld, Ogborn y Krieger, *J Sports Sci* 2017;35(11):1073–82. Más series semanales, más crecimiento; el análisis solo sostiene la relación hasta ~10 series por músculo y casi todos los estudios eran con principiantes: los topes de 14–20 son una decisión de producto. https://doi.org/10.1080/02640414.2016.1210197
- schoenfeld2016rest — Schoenfeld et al., *J Strength Cond Res* 2016;30(7):1805–12. 3 min de descanso dieron más fuerza y músculo que 1 min en hombres entrenados (n = 21). https://doi.org/10.1519/JSC.0000000000001272
- schoenfeld2021loading — Schoenfeld, Grgic, Van Every y Plotkin, *Sports* 2021;9(2):32. El músculo crece en un rango amplio de cargas; los rangos por objetivo son convención útil, no un límite. https://doi.org/10.3390/sports9020032
- acsm2009 — ACSM, *Med Sci Sports Exerc* 2009;41(3):687–708. Principiantes 8–12 RM; frecuencia 2–3 días principiantes, 3–4 intermedios, 4–5 avanzados. https://doi.org/10.1249/MSS.0b013e3181915670
- acsm2026 — ACSM, *Med Sci Sports Exerc* 2026, revisión de 137 revisiones. Entrenar todos los grupos al menos 2 días por semana e individualizar carga y volumen. https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823
- helms2014 — Helms, Aragon y Fitschen, *J Int Soc Sports Nutr* 2014;11:20. En déficit, bajar 0,5–1 % del peso por semana para conservar músculo: el peso lo decide la alimentación. https://pmc.ncbi.nlm.nih.gov/articles/PMC4033492/

## Calentamiento, series de aproximación y estiramientos

Todo es opcional (ajustes `warmupEnabled` y `stretchEnabled`, activados por defecto) y nada de esto cuenta para récords, volumen ni progresión. El catálogo está en `src/features/workout/data/movements.ts`; los textos de cada ficha, en las traducciones bajo `movement.<id>`.

**Evidencia**

- Calentar mejoró el rendimiento en el 79 % de los criterios estudiados, con poca evidencia de que perjudique (Fradkin y col. 2010, https://pubmed.ncbi.nlm.nih.gov/19996770/).
- El estiramiento dinámico ayuda si se hace minutos antes de entrenar; el estático de 60 s o más baja el rendimiento cerca de un 4,6 % (Behm y col. 2016, https://pure.northampton.ac.uk/en/publications/acute-effects-of-muscle-stretching-on-physical-performance-range-/). Por eso antes de entrenar solo hay movimientos dinámicos y de activación.
- Estirar no reduce de forma importante el dolor de los días siguientes (Herbert y col. 2011, https://cochranelibrary.com/cdsr/doi/10.1002/14651858.CD004577.pub3/information). Los estiramientos se presentan como movilidad, nunca como remedio para las agujetas.
- Estiramiento estático de 10 a 30 s, unos 60 s por grupo (Garber y col. 2011, ACSM, https://doi.org/10.1249/MSS.0b013e318213fefb). La app usa 30 s por lado.

**Cantidad según el tiempo de la sesión** (regla de producto; el tiempo sale del asistente, 45 min si no se usó)

| Minutos | Calentamiento | Estiramientos |
| ------- | ------------- | ------------- |
| 30      | 3             | 2             |
| 45      | 4             | 3             |
| 60      | 5             | 4             |
| 75      | 6             | 4             |

**Cómo se eligen** (`warmup-selection.utils`)

- La región del día sale de las series por músculo: inferior o superior si ese lado lleva al menos 2/3 (el core no cuenta); si no, cuerpo completo.
- Calentamiento: uno general y el resto 3/4 para la región principal y 1/4 para la otra (mitad y mitad en cuerpo completo). Dentro de cada región van primero los que más trabajan los músculos del día. Si la persona tiene banda, se prefiere la versión con banda, como mucho dos.
- Estiramientos: los que estiran lo trabajado y uno general (espalda o cadera) al final.
- El resultado es el mismo para el mismo día; no cambia en cada apertura.

**Series de aproximación** (`ramp-sets.utils`, regla de producto: no hay un estudio que fije los porcentajes)

- Solo en el primer ejercicio compuesto con peso del día.
- Carga normal: 10 con la barra sola o la carga mínima, 5 al 50 % y 3 al 75 %, redondeados al salto del equipo y en la unidad registrada.
- Carga liviana (menos de 20 kg o 45 lb): una sola serie de 8 al 50 %.
