# Design system Overload

Fuente visual: artifact "Overload Design System". Los valores exactos están en `src/design/tokens.json`; en código se leen con los helpers de `src/design/tokens.ts`. Nunca escribas un color, tamaño o radio literal en un componente.

## Cómo se usa en código

```ts
import { getSemanticColors, getTextStyle, tokens } from "@/design/tokens";
import { useThemeStore } from "@/shared/store";
import { useColorScheme } from "react-native";

const theme = useThemeStore((s) => s.theme); // "light" | "dark" | "auto"
const system = useColorScheme();
const mode = theme === "auto" ? (system ?? "dark") : theme;
const c = getSemanticColors(mode);

const styles = StyleSheet.create({
  card: { backgroundColor: c.surface, borderRadius: tokens.borderRadius.lg, padding: tokens.spacing[4] },
  weight: { ...getTextStyle("numeric"), color: c.text },
});
```

Como se repite en todos los componentes, la Fase 1 crea el hook `useOverloadTheme()` en `src/shared/hooks/use-overload-theme.ts` con esta lógica y devuelve `{ mode, c }`; los componentes no repiten el bloque de arriba.

## Contraste y letra del sistema

- El texto cumple 4.5:1 y los iconos, barras y la figura 3:1, en oscuro y en claro; `src/design/__tests__/contrast.test.ts` lo comprueba con los tokens, así que un cambio de color que lo rompa falla en `npx vitest run`.
- El volt puro (`accent`) es relleno con texto o icono oscuro encima. Para barras, puntos y celdas sueltas usa `accentText`, que en claro es verde oscuro.
- Los textos crecen con la letra del sistema: ningún contenedor con texto traducido lleva altura fija (solo `minHeight`), y los encabezados admiten dos líneas.

## Principios

1. **Una mano, en el gym.** Controles de al menos 48 de alto (`tokens.dimensions.minTouch`), números grandes, cero teclado si se puede evitar.
2. **El número es el héroe.** Peso, reps y tiempo en Barlow Condensed (`numeric`, `displayXl`); el texto explica, el número manda.
3. **Volt significa "hecho" o "sube".** `accent` solo para acción primaria, serie completada y sugerencia de subir peso.
4. **Ember es un premio.** `reward` solo para récords personales y rachas.
5. **Oscuro por defecto.** El tema claro existe y cumple contraste. Con `theme: "auto"` y sin esquema del sistema, se usa oscuro.

## Voz

Directa, de coach, en segunda persona, sin exclamaciones de más. Unidades siempre visibles (80 kg, 90 s, 4 × 8). Etiquetas en mayúsculas con el estilo `label`. Todo texto sale de `src/locales/{es,en}/translation.json`.

## Colores semánticos (`tokens.semantic.dark` / `.light`)

| Clave | Oscuro | Claro | Uso |
| --- | --- | --- | --- |
| background | #0e0f0c | #f4f5f0 | Fondo de pantalla (los layouts deben usarlo) |
| surface | #171915 | #ffffff | Tarjetas, hojas, filas |
| surfaceAlt | #22251f | #e9ebe3 | Inputs, chips inactivos, series pendientes |
| border / divider | #33372e | #d3d6cb | Bordes y divisores |
| text | #f2f4ec | #14160f | Texto principal |
| textSecondary | #a3a899 | #5b6052 | Texto secundario |
| accent | #c6ff3d | #c6ff3d | Relleno de acción primaria, serie hecha |
| onAccent | #0e0f0c | #0e0f0c | Texto e icono sobre accent |
| accentText | #c6ff3d | #4a7300 | Volt usado como texto (el lima no cumple contraste sobre blanco) |
| reward | #ff7a2f | #b8460a | Récords y rachas |
| danger | #ff5a5f | #c8332f | Errores, borrar |
| info | #6fb7ff | #1b66b3 | Descanso, deload, avisos |
| musclePrimary / muscleSecondary / muscleIdle | #c6ff3d / #5f7d1f / #2a2d26 | #4a7300 / #8fb52c / #d3d6cb | Figura muscular (en claro el principal es verde oscuro para verse sobre el fondo) |
| recoveryWorked / recoveryRecovering / recoveryReady | = danger / info / accent | danger / info / #4a7300 | Estados de recuperación, siempre con texto |

`tokens.brand.dark` / `.light` guarda los colores oficiales de los botones "Continuar con Apple / Google" (blanco o negro para Apple; el tema oscuro o claro de Google). Solo los usa `SocialButton`, junto con los logotipos `brand-apple` y `brand-google`, que son la excepción a los iconos de trazo.

Las escalas `tokens.colors.primary` (volt), `secondary` (ember), `success`, `error`, `info`, `warning` y `neutral` existen para casos puntuales y para el playground; en pantallas usa los semánticos.

## Tipografía (`getTextStyle(name)`)

Fuentes: `@expo-google-fonts/barlow` y `@expo-google-fonts/barlow-condensed`, cargadas en `src/app/_layout.tsx` con `useFonts` antes de ocultar el splash. Los nombres de familia están en `tokens.typography.fontFamily`.

| Estilo | Familia | Tamaño / interlineado | Uso |
| --- | --- | --- | --- |
| displayXl | Barlow Condensed 700 | 64 / 60 | Número héroe |
| displayLg | Barlow Condensed 700 | 40 / 40, mayúsculas | Títulos de pantalla |
| numeric | Barlow Condensed 600 | 28 / 32, cifras tabulares | Peso, reps, cronómetro |
| title | Barlow 600 | 20 / 26 | Nombre de ejercicio |
| body | Barlow 400 | 16 / 24 | Texto corrido |
| bodySm | Barlow 400 | 14 / 20 | Metadatos |
| label | Barlow 600 | 12 / 16, mayúsculas, +0.08em | Etiquetas y tabs |

## Espaciado, radios y forma

- Espaciado del DS → índice de `tokens.spacing`: 4 = `[1]`, 8 = `[2]`, 12 = `[3]`, 16 = `[4]`, 24 = `[6]`, 32 = `[8]`, 48 = `[12]`. Margen lateral: `tokens.dimensions.screenGutter` (16).
- Radios: `sm` 8 (checks, chips, inputs), `md` 14 (botones, filas), `lg` 22 (tarjetas y hojas), `full` (días de la semana, badges).
- Sin sombras: la profundidad viene de pasar de `surface` a `surfaceAlt`.
- Iconos de línea 2 px, solo desde `@/shared/icons`; 24 en la tab bar, 20 en filas. El check de serie completada es el único icono relleno.
- Motivo de marca: discos de pesas (barras verticales redondeadas de alturas crecientes), para estados vacíos y portada.
