import type { SvgProps } from "react-native-svg";
import { ICON_REGISTRY, type IconName } from "./index";

interface IconRendererProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: SvgProps["style"];
}

/**
 * Renderiza un ícono SVG por nombre type-safe
 * - Busca en ICON_REGISTRY (centralizado en index.ts)
 * - TypeScript garantiza que el nombre es válido (IconName)
 * - `color` alimenta el currentColor de los SVG, que son stroke-only
 */
export function IconRenderer({
  name,
  size = 24,
  color = "currentColor",
  style,
}: IconRendererProps) {
  const IconComponent = ICON_REGISTRY[name];

  if (!IconComponent) {
    return null;
  }

  return (
    <IconComponent width={size} height={size} color={color} style={style} />
  );
}

export default IconRenderer;
