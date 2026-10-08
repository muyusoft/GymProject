import type { Edge } from "react-native-safe-area-context";

/**
 * Márgenes seguros arriba y a los lados, sin el de abajo. Para pantallas donde otra cosa ocupa el borde
 * inferior: en las pestañas, la barra de pestañas; en la bienvenida y la introducción, un panel de color
 * que debe llegar hasta el borde (el panel suma por su cuenta el margen inferior a su relleno).
 */
export const EDGES_WITHOUT_BOTTOM: readonly Edge[] = ["top", "right", "left"];
