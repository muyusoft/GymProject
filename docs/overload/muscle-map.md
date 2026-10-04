# Mapeo de músculos

Fuente de verdad en código: `src/features/catalog/data/muscle-map.json` (patrones, grupos, regla y fuentes) y `src/features/catalog/data/common-exercises.json` (94 ejercicios comunes, su patrón y excepciones). Versión editable para el equipo: pestaña "Mapeo de músculos" del roadmap.

## Regla

- **Principal:** el músculo que el patrón busca trabajar y que aparece entre los más activos en la fuente, o el que más creció en estudios de entrenamiento. Puede haber dos.
- **Secundario:** activación de 21% o más de la contracción voluntaria máxima (MVIC), escala de Krause Neto et al. 2020 tomada de Macadam y Feser 2019 (baja 0–20%, moderada 21–40%, alta 41–60%, muy alta más de 60%). Si el estudio midió el músculo y lo describe como participante pero no da porcentaje: `basis: "described"`.
- **Sin dato:** no se pinta, aunque la anatomía sugiera que participa. Nunca agregar músculos sin fuente.
- **Volumen:** principal 1 serie, secundario 0.5 (Pelland et al.).

## Músculos de los estudios → grupos de la figura

| Músculo | Grupo | Vista |
| --- | --- | --- |
| Pectoral mayor | chest | frente |
| Deltoides anterior | deltoids | frente |
| Deltoides medio | deltoids | ambas |
| Deltoides posterior | deltoids | espalda |
| Tríceps | triceps | ambas |
| Bíceps y braquial | biceps | frente |
| Braquiorradial | forearm | ambas |
| Dorsal ancho, romboides, infraespinoso | upper-back | espalda |
| Trapecio superior, medio e inferior | trapezius | ambas |
| Erectores, multífido | lower-back | espalda |
| Recto abdominal, transverso | abs | frente |
| Oblicuos, serrato anterior | obliques | frente |
| Glúteo mayor y medio | gluteal | espalda |
| Vastos y recto femoral | quadriceps | frente |
| Bíceps femoral, semitendinoso | hamstring | espalda |
| Aductor largo | adductors | ambas |
| Gemelo, sóleo | calves | ambas |
| Tensor de la fascia lata | sin grupo, no se pinta | — |

## Patrones

| id | Principal | Secundarios | Fuentes |
| --- | --- | --- | --- |
| horizontal_push | chest | triceps, deltoids (frente) | stastny2017, lopezvivancos2023 |
| fly | chest | deltoids (frente) | welsch2005, schanke2012 |
| dip | chest, triceps | deltoids (frente) | mckenzie2022 |
| vertical_push | deltoids (frente) | triceps, trapezius (descrito) | campos2020, saeterbakken2013, blazkiewicz2022 |
| lateral_raise | deltoids (ambas) | trapezius (descrito) | campos2020, coratella2020 |
| rear_delt | deltoids (espalda) | upper-back | schoenfeld2013 |
| vertical_pull | upper-back | biceps, deltoids (espalda), trapezius (descritos) | buonsenso2025 |
| horizontal_pull | upper-back, trapezius | biceps, deltoids (espalda); + lower-back sin apoyo de pecho | lehman2004, padovan2025, fenwick2009 |
| shrug | trapezius | — | pizzari2014 |
| squat | quadriceps | gluteal | contreras2015, krauseneto2020 |
| lunge | quadriceps, gluteal | hamstring (descrito) | navarro2021, krauseneto2020 |
| hinge_conventional | lower-back, quadriceps | gluteal, hamstring | martinfuentes2020 |
| hinge_rdl | hamstring | gluteal, lower-back | martinfuentes2020 |
| hip_thrust | gluteal | hamstring, quadriceps | contreras2015 |
| knee_extension | quadriceps | — | jakobsen2012 |
| knee_flexion | hamstring | calves (descrito) | maeo2021, vuk2024 |
| hip_abduction | gluteal | — | macadam2015 (sin estudio de la máquina) |
| hip_adduction | adductors | — | serner2014, alonsofernandez2022 (sin estudio de la máquina) |
| calf_standing | calves | — | kinoshita2023 |
| calf_seated | calves (sóleo) | — | kinoshita2023 |
| elbow_flexion | biceps | forearm | marcolin2018, date2021 |
| elbow_extension | triceps | — | maeo2022, boehler2011 |
| core | abs, obliques | lower-back | olivalozano2020 (excepciones por ejercicio) |

Las fuentes completas, con URL y solidez, están en `src/features/catalog/data/muscle-map.json` → `sources`.
